import * as AutocompleteControllers from './autocomplete'
import * as GeometryControllers from './geometry'
import * as GeoplaceControllers from './geoplace'
import * as WaterbodyControllers from './waterbody'

export default {
    ...AutocompleteControllers,
    ...GeometryControllers,
    ...GeoplaceControllers,
    ...WaterbodyControllers
}
   