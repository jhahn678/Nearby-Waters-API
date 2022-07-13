const GeoJson = require('../models/geojson')
const data = require('../filtered-geojson.json')

module.exports = importGeoData = async () => {

    const timeStart = Date.now()
    
    const { features } = data;

    for(let f of features){
        if(f.geometry.coordinates[0].length == 2){
            const a = f.geometry.coordinates[0][0].reduce((x, y) => x + y)
            const b = f.geometry.coordinates[0][1].reduce((x, y) => x + y)
            if(a === b){
                features.filter(ft => ft.properties.osm_id !== f.properties.osm_id)
            }
        }
    }

    features.forEach( async(f, index) => {

        let percent = (index / features.length) * 100

        if(percent % 5 === 0) console.log(`${percent}% done`)

        const newgeo = new GeoJson({
            osm_id: f.properties.osm_id,
            code: f.properties.code,
            fclass: f.properties.fclass,
            name: f.properties.name,
            geometry: {
                type: f.geometry.type,
                coordinates: f.geometry.coordinates
            }
        })
        
        await newgeo.save()
    })

    const multi_line_string = await GeoJson.findOne({ "geometry.type": "MultiLineString" }).lean()

    const timeEnd = Date.now()

    console.log('************************************')
    console.log(multi_line_string)
    console.log('************************************')
    console.log(`process completed in ${(timeEnd - timeStart) / 1000} s`)

}
