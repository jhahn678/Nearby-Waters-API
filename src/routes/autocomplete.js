const express = require('express')
const router = express.Router()
const controller = require('../controllers')

router.get('/', controller.autocompleteAll)
router.get('/geoplaces', controller.autocompletePlaces)
router.get('/waterbodies', controller.autocompleteWaterbodies)
router.get('/state', controller.getStateByCoords)


module.exports = router;