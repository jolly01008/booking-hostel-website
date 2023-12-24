const express = require('express')
const session = require('express-session')
const methodOverride = require('method-override')
const bcryptjs = require('bcryptjs')
const passport = require('passport')
const app = express()
const PORT = 3001

app.use(methodOverride('_method'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.get('/', (req, res) => {
  res.send('hello world')
})

app.listen(PORT, () => {
  console.log(`App is running on http://localhost:${PORT}`)
})

module.exports = app
