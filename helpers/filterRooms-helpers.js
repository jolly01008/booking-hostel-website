const { Room, Hostel, Booking } = require('../models')

const dayjs = require('dayjs')
const isBetween = require('dayjs/plugin/isBetween')
dayjs.extend(isBetween)

// 關鍵字搜尋，所有房間==========================
const keywordFilter = async (keyword, next) => {
  try {
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

    return keywordResults
  } catch (err) { next(err) }
}

// 日期(判斷是否已被預約過)、人數篩選搜尋=========================
const dateFilter = async (checkin, checkout, adults, kids, next) => {
  try {
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
    const dateNotAllowResults = [] // 放需去除的房間。allBookings取出的結果，所以dateNotAllowResults，會有元素重複的可能性
    bookingDatas.forEach(bookingData => {
      // bookingDatas是從資料庫撈出目前已被預約的日期
      // 獨立套房
      if (
      // 無法預約的(日期重疊、床的位置不夠)，就推到 dateNotAllowResults 陣列裡面
        bookingData.Room.type === 'private_room' &&
      (bookingData.Room.headcount < suggestBeds ||
      dayjs(checkin).isSame(bookingData.bookingDate) ||
      dayjs(checkout).isSame(bookingData.checkoutDate) ||
      dayjs(checkin).isBetween(bookingData.bookingDate, bookingData.checkoutDate) ||
      dayjs(checkout).isBetween(bookingData.bookingDate, bookingData.checkoutDate) ||
      dayjs(bookingData.bookingDate).isBetween(checkin, checkout))) {
        dateNotAllowResults.push(bookingData)
      }

      // 混合房
      const bookedPeople = Number(bookingData.numberOfAdults) + Math.floor(Number(bookingData.numberOfKids) / 2) // 資料庫內已登記預約要入住的人數
      // 混合房 若時間沒重疊
      // 須確定總床位 ，是否小於建議的床位數量
      if (bookingData.Room.type === 'mixed_dorm' &&
    dayjs(checkin).isSame(bookingData.bookingDate) === false &&
    dayjs(checkout).isSame(bookingData.checkoutDate) === false &&
    dayjs(checkin).isBetween(bookingData.bookingDate, bookingData.checkoutDate) === false &&
    dayjs(checkout).isBetween(bookingData.bookingDate, bookingData.checkoutDate) === false &&
    dayjs(bookingData.bookingDate).isBetween(checkin, checkout) === false &&
    bookingData.Room.headcount < suggestBeds) {
        dateNotAllowResults.push(bookingData)
      } else if (
      // 剩下的就是"時間有重疊" 的混合房
      // 須確定 總床位 扣掉 已被約走床位，是否小於建議的床位數量
        bookingData.Room.type === 'mixed_dorm' &&
      bookingData.Room.headcount - bookedPeople < suggestBeds
      ) {
        dateNotAllowResults.push(bookingData)
      }
    })
    return dateNotAllowResults
  } catch (err) { next(err) }
}

module.exports = { keywordFilter, dateFilter }
