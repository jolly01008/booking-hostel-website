const { Hostel, Room, Landlord } = require('../models')
const { localFileHandler } = require('../helpers/file-helpers')

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
      return res.status(200).json(hostels)
    } catch (err) {
      next(err)
    }
  },
  postHostel: async (req, res, next) => {
    try {
      const landlordId = req.params.landlordId
      const { name, address, description } = req.body
      const { file } = req // multer收到request 處理好的file
      const picturePath = await localFileHandler(file) // 呼叫localFileHandler取得檔案路徑
      if (!name || !address || !description) throw new Error('請填寫想創建旅館的名稱、地址、描述')
      await Hostel.create({
        name,
        address,
        description,
        picture: picturePath || null,
        landlordId
      })
      return res.status(200).json({
        status: 'success',
        message: '旅館建立成功'
      })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = hostelController
