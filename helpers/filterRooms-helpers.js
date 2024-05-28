const { Room, Hostel, Booking } = require('../models')

const dayjs = require('dayjs')
const isBetween = require('dayjs/plugin/isBetween')
dayjs.extend(isBetween)

// 關鍵字搜尋，所有房間==========================
const keywordFilter = async (keyword, adults, kids, next) => {
  try {
    const suggestBeds = Number(adults) + Math.floor(Number(kids) / 2) // 建議的床位數量
    const allRooms = await Room.findAll({
      attributes: ['id', 'type', 'title', 'description', 'headcount', 'price', 'pictures'],
      include: [{
        model: Hostel,
        attributes: ['id', 'name', 'address', 'description']
      }]
    })

    const keywordResults = allRooms.filter(room => {
      const keywordLower = keyword.trim().toLowerCase()
      // 每個房間先用 (是否有足夠的headcount篩選一次) && (關鍵字篩選一次)
      return room.headcount >= suggestBeds && (
        room.title.toLowerCase().includes(keywordLower) || room.description.toLowerCase().includes(keywordLower) ||
        room.Hostel.name.toLowerCase().includes(keywordLower) ||
        room.Hostel.address.toLowerCase().includes(keywordLower) ||
        room.Hostel.description.toLowerCase().includes(keywordLower)
      )
    })

    return keywordResults
  } catch (err) { next(err) }
}

// 日期(判斷是否已被預約過)、人數篩選搜尋=========================
const dateFilter = async (checkin, checkout, adults, kids, next) => {
  try {
    const allBookings = await Booking.findAll({
      attributes: ['id', 'tenantName', 'bookingDate', 'checkoutDate', 'numberOfAdults', 'numberOfKids'],
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
    const conflictMixDormBooking = [] // 放從訂單中找出 會撞期的混合房間
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
      // 須確定總床位 ，是否小於建議的床位數量
      if (bookingData.Room.type === 'mixed_dorm' &&
        bookingData.Room.headcount < suggestBeds) {
        dateNotAllowResults.push(bookingData)
      }
      if (
        // 如果日期重疊
        bookingData.Room.type === 'mixed_dorm' &&
        (dayjs(checkin).isSame(bookingData.bookingDate) ||
        dayjs(checkout).isSame(bookingData.checkoutDate) ||
        dayjs(checkin).isBetween(bookingData.bookingDate, bookingData.checkoutDate) ||
        dayjs(checkout).isBetween(bookingData.bookingDate, bookingData.checkoutDate) ||
        dayjs(bookingData.bookingDate).isBetween(checkin, checkout))
      ) {
        conflictMixDormBooking.push(bookingData) // 將撞期的的混合房另放一個陣列處理，因還要計算床位數是否足夠
      }
    })

    // 以下主要計算床位數是否足夠。
    // 1.相同Room.id非為同一組陣列 2.取得adults總數與 kids總數除以二，並相加 3.便可判斷被使用床位數，再與headcount比大小
    const groupByRoomId = {} // 定義一個空的物件來存儲根據 roomId 分組的預訂 。

    // 訂單中同樣的Room.id歸在同一個陣列做分類
    conflictMixDormBooking.forEach(booking => {
      const roomId = booking.Room.id
      // groupByRoomId[roomId] 是方括號記法，用來存取物件 object 中鍵為 key 的值(跟點記法一樣)。但動態鍵名，只有方括號記法可以使用
      // 如果這個 groupByRoomId.roomId 尚未出現過，則初始化為一個空陣列
      if (!groupByRoomId[roomId]) {
        groupByRoomId[roomId] = []
        // 這行將 groupByRoomId 物件中的鍵 177初始化為一個 []。此時groupByRoomId 變成 { '177': [] }。JavaScript 自動將177轉換為字符串
      }
      groupByRoomId[roomId].push(booking) // 相同roomId的訂單，就會放到空陣列中
    })

    // Object.values 是 JavaScript 提供的一個方法，用於返回一個給定對象的所有可枚舉屬性的值，這些值以陣列的形式返回
    // 例如 Object.values( { a: 1, b: 2, c: 3 } ) ，返回[1, 2, 3]
    // 目前groupByRoomId內容: { '160': [ 160訂單資料 ], '177': [ 177訂單資料 ] } ， 所以需用Object.values取值
    Object.values(groupByRoomId).forEach(bookings => {
      let totalAdults = 0
      let totalKids = 0

      bookings.forEach(booking => {
        totalAdults += booking.numberOfAdults
        totalKids += booking.numberOfKids
      })
      totalKids = Math.floor(totalKids / 2) // 除以二是因為設定兩個小孩可共用一張床

      const usedBedCounts = totalAdults + totalKids
      // 被使用的床位數量，若大於等於該房的可容納數量，代表已沒床位可預約需放到dateNotAllowResults
      if (usedBedCounts >= bookings[0].Room.headcount) {
        dateNotAllowResults.push(...bookings)
      }
    })

    return dateNotAllowResults
  } catch (err) { next(err) }
}

module.exports = { keywordFilter, dateFilter }
