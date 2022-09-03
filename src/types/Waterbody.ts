import { GeometryCollection } from "geojson"

export interface IWaterbody {
    id: number,
    name: string
    classification: WaterbodyClassification
    country: string
    ccode: string
    subregion: string | null
    admin_one: string[]
    admin_two: string[]
    simplified_geometries: GeometryCollection
    weight: number
    oid: string
}


export type WaterbodyClassification = 
    | 'bay' | 'bayou' | 'beach' | 'bend' | 'creek'
    | 'dock' | 'harbor' | 'lagoon' | 'lake' | 'marsh' | 'oxbow'
    | 'pond' | 'reservoir' | 'river' | 'slough' | 'stream' 
    | 'unknown' | 'strait'