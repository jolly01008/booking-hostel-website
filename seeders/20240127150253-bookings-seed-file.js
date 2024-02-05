'use strict'

const { faker } = require('@faker-js/faker')

// 取得隨機人數
function getRandomNumber () {
  return Math.floor(Math.random() * 2) + 1 // +1目的是防止0個大人的狀況出現
}

// 取得未來訂房日期
function getRandomFutureTime () {
  // 從今天開始，到未來三個月的日期(1年有12個月，那3個月就是0.25年)
  const futureDate = faker.date.future({ years: 0.25, refDate: new Date() })
  futureDate.setHours(0, 0, 0, 0, 0)
  return futureDate
}

// 取得過去訂房日期
function getRandomPastTime () {
  // 從今天開始，到過去一年的日期
  const pastDate = faker.date.past({ years: 1, refDate: '2023-12-31T00:00:00.000Z' })
  pastDate.setHours(0, 0, 0, 0, 0)
  return pastDate
}

// 把隨機 取得的人數、所有房間、所有獨立房間，當成參數帶入(因為kids人數會影響得到甚麼房型)
function getRandomRoom (randomNumber, rooms, privateRooms) {
  const roomIndex = Math.floor(Math.random() * rooms.length)
  const privateRoomIndex = Math.floor(Math.random() * privateRooms.length)
  const numberOfKids = randomNumber - 1
  // 如果number_of_kids大於0(至少有一個kid)，就只傳出privateRoom的房間
  // 其他狀況可回傳所有房間
  if (numberOfKids > 0) {
    return privateRooms[privateRoomIndex].id
  } else { return rooms[roomIndex].id }
}

// 透過 所有房間陣列、以及目前取得的"隨機房間"當參數帶入，得到該房間的價格
function getTotalPrice (rooms, randomRoomId) {
  // 透過比對得知是哪個房間
  const roomData = rooms.find((room, i) =>
    room.id === randomRoomId
  )
  const totalPrice = roomData.price
  return totalPrice
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tenantUsers = await queryInterface.sequelize.query(' SELECT id, name, email, phone FROM Users WHERE role = \'tenant\'',
      { type: queryInterface.sequelize.QueryTypes.SELECT })
    const rooms = await queryInterface.sequelize.query(' SELECT id, price FROM Rooms ', { type: queryInterface.sequelize.QueryTypes.SELECT })
    const privateRooms = await queryInterface.sequelize.query(' SELECT id FROM hostel.rooms WHERE type = \'private_room\' ',
      { type: queryInterface.sequelize.QueryTypes.SELECT })

    const futureBookings = []
    const pastBookings = []
    // 每個使用者有兩筆未來的房間預約
    tenantUsers.forEach((tenantUser, i) => {
      Array.from({ length: 2 }).map((_, i) => {
        const randomNumber = getRandomNumber() // 用getRandomNumber()這個function。取得隨機人數數字
        const randomRoomId = getRandomRoom(randomNumber, rooms, privateRooms) // 取得隨機的房間id
        // queryInterface.sequelize.query(`UPDATE Rooms SET reservation_status = 'reserved' WHERE id = ${randomRoomId} AND type = 'private_room' `)
        return futureBookings.push({
          tenant_name: tenantUser.name,
          email: tenantUser.email,
          phone: tenantUser.phone,
          booking_date: getRandomFutureTime(),
          number_of_adults: randomNumber, // 1個人或2個人
          number_of_kids: randomNumber - 1, // 0個人或1個人
          total_price: getTotalPrice(rooms, randomRoomId),
          user_id: tenantUser.id,
          room_id: randomRoomId,
          created_at: new Date(),
          updated_at: new Date()
        })
      })
    })
    // 每個使用者有兩筆過去的房間預約
    tenantUsers.forEach((tenantUser, i) => {
      Array.from({ length: 2 }).map((_, i) => {
        const randomNumber = getRandomNumber()
        const randomRoomId = getRandomRoom(randomNumber, rooms, privateRooms)
        return pastBookings.push({
          tenant_name: tenantUser.name,
          email: tenantUser.email,
          phone: tenantUser.phone,
          booking_date: getRandomPastTime(),
          number_of_adults: randomNumber,
          number_of_kids: randomNumber - 1,
          total_price: getTotalPrice(rooms, randomRoomId),
          user_id: tenantUser.id,
          room_id: randomRoomId,
          created_at: new Date(),
          updated_at: new Date()
        })
      })
    })

    await queryInterface.bulkInsert('Bookings', futureBookings)
    await queryInterface.bulkInsert('Bookings', pastBookings)
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Bookings', {})
  }
}
