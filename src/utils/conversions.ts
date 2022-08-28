export const milesToMeters = (miles: number | string): number => {
    if(typeof miles === 'string'){
        return Math.floor(parseInt(miles) * 1609.33999997549)
    }else if(typeof miles === 'number'){
        return Math.floor(miles * 1609.33999997549)
    }else{
        return Math.floor(50 * 1609.33999997549)
    }
}