import mongoose, { ObjectId } from "mongoose"
import { AdminOneAbbreviation } from "../types/enums/adminOne"
import { WaterbodyClassification } from "../types/enums/models"
import { LineString, Polygon, MultiLineString, MultiPolygon } from "geojson"

export interface IGeometry{
    osm_id: number,
    name: string,
    name_lower: string,
    classification: WaterbodyClassification,
    states?: AdminOneAbbreviation[],
    admin_one?: AdminOneAbbreviation[],
    admin_two?: string[],
    parent_waterbody: ObjectId,
    geometry: LineString | Polygon | MultiLineString | MultiPolygon,
    geometry_simplified: LineString | Polygon | MultiLineString | MultiPolygon,
    counties?: string[],

}

const geometrySchema = new mongoose.Schema<IGeometry>({
    osm_id: Number,
    name: String,
    name_lower: String,
    classification: String,
    states: [String],
    admin_one: [String],
    admin_two: [String],
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

const Geometry = mongoose.model<IGeometry>("Geometry", geometrySchema)

export default Geometry;