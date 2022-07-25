const toGeoJsonFeatureCollection = (value) => {

    let geojson = {
        type: 'FeatureCollection',
        features: []
    }

    for(let geom of value){
        geojson.features.push({
            type: 'Feature',
            properties: {
                _id: geom._id,
                name: geom.name,
                classification: geom.classification
            },
            geometry: {
                ...geom.geometry
            }
        })
    }

    return geojson;
    
}


const toGeoJsonFeature = value => {

    geojson = {
        type: 'Feature',
        geometry: {
            ...value.geometry
        },
        properties: {
            _id: value._id,
            name: value.name,
            classification: value.classification
        }
    }

    return geojson;

}


toGeoJsonFeatureCollectionFromSearch = results =>  {

    const featureCollection = {
        type: 'FeatureCollection',
        features: []
    }

    for(let result of results){
        for(geom of result.geometries){
            const feature = toGeoJsonFeature(geom)
            featureCollection.features.push(feature)
        }
    }

    return featureCollection;
}


module.exports = {
    toGeoJsonFeature,
    toGeoJsonFeatureCollection,
    toGeoJsonFeatureCollectionFromSearch
}