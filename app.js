if (process.env.NODE !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const methodOverride = require('method-override')
const passport = require('passport')
const app = express()
const PORT = process.env.PORT || 3001

const router = require('./routes')
const cors = require('cors')

app.use(cors())
app.use(passport.initialize())
app.use(methodOverride('_method'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use('/api', router)

app.listen(PORT, () => {
  console.log(`App is running on http://localhost:${PORT}`)
})

module.exports = app
