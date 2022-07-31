const mongoose = require('mongoose')

const waterbodySchema = new mongoose.Schema({
    name: String,
    states: [String],
    classification: String,
    geometries: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Geometry'
        }
    ]
})


module.exports = mongoose.model('Waterbody', waterbodySchema)