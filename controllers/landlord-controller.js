const { Landlord } = require('../models')
const helpers = require('../helpers/auth-helpers')

const landlordController = {
  getLandlord: async (req, res, next) => {
    try {
      const currentUserId = helpers.getUser(req).id
      const landlordId = req.params.id
      const landlordData = await Landlord.findByPk(landlordId, {
        attributes: ['name', 'avatar', 'introduction', 'phone', 'country', 'userId']
      })
      if (currentUserId !== landlordData.userId) throw new Error('使用者非本人，沒有權限')
      return res.status(200).json(landlordData)
    } catch (err) {
      next(err)
    }
  }
}

module.exports = landlordController
