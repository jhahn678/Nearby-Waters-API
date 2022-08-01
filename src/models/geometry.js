const mongoose = require('mongoose')

const geometrySchema = new mongoose.Schema({
    osm_id: Number,
    name: String,
    name_lower: String,
    classification: String,
    states: [String],
    parent_waterbody: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Waterbody'
    },
    geometry: {
        type: {
            type: String,
            enum: ["LineString", "Polygon", "MultiLineString", "MultiPolygon"],
            required: true
        },
        coordinates: []
    },
    geometry_simplified: {
        type: {
            type: String,
            enum: ["LineString", "Polygon", "MultiLineString", "MultiPolygon"],
            required: true
        },
        coordinates: []
    },
    counties: [String]
})

module.exports = mongoose.model("Geometry", geometrySchema)