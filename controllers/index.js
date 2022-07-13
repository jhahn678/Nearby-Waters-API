const catchAsync = require('../utils/catchAsync')
const QueryError = require('../utils/errors/QueryError')
const GeoJson = require('../models/geojson')


const queryByCoordinates = catchAsync( async (req, res) => {

    const { lat, lon } = req.query;

    if(!lat || !lon){
        throw new QueryError(400, 'Query string must include both a lat and lon value')
    }

    console.log(lat, lon)

    const response = await GeoJson.find({ geometry: {
        $near: {
            $geometry: {
                type: "Point" ,
                coordinates: [lon, lat]
             },
             $maxDistance: 25000,
             $minDistance: 0
        }
    }})

    if(response){
        const array = response.map(r => r.name)
        const set = new Set(array)
        const setArray = Array.from(set)
        res.status(200).json(setArray)
    }else{
        res.status(204).json({ results: [] })
    }


    res.status(200).json({ message: 'coordinates received'})

})


module.exports = {
    queryByCoordinates
}