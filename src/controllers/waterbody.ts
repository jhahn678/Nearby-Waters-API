import Waterbody, { IWaterbody } from "../models/waterbody";
import Geometry from '../models/geometry'
import AccessPoint, { IAccessPoint } from "../models/accessPoint";
import catchAsync from "../utils/catchAsync";
import { validateCoords } from '../utils/coordValidation'
import { milesToMeters } from "../utils/conversions";
import { Request } from "express";
import { FilterQuery, PipelineStage } from 'mongoose'
import { distanceWeightFunction } from "../utils/searchWeights";
import { CoordinateError } from "../utils/errors/CoordinateError";
import { RequestError } from "../utils/errors/RequestError";
import { UnknownReferenceError } from "../utils/errors/UnknownReferenceError";
import { GeoJSON } from 'geojson'
import { QueryError } from "../utils/errors/QueryError";
import { AccessPointCreationError } from '../utils/errors/AccessPointCreationError'
import { validateAccessPointType } from "../utils/accessPointValidations";


interface WaterbodyQuery {
    _id: string,
    geometries?: string | boolean
}

export const getWaterbody = catchAsync(async (req: Request<{},{},{},WaterbodyQuery>, res, next) => {

    const { _id, geometries } = req.query;

    if(!_id) res.status(400).json({ error: 'No _id provided'})

    if(geometries){
        const result = await Waterbody.findById(_id).populate('geometries').lean()
        res.status(200).json(result)
    }else{
        const result = await Waterbody.findById(_id).lean()
        res.status(200).json(result)
    }
})


type Sort = { rank: -1 } | { distanceFrom: 1 } 

interface WaterbodiesQuery {
    value?: string
    /**
     * Comma seperated
     * ex: pond,lake,river
     */
    classifications?: string
    /**
     * Comma seperated
     * ex: PA,WV,MD
     */
    states?: string
    minWeight?: string
    maxWeight?: string
    ccode?: string
    subregion?: string
    geometries?: string | boolean,
    /**
     * Comma seperated -- longitude, latitude
     */
    lnglat?: string,
    /**
     * @default 50
     * Number of miles
     */
    within?: string | number
    page: string
    limit: string
    sort?: 'distance' | 'rank'
}


export const getWaterbodies = catchAsync(async(req: Request<{},{},{},WaterbodiesQuery>, res, next) => {
    const { 
        value, classifications, 
        states, ccode, subregion, 
        minWeight, maxWeight,
        geometries, lnglat, within,
        page, limit, sort 
    } = req.query;

    const filters:  FilterQuery<IWaterbody>[] = []

    const pipeline: PipelineStage[] = []

    if(value){
        filters.push({ name: { $regex: `^${value}`, options: 'i' }})
    }
    if(states){
        const split = states.split(',').map(x => x.trim())
        filters.push({ admin_one: { $in: split }})
    }
    if(classifications){
        const split = classifications.split(',').map(x => x.trim())
        filters.push({ classification: { $in: split }})
    }
    if(minWeight && maxWeight){
        filters.push({ weight: { 
            $and: [{ $gte: parseFloat(minWeight) }, { $lte: parseFloat(maxWeight) }] 
        }})
    }
    else if(maxWeight){
        filters.push({ weight: { $lte: parseFloat(maxWeight) }})
    }
    else if(minWeight){
        filters.push({ weight: { $gte: parseFloat(minWeight) }})
    }
    if(ccode){
        filters.push({ ccode: ccode })
    }
    if(subregion){
        filters.push({ subregion: subregion })
    }

    if(lnglat){
        const coords = lnglat.split(',').map(x => parseFloat(x))
        if(!validateCoords(coords)){
            throw new CoordinateError(400, 'Provided coordinates are not valid')
        }
        pipeline.push(
            { $geoNear: { 
                near: { type: "Point", coordinates: [coords[0], coords[1]] },
                distanceField: 'distanceFrom',
                query: { $and: filters.length > 0 ? filters : [{}] },
                maxDistance: within ? milesToMeters(within) : 80000,
                spherical: false
            }},
            { $addFields: { 
                rank: { $function: {
                    body: within ? 
                        distanceWeightFunction(milesToMeters(within)) : 
                        distanceWeightFunction(80000),
                    args: [ '$distanceFrom', '$weight'],
                    lang: 'js'
                }}
            }}
        )
    }else{
        pipeline.push( 
            { $match: { $and: filters.length > 0 ? filters : [{}] } },
            { $addFields: { rank: '$weight', distanceFrom: 0 } },
        )
    }

    const projection: PipelineStage.FacetPipelineStage[] = []

    if(geometries){
        projection.push({
            $lookup: {
                from: 'geometries',
                localField: 'geometries',
                foreignField: '_id',
                as: 'geometries'
            }
        })
    }

    projection.push({ $project: { simplified_geometries: 0 } })

    let sortMethod: Sort = { rank: -1 }
    
    if(sort && sort === 'distance'){
        sortMethod = { distanceFrom: 1 }
    }

    pipeline.push({ 
        $facet: {
            metadata: [ 
                { $count: "total" }, 
                { $addFields: { page: parseInt(page) || 1, limit: parseInt(limit) || 50 } } 
            ],
            data: [ 
                { $sort: sortMethod },
                { $skip: (parseInt(limit) * (parseInt(page) - 1)) || 0 }, 
                { $limit: parseInt(limit) || 50 },
                ...projection
            ]
        }
    }, { $unwind: { path: '$metadata' } })
    

    const result = await Waterbody.aggregate(pipeline)

    if(result.length === 0){
        res.status(200).json({
            metadata: {
                total: 0, 
                page: 1, 
                limit: parseInt(limit) || 50 
            },
            data: []
        })
    }else{
        res.status(200).json({
            metadata: result[0].metadata,
            data: result[0].data
        })
    }

})


