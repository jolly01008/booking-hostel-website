const express = require('express')
const router = express.Router()

const hostel = require('./modules/hostel')

router.use('/hostels', hostel)

module.exports = router
