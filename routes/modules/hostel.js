const express = require('express')
const router = express.Router()

const hostelController = require('../../controllers/hostel-controller')
const bookingController = require('../../controllers/booking-controller')

router.get('/search', bookingController.searchRooms)
router.get('/', hostelController.getHostels)

module.exports = router