interface MergeWaterbodies {
    parent: string,
    children: string[]
}

export const mergeWaterbodies = catchAsync(async(req: Request<{},{},MergeWaterbodies>, res, next) => {
    const { parent, children } = req.body;
    
    if(!parent) throw new RequestError(400, 'Parent waterbody _id is required')
    if(children.length === 0) throw new RequestError(400, 'Children waterbody(s) are required')

    const childWaterbodies = await Waterbody.find({ _id: { $in: children }})

    if(childWaterbodies.length === 0) throw new UnknownReferenceError('WATERBODY', children)

    const childrenGeometries: string[] = []
    const childrenSimplifiedGeometries: GeoJSON[] = []
    const childrenAdminOne: string[] = []
    const childrenAdminTwo: string[] = []

    for(let child of childWaterbodies){
        for(let x of child.geometries){
            childrenGeometries.push(x)
        }
        for(let x of child.simplified_geometries.geometries){
            childrenSimplifiedGeometries.push(x)
        }
        for(let x of child.admin_one){
            childrenAdminOne.push(x)
        }
        for(let x of child.admin_two){
            childrenAdminTwo.push(x)
        }
    }

    const geometries = await Geometry.updateMany(
        { _id: { $in: childrenGeometries }}, 
        { $set: { parent_waterbody: parent } }
    )

    await Waterbody.deleteMany({ _id: { $in: children } })

    const waterbody = await Waterbody.findByIdAndUpdate(parent, {
        $push: { 
            geometries: { $each: childrenGeometries },
            'simplified_geometries.geometries': { $each: childrenSimplifiedGeometries } 
        },
        $addToSet: {
            admin_one: { $each: childrenAdminOne },
            admin_two: { $each: childrenAdminTwo }
        }
    }, { new: true }).populate('geometries')


    res.status(200).json({
        waterbody, 
        updated_geometries: geometries.modifiedCount, 
        deleted_waterbodies: childWaterbodies.length 
    })

}) 



interface GetDuplicatesQuery {
    name: string
    weight?: string
    state?: string
}


export const getWaterbodiesByName = catchAsync(async(req: Request<{},{},{},GetDuplicatesQuery>, res, next) => {
    
    const { name, weight, state } = req.query;

    const pipeline: PipelineStage[] = []

    if(weight) pipeline.push({
        $match: { weight: { $gte: parseFloat(weight) } }
    })

    if(state) pipeline.push({
        $match: { admin_one: state }
    })

    pipeline.push({
        $group: {
            _id: '$name',
            waterbodies: {
                $push: '$_id'
            }
        }
    }, {
        $match: {  _id: name }
    }, {
        $lookup: {
            from:'waterbodies',
            localField: 'waterbodies',
            foreignField: '_id',
            as: 'waterbodies'
        }
    }, {
        $unwind: { path: '$waterbodies' }
    }, {
        $replaceRoot: { newRoot: '$waterbodies' }
    }, {
        $lookup: {
            from: 'geometries',
            localField: 'geometries',
            foreignField: '_id',
            as: 'geometries'
        }
    }, {
        $addFields: {
            totalGeometries: { $size: '$geometries' }
        }
    }, {
        $sort: { totalGeometries: -1 }
    })

    const waterbodies = await Waterbody.aggregate(pipeline)

    res.status(200).json(waterbodies)
})



