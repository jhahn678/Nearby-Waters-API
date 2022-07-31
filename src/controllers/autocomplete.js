const catchAsync = require('../utils/catchAsync')
const QueryError = require('../utils/errors/QueryError')
const Geoplace = require('../models/geoplace')
const Waterbody = require('../models/waterbody')
const Geometry = require('../models/geometry')
const { validateState } = require('../utils/stateValidation')
const { findStateByPoint } = require('../utils/findStateByPoint')
const { distanceWeightFunction } = require('../utils/searchWeights')
const { validateCoords } = require('../utils/coordValidation')

const models = { waterbodies: 'WATERBODIES', geoplaces: 'GEOPLACES' }

const createFilters = (value, model) => {

    const filters = []

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



const autocompletePlaces = catchAsync(async (req, res) => {

    const { value, lnglat } = req.query;

    if(!value) throw new QueryError(400, 'Invalid Request -- Query value is required')

    const pipeline = []

    if(lnglat){
        const coords = lnglat.split(',').map(x => parseFloat(x))
        if(!validateCoords(coords[0], coords[1])){
            throw new QueryError(400, 'Invalid coordinates --- Coords must adhere to pattern: "Longitude,Latitude"')
        }

        pipeline.push({ 
            $geoNear: { 
                near: {
                    type: 'Point',
                    coordinates: coords
                },
                distanceField: 'distanceFrom',
                maxDistance: 500000,
                query: { $and: createFilters(value, models.geoplaces) },
                spherical: false
            }
            },{ $addFields: { 
                rank: { 
                    $function: {
                        body: distanceWeightFunction(),
                        args: [
                            '$distanceFrom',
                            '$weight'
                        ],
                        lang: 'js'
                    }
                }}
            },
            {  $sort: {  rank: -1 } }
        )

    }

    if(!lnglat){
        pipeline.push(
            { $addFields: { ranking: '$weight' } },
            { $sort: { ranking: -1 } }
        )

    }

    const results = await Geoplace.aggregate([
        ...pipeline,
        { $limit : 5 }
    ])
        
        
    res.status(200).json(results)

})










const autocompleteWaterbodies = catchAsync( async (req, res) => {

    const { value, lnglat } = req.query;

    if(!value) throw new QueryError(400, 'Invalid Request -- Query value is required')

    const pipeline = []

    if(lnglat){
        const coords = lnglat.split(',').map(x => parseFloat(x))
        if(!validateCoords(coords[0], coords[1])){
            throw new QueryError(400, 'Invalid coordinates --- Coords must adhere to pattern: "Longitude,Latitude"')
        }

        pipeline.push(
            { $geoNear: { 
                near: {
                    type: 'Point',
                    coordinates: coords
                },
                key: 'geometry_simplified',
                distanceField: 'distanceFrom',
                maxDistance: 300000,
                query: { $and: createFilters(value, models.waterbodies) },
                spherical: false
            }},
            { $group: {
                _id: '$parent_waterbody',
                distanceFrom: {
                    $min: '$distanceFrom'
                }
            }},
            { $lookup: {
                from: 'waterbodies',
                localField: '_id',
                foreignField: '_id',
                as: '_id'
            }}, 
            { $unwind: {
                path: '$_id'
            }},
            { $addFields: { 
                rank: { 
                    $function: {
                        body: distanceWeightFunction(300000),
                        args: [
                            '$distanceFrom',
                            '$_id.weight'
                        ],
                        lang: 'js'
                    }
                }}
            },
            { $project: {
                 _id: '$_id._id',
                 name: '$_id.name',
                 states: '$_id.states',
                 classification: '$_id.classification',
                 distanceFrom: '$distanceFrom',
                 rank: '$rank'
            }}
        )

        const results = await Geometry.aggregate([
            ...pipeline,
            { $sort: { rank: -1 } },
            { $limit : 5 }
        ])
            
        res.status(200).json(results)
    }



    if(!lnglat){

        pipeline.push(
            { $match: { $and: createFilters(value, models.waterbodies ) } },
            { $project: {
                _id: '$_id',
                name: '$name',
                classification: '$classification',
                weight: '$weight',
                rank: '$weight'
            }}, 
            { $sort: { rank: -1 } },
            { $limit : 5 }
        )

        const results = await Waterbody.aggregate(pipeline)

        res.status(200).json(results)

    }

    
})







const autocompleteAll = catchAsync( async (req, res) => {

    const { value, coords, state: queryState } = req.query;

    let state = null;

    if(queryState) state = queryState;

    if(coords){
        const lnglat = coords.split(',')
        state = findStateByPoint(lnglat).abbr
    }

    if(!value) throw new QueryError(400, 'Invalid Request -- Query value is required')

    const filtersWaterbody = []
    const filtersGeoplace = []

    const parsed = value.split(',').map(x => x.trim())

    if(parsed.length === 2){
        const validState = validateState(parsed[1])
        if(validState){ 
            filtersGeoplace.push({ abbr: validState })
            filtersWaterbody.push({ states: validState })
        }
    }

    if(parsed.length >= 1){
        filtersGeoplace.push({ $text: { $search: parsed[0] }})
        filtersWaterbody.push({ $text: { $search: parsed[0] }})
    }

    const resultsWaterbody = await Waterbody
        .find({ $and: filtersWaterbody }, { score: { $meta: 'textScore' }})
        .sort({ score: { $meta: "textScore" }})
        .lean()
        .limit(10)

    const resultsGeoplace = await Geoplace
        .find({ $and: filtersGeoplace }, { score: { $meta: 'textScore' }})
        .sort({ score: { $meta: "textScore" }})
        .lean()
        .limit(10)


    const resultsAll = [
        ...resultsWaterbody, 
        ...resultsGeoplace
    ].sort((x, y) => y.score - x.score)


    res.status(200).json(resultsAll)
})



const getStateByCoords = catchAsync( async(req, res) => {

    const { coords } = req.query;

    if(!coords) throw new QueryError(400, 'Invalid Request -- Coords not provided')

    const lnglat = coords.split(',')
    const state = findStateByPoint(lnglat)

    res.status(200).json(state)
})


module.exports = { 
    autocompletePlaces,
    autocompleteWaterbodies,
    autocompleteAll,
    getStateByCoords
}
