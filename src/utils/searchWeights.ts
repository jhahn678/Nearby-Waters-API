export const distanceWeight = ( distance: number, maxDistance=300000, maxWeight=2, minWeight=1.3 ): number => {
// weight = maxweight - ( ( distance / maxDistance )^2 * ( maxweight - minweight ) )
    return (
        maxWeight - ( Math.pow((distance/maxDistance), 2) * ( maxWeight - minWeight ) )   
    )
}

type DistanceWeightFunction = (
    /** Maximum distance in meters for weight to be applied to
     *  -- should line up with query distance 
     * @default 300000 */
    maxDistance?: number, 
    /** Minimum distance in meters for weight to be applied to  
     * @default 15000 */
    minDistance?: number,
    /** Maximum weight for a waterbody by distance
    * @default 2 */
    maxWeight?: number, 
    /** Minimum weight for a waterbody by distance 
    *  -- lines up with maxDistance
    * @default 1.3 */
    minWeight?: number
    ) => (
    distance: number, weight: number, maxDistance?: number, minDistance?: number, maxWeight?: number, minWeight?: number
) => number

export const distanceWeightFunction: DistanceWeightFunction = () => (
    distance, weight, maxDistance=300000, minDistance=15000, maxWeight=2, minWeight=1.3
) => {
    return (
        (maxWeight - ( Math.pow(((distance < minDistance ? minDistance : distance)/maxDistance), 2) * ( maxWeight - minWeight ) )) * weight
    )
}

