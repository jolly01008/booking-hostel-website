const express = require('express')
const router = express.Router()

const hostel = require('./modules/hostel')
const user = require('./modules/user')
const landlord = require('./modules/landlord')

const userController = require('../controllers/user-controller')
const { apiErrorHandler } = require('../middleware/error-handler')
const { userSignIn } = require('../middleware/login-handler')
const { authenticated } = require('../middleware/auth')

router.use('/hostels', authenticated, hostel)

router.post('/signUp', userController.signUp)
router.post('/users/signIn', userSignIn, userController.signIn) // userSignIn登入認證成功, 就簽發JWT
router.use('/users', authenticated, user)
router.use('/landlords', authenticated, landlord)
router.use('/', apiErrorHandler)

module.exports = router
