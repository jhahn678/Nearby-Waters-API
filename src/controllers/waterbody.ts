import catchAsync from "../utils/catchAsync";
import knex, { st } from "../config/knex";
import { validateCoords } from '../utils/validations/coordValidation'
import { milesToMeters } from "../utils/conversions";
import { Request } from "express";
import { CoordinateError } from "../utils/errors/CoordinateError";
import { RequestError } from "../utils/errors/RequestError";
import { UnknownReferenceError } from "../utils/errors/UnknownReferenceError";
import { QueryError } from "../utils/errors/QueryError";
import { AccessPointCreationError } from '../utils/errors/AccessPointCreationError'
import { validateAccessPointType } from "../utils/validations/accessPointValidations";
import { validateAdminOne } from "../utils/validations/validateAdminOne";
import { validateCountry } from '../utils/validations/validateCountry'
import { validateSubregion } from "../utils/validations/validateSubregion";
import { validateLimitInput, validatePageInput } from "../utils/validations/validatePagination";
import { INewAccessPoint } from "../types/AccessPoint";


interface WaterbodyQuery {
    id: number,
    /** Returns associated geometries as a geojson geometry collection */
    geometries?: string | boolean
}

export const getWaterbody = catchAsync(async (req: Request<{},{},{},WaterbodyQuery>, res) => {

    const { id, geometries } = req.query;
    if(!id) throw new QueryError('ID_REQUIRED')

    const query = knex('waterbodies')
        .select(
            'id', 'name', 'classification', 'country', 'ccode',
            'admin_one', 'admin_two', 'subregion', 'weight'
        )
        .where('id', id)
        .first()
    
    if(geometries) {
        query.select(knex.raw(
            '(select st_asgeojson(st_collect(st_transform(geom, 4326))) ' + 
            'from geometries where waterbody = ?)::json as geometries', 
            [id]
        ))
    }

    const waterbody = await query;
    if(!waterbody) throw new UnknownReferenceError('WATERBODY', [id])
    res.status(200).json(waterbody)
})

interface WaterbodiesQuery {
    /** case-insensitive value */
    value?: string
    /** Comma seperated classifications */
    classifications?: string
    /** Comma seperated admin_one values -- precedence over states */
    admin_one?: string
    /** Comma seperated admin_one values */
    states?: string
    /** minimum search weight returned*/
    minWeight?: string
    /** maximum search weight returned */
    maxWeight?: string
    /** two letter country code -- precedence over country*/
    ccode?: string
    /** country name */
    subregion?: string
    /** Boolean value to include geometries or not @default false*/
    /** Returns geometries as a geojson geometry collection */
    geometries: string | boolean,
    /**Comma seperated longitude, latitude */
    lnglat?: string,
    /** Number of miles to search within @default 50 */
    within: string | number
    /** Method to sort by  @default rank */
    sort: 'distance' | 'rank'
    /** page number @default 1 */
    page: string | number
    /** page size @default 50 */
    limit: string | number
}


