const dayjs = require('dayjs')
const { bookedBed } = require('../models')

const getNewBooking = async (allBookings, next) => {
  try {
    const newBooking = []
    // forEach不關心内部的異步操作，不會等待異步操作完成。所以用for...of更為適合
    for (const booking of allBookings) {
      const beds = await bookedBed.findOne({
        where: { bookingId: booking.id },
        attributes: ['id', 'bedRecords']
      })
      const today = dayjs(new Date()).format('YYYY-MM-DD')
      const bookingDate = dayjs(booking.bookingDate).format('YYYY-MM-DD')
      const checkoutDate = dayjs(booking.checkoutDate).format('YYYY-MM-DD')
      if ((bookingDate >= today || checkoutDate >= today) && beds) {
        // 是未來的時間，且有 beds 的資料(混合房)，就得把bedRecords也推進newBooking
        const bedRecords = JSON.parse(beds.bedRecords) // 該筆booking的所有床位編號
        newBooking.push({ ...booking.toJSON(), bookingDate, checkoutDate, bedRecords })
      } else if (bookingDate >= today || checkoutDate >= today) {
      // 是未來時間，但沒有 beds資料 ( 獨立房間 )
        newBooking.push({ ...booking.toJSON(), bookingDate, checkoutDate })
      }
    }
    return newBooking
  } catch (err) { next(err) }
}

const getPastBooking = async (allBookings, next) => {
  try {
    const pastBooking = []
    // forEach不關心内部的異步操作，不會等待異步操作完成。所以用for...of更為適合
    for (const booking of allBookings) {
      const beds = await bookedBed.findOne({
        where: { bookingId: booking.id },
        attributes: ['id', 'bedRecords']
      })
      const today = dayjs(new Date()).format('YYYY-MM-DD')
      const bookingDate = dayjs(booking.bookingDate).format('YYYY-MM-DD')
      const checkoutDate = dayjs(booking.checkoutDate).format('YYYY-MM-DD')
      if ((bookingDate < today && checkoutDate < today) && beds) {
      // 是過去的時間，且有 beds 的資料(混合房)，就得把bedRecords也推進pastBooking
        const bedRecords = JSON.parse(beds.bedRecords) // 該筆booking的所有床位編號
        pastBooking.push({ ...booking.toJSON(), bookingDate, checkoutDate, bedRecords })
      } else if (bookingDate < today && checkoutDate < today) {
      // 是過去時間，但沒有 beds資料 ( 獨立房間 )
        pastBooking.push({ ...booking.toJSON(), bookingDate, checkoutDate })
      }
    }
    return pastBooking
  } catch (err) { next(err) }
}

module.exports = { getNewBooking, getPastBooking }
