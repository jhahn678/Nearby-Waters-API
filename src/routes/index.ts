import { Router } from 'express'
import AutocompleteRoutes from '../routes/autocomplete'
import controllers from '../controllers'

const router = Router()

router.get('/waterbody', controllers.getWaterbody)
router.get('/waterbodies', controllers.getWaterbodies)
router.get('/geoplace', controllers.getGeoplace)
router.get('/geoplaces', controllers.getGeoplaces)
router.get('/geometry', controllers.getGeometry)
router.get('/geometries', controllers.getGeometries)
router.get('/mystate', controllers.getStateByCoords)
router.use('/autocomplete', AutocompleteRoutes)

export default router;
    



    