const mongoose = require('mongoose')

const waterbodySchema = new mongoose.Schema({
    name: String,
    states: [String],
    classification: String,
    weight: Number,
    geometries: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Geometry'
        }
    ],
    simplified_geometries: {
        type: {
            type: String,
            enum: ['GeometryCollection']
        },
        geometries: [{
            type: {
                type: String,
                enum: ['Point', 'LineString', 'Polygon', 'MultiLineString', 'MulitPolygon'],
            },
            coordinates: []
        }]
    }
})



module.exports = mongoose.model('Waterbody', waterbodySchema)