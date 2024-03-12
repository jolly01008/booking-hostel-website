const { User, Landlord } = require('../models')
const helpers = require('../helpers/auth-helpers')

const landlordAuth = async (req, res, next) => {
  try {
    const currentUserId = helpers.getUser(req).id
    const currentUser = await User.findByPk(currentUserId, { attributes: ['role'] })

    if (!currentUserId) throw new Error('沒有這位使用者')
    if (currentUser.role !== 'landlord') throw new Error('尚未申請房東身份，沒有權限!')

    const landlord = await Landlord.findByPk(req.params.landlordId, { attributes: ['userId'] })
    if (!landlord) throw new Error('沒有這位房東')
    if (currentUserId !== landlord.userId) throw new Error('使用者非本人，沒有權限')
    next()
  } catch (err) {
    next(err)
  }
}

module.exports = { landlordAuth }
