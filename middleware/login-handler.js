const bcrypt = require('bcryptjs')
const { User } = require('../models')

// 登入認證程序
const userSignIn = async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) throw new Error('帳號與密碼都是必填項目')
    const user = await User.findOne({ where: { email } })
    if (!user) throw new Error('使用者不存在!')
    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) throw new Error('帳號或密碼輸入錯誤')
    req.user = user
    next()
  } catch (err) {
    next(err)
  }
}

module.exports = { userSignIn }
