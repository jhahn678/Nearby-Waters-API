const catchAsync = require('../utils/catchAsync')
const QueryError = require('../utils/errors/QueryError')
const Geoplace = require('../models/geoplace')
const { validateState } = require('../utils/places-enums')


const autocompletePlaces = catchAsync(async (req ,res) => {

    const { value } = req.query;

    if(!value) throw new QueryError(400, 'Invalid Request -- Query value is required')

    const filters = []

    const parsed = value.split(',').map(x => x.trim())

    if(parsed.length === 2){
        filters.push({ $text: { $search: parsed[0] }})
        const validState = validateState(parsed[1])
        if(validState) filters.push({ abbr: validState })

    }else if(parsed.length === 1){
        filters.push({ $text: { $search: parsed[0] }})

    }else{
        throw new QueryError(400, 'Invalid request --- Query value must adhere to pattern: "Place", "State"') 
    }

    const results = await Geoplace
        .find({ $and: filters }, { score: { $meta: "textScore" } })
        .sort({ score: { $meta: "textScore" } } )
        .limit(3)

        
    res.status(200).json(results)

})


module.exports = { 
    autocompletePlaces
}