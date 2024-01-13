const passport = require('passport')
const passportJWT = require('passport-jwt')
const { User } = require('../models')

const JwtStrategy = passportJWT.Strategy
const ExtractJwt = passportJWT.ExtractJwt

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
  passReqToCallback: true
}

passport.use(new JwtStrategy(jwtOptions, async (req, jwtPayload, cb) => {
  try {
    const user = await User.findByPk(jwtPayload.id)
    req.user = user
    cb(null, user)
  } catch (err) {
    cb(err)
  }
}))

module.exports = passport
