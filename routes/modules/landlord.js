const express = require('express')
const router = express.Router()

const { landlordAuth } = require('../../middleware/landlord-auth')
const upload = require('../../middleware/multer')

const landlordController = require('../../controllers/landlord-controller')
const hostelController = require('../../controllers/hostel-controller')
const roomController = require('../../controllers/room-controller')

router.post('/:landlordId/hostels/:hostelId/createRoom', landlordAuth, upload.array('pictures', 6), roomController.postRoom)
router.post('/:landlordId/hostels/create', landlordAuth, upload.single('picture'), hostelController.postHostel)
router.get('/:landlordId/hostels', landlordAuth, hostelController.getLandlordHostels)
router.get('/:landlordId', landlordAuth, landlordController.getLandlord)

module.exports = router
