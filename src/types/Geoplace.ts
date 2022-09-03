import { AdminOneName } from './AdminOne'
import { Point } from 'geojson'

export interface IGeoplace {
    id: number,
    oid: string,
    name: string,
    fclass: string,
    fcode: string,
    country: string,
    ccode: string,
    admin_one: AdminOneName | null,
    admin_two: string | null,
    weight: number,
    geom: Point
}