import Geometry from "../models/geometry";
import { Request } from 'express'
import catchAsync from "../utils/catchAsync";
import { QueryOptions } from 'mongoose'


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

}

export const getGeometries = catchAsync(async(req, res, next) => {})