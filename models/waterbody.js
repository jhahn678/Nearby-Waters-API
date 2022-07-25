const mongoose = require('mongoose')

const waterbodySchema = new mongoose.Schema({
    name: String,
    geometries: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Geometry'
        }
    ]
})


module.exports = mongoose.model('Waterbody', waterbodySchema)