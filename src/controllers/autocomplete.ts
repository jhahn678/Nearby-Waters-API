import catchAsync from "../utils/catchAsync"
import { Request } from 'express'
import { QueryError } from "../utils/errors/QueryError"
import Geoplace from "../models/geoplace"
import Waterbody from "../models/waterbody"
import { validateState } from "../utils/stateValidation"
import { findStateByPoint } from "../utils/findStateByPoint"
import { distanceWeightFunction } from "../utils/searchWeights"
import { validateCoords } from '../utils/coordValidation'
import { PipelineStage } from "mongoose"

type Model = 'WATERBODIES' | 'GEOPLACES'
type Models = { waterbodies: 'WATERBODIES', geoplaces: 'GEOPLACES' }
const models: Models = { waterbodies: 'WATERBODIES', geoplaces: 'GEOPLACES' }

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
///////////          Aggregation pipeline and filter helpers                    ////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

const createFilters = (value: string, model: Model ): Object[] => {

    const filters: Object[] = []

    const parsedValue = value.split(',').map(x => x.trim())

    if(parsedValue.length === 2){
        filters.push({ name: {
            $regex: `^${parsedValue[0]}`,
            $options: 'i'
        }})
        const validState = validateState(parsedValue[1])
        if(validState && model === models.geoplaces) filters.push({ abbr: validState })
        if(validState && model === models.waterbodies) filters.push({ states: validState })
    }else if(parsedValue.length === 1){
        filters.push({ name: {
            $regex: `^${parsedValue[0]}`,
            $options: 'i'
        }})

    }else{
        throw new QueryError(400, 'Invalid request --- Query value must adhere to pattern: "Place", "State"') 
    }

    return filters
}



const createWaterbodiesPipeline = (value: string): PipelineStage[] => ([
    { $match: { $and: createFilters(value, models.waterbodies) } },
    { $addFields: { rank: '$weight' } },
    { $sort: { rank: -1 } },
    { $limit : 8 },
    { $project: { simplified_geometries: 0 }},
    { $addFields: { type: 'WATERBODY' }},
])



const createWaterbodiesGeospatialPipeline = (
    value: string, coords: [number, number], maxDistance: number = 300000
): PipelineStage[] => ([{ 
    $geoNear: { 
        near: {
            type: 'Point',
            coordinates: coords
        },
        distanceField: 'distanceFrom',
        maxDistance: maxDistance,
        query: { $and: createFilters(value, models.waterbodies) },
        spherical: false
    }},
    { $addFields: { 
        rank: { 
            $function: {
                body: distanceWeightFunction(maxDistance),
                args: [
                    '$distanceFrom',
                    '$weight'
                ],
                lang: 'js'
            }
        }}
    },
    { $sort: { rank: -1 } },
    { $limit : 8 },
    { $project: { simplified_geometries: 0 }},
    { $addFields: { type: 'WATERBODY' }}
])



const createGeoplacesPipeline = (value: string): PipelineStage[] => ([
    { $match: { $and: createFilters(value, models.geoplaces) } },
    { $addFields: { rank: '$weight' } },
    { $sort: { rank: -1 } },
    { $limit : 8 },
    { $addFields: { type: 'GEOPLACE', }}
])



const createGeoplacesGeospatialPipeline = (
    value: string, coords: [number, number], maxDistance: number = 500000
): PipelineStage[] => ([{ 
        $geoNear: { 
            near: {
                type: 'Point',
                coordinates: coords
            },
            distanceField: 'distanceFrom',
            maxDistance: maxDistance,
            query: { $and: createFilters(value, models.geoplaces) },
            spherical: false
        }
        },{ $addFields: { 
            rank: { 
                $function: {
                    body: distanceWeightFunction(maxDistance),
                    args: [
                        '$distanceFrom',
                        '$weight'
                    ],
                    lang: 'js'
                }
            }}
        },
        { $sort: { rank: -1 }},
        { $limit: 5 },
        { $addFields: { type: 'GEOPLACE', }}
        
])



