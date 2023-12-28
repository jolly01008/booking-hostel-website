const express = require('express')
const router = express.Router()

const hostelController = require('../../controllers/hostel-controller')

router.get('/', hostelController.getHostels)

module.exports = router
