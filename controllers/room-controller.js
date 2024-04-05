const { Room, Bed, Hostel, Landlord } = require('../models')

const { roomsFileHandler } = require('../helpers/file-helpers')

const roomController = {
  getRoom: async (req, res, next) => {
    try {
      const { hostelId, roomId } = req.params
      const room = await Room.findByPk(roomId, {
        where: { hostelId },
        attributes: ['title', 'type', 'description', 'price', 'facilities', 'pictures'],
        include: [{
          model: Hostel,
          where: { id: hostelId },
          attributes: ['id', 'name', 'address', 'landlordId']
        }]
      })
      const landlord = await Landlord.findOne({
        where: { id: room.Hostel.landlordId },
        attributes: ['name', 'avatar', 'introduction', 'phone', 'country']
      })
      if (!room) throw new Error('沒有這個房間')

      res.status(200).json({
        roomData: room,
        landlordData: landlord
      })
    } catch (err) { next(err) }
  },
  postRoom: async (req, res, next) => {
    try {
      const { landlordId, hostelId } = req.params
      const { title, type, description, price, facilities, headcount } = req.body
      const { files } = req // multer收到request 處理好的files
      // 先檢查目前的房東是否有瀏覽、編輯該旅館的權限
      const landlordHostels = await Hostel.findAll({ where: { landlordId }, attributes: ['id'] })
      const landlordHostel = await Hostel.findByPk(hostelId, { attributes: ['id'] })
      if (!landlordHostel) throw new Error('沒有這間旅館')
      if (!landlordHostels.some(landlordHostel => Number(landlordHostel.id) === Number(hostelId))) {
        throw new Error('你沒有瀏覽、編輯這個旅館的權限')
      }

      const picturesPathArr = await roomsFileHandler(files) // 呼叫localFileHandler取得檔案路徑
      const picturesPathJson = JSON.stringify(picturesPathArr)

      if (!title || !type || !price || !headcount) throw new Error('房源名稱、類型、價格、人數為必填選項')

      // 檢查title是否被使用過
      const allRoomsTitle = await Room.findAll({
        where: { hostelId },
        attributes: ['title']
      })
      for (let i = 0; i < allRoomsTitle.length; i++) {
        if (allRoomsTitle[i].title === title) {
          throw new Error('這個房源名稱在此旅館已經使用過，請更換名稱')
        }
      }
      // 如果是混合房，Room需要存資料，Bed也要存入床位
      if (type === 'mixed_dorm') {
        await Room.create({
          title,
          type,
          description,
          price,
          facilities,
          hostelId,
          pictures: picturesPathJson,
          headcount
        })
        // 取出新建立的房間資料
        const newRoomData = await Room.findOne({
          where: { title, type: 'mixed_dorm', hostelId, headcount, price }, // 核對是否為新建立的房間資訊
          attributes: ['id']
        })
        // Bed table存入床位。对数组中的每个元素都执行了一个异步函数
        const promiseEachBed = Array.from({ length: Number(headcount) }).map(async () => {
          await Bed.create({
            reserved: false,
            roomId: newRoomData.id
          })
        })
        await Promise.all(promiseEachBed) // Promsie.all為了確保 对象在数组中的所有 Promise 对象都变为 resolved
      }

      // 如果是獨立套房，只需把資料存到Room table
      if (type === 'private_room') {
        await Room.create({
          title,
          type,
          description,
          price,
          facilities,
          hostelId,
          pictures: picturesPathJson,
          headcount
        })
      }

      return res.status(200).json({
        status: 'success',
        message: '建立房源成功'
      })
    } catch (err) {
      next(err)
    }
  },
  getLandlordRooms: async (req, res, next) => {
    try {
      const { landlordId, hostelId } = req.params
      // 先檢查目前的房東是否有瀏覽、編輯該旅館的權限
      const landlordHostels = await Hostel.findAll({ where: { landlordId }, attributes: ['id'] })
      const landlordHostel = await Hostel.findByPk(hostelId, { attributes: ['id'] })
      if (!landlordHostel) throw new Error('沒有這間旅館')
      if (!landlordHostels.some(landlordHostel => Number(landlordHostel.id) === Number(hostelId))) {
        throw new Error('你沒有瀏覽、編輯這個旅館的權限')
      }

      const landlordData = await Landlord.findByPk(landlordId, {
        attributes: ['name', 'avatar', 'introduction']
      })
      const HostelData = await Hostel.findByPk(hostelId, {
        attributes: ['name', 'address', 'description']
      })
      const allRooms = await Room.findAll({
        where: { hostelId },
        attributes: ['title', 'price', 'pictures']
      })
      if (!landlordData) throw new Error('找不到該房東資訊')
      if (!HostelData) throw new Error('找不到該旅館')
      if (!allRooms.length) throw new Error('目前沒有任何房間')

      const data = {
        allRooms,
        landlordName: landlordData.name,
        landlordAvatar: landlordData.avatar,
        landlordIntroduction: landlordData.introduction,
        HostelName: HostelData.name,
        HostelAddress: HostelData.address,
        Hosteldescription: HostelData.description
      }

      res.status(200).json({ data })
    } catch (err) {
      next(err)
    }
  },
  getLandlordRoom: async (req, res, next) => {
    try {
      const { landlordId, hostelId, roomId } = req.params
      // 先檢查目前的房東是否有瀏覽、編輯該旅館的權限
      const landlordHostels = await Hostel.findAll({ where: { landlordId }, attributes: ['id'] })
      const landlordHostel = await Hostel.findByPk(hostelId, { attributes: ['id'] })
      if (!landlordHostel) throw new Error('沒有這間旅館')
      if (!landlordHostels.some(landlordHostel => Number(landlordHostel.id) === Number(hostelId))) {
        throw new Error('你沒有瀏覽、編輯這個旅館的權限')
      }
      const room = await Room.findByPk(roomId, {
        where: { hostelId },
        attributes: ['title', 'type', 'description', 'price', 'facilities', 'pictures'],
        include: [{
          model: Hostel,
          where: { landlordId, id: hostelId },
          attributes: ['name', 'address']
        }]
      })
      if (!room) throw new Error('這個房間不存在')
      if (!room.Hostel) throw new Error('這個旅館不存在')

      res.status(200).json({
        data: room
      })
    } catch (err) {
      next(err)
    }
  },
  getEditRoom: async (req, res, next) => {
    try {
      const { landlordId, hostelId, roomId } = req.params
      // 先檢查目前的房東是否有瀏覽、編輯該旅館的權限
      const landlordHostels = await Hostel.findAll({ where: { landlordId }, attributes: ['id'] })
      const landlordHostel = await Hostel.findByPk(hostelId, { attributes: ['id'] })
      const allRooms = await Room.findAll({ where: { hostelId }, attributes: ['id', 'title', 'type', 'description', 'price', 'facilities', 'pictures'] })
      const editRoom = await Room.findByPk(roomId, {
        where: { hostelId },
        attributes: ['id', 'title', 'type', 'description', 'price', 'facilities', 'pictures']
      })
      if (!landlordHostel) throw new Error('沒有這間旅館')
      if (!landlordHostels.some(landlordHostel => Number(landlordHostel.id) === Number(hostelId))) {
        throw new Error('你沒有瀏覽、編輯這個旅館的權限')
      }
      if (!editRoom) throw new Error('沒有這個房間')
      if (!allRooms.some(room => Number(room.id) === Number(roomId))) {
        throw new Error('你沒有瀏覽、編輯這個房間的權限')
      }

      res.status(200).json({
        data: editRoom
      })
    } catch (err) {
      next(err)
    }
  },
  editRoom: async (req, res, next) => {
    try {
      const { landlordId, hostelId, roomId } = req.params
      // 先檢查目前的房東是否有瀏覽、編輯該旅館的權限
      const landlordHostels = await Hostel.findAll({ where: { landlordId }, attributes: ['id'] })
      const landlordHostel = await Hostel.findByPk(hostelId, { attributes: ['id'] })
      const allRooms = await Room.findAll({ where: { hostelId }, attributes: ['id', 'title', 'type', 'description', 'price', 'facilities', 'pictures'] })
      const editRoom = await Room.findByPk(roomId, {
        where: { hostelId },
        attributes: ['id', 'title', 'type', 'description', 'price', 'facilities', 'pictures']
      })

      if (!landlordHostel) throw new Error('沒有這間旅館')
      if (!landlordHostels.some(landlordHostel => Number(landlordHostel.id) === Number(hostelId))) {
        throw new Error('你沒有瀏覽、編輯這個旅館的權限')
      }
      if (!editRoom) throw new Error('沒有這個房間')
      if (!allRooms.some(room => Number(room.id) === Number(roomId))) {
        throw new Error('你沒有瀏覽、編輯這個房間的權限')
      }

      const { title, type, description, price, facilities, headcount } = req.body
      const { files } = req // multer收到request 處理好的files
      const picturesPathArr = await roomsFileHandler(files) // 呼叫localFileHandler取得檔案路徑
      const picturesPathJson = JSON.stringify(picturesPathArr)
      if (!title || !type || !description || !price || !facilities || !headcount) throw new Error('房間資訊需要填寫完整')

      await Room.update({
        pictures: picturesPathJson || editRoom.pictures,
        title: title || editRoom.title,
        type: type || editRoom.type,
        description: description || editRoom.description,
        price: price || editRoom.price,
        facilities: facilities || editRoom.facilities,
        headcount: headcount || editRoom.headcount
      }, { where: { id: roomId } })

      return res.status(200).json({
        status: 'success',
        message: '編輯資料成功'
      })
    } catch (err) { next(err) }
  },
  deleteRoom: async (req, res, next) => {
    try {
      const { landlordId, hostelId, roomId } = req.params
      // 先檢查目前的房東是否有瀏覽、編輯該旅館的權限
      const landlordHostels = await Hostel.findAll({ where: { landlordId }, attributes: ['id'] })
      const landlordHostel = await Hostel.findByPk(hostelId, { attributes: ['id'] })
      const allRooms = await Room.findAll({ where: { hostelId }, attributes: ['id', 'title', 'type', 'description', 'price', 'facilities', 'pictures'] })
      const deleteRoom = await Room.findByPk(roomId, { where: { hostelId } })

      if (!landlordHostel) throw new Error('沒有這間旅館')
      if (!landlordHostels.some(landlordHostel => Number(landlordHostel.id) === Number(hostelId))) {
        throw new Error('你沒有瀏覽、編輯這個旅館的權限')
      }
      if (!deleteRoom) throw new Error('沒有這個房間')
      if (!allRooms.some(room => Number(room.id) === Number(roomId))) {
        throw new Error('你沒有瀏覽、編輯這個房間的權限')
      }
      await deleteRoom.destroy()

      res.status(200).json({
        status: 'success',
        message: '成功刪除該房源'
      })
    } catch (err) { next(err) }
  }
}

module.exports = roomController
