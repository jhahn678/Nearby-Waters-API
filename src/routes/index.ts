import { Router } from 'express'
import AutocompleteRoutes from '../routes/autocomplete'
import AdminRoutes from '../routes/admin'
import controllers from '../controllers'
import { authorizeAdmin } from '../middleware/auth'

const router = Router()

router.get('/waterbody', controllers.getWaterbody)
router.get('/waterbody/names', controllers.getDistinctName)
router.delete('/waterbody', authorizeAdmin, controllers.deleteWaterbody)
router.get('/waterbodies', controllers.getWaterbodies)
router.patch('/waterbodies', authorizeAdmin, controllers.mergeWaterbodies)
router.get('/waterbodies/name', controllers.getWaterbodiesByName)
router.get('/waterbodies/names', controllers.getDistinctDuplicatedNames)
router.get('/waterbodies/nearest', controllers.getNearestWaterbodies)
router.get('/geoplace', controllers.getGeoplace)
router.get('/geoplaces', controllers.getGeoplaces)
router.get('/geometry', controllers.getGeometry)
router.get('/geometries', controllers.getGeometries)
router.get('/mystate', controllers.getStateByCoords)
router.use('/admin', AdminRoutes)
router.use('/autocomplete', AutocompleteRoutes)

export default router;
    



    