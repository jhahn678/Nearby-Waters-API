const catchAsync = require('../utils/catchAsync')
const QueryError = require('../utils/errors/QueryError')
const Geometry = require('../models/geometry')
const { milesToMeters } = require('../utils/conversions')
const { toGeoJsonFeatureCollection } = require('../utils/toGeoJson')


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


module.exports = {
    queryByCoordinatesGeoJson
}