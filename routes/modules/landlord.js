const express = require('express')
const router = express.Router()

const landlordController = require('../../controllers/landlord-controller')

router.get('/:id', landlordController.getLandlord)

module.exports = router
