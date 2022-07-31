export const distanceWeight = ( distance: number, maxDistance=500000, maxWeight=2, minWeight=1.3 ): number => {
// weight = maxweight - ( ( distance / maxDistance )^2 * ( maxweight - minweight ) )
    return (
        maxWeight - ( Math.pow((distance/maxDistance), 2) * ( maxWeight - minWeight ) )   
    )
}

type DistanceWeightFunction = (maxDistance?: number, maxWeight?: number, minWeight?: number) => (
    distance: number, weight: number, maxDistance?: number, maxWeight?: number, minWeight?: number
) => number

export const distanceWeightFunction: DistanceWeightFunction = () => (
    distance, weight, maxDistance=500000, maxWeight=2, minWeight=1.3
) => {
    return (
        (maxWeight - ( Math.pow(((distance < 15000 ? 15000 : distance)/maxDistance), 2) * ( maxWeight - minWeight ) )) * weight
    )
}

