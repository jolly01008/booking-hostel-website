'use strict'
const { faker } = require('@faker-js/faker')

function getPictures () {
  const multiplePictures = []
  for (let i = 1; i <= 4; i++) {
    const randomNum = Math.floor(Math.random() * 1000)
    const singlePicture = `https://loremflickr.com/320/240/room?${randomNum}.jpg`
    multiplePictures.push(singlePicture)
  }
  return JSON.stringify(multiplePictures)
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hostels = await queryInterface.sequelize.query('SELECT id FROM Hostels', { type: queryInterface.sequelize.QueryTypes.SELECT })
    const allFacilities = ['早餐', '獨立衛浴', '洗衣機', '電視', '飲水機', '空調設備', 'Wifi', '停車場']
    const allRooms = []

    // 每個hostel，至少有四個房間
    hostels.forEach((hostel, i) => {
      // 指定其中兩間，是雙人房的獨立套房
      for (let room = 0; room < 2; room++) {
        const privateRoomData = {
          title: faker.lorem.words({ min: 1, max: 2 }),
          type: 'private_room',
          description: faker.lorem.paragraphs({ min: 1, max: 2 }),
          price: faker.commerce.price({ min: 1500, max: 10000, dec: 0 }),
          facilities: faker.helpers.arrayElements(allFacilities, { min: 1, max: 6 }).join(),
          pictures: getPictures(),
          hostel_id: hostel.id,
          headcount: 2,
          created_at: new Date(),
          updated_at: new Date()
        }
        allRooms.push(privateRoomData)
      }
      // 指定其中一間，是三人房的獨立套房
      for (let room = 0; room < 1; room++) {
        const privateRoomData = {
          title: faker.lorem.words({ min: 2, max: 4 }),
          type: 'private_room',
          description: faker.lorem.paragraphs({ min: 1, max: 2 }),
          price: faker.commerce.price({ min: 1500, max: 10000, dec: 0 }),
          facilities: faker.helpers.arrayElements(allFacilities, { min: 1, max: 6 }).join(),
          pictures: getPictures(),
          hostel_id: hostel.id,
          headcount: 3,
          created_at: new Date(),
          updated_at: new Date()
        }
        allRooms.push(privateRoomData)
      }
      // 指定其中一間，是五人房的混合房
      const mixdDormData = {
        title: faker.lorem.words({ min: 2, max: 4 }),
        type: 'mixed_dorm',
        description: faker.lorem.paragraphs({ min: 1, max: 2 }),
        price: faker.commerce.price({ min: 500, max: 2500, dec: 0 }),
        facilities: faker.helpers.arrayElements(allFacilities, { min: 1, max: 6 }).join(),
        pictures: getPictures(),
        hostel_id: hostel.id,
        headcount: 5,
        created_at: new Date(),
        updated_at: new Date()
      }
      allRooms.push(mixdDormData)
    })
    await queryInterface.bulkInsert('Rooms', allRooms)
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Rooms', {})
  }
}