export const getWaterbodies = catchAsync(async(req: Request<{},{},{},WaterbodiesQuery>, res) => {
    const { 
        value, classifications, admin_one, states, 
        minWeight, maxWeight, ccode, subregion, lnglat,
        geometries=false, within=50, sort='rank', page=1, limit=50
    } = req.query;

    let isUsingDistance = false;

    const query = knex('waterbodies')

    if(value){
        query.whereILike("name", value + '%')
    }

    if(classifications){
        const split = classifications.split(',')
            .map(x => x.trim().toLowerCase())
        query.whereIn('classification', split)
    }

    if(admin_one){
        const split = admin_one.split(',')
            .map(x => validateAdminOne(x.trim()))
            .filter(x => x !== null)
        if(split.length > 0){
            query.whereRaw(`admin_one && array[${split.map(() => '?').join(',')}]::varchar[]`, split)
        }
    }else if(states){
        const split = states.split(',')
            .map(x => validateAdminOne(x.trim()))
            .filter(x => x !== null)
        if(split.length > 0){
            query.whereRaw(`admin_one && array[${split.map(() => '?').join(',')}]::varchar[]`, split)
        }
    }

    if(maxWeight){
        query.where('weight', '<=', parseFloat(maxWeight))
    }
    if(minWeight){
        query.where('weight', '>=', parseFloat(minWeight))
    }

    if(ccode){
        query.where('ccode', ccode)
    }

    if(subregion){
        query.where('subregion', subregion)
    }

    if(lnglat){
        const coords = lnglat.split(',').map(x => parseFloat(x))
        if(!validateCoords(coords)){
            throw new CoordinateError(400, 'Provided coordinates are not valid')
        }
        isUsingDistance = true;
        const [lng, lat] = coords; 
        const point = st.transform(st.setSRID(st.point(lng, lat), 4326), 3857)
        const dist = within ? milesToMeters(within) : 80000 //~50 miles
        query.select('id', 'name', 'classification', 'country', 'ccode', 
            'admin_one', 'admin_two', 'subregion', 'weight', 'oid', 
            knex.raw('simplified_geometries <-> ? as distance', point), 
            knex.raw('rank_result(simplified_geometries <-> ?, weight, ?) as rank', [point, dist])
        )
        query.where(st.dwithin('simplified_geometries', point, dist, false))
    }else{
        query.select('id', 'name', 'classification', 'country', 'ccode', 'admin_one', 
            'admin_two', 'subregion', 'weight', 'oid', { rank: 'weight' }
        )
    }

    if(geometries){
        query.select(knex.raw(
            '(select st_asgeojson(st_transform(st_collect(geometries.geom), 4326))' +  
            ' from geometries where geometries.waterbody = waterbodies.id)::json as geometries'
        ))
    }

    const vLimit = validateLimitInput(limit);
    const vPage = validatePageInput(page);

    query.limit(vLimit + 1)
    query.offset((vPage - 1) * vLimit)

    if(sort && sort === 'distance' && isUsingDistance === true){
        query.orderBy('distance', 'asc')
    }else{
        query.orderBy('rank', 'desc')
    }

    const results = await query;
    const hasNext = results.length === (vLimit + 1)

    if(results.length === 0){
        res.status(200).json({
            metadata: {
                next: false, 
                page: vPage, 
                limit: vLimit
            },
            data: []
        })
    }else{
        res.status(200).json({
            metadata: {
                next: hasNext,
                page: vPage,
                limit: vLimit
            },
            data: hasNext ? results.slice(0,-1) : results
        })
    }

})


interface MergeWaterbodies {
    parent: number,
    children: number[]
}

export const mergeWaterbodies = catchAsync(async(req: Request<{},{},MergeWaterbodies>, res) => {
    const { parent, children } = req.body;
    
    if(!parent) throw new RequestError(400, 'Parent waterbody _id is required')
    if(children.length === 0) throw new RequestError(400, 'Children waterbody(s) are required')

    const childWaterbodies = await knex('waterbodies').whereIn('id', children)
    if(childWaterbodies.length === 0) throw new UnknownReferenceError('WATERBODY', children)
    
    const adminOneSet = new Set()
    const adminTwoSet = new Set()
    for(let x of childWaterbodies){
        x.admin_one.forEach(x => adminOneSet.add(x))
        x.admin_two.forEach(x => adminTwoSet.add(x))
    }

    const adminOneValues = Array.from(adminOneSet)
    const adminOneVars = adminOneValues.map(() => '?').join(',')
    const adminOneRaw = knex.raw(
        `array(select distinct unnest(admin_one || array[${adminOneVars}]::varchar[]))`, 
        adminOneValues
    )

    const adminTwoValues = Array.from(adminTwoSet)
    const adminTwoVars = adminTwoValues.map(() => '?').join(',')
    const adminTwoRaw = knex.raw(
        `array(select distinct unnest(admin_two || array[${adminTwoVars}]::varchar[]))`, 
        adminTwoValues
    )

    const geometries = await knex('geometries')
        .whereIn('waterbody', children)
        .update({ waterbody: parent })

    const waterbody = await knex('waterbodies')
        .where('id', parent)
        .update({ admin_one: adminOneRaw, admin_two: adminTwoRaw })
        .returning('*')

    let simplified: any = null;
    let number = 16;

    while(simplified === null){
        const { rows } = await knex.raw(
            'update waterbodies set "simplified_geometries" = ' +
            '(select st_collect(st_simplify(geom,?)) from geometries where "waterbody" = ?) ' +
            'where "id" = ? ' + 
            'returning st_astext(st_transform("simplified_geometries", 4326)) as simplified_geometries',
            [number, parent, parent]
        )
        number /= 2;
        simplified = rows[0].simplified_geometries
    } 

    const deleted = await knex('waterbodies')
        .whereIn('id', children).del()


    res.status(200).json({
        waterbody: waterbody[0],
        updated_geometries: geometries, 
        deleted_waterbodies: deleted 
    })

}) 



interface GetDuplicatesQuery {
    name: string
    classification?: string
    admin_one?: string
}


