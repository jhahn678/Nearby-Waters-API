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
    admin_one: AdminOneName,
    admin_two: string,
    weight: number,
    geom: Point
}