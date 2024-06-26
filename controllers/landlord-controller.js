const { Landlord, Hostel, Room, Booking } = require('../models')
const bookingDateHelper = require('../helpers/bookingDate-helpers')
const { imgurFileHandler } = require('../helpers/file-helpers')

const landlordController = {
  getLandlord: async (req, res, next) => {
    try {
      const landlordId = req.params.landlordId
      const landlordData = await Landlord.findByPk(landlordId, {
        attributes: ['name', 'avatar', 'introduction', 'phone', 'country', 'userId']
      })
      const allHostels = await Hostel.findAll({
        where: { landlordId },
        attributes: ['id', 'name']})
      // Room.findAll 方法返是一个数组， Promise.all也是返回一個陣列。變成 [ [ Room ] ,[ Room ]... ]
      // 想要 allRooms 陣列只包含房间物件，所以外部使用 flat 方法将嵌套的数组展平
      const allRooms = (await Promise.all(allHostels.map(async (hostel) => {
        return await Room.findAll({
          where: { hostelId: hostel.id },
          attributes: ['id', 'title']})
      }))).flat()
      const allBookings = (await Promise.all(allRooms.map(async (room) => {
        return await Booking.findAll({
          where: { roomId: room.id },
          attributes: ['id', 'tenantName', 'bookingDate', 'checkoutDate', 'totalPrice'],
          include: {
            model: Room,
            attributes:['title']
          }
        })
      }))).flat()
      const newBooking = await bookingDateHelper.getNewBooking(allBookings, next)
      const pastBooking = await bookingDateHelper.getPastBooking(allBookings, next)

      return res.status(200).json({
        landlordData,
        newBooking,
        pastBooking
      })
    } catch (err) {
      next(err)
    }
  },
  getEditLandlord: async (req, res, next) => {
    try {
      const landlordId = req.params.landlordId
      const landlordData = await Landlord.findByPk(landlordId, {
        attributes: ['id', 'name', 'avatar', 'introduction', 'phone', 'country']
      })
      return res.status(200).json(landlordData)
    } catch (err) {
      next(err)
    }
  },
  editLandlord: async (req, res, next) => {
    try {
      const { name, introduction, phone, country } = req.body
      const { file } = req
      const avatarPath = await imgurFileHandler(file)
      const landlordData = await Landlord.findByPk(req.params.landlordId, {
        attributes: ['id', 'name', 'avatar', 'introduction', 'phone', 'country']
      })
      if (!name) throw new Error('不能沒有姓名!')

      await landlordData.update({
        avatar: avatarPath || landlordData.avatar,
        name: name || landlordData.name,
        introduction: introduction || landlordData.introduction,
        phone: phone || landlordData.phone,
        country: country || landlordData.country
      },
      { where: { id: req.params.landlordId } })

      return res.status(200).json({
        status: 'success',
        message: '變更成功'
      })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = landlordController
