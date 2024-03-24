const { Room, Hostel, Booking } = require('../models')

const dayjs = require('dayjs')
const isBetween = require('dayjs/plugin/isBetween')
dayjs.extend(isBetween)

const bookingController = {
  searchRooms: async (req, res, next) => {
    try {
      const { keyword, checkin, checkout, adults, kids } = req.query
      const today = dayjs(new Date()).format('YYYY-MM-DD')
      if (!keyword) throw new Error('請輸入想搜尋的地點')
      if (!checkin || !checkout) throw new Error('請輸入想入住的時間')
      if (checkin > checkout || checkin < today || checkout < today) throw new Error('請輸入合理的時間')
      if (!adults > 1) throw new Error('請確實填寫人數，至少須有一位青年或成人')

      // 關鍵字搜尋，所有房間==========================
      const allRooms = await Room.findAll({
        attributes: ['id', 'type', 'title', 'description', 'headcount'],
        include: [{
          model: Hostel,
          attributes: ['name', 'address', 'description']
        }]
      })

      const keywordResults = allRooms.filter(room => {
        const keywordLower = keyword.trim().toLowerCase()
        return room.title.toLowerCase().includes(keywordLower) || room.description.toLowerCase().includes(keywordLower) ||
          room.Hostel.name.toLowerCase().includes(keywordLower) ||
          room.Hostel.address.toLowerCase().includes(keywordLower) ||
          room.Hostel.description.toLowerCase().includes(keywordLower)
      })

      if (keywordResults.length === 0) {
        return res.status(200).json({
          status: 'success',
          message: '找不到符合條件的資料'
        })
      }

      // 日期(判斷是否已被預約過)、人數篩選搜尋================================
      const allBookings = await Booking.findAll({
        attributes: ['bookingDate', 'checkoutDate', 'numberOfAdults', 'numberOfKids'],
        include: [{
          model: Room,
          attributes: ['id', 'type', 'headcount', 'title']
        }]
      })
      const bookingDatas = allBookings.map(booking => {
        // 用dayjs套件讓時間變成 mm-dd
        return {
          ...booking.toJSON(),
          bookingDate: dayjs(booking.bookingDate).format('YYYY-MM-DD'),
          checkoutDate: dayjs(booking.checkoutDate).format('YYYY-MM-DD')
        }
      })
      const suggestBeds = Number(adults) + Math.floor(Number(kids) / 2) // 建議的床位數量
      const dateResults = [] // allBookings取出的結果，可能有重複的房間，所以dateResults的結果，會有元素重複的可能性
      bookingDatas.forEach(bookingData => {
        // bookingDatas是從資料庫撈出目前已被預約的日期
        // 獨立套房
        // 要挑出checkin~checkout的日期，必須是"沒有與bookingData重疊的日期!"。沒有在 "已被預約的期間" ，就return出去
        if (bookingData.Room.type === 'private_room' &&
          bookingData.Room.headcount >= suggestBeds &&
          dayjs(checkin).isSame(dayjs(bookingData.bookingDate)) === false &&
          dayjs(checkin).isSame(dayjs(bookingData.checkoutDate)) === false &&
          dayjs(checkout).isSame(dayjs(bookingData.bookingDate)) === false &&
          dayjs(checkout).isSame(dayjs(bookingData.checkoutDate)) === false &&
          dayjs(checkin).isBetween(bookingData.bookingDate, dayjs(bookingData.checkoutDate)) === false &&
          dayjs(checkout).isBetween(bookingData.bookingDate, dayjs(bookingData.checkoutDate)) === false) {
          dateResults.push(bookingData)
        }

        // 混合房
        const bookedPeople = Number(bookingData.numberOfAdults) + Math.floor(Number(bookingData.numberOfKids) / 2) // 資料庫內已經預約好要入住的人數
        // 混合房 若時間沒重疊
        // 須確定總床位 ，是否大於等於建議的床位數量
        if (bookingData.Room.type === 'mixed_dorm' &&
          dayjs(checkin).isSame(dayjs(bookingData.bookingDate)) === false &&
          dayjs(checkin).isSame(dayjs(bookingData.checkoutDate)) === false &&
          dayjs(checkout).isSame(dayjs(bookingData.bookingDate)) === false &&
          dayjs(checkout).isSame(dayjs(bookingData.checkoutDate)) === false &&
          dayjs(checkin).isBetween(bookingData.bookingDate, dayjs(bookingData.checkoutDate)) === false &&
          dayjs(checkout).isBetween(bookingData.bookingDate, dayjs(bookingData.checkoutDate)) === false &&
          bookingData.Room.headcount >= suggestBeds) {
          dateResults.push(bookingData)
        } else if (
          // 剩下的就是"時間有重疊" 的混合房
          // 須確定 總床位 扣掉 已被約走床位，是否大於等於建議的床位數量
          bookingData.Room.type === 'mixed_dorm' &&
          bookingData.Room.headcount - bookedPeople >= suggestBeds
        ) {
          dateResults.push(bookingData)
        }
      })
      // keywordResults 和 dateResults 每個元素拿出互相比對。keywordResults跟dateResults都擁有的元素，放到results陣列內
      const results = []
      keywordResults.forEach(keywordResult => {
        for (let i = 0; i < dateResults.length; i++) {
          if (dateResults[i].Room.id === keywordResult.id) {
            results.push(keywordResult.toJSON())
          }
        }
      })
      // 把results的重複元素刪掉。(重複元素來自於，所有訂單allBookings取出的資料，可能會有重複的房間)
      const uniqueResults = results.filter((result, index, arr) => {
        // index：當前陣列(results)元素的索引。arr：原始陣列本身(results)。
        // findIndex會返回當前元素在陣列 "第一個符合條件" 的index
        // 返回当前元素在数组中第一次出现的索引，是否等于当前索引，如果相等，说明当前元素是数组中第一次出现的具有相同 id 属性值的元素，将其保留。
        return arr.findIndex(arrItem => arrItem.id === result.id) === index
      })

      if (uniqueResults.length === 0) {
        return res.status(200).json({
          status: 'success',
          message: '這段期間已經沒有可預約的房間'
        })
      }

      return res.status(200).json({
        status: 'success',
        searchData: req.query,
        message: `建議床位數至少: ${suggestBeds} 張床`,
        data: uniqueResults
      })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = bookingController
