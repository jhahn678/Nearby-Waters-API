const catchAsync = require('../utils/catchAsync')
const QueryError = require('../utils/errors/QueryError')
const Waterbody = require('../models/waterbody')
const { toGeoJsonFeatureCollectionFromSearch} = require('../utils/toGeoJson')


// Route:          /search
// Purpose:        Searching for named geometry relations ('waterbody names')

const queryBySearchTerm = catchAsync( async (req, res) => {

    const { value } = req.query;

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
    queryBySearchTerm
}