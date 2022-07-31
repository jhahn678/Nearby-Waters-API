export const validateCoords = (lng: number, lat: number): boolean => {
    if(
        lng > -180 && lng < 180 &&
        lat > -90 && lat < 90
    ){
        return true;
    }else {
        return false;
    }
} 
