const { Booking, bookedBed, Bed, Room } = require('../models')

const dayjs = require('dayjs')
const isBetween = require('dayjs/plugin/isBetween')
dayjs.extend(isBetween)

// 判斷即將下單預約的房間，是否有重疊日期，若有重疊，床位數是否還足夠
const bedsAmountFilter = async (checkin, checkout, adults, kids, roomId, next) => {
  try {
    // 取出該房間所有訂單資料
    const bookingsOfRoom = await Booking.findAll({
      where: { roomId },
      attributes: ['id', 'bookingDate', 'checkoutDate', 'numberOfAdults', 'numberOfKids']
    })

    const room = await Room.findOne({
      where: { id: roomId },
      attributes: ['headcount']
    })

    let bookedBedsAmount = 0 // 計算重疊的日期中，有幾張床被訂走了
    const suggestBeds = Number(adults) + Math.floor(Number(kids) / 2) // 建議的床位數量
    // 該房間的每筆訂單拿出來比對，若有與入住期間重疊，就計算它被訂走了幾個床位
    bookingsOfRoom.forEach(bookingOfRoom => {
    // 先將日期轉換成 YYYY-MM-DD格式
      const bookingDate = dayjs(bookingOfRoom.bookingDate).format('YYYY-MM-DD')
      const checkoutDate = dayjs(bookingOfRoom.checkoutDate).format('YYYY-MM-DD')
      if (
        dayjs(checkin).isSame(bookingDate) ||
      dayjs(checkout).isSame(checkoutDate) ||
      dayjs(checkin).isBetween(bookingDate, checkoutDate) ||
      dayjs(checkout).isBetween(bookingDate, checkoutDate) ||
      dayjs(bookingDate).isBetween(checkin, checkout)) {
        bookedBedsAmount = bookedBedsAmount + Number(bookingOfRoom.numberOfAdults) + Math.floor(Number(bookingOfRoom.numberOfKids) / 2) // 這個房間已被訂走幾張床
      }
    })
    if (bookedBedsAmount + suggestBeds > room.headcount) throw new Error('這個期間，該房間床位不足!')
  } catch (err) { next(err) }
}

// create訂單與床位資料 到 Booked_bed資料表
const bedCreater = async (tenantName, email, phone, checkin, checkout, adults, kids, totalPrice, currentUserId, roomId, next) => {
  try {
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
    if (!booking) throw new Error('沒有預約成功')

    // 找出這個房間所有的床位
    const bedsOfRoom = await Bed.findAll({ where: { roomId } })

    // 找出這個房間所有的訂單。為了判斷日期，分配床位
    const bookingsOfRoom = await Booking.findAll({
      where: { roomId },
      attributes: ['id', 'bookingDate', 'checkoutDate', 'numberOfAdults', 'numberOfKids']
    })

    let bookedBedsAmount = 0 // 計算重疊的日期中，有幾張床被訂走了
    // 該房間的每筆訂單拿出來比對，若有與入住期間重疊，就計算它被訂走了幾個床位
    bookingsOfRoom.forEach(bookingOfRoom => {
    // 先將日期轉換成 YYYY-MM-DD格式
      const bookingDate = dayjs(bookingOfRoom.bookingDate).format('YYYY-MM-DD')
      const checkoutDate = dayjs(bookingOfRoom.checkoutDate).format('YYYY-MM-DD')
      if (
        bookingOfRoom.id !== booking.id && // 先去除掉 "才剛新增的訂單"
      (dayjs(checkin).isSame(bookingDate) ||
      dayjs(checkout).isSame(checkoutDate) ||
      dayjs(checkin).isBetween(bookingDate, checkoutDate) ||
      dayjs(checkout).isBetween(bookingDate, checkoutDate) ||
      dayjs(bookingDate).isBetween(checkin, checkout))) {
        bookedBedsAmount = bookedBedsAmount + Number(bookingOfRoom.numberOfAdults) + Math.floor(Number(bookingOfRoom.numberOfKids) / 2) // 這個房間已被訂走幾張床
      }
    })

    // 安排的床位是 bedsOfRoom[bookedBedsAmount +1(往後一張床) -1(index從0開始) ]，互相抵消乾脆寫bedsOfRoom[bookedBedsAmount]
    const bedId = bedsOfRoom[bookedBedsAmount].id

    await bookedBed.create({
      bookingId: booking.id,
      bedId
    })
  } catch (err) { next(err) }
}

module.exports = { bedsAmountFilter, bedCreater }
