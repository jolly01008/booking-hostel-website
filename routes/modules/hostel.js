const express = require('express')
const router = express.Router()

const hostelController = require('../../controllers/hostel-controller')
const bookingController = require('../../controllers/booking-controller')
const roomController = require('../../controllers/room-controller')
const { tenantAuth } = require('../../middleware/auth')

router.post('/:hostelId/rooms/:roomId/booking', tenantAuth, bookingController.postBookingRoom)
router.get('/:hostelId/rooms/:roomId/booking', tenantAuth, bookingController.getBookingRoom)
router.get('/:hostelId/rooms/:roomId', roomController.getRoom)
router.get('/:hostelId', hostelController.getHostel)
router.get('/search', bookingController.searchRooms)
router.get('/', hostelController.getHostels)

module.exports = router
