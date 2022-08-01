import * as turf from "@turf/turf";
import { CoordinateError } from "./errors/CoordinateError";
import { USA_BOUNDARY_POLYGON } from './data-boundary-polygon'

export const validateCoords = (lng: number, lat: number): boolean => {
    if(lng < -180 || lng > 180){
        throw new CoordinateError(400, 'Provided longitude is invalid. Valid range is -180 to 180.')
    }
    if(lat > 90 || lat < -90){
        throw new CoordinateError(400, 'Provided latitude is invalid. Valid range is -90 to 90.')
    }
    const point = turf.point([lng, lat])
    if(turf.booleanWithin(point, USA_BOUNDARY_POLYGON)){
        return true;
    }else{
        return false;
    }
} 
