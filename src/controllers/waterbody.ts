import Waterbody, { IWaterbody } from "../models/waterbody";
import catchAsync from "../utils/catchAsync";
import { validateCoords } from '../utils/coordValidation'
import { milesToMeters } from "../utils/conversions";
import { Request } from "express";
import { FilterQuery, PipelineStage } from 'mongoose'
import { distanceWeightFunction } from "../utils/searchWeights";
import { CoordinateError } from "../utils/errors/CoordinateError";


interface WaterbodyQuery {
    _id: string,
    geometries?: string | boolean
}

export const getWaterbody = catchAsync(async (req: Request<{},{},{},WaterbodyQuery>, res, next) => {

    const { _id, geometries } = req.query;

    if(!_id) res.status(400).json({ error: 'No _id provided'})

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
    page: string
    limit: string
}


export const getWaterbodies = catchAsync(async(req: Request<{},{},{},WaterbodiesQuery>, res, next) => {
    const { 
        value, classifications, 
        states, ccode, subregion, 
        minWeight, maxWeight,
        geometries, lnglat, within,
        page, limit 
    } = req.query;


    console.log(page)

    const filters:  FilterQuery<IWaterbody>[] = []

    const pipeline: PipelineStage[] = []

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
    if(minWeight && maxWeight){
        filters.push({ weight: { 
            $and: [{ $gte: parseFloat(minWeight) }, { $lte: parseFloat(maxWeight) }] 
        }})
    }
    else if(maxWeight){
        filters.push({ weight: { $lte: parseFloat(maxWeight) }})
    }
    else if(minWeight){
        filters.push({ weight: { $gte: parseFloat(minWeight) }})
    }
    if(ccode){
        filters.push({ ccode: ccode })
    }
    if(subregion){
        filters.push({ subregion: subregion })
    }

    if(lnglat){
        const coords = lnglat.split(',').map(x => parseFloat(x))
        if(!validateCoords(coords)){
            throw new CoordinateError(400, 'Provided coordinates are not valid')
        }
        pipeline.push(
            { $geoNear: { 
                near: { type: "Point", coordinates: [coords[0], coords[1]] },
                distanceField: 'distanceFrom',
                query: { $and: filters.length > 0 ? filters : [{}] },
                maxDistance: within ? milesToMeters(within) : 80000,
                spherical: false
            }},
            { $addFields: { 
                rank: { $function: {
                    body: within ? 
                        distanceWeightFunction(milesToMeters(within)) : 
                        distanceWeightFunction(80000),
                    args: [ '$distanceFrom', '$weight'],
                    lang: 'js'
                }}
            }}
        )
    }else{
        pipeline.push( 
            { $match: { $and: filters.length > 0 ? filters : [{}] } },
            { $addFields: { rank: '$weight', distanceFrom: 0 } },
        )
    }

    const projection: PipelineStage.FacetPipelineStage[] = []
    

    if(geometries){
        projection.push({
            $lookup: {
                from: 'geometries',
                localField: 'geometries',
                foreignField: '_id',
                as: 'geometries'
            }
        })
    }

    projection.push({ $project: { simplified_geometries: 0 } })
    
           

    pipeline.push({ 
        $facet: {
            metadata: [ 
                { $count: "total" }, 
                { $addFields: { page: parseInt(page) || 1, limit: parseInt(limit) || 50 } } 
            ],
            data: [ 
                { $sort: { rank: -1 } },
                { $skip: (parseInt(limit) * (parseInt(page) - 1)) || 0 }, 
                { $limit: parseInt(limit) || 50 },
                ...projection
            ]
        }
    })
    

    const result = await Waterbody.aggregate(pipeline)


    res.status(200).json({
        metadata: result[0].metadata[0],
        data: result[0].data
    })
})

