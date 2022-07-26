const autocomplete = require('./autocomplete')
const geojson = require('./geojson')
const near = require('./near')
const search = require('./search')


module.exports = {
    ...autocomplete,
    ...geojson,
    ...near,
    ...search
}