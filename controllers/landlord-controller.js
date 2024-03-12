const { Landlord } = require('../models')

const landlordController = {
  getLandlord: async (req, res, next) => {
    try {
      const landlordId = req.params.landlordId
      const landlordData = await Landlord.findByPk(landlordId, {
        attributes: ['name', 'avatar', 'introduction', 'phone', 'country', 'userId']
      })
      return res.status(200).json(landlordData)
    } catch (err) {
      next(err)
    }
  }
}

module.exports = landlordController
