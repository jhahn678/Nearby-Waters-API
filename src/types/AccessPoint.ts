import { Point } from "geojson"
import { Knex } from "knex"

export type AccessType = 'PARKING_LOT' | 'PULL_OFF' | 'WALK_IN'

export interface IAccessPoint {
    id: number
    name: string
    user?: number
    description?: string
    accessType: AccessType
    restrooms?: boolean
    boatLaunch?: boolean
    waterbody: number
    geom: Point
}

export interface INewAccessPoint {
    name: string
    user?: number
    waterbody: number
    geom: Knex.Raw
    accessType: AccessType
    description?: string
    restrooms?: boolean
    boatLaunch?: boolean
}