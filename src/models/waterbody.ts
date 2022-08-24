import mongoose from 'mongoose'
import { WaterbodyClassification } from '../types/enums/models'
import { GeometryCollection } from "geojson"

export interface IWaterbody {
    _id: string,
    name: string
    classification: WaterbodyClassification
    country: string
    ccode: string
    subregion: string
    admin_one: string[]
    admin_two: string[]
    geometries: string[]
    simplified_geometries: GeometryCollection
    weight: number
}

const waterbodySchema = new mongoose.Schema<IWaterbody>({
    name: String,
    classification: String,
    country: String,
    ccode: String,
    subregion: String,
    admin_one: [String],
    admin_two: [String],
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

const Waterbody = mongoose.model<IWaterbody>('Waterbody', waterbodySchema)

export default Waterbody;
