const bcrypt = require('bcryptjs')
const { User, Booking, Landlord } = require('../models')
const jwt = require('jsonwebtoken')
const helpers = require('../helpers/auth-helpers')
const { localFileHandler } = require('../helpers/file-helpers')

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
  getUser: async (req, res, next) => {
    try {
      const userId = req.params.id
      const currentUserId = helpers.getUser(req).id.toString()
      const userData = await User.findByPk(currentUserId, {
        attributes: { exclude: 'password' }
      })
      const bookings = await Booking.findAll({
        where: { userId: currentUserId }
      })
      const pastBookings = bookings.filter(booking => {
        return new Date(booking.bookingDate) < new Date()
      })

      if (userId !== currentUserId) { throw new Error('使用者非本人') }
      if (!currentUserId) { throw new Error('找不到該使用者') }

      return res.status(200).json({ userData, pastBookings })
    } catch (err) {
      next(err)
    }
  },
  postApplyLandlord: async (req, res, next) => {
    try {
      const userId = req.params.id
      const currentUserId = helpers.getUser(req).id.toString()
      if (userId !== currentUserId) throw new Error('使用者非本人！')

      const currentUser = await User.findByPk(userId)
      if (!currentUser) throw new Error('使用者不存在')
      if (currentUser.role === 'landlord') throw new Error('已經申請過房東身分')

      const { name, introduction, phone, country } = req.body
      const { file } = req // multer在request處理好的file
      const avatarPath = await localFileHandler(file) // 呼叫localFileHandler取得檔案路徑
      if (!name || !introduction || !phone || !country) throw new Error('欄位中不能空白，申請失敗')
      await Landlord.create({
        name,
        introduction,
        phone,
        country,
        avatar: avatarPath || null,
        userId
      })
      await currentUser.update({ role: 'landlord' })
      return res.status(200).json({
        status: 'success',
        message: '申請房東成功'
      })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = userController
