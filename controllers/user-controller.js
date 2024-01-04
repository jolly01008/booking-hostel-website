const bcrypt = require('bcryptjs')
const { User } = require('../models')

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
        role: 'user',
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
  }
}

module.exports = userController
