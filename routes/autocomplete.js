const express = require('express')
const router = express.Router()
const controller = require('../controllers')

router.get('/geoplaces', controller.autocompletePlaces)

router.get('/waterbodies', (req, res) => res.send('Not yet operational'))

module.exports = router;