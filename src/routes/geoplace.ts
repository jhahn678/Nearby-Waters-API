import { Router } from 'express'
import * as Controller from '../controllers/geoplace'

const router = Router()


router.get('/geoplace', Controller.getGeoplace)
router.get('/geoplaces', Controller.getGeoplaces)

export default router;