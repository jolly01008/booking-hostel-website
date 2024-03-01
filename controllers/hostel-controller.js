const { Hostel, Room } = require('../models')

const hostelController = {
  getHostels: async (req, res, next) => {
    try {
      const hostels = await Hostel.findAll({
        attributes: ['id', 'name', 'address', 'picture', 'landlordId'],
        include: [{
          model: Room,
          attributes: ['id', 'title', 'price']
        }],
        order: [[{ model: Room }, 'price', 'ASC']]
      })

      if (!hostels.length) {
        return res.status(200).json({
          status: 'success',
          message: '目前沒有任何旅館'
        })
      }
      console.log('hostels內容:', hostels)
      return res.status(200).json(hostels)
    } catch (err) {
      next(err)
    }
  }
}

module.exports = hostelController
