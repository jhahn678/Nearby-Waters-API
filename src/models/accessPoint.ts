import { Point } from 'geojson';
import mongoose from 'mongoose'

export interface IAccessPoint {
    name: string
    description: string
    accessType: 'PARKING_LOT' | 'PULLOFF' | 'WALK_IN'
    restrooms: boolean
    boatLaunch: boolean
    waterbody: string
    geometry: Point
}

const accessPointSchema = new mongoose.Schema({
    name: String,
    description: String,
    accessType: {
        type: String,
        enum: ['PARKING_LOT', 'PULLOFF', 'WALK_IN']
    },
    restrooms: {
        type: Boolean,
        default: false
    },
    boatLaunch: {
        type: Boolean,
        default: false
    },
    waterbody: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Waterbody'
    },
    geometry: {
        type: {
            type: String,
            enum: ['Point']
        },
        coordinates: [Number]
    }
})


const AccessPoint = mongoose.model<IAccessPoint>('AccessPoint', accessPointSchema, 'accesspoints')

export default AccessPoint;