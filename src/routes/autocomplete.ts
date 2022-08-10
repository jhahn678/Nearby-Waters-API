import { Router } from 'express'
import controllers from '../controllers'
const router = Router()

router.get('/', controllers.autocompleteAll)
router.get('/geoplaces', controllers.autocompletePlaces)
router.get('/waterbodies', controllers.autocompleteWaterbodies)
router.get('/waterbodies/distinct-name', controllers.autocompleteDistinctName)
router.get('/waterbodies/distinct-duplicated-name', controllers.autocompleteDistinctDuplicatedName)


export default router;