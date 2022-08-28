export const validateAccessPointType = (type: string): boolean => {
    if(type === 'PARKING_LOT' || type === 'PULL_OFF' || type === 'WALK_IN'){
        return true;
    }else{
        return false;
    }
}