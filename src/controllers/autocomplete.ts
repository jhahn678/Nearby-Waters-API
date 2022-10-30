import catchAsync from "../utils/catchAsync"
import knex, { st } from "../config/knex"
import { Request } from 'express'
import { QueryError } from "../utils/errors/QueryError"
import { validateAdminOne } from "../utils/validations/validateAdminOne"
import { validateCoords } from "../utils/validations/coordValidation"


interface AutocompleteQuery {
    value: string,
    lnglat?: string
}

export const autocompletePlaces = catchAsync(async (req: Request<{},{},{},AutocompleteQuery>, res) => {

    const { value, lnglat } = req.query;
    if(!value) throw new QueryError('VALUE_REQUIRED')

    const query = knex('geoplaces')

    const parsedValue = value.split(',').map(x => x.trim())
    const [ name, adminOne ] = parsedValue;
    query.whereILike('name', (name + '%'))

    if(parsedValue.length > 1){
        const valid = validateAdminOne(adminOne);
        if(valid) query.where('admin_one', valid)
    }

    if(lnglat && !adminOne && name.length < 8){
        const coords = lnglat.split(',').map(x => parseFloat(x))
        if(validateCoords(coords)){
            const [lng, lat] = coords;
            const point = st.transform(st.setSRID(st.point(lng, lat), 4326), 3857)
            query.select('*',
                knex.raw('st_asgeojson(st_transform(geom, 4326))::json as geom'),
                knex.raw("'GEOPLACE' as type"),
                knex.raw('rank_result(geom <-> ?, weight, ?) as rank', [point, 300000])
            )
            query.where(st.dwithin('geom', point, 300000))
        }
    }else{
        query.select('*', 
            knex.raw('st_asgeojson(st_transform(geom, 4326))::json as geom'),
            knex.raw("'GEOPLACE' as type"),
            knex.raw('weight as rank')
        )
    }

    query.orderByRaw('rank desc')
    query.limit(8)

    const results = await query;
    res.status(200).json(results)
})



export const autocompleteWaterbodies = catchAsync(async(req: Request<{},{},{},AutocompleteQuery>, res) => {

    const { value, lnglat } = req.query;
    if(!value) throw new QueryError('VALUE_REQUIRED')

    const query = knex('waterbodies')

    const parsedValue = value.split(',').map(x => x.trim())
    const [ name, adminOne ] = parsedValue;
    query.whereILike('name', (name + '%'))

    if(parsedValue.length > 1){
        const valid = validateAdminOne(adminOne);
        if(valid) query.whereRaw('? = any(admin_one)', [valid])
    }

    if(lnglat && !adminOne && name.length < 8){
        const coords = lnglat.split(',').map(x => parseFloat(x))
        if(validateCoords(coords)){
            const [lng, lat] = coords;
            const point = st.transform(st.setSRID(st.point(lng, lat), 4326), 3857)
            query.select(
                'id', 'name', 'classification', 'admin_one', 
                'admin_two', 'country', 'ccode', 'subregion', 'weight', 
                knex.raw("'WATERBODY' as type"),
                knex.raw('rank_result(simplified_geometries <-> ?, weight, ?) as rank', [point, 300000])
            )
            query.where(st.dwithin('simplified_geometries', point, 300000))
        }
    }else{
        query.select(
            'id', 'name', 'classification', 'admin_one', 
            'admin_two', 'country', 'ccode', 'subregion', 'weight', 
            knex.raw("'WATERBODY' as type"),
            knex.raw('weight as rank')
        )
    }

    query.orderByRaw('rank desc')
    query.limit(8)

    const results = await query;
    res.status(200).json(results)

})



export const autocompleteAll = catchAsync(async (req: Request<{},{},{},AutocompleteQuery>, res) => {

    const { value, lnglat } = req.query;
    if(!value) throw new QueryError('VALUE_REQUIRED')

    const waterbodies = knex('waterbodies')
    const geoplaces = knex('geoplaces')

    const parsedValue = value.split(',').map(x => x.trim())
    const [ name, adminOne ] = parsedValue;
    waterbodies.whereILike('name', (name + '%'))
    geoplaces.whereILike('name', (name + '%'))
    
    if(lnglat && !adminOne && name.length < 8){
        const coords = lnglat.split(',').map(x => parseFloat(x))
        if(validateCoords(coords)){
            const [lng, lat] = coords;
            const point = st.transform(st.setSRID(st.point(lng, lat), 4326), 3857)
            waterbodies.select(
                'id', 'name', 'classification', 'admin_one', 
                'admin_two', 'country', 'ccode', 'subregion', 'weight', 
                knex.raw("'WATERBODY' as type"),
                knex.raw('rank_result(simplified_geometries <-> ?, weight, ?) as rank', [point, 300000])
            )
            geoplaces.select('*', 
                knex.raw("'GEOPLACE' as type"),
                knex.raw('st_asgeojson(st_transform(geom, 4326))::json as geom'),
                knex.raw('rank_result(geom <-> ?, weight, ?) as rank', [point, 300000])
            )
            geoplaces.where(st.dwithin('geom', point, 300000))
            waterbodies.where(st.dwithin('simplified_geometries', point, 300000))
        }
    }else{
        waterbodies.select(
            'id', 'name', 'classification', 'admin_one', 
            'admin_two', 'country', 'ccode', 'subregion', 'weight', 
            knex.raw("'WATERBODY' as type"),
            knex.raw('weight as rank')
        )
        geoplaces.select('*', 
            knex.raw('weight as rank'))
            knex.raw("'GEOPLACE' as type"),
            knex.raw('st_asgeojson(st_transform(geom, 4326))::json as geom'
        )
    }

    waterbodies.orderByRaw('rank desc')
    geoplaces.orderByRaw('rank desc')
    waterbodies.limit(8)
    geoplaces.limit(8)

    const waterbodyResults = await waterbodies;
    const geoplaceResults = await geoplaces;

    const sorted = [
        ...waterbodyResults, 
        ...geoplaceResults
        //@ts-ignore
    ].sort((x,y) => y.rank - x.rank)

    res.status(200).json(sorted)
})



interface DistinctNameQuery { 
    value: string,
    classifications?: string,
    admin_one?: string
}

export const autocompleteDistinctName = catchAsync(async(req: Request<{},{},{},DistinctNameQuery>, res, next) => {
    
    const { value, classifications, admin_one } = req.query;

    const query = knex('waterbodies').distinct('name')

    if(value) query.whereILike('name',(value + '%'))

    if(classifications){
        const split = classifications
            .split(',')
            .map(x => x.trim().toLowerCase())
        query.whereIn('classification', split)
    }

    if(admin_one){
        const valid = admin_one.split(',')
            .map(x => validateAdminOne(x.trim()))
            .filter(x => x !== null)
        if(valid.length > 0){
            query.whereRaw(`admin_one && array[${valid.map(() => '?').join(',')}]::varchar[]`, valid)
        }
    }

    const results = await query;

    res.status(200).json(results.map(x => x.name))
})




