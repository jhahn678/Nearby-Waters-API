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

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
///////////          Aggregation pipeline and filter helpers                    ////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////


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
        _id: '$_id',
        type: 'WATERBODY',
        name: '$name',
        states: '$states',
        classification: '$classification',
        rank: '$rank'
    }},
    { $sort: { rank: -1 } },
    { $limit : 8 }
])



const createWaterbodiesGeospatialPipeline = (
    value, coords, maxDistance=300000
) => ([{ 
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
    { $project: {
        _id: '$_id',
        type: 'WATERBODY',
        name: '$name',
        states: '$states',
        classification: '$classification',
        distanceFrom: '$distanceFrom',
        rank: '$rank'
    }}
])



const createGeoplacesPipeline = value => ([
    { $match: { $and: createFilters(value, models.geoplaces) } },
    { $addFields: { rank: '$weight' } },
    { $sort: { rank: -1 } },
    { $limit : 8 },
    { $project: {
        _id: '$_id',
        type: 'GEOPLACE',
        fcode: '$fcode',
        name: '$name',
        state: '$state',
        abbr: '$abbr',
        geometry: '$geometry',
        county: '$county',
        rank: '$rank'
    }}
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
            type: 'GEOPLACE',
            name: '$name',
            state: '$state',
            abbr: '$abbr',
            fcode: '$fcode',
            geometry: '$geometry',
            county: '$county',
            distanceFrom: '$distanceFrom',
            rank: '$rank'
        }},
        { $sort: { rank: -1 }},
        { $limit: 5 }
])



////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
///////////                    Autocomplete controllers                       //////////
///////////          Places only, waterbodies only, and combined              //////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////a



const autocompletePlaces = catchAsync(async (req, res) => {

    const { value, lnglat } = req.query;

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

    const pipeline = []

    if(lnglat && value.length <= 8){

        const coords = lnglat.split(',').map(x => parseFloat(x))
        if(!validateCoords(coords[0], coords[1])){
            throw new QueryError(400, 'Invalid coordinates --- Coords must adhere to pattern: "Longitude,Latitude"')
        }

        pipeline = [ ...createWaterbodiesGeospatialPipeline(value, coords) ]

        const results = await Geometry.aggregate(pipeline)

        res.status(200).json(results)
    }



    if(!lnglat || value.length > 8){

        pipeline = [ ...createWaterbodiesPipeline(value) ]

        const results = await Waterbody.aggregate(pipeline)

        res.status(200).json(results)
    }

})



const autocompleteAll = catchAsync( async (req, res) => {

    const { value, lnglat } = req.query;

    const waterbodiesPipeline = []
    const geoplacesPipeline = []

    if(lnglat && value.length <= 8){

        const coords = lnglat.split(',').map(x => parseFloat(x))
        if(!validateCoords(coords[0], coords[1])){
            throw new QueryError(400, 'Invalid coordinates --- Coords must adhere to pattern: "Longitude,Latitude"')
        }

        waterbodiesPipeline = [ ...createWaterbodiesGeospatialPipeline(value, coords) ]
        geoplacesPipeline = [ ...createGeoplacesGeospatialPipeline(value, coords) ]

        const resultsWaterbody = await Geometry.aggregate(waterbodiesPipeline)

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



const getStateByCoords = catchAsync( async(req, res) => {

    const { lnglat } = req.query;

    if(!lnglat) throw new QueryError(400, 'Invalid Request -- Coords not provided')

    const coords = lnglat.split(',')
    const state = findStateByPoint(coords)

    res.status(200).json(state)
})


module.exports = { 
    autocompletePlaces,
    autocompleteWaterbodies,
    autocompleteAll,
    getStateByCoords
}
