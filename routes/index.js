const express = require('express')
const router = express.Router()

const hostel = require('./modules/hostel')
const userController = require('../controllers/user-controller')
const { apiErrorHandler } = require('../middleware/error-handler')

router.use('/hostels', hostel)

router.post('/signUp', userController.signUp)
router.use('/', apiErrorHandler)

module.exports = router
