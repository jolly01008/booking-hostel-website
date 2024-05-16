const passport = require('../config/passport')
const { User } = require('../models')
const authHelper = require('../helpers/auth-helpers')

const authenticated = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err || !user) return res.status(401).json({ status: 'error', message: 'unauthorized' })
    next()
  })(req, res, next)
}

const tenantAuth = async (req, res, next) => {
  try {
    const currentUserId = authHelper.getUser(req).id
    const currentUser = await User.findByPk(currentUserId, { attributes: ['currentRole'] })
    if (currentUser.currentRole !== 'tenant') throw new Error('若想使用 房客頁面、預約房間，請先切換成使用者身分')
    next()
  } catch (err) {
    next(err)
  }
}

module.exports = { authenticated, tenantAuth }
