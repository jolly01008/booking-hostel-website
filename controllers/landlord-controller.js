const { Landlord, Hostel, Room, Booking } = require('../models')
const bookingDateHelper = require('../helpers/bookingDate-helpers')

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
          attributes: ['id', 'tenantName', 'bookingDate', 'checkoutDate', 'totalPrice']})
      }))).flat()

      const newBooking = bookingDateHelper.getNewBooking(allBookings)
      const pastBooking = bookingDateHelper.getPastBooking(allBookings)

      return res.status(200).json({
        landlordData,
        newBooking,
        pastBooking
      })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = landlordController
