import mongoose from 'mongoose'
import { StateName, StateAbbreviation } from '../types/enums/states'
import { Point } from 'geojson'

export interface IGeoplace {
    name: string,
    fclass: string,
    fcode: string,
    country: string,
    state: StateName,
    abbr: StateAbbreviation,
    county: string,
    weight: number,
    geometry: Point
}

const geoplaceSchema = new mongoose.Schema<IGeoplace>({
    name: String,
    fclass: String,
    fcode: String,
    country: String,
    state: String,
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