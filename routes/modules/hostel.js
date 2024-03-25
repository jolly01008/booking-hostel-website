const express = require('express')
const router = express.Router()

const hostelController = require('../../controllers/hostel-controller')
const bookingController = require('../../controllers/booking-controller')

router.post('/:hostelId/rooms/:roomId/booking', bookingController.postBookingRoom)
router.get('/:hostelId/rooms/:roomId/booking', bookingController.getBookingRoom)
router.get('/search', bookingController.searchRooms)
router.get('/', hostelController.getHostels)

module.exports = router
