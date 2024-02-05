'use strict'

// 所有訂單裡挑出房型是混合房的 >> 所有床位，用room_id 比對訂單中為混合房型的room_id，代表該訂單可選用的五張床 >> 照room_id、人數給床位，insert相對的資料

// 拿到混合房的所有訂單
// 把allMixedDorms(已經確定是mixed_dorm)的id，與allBookings的room_id做比對，若互相匹配，代表該筆訂單的room_id是混合房間
// 那就可以把該筆訂單的id，塞進booked_beds的資料表booking_id欄位
function getMixedDormBookings (allMixedDorms, allBookings) {
  const packArrs = []
  // forEach取出allMixedDorms的每一個元素(每個元素都拿出來做filter條件比對)
  allMixedDorms.forEach(mixedDorm => {
    // filter方法迭代每筆訂單，並回傳滿足條件的每個元素值。是回傳新陣列，用result接住
    const result = allBookings.filter(booking => {
      return booking.room_id === mixedDorm.id
    })
    packArrs.push(result) // 先將多組result的陣列，push到空陣列。會變成陣列中又包陣列 [ [result結果], [result結果], [result結果] .... ]
  })
  const mixedDormBookings = packArrs.flat(Infinity) // 所有訂單裡，取出room_id是mixed_dorm的。 flat(Infinity)將陣列中的所有陣列都展平
  return mixedDormBookings
}

// 拿到每筆"混合房訂單"中的每張床
// 把allBeds的room_id 與 allBookings的room_id做比對(床本來就來自混合房，所以直接比對訂單room_id，也就篩選出該訂單是混合房)
// 若互相匹配，代表該床的room_id，有在訂單資料表裡找到，且比對出的床是該筆訂單可選用的床
function getPerBedsOfBookings (allBookings, allBeds) {
  const packArrs = []
  // forEach取出allBookings的每一個元素(每個元素都拿出來做filter條件比對)
  allBookings.forEach(booking => {
    // filter方法迭代每張床，並回傳滿足條件的每張床。滿足該筆訂單room_id與哪些床的room_id相同(進而得知該筆訂單有五張床可選)
    const result = allBeds.filter(bed => {
      return booking.room_id === bed.room_id
    })
    packArrs.push(result) // 把符合條件的每張床蒐集在packArrs
  })
  const perBedsOfBookings = packArrs.flat(Infinity) // flat(Infinity)將陣列中的所有陣列都展平
  return perBedsOfBookings
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 所有訂單資料
    const allBookings = await queryInterface.sequelize.query(' SELECT id, room_id, number_of_adults FROM Bookings ', { type: queryInterface.sequelize.QueryTypes.SELECT })
    // 所有房型為mixed_dorm的資料
    const allMixedDorms = await queryInterface.sequelize.query(' SELECT id FROM Rooms WHERE type = \'mixed_dorm\' ',
      { type: queryInterface.sequelize.QueryTypes.SELECT })
    // 所有床的資料
    const allBeds = await queryInterface.sequelize.query(' SELECT id, room_id FROM Beds ', { type: queryInterface.sequelize.QueryTypes.SELECT })

    const mixedDormBookings = getMixedDormBookings(allMixedDorms, allBookings)
    const perBedsOfBookings = getPerBedsOfBookings(allBookings, allBeds)

    const bookedBeds = []
    mixedDormBookings.forEach(mixedDormBooking => {
      // 每一筆混合房訂單的room_id 與 可選用床位的room_id做比對，依照room_id去分配床位
      // 用find返回第一個符合條件的元素。因為知道是哪個room_id一次就好(也剛好取得該混合房間第1張床的id)
      const bedOfBooking = perBedsOfBookings.find(bed => {
        return mixedDormBooking.room_id === bed.room_id }) // 該筆訂單，配出一張這個room_id的床

      const numberOfAdults = mixedDormBooking.number_of_adults
      // 1個大人就分一個床位，2個大人就給兩個床位
      if (numberOfAdults === 1) {
        bookedBeds.push({
          booking_id: mixedDormBooking.id,
          bed_id: bedOfBooking.id,
          created_at: new Date(),
          updated_at: new Date()
        })
      } else if (numberOfAdults === 2) {
        bookedBeds.push({
          booking_id: mixedDormBooking.id,
          bed_id: bedOfBooking.id,
          created_at: new Date(),
          updated_at: new Date()
        })
        bookedBeds.push({
          booking_id: mixedDormBooking.id,
          bed_id: bedOfBooking.id + 1, // 再 +1，就可拿到第2張床的id
          created_at: new Date(),
          updated_at: new Date()
        })
      }
    })
    await queryInterface.bulkInsert('Booked_beds', bookedBeds)
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Booked_beds', {})
  }
}
