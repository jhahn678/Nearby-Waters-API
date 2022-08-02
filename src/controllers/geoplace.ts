import Geoplace from '../models/geoplace'
import { Request } from 'express'
import catchAsync from '../utils/catchAsync'
import { validateCoords } from '../utils/coordValidation'
import { milesToMeters } from '../utils/conversions'
import { QueryOptions } from 'mongoose'


interface GetGeoplaceQuery {
    _id: string
}

export const getGeoplace = catchAsync(async(req: Request<{},{},{},GetGeoplaceQuery>, res) => {

    const geoplace = await Geoplace.findById(req.query._id)

    res.status(200).json(geoplace)
})




interface GetGeoplacesQuery {
    value?: string
    states?: string
    country?: string
    weight?: string
    counties?: string
    /**
    * Comma seperated -- longitude, latitude
    */
    lnglat?: string,
    /**
    * @default 50
    * Number of miles
    */
    within?: string | number
}

export const getGeoplaces = catchAsync(async(req: Request<{},{},{},GetGeoplacesQuery>, res) => {

    const { value, states, lnglat, within, country, counties, weight } = req.query;

    const filters: QueryOptions[] = []

    if(value){
        filters.push({ name: { $regex: `^${value}`, options: 'i' }})
    }
    if(states){
        const split = states.split(',').map(x => x.trim())
        filters.push({ states: { $in: split }})
    }
    if(lnglat){
        const coords = lnglat.split(',').map(x => parseFloat(x))
        if(validateCoords(coords)){
            const geometry = { type: 'Point', coordinates: coords }
            if(within){
                filters.push({ simplified_geometries: { 
                    $near: { $geometry: geometry },
                    $maxDistance: milesToMeters(within) 
                }})
            }else{
                filters.push({ simplified_geometries: { 
                    $near: { $geometry: geometry },
                    $maxDistance: milesToMeters(50)
                }})
            }
        }
    }
    if(country){
        filters.push({ country: country })
    }
    if(counties){
        const split = counties.split(',').map(x => x.trim)
        filters.push({ county: { $in: split }})
    }
    if(weight){
        const num = parseFloat(weight)
        filters.push({ weight: num })
    }

    const geoplaces = await Geoplace.find(filters)

    res.status(200).json(geoplaces)

})