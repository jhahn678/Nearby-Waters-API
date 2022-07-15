const catchAsync = require('../utils/catchAsync')
const QueryError = require('../utils/errors/QueryError')
const Geometry = require('../models/geometry')
const { milesToMeters } = require('../utils/conversions')


const queryByCoordinates = catchAsync( async (req, res) => {

    const { lat, lon, maxdis=10, mindis=0 } = req.query;

    if(!lat || !lon){
        throw new QueryError(400, 'Query string must include both a lat and lon value')
    }


    const response = await Geometry.find({ 
        geometry: {
            $near: {
                $geometry: {
                    type: "Point" ,
                    coordinates: [lon, lat]
                },
                $maxDistance: milesToMeters(maxdis),
                $minDistance: milesToMeters(mindis)
            }
    }})

    if(!response) return res.status(200).json({ results: [], message: 'No results found' })

    const allNames = response.map(r => r.name)
    const uniqueNames = new Set(allNames)
    const uniqueNamesArray = Array.from(uniqueNames)
    const final = uniqueNamesArray.map(item => {
        const found = response.find(i => i.name === item)
        return { name: found.name, classification: found.classification }
    })
    
    return res.status(200).json(final)

})


module.exports = {
    queryByCoordinates
}