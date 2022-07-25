const catchAsync = require('../utils/catchAsync')
const QueryError = require('../utils/errors/QueryError')
const Geometry = require('../models/geometry')
const Waterbody = require('../models/waterbody')
const { milesToMeters } = require('../utils/conversions')
const { toGeoJsonFeature, toGeoJsonFeatureCollection, toGeoJsonFeatureCollectionFromSearch} = require('../utils/toGeoJson')

//search        -- optional     Optional search string to narrow results by name
//lat           -- required     Latitude EPSG 4236
//lng           -- required     Longitude
//maxdis        -- def:10       Radius of search in miles
//mindis        -- def:0        Minimum distance from lat/lng
//coordinate    -- def:false    Will send back a single point geojson object with response
//unique        -- def:true     Only return one result per geometry name. 





// Route:          /near
// Purpose:        Return named results from DB. Not for visualization

const queryByCoordinates = catchAsync( async (req, res) => {
    
    const { lat, lng, maxdis=10, mindis=0, coordinate=false, unique=true, search="" } = req.query;

    if(!lat || !lng){
        throw new QueryError(400, 'Query string must include both a lat and lon value')
    }


    const response = await Geometry.find({ 
        $and: [{
            name: {
                $regex: `.*${search}.*`,
                $options: "i"
            }
        },{
            geometry: {
                $near: {
                    $geometry: {
                        type: "Point" ,
                        coordinates: [lng, lat]
                    },
                    $maxDistance: milesToMeters(maxdis),
                    $minDistance: milesToMeters(mindis)
                }
            }
        }]
    })


    if(!response) return res.status(200).json({ results: [], message: 'No results found' })

    
    if(unique) {
        const allNames = response.map(r => r.name)
        const uniqueNames = new Set(allNames)
        const uniqueNamesArray = Array.from(uniqueNames)
        const uniqueGeometries = uniqueNamesArray.map(item => {
                const found = response.find(i => i.name === item)
                const obj = { _id: found._id, name: found.name, classification: found.classification }
                if(coordinate && found.geometry.type === 'Polygon'){
                    obj.geometry = {
                        type: 'Point',
                        coordinates: found.geometry.coordinates[0][0]
                    }
                }
                if(coordinate && found.geometry.type === 'LineString'){
                    obj.geometry = {
                        type: 'Point',
                        coordinates: found.geometry.coordinates[0]
                    }
                }
                return obj;
        })
        return res.status(200).json(uniqueGeometries)
    }

    else if(coordinate){
        const duplicatesWithCoordinate = response.map(g => {
            const obj = { _id: g._id, name: g.name, classification: g.classification }
            if(g.geometry.type === 'Polygon') {
                obj.geometry = {
                    type: 'Point',
                    coordinates: g.geometry.coordinates[0][0]
                }
            }else if(g.geometry.type === 'LineString'){
                obj.geometry = {
                    type: 'Point',
                    coordinates: g.geometry.coordinates[0]
                }
            }
            return obj;
        })
        return res.status(200).json(duplicatesWithCoordinate)
    }
    
    else {
        const duplicates = response.map(g => ({ _id: g._id, name: g.name, classification: g.classification }))
        return res.status(200).json(duplicates)
    }

})







// Route:          /near
// Purpose:        Return query results as GeoJson Feature Collection

const queryByCoordinatesGeoJson = catchAsync( async (req, res) => {

    const { lat, lng, maxdis=10, mindis=0, search="" } = req.query;

    if(!lat || !lng){
        throw new QueryError(400, 'Query string must include both a lat and lon value')
    }


    const response = await Geometry.find({ 
        $and: [{
            name: {
                $regex: `.*${search}.*`,
                $options: "i"
            }
        },{
            geometry: {
                $near: {
                    $geometry: {
                        type: "Point" ,
                        coordinates: [lng, lat]
                    },
                    $maxDistance: milesToMeters(maxdis),
                    $minDistance: milesToMeters(mindis)
                }
            }
        }]
    })

    if(!response) return res.status(200).json({ results: [], message: 'No results found' })

    const geojson = toGeoJsonFeatureCollection(response)

    return res.status(200).json(geojson)

})






// Route:          /search
// Purpose:        Searching for named geometry relations ('waterbody names')

const queryBySearchTerm = catchAsync( async (req, res) => {

    const { value } = req.query;

    console.log(value)

    if(!value) throw new QueryError(400, 'Search term is missing from request')
    if(value.length < 5) throw new QueryError(400, 'Search term must be at least 5 characters long')


    const results = await Waterbody
        .find({ $text: { $search: value }})
        .sort({ score: { $meta: "textScore" } } )
        .populate('geometries')
        .limit(5)
        .lean()


    const geojson = toGeoJsonFeatureCollectionFromSearch(results)

    res.status(200).json(geojson)

})


module.exports = {
    queryByCoordinates,
    queryByCoordinatesGeoJson,
    queryBySearchTerm
}