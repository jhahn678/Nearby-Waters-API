import { Router } from 'express'
import AutocompleteRoutes from '../routes/autocomplete'
import AdminRoutes from '../routes/admin'
import controllers from '../controllers'
import { authorizeAdmin } from '../middleware/auth'

const router = Router()

router.get('/waterbody', controllers.getWaterbody)
router.get('/waterbodies', controllers.getWaterbodies)
router.patch('/waterbodies', authorizeAdmin, controllers.mergeWaterbodies)
router.get('/waterbodies/duplicate-name', controllers.getPossibleDuplicates)
router.get('/geoplace', controllers.getGeoplace)
router.get('/geoplaces', controllers.getGeoplaces)
router.get('/geometry', controllers.getGeometry)
router.get('/geometries', controllers.getGeometries)
router.get('/mystate', controllers.getStateByCoords)
router.use('/admin', AdminRoutes)
router.use('/autocomplete', AutocompleteRoutes)

export default router;
    



    