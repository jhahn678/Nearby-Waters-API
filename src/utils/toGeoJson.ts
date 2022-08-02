import { Feature, FeatureCollection, GeoJsonObject, Geometry } from "geojson";


interface GeometryDocument {
    _id: string,
    name: string,
    geometry: Geometry
}



export const toGeoJsonFeatureCollection = (docs: GeometryDocument[]): FeatureCollection => {

    const collection: FeatureCollection = {
        type: 'FeatureCollection',
        features: []
    }

    for(let doc of docs){
        const { geometry, ...properties } = doc;
        collection.features.push({
            type: 'Feature',
            properties: properties,
            geometry: geometry
        })
    }

    return collection
    
}


export const toGeoJsonFeature = (doc: GeometryDocument): Feature => {

    const { geometry, ...properties } = doc;

    const feature: Feature = {
        type: 'Feature',
        properties: properties,
        geometry: geometry
    }

    return feature;

}


