const dayjs = require('dayjs')

const getNewBooking = allBookings => {
  const newBooking = []
  allBookings.forEach(booking => {
    const today = dayjs(new Date()).format('YYYY-MM-DD')
    const bookingDate = dayjs(booking.bookingDate).format('YYYY-MM-DD')
    const checkoutDate = dayjs(booking.checkoutDate).format('YYYY-MM-DD')
    if (bookingDate >= today || checkoutDate >= today) {
      newBooking.push({ ...booking.toJSON(), bookingDate, checkoutDate })
    }
  })
  return newBooking
}

const getPastBooking = allBookings => {
  const pastBooking = []
  allBookings.forEach(booking => {
    const today = dayjs(new Date()).format('YYYY-MM-DD')
    const bookingDate = dayjs(booking.bookingDate).format('YYYY-MM-DD')
    const checkoutDate = dayjs(booking.checkoutDate).format('YYYY-MM-DD')
    if (bookingDate < today && checkoutDate < today) {
      pastBooking.push({ ...booking.toJSON(), bookingDate, checkoutDate })
    }
  })
  return pastBooking
}

module.exports = { getNewBooking, getPastBooking }
