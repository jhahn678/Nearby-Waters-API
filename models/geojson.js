const mongoose = require('mongoose')

const geojsonSchema = new mongoose.Schema({
    osm_id: Number,
    code: Number,
    fclass: String,
    name: String,
    geometry: {
        type: {
            type: String,
            enum: ["MultiLineString", "MultiPolygon"],
            required: true
        },
        coordinates: []
    }
}, { timestamps: true })

module.exports = mongoose.model("Geojson", geojsonSchema)