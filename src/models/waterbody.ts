import mongoose from 'mongoose'
import { StateAbbreviation } from "../types/enums/states"
import { WaterbodyClassification } from '../types/enums/models'
import { GeometryCollection } from "geojson"

export interface IWaterbody {
    name: string
    states: StateAbbreviation[]
    classification: WaterbodyClassification
    weight: number
    country: string
    counties: string[]
    ccode: string
    subregion: string
    geometries: string[]
    simplified_geometries: GeometryCollection
}

const waterbodySchema = new mongoose.Schema<IWaterbody>({
    name: String,
    states: [String],
    classification: String,
    weight: Number,
    country: String,
    ccode: String,
    subregion: String,
    counties: [String],
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