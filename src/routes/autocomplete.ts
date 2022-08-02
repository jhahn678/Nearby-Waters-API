import { Router } from 'express'
import controllers from '../controllers'
const router = Router()

router.get('/autocomplete', controllers.autocompleteAll)
router.get('/autocomplete/geoplaces', controllers.autocompletePlaces)
router.get('/autocomplete/waterbodies', controllers.autocompleteWaterbodies)
router.get('/state', controllers.getStateByCoords)


export default router;