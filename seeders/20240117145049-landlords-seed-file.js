'use strict'
const { faker } = require('@faker-js/faker')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const users = await queryInterface.sequelize.query(
      'SELECT id, name, avatar, phone, country FROM Users WHERE email NOT IN (\'user1@example.com\', \'user2@example.com\')',
      { type: queryInterface.sequelize.QueryTypes.SELECT })
    const shuffledUsers = users.sort(() => 0.5 - Math.random()) // 隨機排序使用者

    const userTwo = await queryInterface.sequelize.query(
      'SELECT id, name, avatar, phone, country FROM Users WHERE email = \'user2@example.com\'',
      { type: queryInterface.sequelize.QueryTypes.SELECT })

    // 指定user2變成房東
    await queryInterface.sequelize.query(`UPDATE Users SET role = 'landlord', currentRole = 'landlord' WHERE id = ${userTwo[0].id}`)
    await queryInterface.bulkInsert('Landlords', [{
      name: userTwo[0].name || faker.person.fullName(),
      avatar: 'https://imgur.com/a/Vlb1ogg',
      introduction: 'I am user2 landord',
      phone: userTwo[0].phone || faker.airline.flightNumber({ length: 10 }),
      country: userTwo[0].country || faker.location.country(),
      user_id: userTwo[0].id,
      created_at: new Date(),
      updated_at: new Date()
    }])

    // 2個租客變成房東
    await queryInterface.bulkInsert('Landlords',
      Array.from({ length: 2 }).map((v, index) => {
        queryInterface.sequelize.query(`UPDATE Users SET role = 'landlord', currentRole = 'landlord' WHERE id = ${shuffledUsers[index].id} `)
        return {
          name: shuffledUsers[index].name || faker.person.fullName(),
          avatar: 'https://imgur.com/a/Vlb1ogg',
          introduction: faker.lorem.words({ min: 8, max: 15 }),
          phone: shuffledUsers[index].phone || faker.airline.flightNumber({ length: 10 }),
          country: shuffledUsers[index].country || faker.location.country(),
          user_id: shuffledUsers[index].id,
          created_at: new Date(),
          updated_at: new Date()
        }
      })
    )
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Landlords', {})
  }
}
