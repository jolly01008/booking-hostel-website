const express = require('express')
const router = express.Router()

const hostel = require('./modules/hostel')
const userController = require('../controllers/user-controller')
const { apiErrorHandler } = require('../middleware/error-handler')
const { userSignIn } = require('../middleware/login-handler')
router.use('/hostels', hostel)

router.post('/signUp', userController.signUp)
router.post('/users/signIn', userSignIn, userController.signIn) // userSignIn登入認證成功, 就簽發JWT
router.use('/', apiErrorHandler)

module.exports = router
