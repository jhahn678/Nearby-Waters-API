import catchAsync from '../utils/catchAsync'
import  { QueryError } from '../utils/errors/QueryError'
import Geometry from '../models/geometry'
import { milesToMeters } from '../utils/conversions'
import { Response, Request } from 'express'
// import { toGeoJsonFeatureCollection } from '../utils/toGeoJson'

interface QueryByCoordsQS{
    lat: string,
    lng: string,
    maxdis: number,
    mindis: number,
    search: string
}


export const queryByCoordinatesGeoJson = catchAsync( async (
    req: Request<{},{},{},QueryByCoordsQS>, res, next
): Promise<any> => {

    const { lat, lng, maxdis=10, mindis=0, search="" } = req.query;

    if(!lat || !lng){
        throw new QueryError(400, 'Query string must include both a lat and lon value')
    }


    const response = await Geometry
        .find({ 
            $and: [{
                name: {
                    $regex: `^${search}`,
                    $options: "i"
                }
            },{
                geometry: {
                    $near: {
                        $geometry: {
                            type: "Point" ,
                            coordinates: [lng, lat]
                        },
                        $maxDistance: milesToMeters(maxdis),
                        $minDistance: milesToMeters(mindis)
                    }
                }
            }]
        })

    if(!response) return res.status(200).json({ results: [], message: 'No results found' })

    const geojson = toGeoJsonFeatureCollection(response)

    return res.status(200).json(geojson)

})
