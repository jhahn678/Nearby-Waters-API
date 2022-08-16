export const validateAccessPointType = (type: string): boolean => {
    if(type === 'PARKING_LOT' || type === 'PULLOFF' || type === 'WALK_IN'){
        return true;
    }else{
        return false;
    }
}