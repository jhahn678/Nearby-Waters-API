import Waterbody from "../models/waterbody";
import catchAsync from "../utils/catchAsync";
import { validateCoords } from '../utils/coordValidation'
import { milesToMeters } from "../utils/conversions";
import { Request } from "express";
import { QueryOptions } from 'mongoose'


interface WaterbodyQuery {
    _id: string,
    geometries?: string | boolean
}

export const getWaterbody = catchAsync(async (req: Request<{},{},{},WaterbodyQuery>, res, next) => {

    const { _id, geometries } = req.query;

    if(geometries){
        const result = await Waterbody.findById(_id).populate('geometries').lean()
        res.status(200).json(result)
    }else{
        const result = await Waterbody.findById(_id).lean()
        res.status(200).json(result)
    }
})


interface WaterbodiesQuery {
    value?: string
    /**
     * Comma seperated
     * ex: pond,lake,river
     */
    classifications?: string
    /**
     * Comma seperated
     * ex: PA,WV,MD
     */
    states?: string
    minWeight?: string
    maxWeight?: string
    ccode?: string
    subregion?: string
    geometries?: string | boolean,
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

export const getWaterbodies = catchAsync(async (req: Request<{},{},{},WaterbodiesQuery>, res, next) => {

    const { 
        value, classifications, 
        states, ccode, subregion, 
        minWeight, maxWeight,
        geometries, lnglat, within 
    } = req.query;

    const filters: QueryOptions[] = []

    if(value){
        filters.push({ name: { $regex: `^${value}`, options: 'i' }})
    }
    if(states){
        const split = states.split(',').map(x => x.trim())
        filters.push({ states: { $in: split }})
    }
    if(classifications){
        const split = classifications.split(',').map(x => x.trim())
        filters.push({ classification: { $in: split }})
    }
    if(minWeight){
        filters.push({ weight: { $gte: parseFloat(minWeight) }})
    }
    if(maxWeight){
        filters.push({ weight: { $lte: parseFloat(maxWeight) }})
    }
    if(ccode){
        filters.push({ ccode: ccode })
    }
    if(subregion){
        filters.push({ subregion: subregion })
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


    if(geometries){
        const results = await Waterbody
            .find(filters)
            .populate('geometries')
            .lean()
            .sort({ weight: -1 })

        res.status(200).json(results)
    }else{
        const results = await Waterbody
            .find(filters)
            .lean()
            .sort({ weight: -1 })

        res.status(200).json(results)
    }

})