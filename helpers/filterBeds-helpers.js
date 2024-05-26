const { Booking, bookedBed, Bed } = require('../models')

const dayjs = require('dayjs')
const isBetween = require('dayjs/plugin/isBetween')
dayjs.extend(isBetween)

// 判斷即將下單預約的房間，是否有重疊日期，若有重疊，床位數是否還足夠
const bedsAmountFilter = async (checkin, checkout, adults, kids, roomId, next) => {
  try {
    const suggestBeds = Number(adults) + Math.floor(Number(kids) / 2) // 建議的床位數量
    // 取出該房間所有訂單資料
    const bookingsOfRoom = await Booking.findAll({
      where: { roomId },
      attributes: ['id', 'bookingDate', 'checkoutDate', 'numberOfAdults', 'numberOfKids']
    })
    const beds = await Bed.findAll({ where: { roomId }, attributes: ['id'] }) // 該房間所有床的編號
    const allBookedBeds = await bookedBed.findAll({ attributes: ['id', 'bookingId', 'bedRecords'] }) // bookedBed表所有資料

    // =========找出有重疊日期，已被約走的床位編號、長度，並判斷床位是否足夠
    // 重疊日期的訂單
    const conflictDateBooking = []
    bookingsOfRoom.forEach(bookingOfRoom => {
    // 先將日期轉換成 YYYY-MM-DD格式
      const bookingDate = dayjs(bookingOfRoom.bookingDate).format('YYYY-MM-DD')
      const checkoutDate = dayjs(bookingOfRoom.checkoutDate).format('YYYY-MM-DD')
      if (
        // 預約的日期有重疊的狀況
        dayjs(checkin).isSame(bookingDate) ||
        dayjs(checkout).isSame(checkoutDate) ||
        dayjs(checkin).isBetween(bookingDate, checkoutDate) ||
        dayjs(checkout).isBetween(bookingDate, checkoutDate) ||
        dayjs(bookingDate).isBetween(checkin, checkout)) {
        conflictDateBooking.push(bookingOfRoom.id)
      }
    })

    // 重疊日期訂單 與 bookedBed資料表的bookingId 互相比對，若id相同代表這筆訂單確實被記錄在bookedBed表，進而取得該筆的bedRecords
    const unableBedsArr = []
    allBookedBeds.forEach(bookingRecord => {
      conflictDateBooking.forEach(bookingId => {
        if (Number(bookingRecord.bookingId) === Number(bookingId)) {
          const unableBeds = JSON.parse(bookingRecord.bedRecords) // unableBeds資料會是這樣['148', '149']
          unableBedsArr.push(...unableBeds) // 資料要展開再push，unableBedsArr會像這樣['148', '149', '150']是字串陣列
        }
      })
    })

    // 過濾掉在 unableBedsArr 中存在的元素
    // availableBeds結果會類似這樣[{id:148},{id:149},{id:150},{id:151},{id:152}] ; slice(0, suggestBeds)用來切割需要幾張床位 ;
    const availableBeds = beds.filter(bed =>
      !unableBedsArr.includes(String(bed.id))).slice(0, suggestBeds)
    // 可預約床位長度來判斷
    if (availableBeds.length < suggestBeds) {
      return '這個期間，該房間的床位不足!'
    } else {
      return ('床位還足夠')
    }
  } catch (err) { next(err) }
}

// 寫入床位資料
const bedCreater = async (tenantName, email, phone, checkin, checkout, adults, kids, totalPrice, currentUserId, roomId, next) => {
  try {
    const suggestBeds = Number(adults) + Math.floor(Number(kids) / 2) // 建議的床位數量
    // 找出才剛新增的訂房紀錄。若項目都符合才剛填入的資料，就是那筆"剛新增的booking"
    const booking = await Booking.findOne({
      where: {
        tenantName,
        email,
        phone,
        bookingDate: new Date(checkin),
        checkoutDate: new Date(checkout),
        numberOfAdults: adults,
        numberOfKids: kids,
        totalPrice,
        userId: currentUserId,
        roomId
      }
    })
    if (!booking) throw new Error('找不到這筆訂單，沒有預約成功')

    // 取出該房間所有訂單資料
    const bookingsOfRoom = await Booking.findAll({
      where: { roomId },
      attributes: ['id', 'bookingDate', 'checkoutDate', 'numberOfAdults', 'numberOfKids']
    })
    const beds = await Bed.findAll({ where: { roomId }, attributes: ['id'] }) // 該房間所有床的編號
    const allBookedBeds = await bookedBed.findAll({ attributes: ['id', 'bookingId', 'bedRecords'] }) // bookedBed表所有資料

    // 1.找出有重疊日期的訂單 2.進而取得已被約走的床位bedRecords 3.去除被約走的床位 4.把尚可預約的床位寫進bookedBed
    // 重疊日期的訂單
    const conflictDateBooking = []
    bookingsOfRoom.forEach(bookingOfRoom => {
    // 先將日期轉換成 YYYY-MM-DD格式
      const bookingDate = dayjs(bookingOfRoom.bookingDate).format('YYYY-MM-DD')
      const checkoutDate = dayjs(bookingOfRoom.checkoutDate).format('YYYY-MM-DD')
      if (
        // 預約的日期有重疊的狀況
        dayjs(checkin).isSame(bookingDate) ||
        dayjs(checkout).isSame(checkoutDate) ||
        dayjs(checkin).isBetween(bookingDate, checkoutDate) ||
        dayjs(checkout).isBetween(bookingDate, checkoutDate) ||
        dayjs(bookingDate).isBetween(checkin, checkout)) {
        conflictDateBooking.push(bookingOfRoom.id)
      }
    })
    // 重疊日期訂單 與 bookedBed資料表的bookingId 互相比對，若id相同代表這筆訂單確實被記錄在bookedBed表，進而取得該筆的bedRecords
    const unableBedsArr = []
    allBookedBeds.forEach(bookingRecord => {
      conflictDateBooking.forEach(bookingId => {
        if (Number(bookingRecord.bookingId) === Number(bookingId)) {
          const unableBeds = JSON.parse(bookingRecord.bedRecords) // unableBeds資料會是這樣['148', '149']
          unableBedsArr.push(...unableBeds) // 資料要展開再push，unableBedsArr會像這樣['148', '149', '150']是字串陣列
        }
      })
    })

    // 過濾掉在 unableBedsArr 中存在的元素
    // availableBeds結果會類似這樣[{id:148},{id:149},{id:150},{id:151},{id:152}] ; slice(0, suggestBeds)用來切割需要幾張床位 ;
    const availableBeds = beds.filter(bed =>
      !unableBedsArr.includes(String(bed.id))).slice(0, suggestBeds)

    if (availableBeds.length < suggestBeds) throw new Error('這個期間，該房間的床位不足!')
    if (availableBeds.length === 0) throw new Error('這個期間，該房間已經沒有可預約的床位!')

    const bedRecords = availableBeds.map(item => JSON.stringify(item.id)) // 將結果變成["148", "149", "150", "151", "152"]

    return ({ bookingId: booking.id, bedRecords })
  } catch (err) { next(err) }
}

module.exports = { bedsAmountFilter, bedCreater }
