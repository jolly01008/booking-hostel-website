const bcrypt = require('bcryptjs')
const { User } = require('../models')
const jwt = require('jsonwebtoken')
const helpers = require('../helpers/auth-helpers')

const userController = {
  signUp: async (req, res, next) => {
    try {
      const { name, email, password, confirmPassword } = req.body
      if (!name || !email || !password || !confirmPassword) throw new Error('每個欄位都需要填寫')
      if (password !== confirmPassword) throw new Error('密碼與確認密碼不相符')

      const userEmail = await User.findOne({ where: { email } })
      if (userEmail) throw new Error('這個email已經註冊過了!')

      const hash = await bcrypt.hash(password, 10)
      const newUser = await User.create({
        name,
        email,
        password: hash,
        role: 'tenant',
        avatar: 'https://imgur.com/a/RJmY7yQ'
      })
      const userData = newUser.toJSON()
      delete userData.password
      return res.json({
        status: 'success',
        data: { user: userData }
      })
    } catch (err) {
      return next(err)
    }
  },
  signIn: (req, res, next) => {
    try {
      const userData = helpers.getUser(req).toJSON()
      delete userData.password
      const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '30d' }) // 簽發 JWT Token(期限30天)
      res.status(200).json({
        token,
        user: userData
      })
    } catch (err) {
      next(err)
    }
  },
  test: (req, res, next) => {
    res.json({
      message: 'passport jwt 驗證成功'
    })
  }
}

module.exports = userController