////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
///////////                    Autocomplete controllers                       //////////
///////////          Places only, waterbodies only, and combined              //////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////a



export const autocompletePlaces = catchAsync(async (req, res) => {

    const { value, lnglat } = req.query;

    let pipeline: PipelineStage[] = []

    if(lnglat && value.length <= 8){
        const coords = lnglat.split(',').map(x => parseFloat(x))
        if(validateCoords(coords)){
            pipeline = [ ...createGeoplacesGeospatialPipeline(value, coords) ]
        }else{
            pipeline = [ ...createGeoplacesPipeline(value)]
        }
        
    }

    if(!lnglat || value.length > 8){

        pipeline = [ ...createGeoplacesPipeline(value)]
    }

    const results = await Geoplace.aggregate(pipeline)
    
    res.status(200).json(results)

})



export const autocompleteWaterbodies = catchAsync( async (req, res) => {

    const { value, lnglat } = req.query;

    let pipeline: PipelineStage[] = []

    if(lnglat && value.length <= 8){

        const coords = lnglat.split(',').map(x => parseFloat(x))
        if(validateCoords(coords)){
            pipeline = [ ...createWaterbodiesGeospatialPipeline(value, coords) ]
        }else{
            pipeline = [ ...createWaterbodiesPipeline(value) ]
        }

        const results = await Waterbody.aggregate(pipeline)

        res.status(200).json(results)
    }



    if(!lnglat || value.length > 8){

        const pipeline = [ ...createWaterbodiesPipeline(value) ]

        const results = await Waterbody.aggregate(pipeline)

        res.status(200).json(results)
    }

})



export const autocompleteAll = catchAsync( async (req, res) => {

    const { value, lnglat } = req.query;

    let waterbodiesPipeline: PipelineStage[] = []
    let geoplacesPipeline: PipelineStage[] = []

    if(lnglat && value.length <= 8){

        const coords = lnglat.split(',').map(x => parseFloat(x))

        if(validateCoords(coords)){
            waterbodiesPipeline = [ ...createWaterbodiesGeospatialPipeline(value, coords) ]
            geoplacesPipeline = [ ...createGeoplacesGeospatialPipeline(value, coords) ]
        }else{
            waterbodiesPipeline = [ ...createWaterbodiesPipeline(value) ]
            geoplacesPipeline = [ ...createGeoplacesPipeline(value) ]
        }

        const resultsWaterbody = await Waterbody.aggregate(waterbodiesPipeline)
        const resultsGeoplace = await Geoplace.aggregate(geoplacesPipeline)

        const results = [
            ...resultsGeoplace,
            ...resultsWaterbody
        ].sort((x, y) => y.rank - x.rank)

        res.status(200).json(results)
        
    }

    if(!lnglat || value.length > 8){

        waterbodiesPipeline = [ ...createWaterbodiesPipeline(value) ]
        geoplacesPipeline = [ ...createGeoplacesPipeline(value) ]

        const resultsWaterbody = await Waterbody.aggregate(waterbodiesPipeline)
        const resultsGeoplace = await Geoplace.aggregate(geoplacesPipeline)

        const results = [
            ...resultsGeoplace,
            ...resultsWaterbody
        ].sort((x, y) => y.rank - x.rank)

        res.status(200).json(results)
    }

})




////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////         Additional helper for calculating state coords are in          ////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////



export const getStateByCoords = catchAsync( async(req, res) => {

    const { lnglat } = req.query;

    if(!lnglat) throw new QueryError(400, 'Invalid Request -- Coords not provided')

    const coords = lnglat.split(',')
    const state = findStateByPoint(coords)

    res.status(200).json(state)
})




////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//////////////             Autocomplete for dev query by name         //////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////



interface DistinctNameQuery { 
    value: string
}

export const autocompleteDistinctName = catchAsync(async(req: Request<{},{},{},DistinctNameQuery>, res, next) => {
    const { value } = req.query;

    const results = await Waterbody.distinct('name', { name: { $regex: `^${value}`, $options: 'i' }})

    res.status(200).json(results)
})