export const getWaterbodiesByName = catchAsync(async(req: Request<{},{},{},GetDuplicatesQuery>, res) => {
    
    const { name, classification, admin_one } = req.query;

    if(!name) throw new QueryError('NAME_REQUIRED')
    
    const query = knex('waterbodies').where('name', name)

    if(classification){
        const split = classification.split(',')
            .map(x => x.trim().toLowerCase())
        query.whereIn('classification', split)
    }

    if(admin_one){
        const split = admin_one.split(',')
            .map(x => validateAdminOne(x.trim()))
            .filter(x => x !== null)
        query.whereRaw(`admin_one && array[${split.map(() => '?').join(',')}]::varchar[]`, split)
    }


    query.select(
        'id', 'oid', 'name', 'classification', 'country', 'ccode', 
        'admin_one', 'admin_two', 'subregion', 'weight', 
        knex.raw(
            '(select st_asgeojson(st_transform(st_collect(geometries.geom), 4326))' +  
            ' from geometries where geometries.waterbody = waterbodies.id)::json as geometries'
        ), knex.raw(
            '(select count(geometries.geom) from geometries where geometries.waterbody = ' +
            'waterbodies.id) as total_geometries'
        )
    )

    query.orderByRaw('total_geometries desc')
    
    const waterbodies = await query;
    res.status(200).json(waterbodies)
})



interface DeleteWaterbodyReqBody {
    id: number
}

export const deleteWaterbody = catchAsync(async(req: Request<{},{},DeleteWaterbodyReqBody>, res) => {

    const { id } = req.body;
    if(!id) throw new RequestError(400, 'Waterbody _id is required')

    const deleted = await knex('waterbodies').where({ id }).del()
    if(deleted === 0) throw new ReferenceError('Waterbody does not exist')

    res.status(204).json({ deleteCount: deleted })
})

interface NearestWaterbodyQuery {
    /** Comma seperated -- longitude, latitude */
    lnglat: string,
}

export const getNearestWaterbodies = catchAsync(async (req: Request<{},{},{},NearestWaterbodyQuery>, res) => {

    const { lnglat } = req.query;
    if(!lnglat) throw new QueryError('COORDS_REQUIRED')

    const coordinates = lnglat.split(',').map(x => parseFloat(x))
    if(!validateCoords(coordinates)){
        throw new CoordinateError(400, 'Provided coordinates are not valid')
    }
    
    const [lng, lat] = coordinates;
    const point = st.transform(st.setSRID(st.makePoint(lng, lat), 4326), 3857)
    const dist = knex.raw('(simplified_geometries <-> ?) as distance', [point])

    const waterbodies = await knex('waterbodies')
        .select('id', 'name', 'classification', dist)
        .where(st.dwithin('simplified_geometries', point, 10000, false))
        .orderByRaw('distance asc')
        .limit(3)

    res.status(200).json(waterbodies)
})


interface NewAccessPointReq {
    name: string
    description?: string
    accessType: 'PARKING_LOT' | 'PULL_OFF' | 'WALK_IN'
    restrooms?: boolean
    boatLaunch?: boolean
    waterbody: number
    coordinates: [Lng: number, Lat: number]
}

export const addAccessPoint = catchAsync(async(req: Request<{},{},NewAccessPointReq>, res) => {
    const { 
        name, 
        description, 
        accessType,
        restrooms, 
        boatLaunch, 
        waterbody, 
        coordinates 
    } = req.body;

    if(!name) throw new AccessPointCreationError('NAME_NOT_PROVIDED')
    if(!accessType) throw new AccessPointCreationError('ACCESS_TYPE_NOT_PROVIDED')
    if(!validateAccessPointType(accessType)) throw new AccessPointCreationError('ACCESS_TYPE_NOT_VALID')
    if(!waterbody) throw new AccessPointCreationError('WATERBODY_NOT_PROVIDED')
    const validated = await knex('waterbodies').where({ id: waterbody }).first()
    if(!validated) throw new UnknownReferenceError('WATERBODY')
    if(!coordinates) throw new AccessPointCreationError('COORDINATES_NOT_PROVIDED')
    if(!validateCoords(coordinates)) throw new CoordinateError(400, 'Provided coordinates are not valid')

    const [lng, lat] = coordinates;
    const point = st.transform(st.setSRID(st.makePoint(lng, lat), 4326), 3857)

    const newAccessPoint: INewAccessPoint = {
        name,
        accessType,
        // user,
        waterbody,
        geom: point
    }

    if(description && typeof description === 'string') newAccessPoint.description = description;
    if(restrooms && typeof restrooms === 'boolean') newAccessPoint.restrooms = restrooms;
    if(boatLaunch && typeof boatLaunch === 'boolean') newAccessPoint.boatLaunch = boatLaunch;

    const saved = await knex('accessPoints').insert(newAccessPoint).returning('*')
    
    res.status(200).json(saved)
})







