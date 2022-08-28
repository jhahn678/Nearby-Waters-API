import { Request } from 'express'
import catchAsync from "../utils/catchAsync";
import { validateCoords } from "../utils/validations/coordValidation";
import knex, { st } from '../config/knex'
import { UnknownReferenceError } from '../utils/errors/UnknownReferenceError';
import { milesToMeters } from '../utils/conversions';


interface GetGeometryQuery {
    /** ID of geometry */
    id: number,
    /** Boolean, also return waterbody with geometry */
    waterbody?: string | boolean
}


export const getGeometry = catchAsync(async(req: Request<{},{},{},GetGeometryQuery>, res, next) => {
    const { id, waterbody } = req.query;
    const query = knex('geometries').where({ id })
    if(waterbody) query.join('waterbodies', 'geometries.waterbody', '=', 'waterbodies.id')
    const geometry = await query.first()
    if(!geometry) throw new UnknownReferenceError('GEOMETRY', [id])
    res.status(200).json(geometry)
})


interface GetGeometriesQuery{
    /** Comma seperated string of ids */
    ids?: string,
    /** Geometry/waterbody name */
    name?: string,
    /** Comma seperated string of classifications */
    classification?: string,
    /** Comma seperated longitude and latitude */
    lnglat?: string,
    /** Radius in miles to search in */
    /** @default 25 */
    within: string
}

export const getGeometries = catchAsync(async(req: Request<{},{},{},GetGeometriesQuery>, res, next) => {
    const { ids, name, classification, lnglat, within } = req.query;

    const query = knex('geometries')

    if(ids){
        const split = ids.split(',').map(x => x.trim())
        if(split.length > 0) query.whereIn('id', split)
    }
    if(name){
        query.whereILike('name', (name + '%'))
    }
    if(classification){
        const split = classification.split(',').map(x => x.trim())
        query.whereIn('classification', split)
    }
    if(lnglat){
        const coords = lnglat.split(',').map(x => parseFloat(x))
        if(validateCoords(coords)){
            const [lng, lat] = coords;
            const point = st.transform(st.setSRID(st.point(lng, lat), 4326), 3857)
            const dist = within ? milesToMeters(within) : milesToMeters(25)
            query.where(st.dwithin('geom', point, dist, false))
        }
    }

    const results = await query
    res.status(200).json(results)
})