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
        order: [[{ model: Room }, 'price', 'DESC']]
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
  getHostel: async (req, res, next) => {
    try {
      const { hostelId } = req.params
      const hostel = await Hostel.findByPk(hostelId, {
        attributes: ['id', 'name', 'address', 'description', 'landlordId'],
        include: [{
          model: Room,
          where: { hostelId },
          attributes: ['id', 'title', 'price', 'pictures']
        }]
      })
      const landlord = await Landlord.findOne({
        where: { id: hostel.landlordId },
        attributes: ['name', 'avatar', 'introduction', 'phone', 'country']
      })
      if (!hostel) throw new Error('沒有這間旅館')

      return res.status(200).json({
        hostelData: hostel,
        landlordData: landlord
      })
    } catch (err) { next(err) }
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
  },
  getLandlordHostels: async (req, res, next) => {
    try {
      const { landlordId } = req.params
      const landlordHostels = await Hostel.findAll({
        where: { landlordId },
        attributes: ['id', 'name', 'address', 'description', 'picture']
      })

      if (!landlordHostels) throw new Error('尚未建立任何旅館')

      return res.status(200).json(
        landlordHostels
      )
    } catch (err) {
      next(err)
    }
  },
  editHostel: async (req, res, next) => {
    try {
      const { landlordId, hostelId } = req.params
      const { name, address, description } = req.body
      const { file } = req
      const picturePath = await localFileHandler(file)
      if (!name || !address || !description) throw new Error('旅館資訊需要填寫完整')

      const landlordHostels = await Hostel.findAll({ where: { landlordId }, attributes: ['id'] })
      const editHostel = await Hostel.findByPk(hostelId, { attributes: ['id', 'name', 'address', 'description'] })

      if (!editHostel) throw new Error('沒有這間旅館')
      if (!landlordHostels.some(landlordHostel => Number(landlordHostel.id) === Number(hostelId))) {
        throw new Error('你沒有瀏覽、編輯這個旅館的權限')
      }

      await Hostel.update({
        picture: picturePath || editHostel.picture,
        name: name || editHostel.name,
        address: address || editHostel.address,
        description: description || editHostel.description
      }, { where: { id: hostelId } })

      return res.status(200).json({
        status: 'success',
        message: '編輯資料成功'
      })
    } catch (err) { next(err) }
  }
}

module.exports = hostelController
