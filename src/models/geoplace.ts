import mongoose from 'mongoose'
import { AdminOneName, AdminOneAbbreviation } from '../types/enums/adminOne'
import { Point } from 'geojson'

export interface IGeoplace {
    name: string,
    fclass: string,
    fcode: string,
    country: string,
    admin_one: AdminOneName,
    abbr: AdminOneAbbreviation,
    county: string,
    weight: number,
    geometry: Point
}

const geoplaceSchema = new mongoose.Schema<IGeoplace>({
    name: String,
    fclass: String,
    fcode: String,
    country: String,
    admin_one: String,
    abbr: String,
    county: String,
    weight: Number,
    geometry: {
        type: {
            type: String,
            enum: ['Point']
        },
        coordinates: [Number]
    }
})


const Geoplace = mongoose.model<IGeoplace>('Geoplace', geoplaceSchema)

export default Geoplace;