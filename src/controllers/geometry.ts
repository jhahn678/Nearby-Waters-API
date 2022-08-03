import Geometry from "../models/geometry";
import { Request } from 'express'
import catchAsync from "../utils/catchAsync";
import { QueryOptions } from 'mongoose'
import { validateCoords } from "../utils/coordValidation";


interface GetGeometryQuery {
    _id: string,
    waterbody?: string | boolean
}


export const getGeometry = catchAsync(async(req: Request<{},{},{},GetGeometryQuery>, res, next) => {
    const { _id, waterbody } = req.query
    if(waterbody){
        const result = await Geometry.findById(_id).lean().populate('parent_waterbody')
        res.status(200).json(result)
    }else{
        const result = await Geometry.findById(_id).lean()
        res.status(200).json(result)
    }
})


interface GetGeometriesQuery{
    _ids?: string,
    name?: string,
    classification?: string,
    lnglat?: string,
    within: string
}

export const getGeometries = catchAsync(async(req: Request<{},{},{},GetGeometriesQuery>, res, next) => {
    const { _ids, name, classification, lnglat, within } = req.query;

    const filters: QueryOptions[] = []

    if(_ids){
        const split = _ids.split(',').map(x => x.trim())
        filters.push({ _id: { $in: split }})
    }
    if(name){
        filters.push({ name: { $regex: `^${name}`, $options: 'i' }})
    }
    if(classification){
        const split = classification.split(',').map(x => x.trim())
        filters.push({ classification: { $in: split }})
    }
    if(lnglat){
        const coords = lnglat.split(',').map(x => parseFloat(x))
        if(validateCoords(coords)){
            if(within){
                filters.push({ simplified_geometries: { 
                    $geoWithin: { $center: [coords, parseInt(within)/3963.2] }
                }})
            }
            else{
                filters.push({ simplified_geometries: { 
                    $geoWithin: { $center: [ coords, 50/3963.2 ] },
                }})
            }
        }
    }
})