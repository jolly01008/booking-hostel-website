const express = require('express')
const router = express.Router()

const { landlordAuth } = require('../../middleware/landlord-auth')
const upload = require('../../middleware/multer')

const landlordController = require('../../controllers/landlord-controller')
const hostelController = require('../../controllers/hostel-controller')
const roomController = require('../../controllers/room-controller')

router.get('/:landlordId/hostels/:hostelId/rooms/:roomId/edit', landlordAuth, roomController.getEditRoom)
router.put('/:landlordId/hostels/:hostelId/rooms/:roomId/edit', landlordAuth, upload.array('pictures', 6), roomController.editRoom)
router.delete('/:landlordId/hostels/:hostelId/rooms/:roomId/delete', landlordAuth, roomController.deleteRoom)
router.get('/:landlordId/hostels/:hostelId/rooms/:roomId', landlordAuth, roomController.getLandlordRoom)
router.post('/:landlordId/hostels/:hostelId/createRoom', landlordAuth, upload.array('pictures', 6), roomController.postRoom)
router.get('/:landlordId/hostels/:hostelId/edit', landlordAuth, hostelController.getEditLandlordHostel)
router.put('/:landlordId/hostels/:hostelId/edit', landlordAuth, upload.single('picture'), hostelController.editHostel)
router.get('/:landlordId/hostels/:hostelId/rooms', landlordAuth, roomController.getLandlordRooms)
router.post('/:landlordId/hostels/create', landlordAuth, upload.single('picture'), hostelController.postHostel)
router.get('/:landlordId/hostels', landlordAuth, hostelController.getLandlordHostels)
router.get('/:landlordId/editLandlord', landlordAuth, landlordController.getEditLandlord)
router.put('/:landlordId/editLandlord', landlordAuth, upload.single('avatar'), landlordController.editLandlord)
router.get('/:landlordId', landlordAuth, landlordController.getLandlord)

module.exports = router