interface DeleteWaterbodyReqBody {
    _id: string
}

export const deleteWaterbody = catchAsync(async(req: Request<{},{},DeleteWaterbodyReqBody>, res, next) => {

    const { _id } = req.body;

    if(!_id) throw new RequestError(400, 'Waterbody _id is required')

    const deleted = await Waterbody.findByIdAndDelete(_id)

    if(!deleted) throw new ReferenceError('Waterbody does not exist')

    const result = await Geometry.deleteMany({ _id: { $in: deleted.geometries } })

    res.status(204).json({
        deleted_waterbodies: 1,
        deleted_geometries: result.deletedCount
    })
})



interface GetDistinctNames {
    index: string
    weight?: string
    state?: string
}

export const getDistinctName = catchAsync(async(req: Request<{},{},{},GetDistinctNames>, res, next) => {
    
    const { state, weight, index } = req.query;

    let filters: FilterQuery<IWaterbody>[] = []
    
    let names: string[] = [];

    if(state) filters.push({ admin_one: state })

    if(weight) filters.push({ weight: parseFloat(weight)})

    if(filters.length > 0){
        names = await Waterbody.distinct('name', { $and: filters })
    }else{
        names = await Waterbody.distinct('name')
    }
    
    
    const x = parseInt(index);

    const nameSlice = names.slice(x, (x + 10))


    res.status(200).json({
        index: x,
        position: x + 1,
        total: names.length,
        next: x + 10 < names.length,
        values: nameSlice
    })

})




interface NearestWaterbodyQuery {
    /** Comma seperated -- longitude, latitude */
    lnglat: string,
}

export const getNearestWaterbodies = catchAsync(async (req: Request<{},{},{},NearestWaterbodyQuery>, res, next) => {
    const { lnglat } = req.query;

    if(!lnglat) throw new QueryError(400, 'lnglat is required')

    const coordinates = lnglat.split(',').map(x => parseFloat(x))
    if(!validateCoords(coordinates)){
        throw new CoordinateError(400, 'Provided coordinates are not valid')
    }

    const waterbodies = await Waterbody.find({ 
        simplified_geometries: { 
            $near: {
                $geometry: { type: 'Point', coordinates },
                $minDistance: 0,
                $maxDistance: 10000
            }
        }
    }).limit(2)

    res.status(200).json(waterbodies)
})




interface NewAccessPointReq {
    name: string
    description?: string
    accessType: 'PARKING_LOT' | 'PULLOFF' | 'WALK_IN'
    restrooms?: boolean
    boatLaunch?: boolean
    waterbody: string
    coordinates: [Lng: number, Lat: number]
}


export const addAccessPoint = catchAsync(async(req: Request<{},{},NewAccessPointReq>, res, next) => {
    const { 
        name, 
        description, 
        accessType, 
        restrooms, 
        boatLaunch, 
        waterbody, 
        coordinates 
    } = req.body;

    if(!name) throw new AccessPointCreationError('NAME_NOT_PROVIDED')
    if(!accessType) throw new AccessPointCreationError('ACCESS_TYPE_NOT_PROVIDED')
    if(!validateAccessPointType(accessType)) throw new AccessPointCreationError('ACCESS_TYPE_NOT_VALID')
    if(!waterbody) throw new AccessPointCreationError('WATERBODY_NOT_PROVIDED')
    if(!(await Waterbody.findById(waterbody))) throw new UnknownReferenceError('WATERBODY', [waterbody])
    if(!coordinates) throw new AccessPointCreationError('COORDINATES_NOT_PROVIDED')
    if(!validateCoords(coordinates)) throw new CoordinateError(400, 'Provided coordinates are not valid')

    const accessPoint: IAccessPoint = {
        name,
        accessType,
        waterbody,
        restrooms: false,
        boatLaunch: false,
        geometry: {
            type: 'Point',
            coordinates
        }
    }

    if(description && typeof description === 'string') accessPoint.description = description;
    if(restrooms && typeof restrooms === 'boolean') accessPoint.restrooms = restrooms;
    if(boatLaunch && typeof boatLaunch === 'boolean') accessPoint.boatLaunch = boatLaunch;

    const newAccessPoint = new AccessPoint(accessPoint)

    const saved = await newAccessPoint.save()

    res.status(200).json(saved)
})







