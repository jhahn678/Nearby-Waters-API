const mongoose = require('mongoose')


const geoplaceSchema = new mongoose.Schema({
    name: String,
    fclass: String,
    fcode: String,
    country: String,
    state: String,
    abbr: String,
    geometry: {
        type: {
            type: String,
            enum: 'Point'
        },
        coordinates: [Number]
    }
})




module.exports = mongoose.model('Geoplace', geoplaceSchema)