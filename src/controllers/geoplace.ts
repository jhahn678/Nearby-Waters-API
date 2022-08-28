import knex, { st } from '../config/knex'
import { Request } from 'express'
import catchAsync from '../utils/catchAsync'
import { validateCoords } from '../utils/validations/coordValidation'
import { milesToMeters } from '../utils/conversions'
import { UnknownReferenceError } from '../utils/errors/UnknownReferenceError'
import { validateAdminOne } from '../utils/validations/validateAdminOne'


interface GetGeoplaceQuery {
    id: number
}

export const getGeoplace = catchAsync(async(req: Request<{},{},{},GetGeoplaceQuery>, res) => {
    const { id } = req.query;
    const [ geoplace ] = await knex('geoplace').where({ id })
    if(!geoplace) throw new UnknownReferenceError('GEOPLACE', [id])
    res.status(200).json(geoplace)
})




interface GetGeoplacesQuery {
    value?: string
    /** Comma seperated list of states */
    states?: string
    /** Comma seperated list of admin_one entities */
    admin_one?: string
    /** Full country name */
    country?: string
    /** Two letter country abbreviation */
    ccode?: string
    /** By search weight -- 1.0 to 1.4  */
    weight?: string
    /** Comma seperated list of counties */
    counties?: string
    /** Comma seperated list of admin_two entities */
    admin_two?: string
    /** Comma seperated longitude,latitude */
    lnglat?: string,
    /** Number of miles to search 
    * @default 50 */
    within?: string | number
}

export const getGeoplaces = catchAsync(async(req: Request<{},{},{},GetGeoplacesQuery>, res) => {

    const { value, states, admin_one, country, ccode, weight, counties, admin_two, lnglat, within } = req.query;

    const query = knex('geoplaces')

    if(value) query.whereILike('name', (value + '%'))

    if(admin_one){
        const split = admin_one.split(',')
            .map(x => validateAdminOne(x.trim()))
            .filter(x => x !== null)
        if(split.length > 0){
            query.whereIn('admin_one', split)
        }
    }else if(states){
        const split = states.split(',')
            .map(x => validateAdminOne(x.trim()))
            .filter(x => x !== null)
        if(split.length > 0){
            query.whereIn('admin_one', split)
        }
    }

    if(admin_two){
        const split = admin_two.split(',').map(x => x.trim())
        query.whereIn('admin_two', split)
    }else if(counties){
        const split = counties.split(',').map(x => x.trim())
        query.whereIn('admin_two', split)
    }

    if(country){
        query.where('country', country)
    }

    if(ccode){
        query.where('ccode', ccode)
    }

    if(weight){
        const num = parseFloat(weight)
        query.where('weight', num)
    }

    //return only results within distance of provided point
    if(lnglat){
        const coords = lnglat.split(',').map(x => parseFloat(x))
        if(validateCoords(coords)){
            const [lng, lat] = coords;
            const point = st.transform(st.setSRID(st.point(lng, lat), 4326), 3857)
            const dist = within ? milesToMeters(within) : milesToMeters(50)
            query.select('*', knex.raw('geom <-> ? as distance', point))
            query.where(st.dwithin('geom', point, dist, false))
            query.orderBy('distance', 'asc')
        }
    }    

    const geoplaces = await query
    res.status(200).json(geoplaces)
})