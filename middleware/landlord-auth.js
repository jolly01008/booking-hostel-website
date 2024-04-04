const { User, Landlord } = require('../models')
const authHelper = require('../helpers/auth-helpers')

const landlordAuth = async (req, res, next) => {
  try {
    const currentUserId = authHelper.getUser(req).id
    const currentUser = await User.findByPk(currentUserId, { attributes: ['role', 'currentRole'] })

    if (!currentUserId) throw new Error('沒有這位使用者')
    if (currentUser.role !== 'landlord') throw new Error('尚未申請房東身份，沒有權限!')
    if (currentUser.currentRole !== 'landlord') throw new Error('若想查看房東頁面，或使用房東的相關功能，請先切換至房東身分!')

    const landlord = await Landlord.findByPk(req.params.landlordId, { attributes: ['userId'] })
    if (!landlord) throw new Error('沒有這位房東')
    if (currentUserId !== landlord.userId) throw new Error('使用者非本人，沒有權限')
    next()
  } catch (err) {
    next(err)
  }
}

module.exports = { landlordAuth }
