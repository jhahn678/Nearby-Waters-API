const mongoose = require('mongoose')

const geometrySchema = new mongoose.Schema({
    osm_id: Number,
    name: String,
    classification: String,
    geometry: {
        type: {
            type: String,
            enum: ["LineString", "Polygon", "MultiLineString", "MultiPolygon"],
            required: true
        },
        coordinates: []
    }
})

module.exports = mongoose.model("Geometry", geometrySchema)