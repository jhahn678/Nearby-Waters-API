const catchAsync = require('../utils/catchAsync')
const QueryError = require('../utils/errors/QueryError')
const Geoplace = require('../models/geoplace')
const Waterbody = require('../models/waterbody')
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



const createWaterbodiesPipeline = value => ([
    { $match: { $and: createFilters(value, models.waterbodies) } },
    { $addFields: { rank: '$weight' } },
    { $project: {
        _id: '$_id._id',
        name: '$_id.name',
        states: '$_id.states',
        classification: '$_id.classification',
        rank: '$rank'
    }},
    { $sort: { rank: -1 } },
    { $limit : 5 }
])



const createWaterbodiesGeospatialPipeline = (
    value, coords, maxDistance=300000
) => ([{ 
    $geoNear: { 
        near: {
            type: 'Point',
            coordinates: coords
        },
        key: 'geometry_simplified',
        distanceField: 'distanceFrom',
        maxDistance: maxDistance,
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
                body: distanceWeightFunction(maxDistance),
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
    }},
    { $sort: { rank: -1 } },
    { $limit : 5 }
])



const createGeoplacesPipeline = value => ([
    { $match: { $and: createFilters(value, models.geoplaces) } },
    { $addFields: { rank: '$weight' } },
    { $project: {
        _id: '$_id',
        name: '$name',
        state: '$state',
        abbr: '$abbr',
        geometry: '$geometry',
        county: '$county',
        distanceFrom: '$distanceFrom',
        rank: '$rank'
    }},
    { $sort: { rank: -1 } },
    { $limit : 5 }
])



const createGeoplacesGeospatialPipeline = (
    value, coords, maxDistance=500000
) => ([{ 
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
        { $project: {
            _id: '$_id',
            name: '$name',
            state: '$state',
            abbr: '$abbr',
            geometry: '$geometry',
            county: '$county',
            distanceFrom: '$distanceFrom',
            rank: '$rank'
        }},
        { $sort: { rank: -1 }},
        { $limit: 5 }
])


const autocompletePlaces = catchAsync(async (req, res) => {

    const { value, lnglat } = req.query;

    if(!value) throw new QueryError(400, 'Invalid Request -- Query value is required')

    const pipeline = []

    if(lnglat && value.length <= 8){
        const coords = lnglat.split(',').map(x => parseFloat(x))
        if(!validateCoords(coords[0], coords[1])){
            throw new QueryError(400, 'Invalid coordinates --- Coords must adhere to pattern: "Longitude,Latitude"')
        }

        pipeline = [ ...createGeoplacesGeospatialPipeline(value, coords) ]
    }

    if(!lnglat || value.length > 8){

        pipeline = [ ...createGeoplacesPipeline(value)]
    }

    const results = await Geoplace.aggregate(pipeline)
    
    res.status(200).json(results)

})










const autocompleteWaterbodies = catchAsync( async (req, res) => {

    const { value, lnglat } = req.query;

    if(!value) throw new QueryError(400, 'Invalid Request -- Query value is required')

    const pipeline = []

    if(lnglat && value.length <= 8){

        const coords = lnglat.split(',').map(x => parseFloat(x))
        if(!validateCoords(coords[0], coords[1])){
            throw new QueryError(400, 'Invalid coordinates --- Coords must adhere to pattern: "Longitude,Latitude"')
        }

        pipeline = [ ...createWaterbodiesGeospatialPipeline(value, coords) ]
    }



    if(!lnglat || value.length > 8){

        pipeline = [ ...createWaterbodiesPipeline(value) ]
    }

    const results = await Waterbody.aggregate(pipeline)

    res.status(200).json(results)

})







const autocompleteAll = catchAsync( async (req, res) => {

    const { value, lnglat } = req.query;

    if(!value) throw new QueryError(400, 'Invalid Request -- Query value is required')

    const waterbodiesPipeline = []
    const geoplacesPipeline = []

    if(lnglat && value.length <= 8){

        const coords = lnglat.split(',').map(x => parseFloat(x))
        if(!validateCoords(coords[0], coords[1])){
            throw new QueryError(400, 'Invalid coordinates --- Coords must adhere to pattern: "Longitude,Latitude"')
        }

        waterbodiesPipeline = [ ...createWaterbodiesGeospatialPipeline(value, coords) ]
        geoplacesPipeline = [ ...createGeoplacesGeospatialPipeline(value, coords) ]
        
    }

    if(!lnglat || value.length > 8){

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
})



const getStateByCoords = catchAsync( async(req, res) => {

    const { lnglat } = req.query;

    if(!coords) throw new QueryError(400, 'Invalid Request -- Coords not provided')

    const coords = coords.split(',')
    const state = findStateByPoint(coords)

    res.status(200).json(state)
})


module.exports = { 
    autocompletePlaces,
    autocompleteWaterbodies,
    autocompleteAll,
    getStateByCoords
}
