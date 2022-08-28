const stateGeometries = require('./states-boundaries.json')
import * as turf from '@turf/turf'
import { AdminOneName } from '../types/AdminOne';


export const findStateByPoint = (coords: [lng: number, lat:number]): AdminOneName | null => {
    const point = turf.point(coords)

    for(let state of stateGeometries.features){
        let geometry;

        if(state.geometry.type === 'Polygon'){
            geometry = turf.polygon(state.geometry.coordinates)
        }else{
            geometry = turf.multiPolygon(state.geometry.coordinates)
        }

        // @ts-ignore
        if(turf.booleanPointInPolygon(point, geometry)){
            return state.properties;
        }
    }

    return null;
}


