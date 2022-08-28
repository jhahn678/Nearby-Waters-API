import { AdminOneName } from "./AdminOne"
import { WaterbodyClassification } from "./Waterbody"
import { LineString, Polygon, MultiLineString, MultiPolygon } from "geojson"

export interface IGeometry{
    id: number,
    osm_id: number,
    name: string,
    // classification: WaterbodyClassification,
    country: string
    ccode: string
    admin_one: AdminOneName[]
    geom: LineString | Polygon | MultiLineString | MultiPolygon
    waterbody: number
}


