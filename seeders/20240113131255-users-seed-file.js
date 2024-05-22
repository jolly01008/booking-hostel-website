'use strict'
const bcrypt = require('bcryptjs')
const { faker } = require('@faker-js/faker')
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hash('12345678', 10)
    await queryInterface.bulkInsert('Users', [
      {
        email: 'user1@example.com',
        password: hashedPassword,
        name: 'user1',
        avatar: 'https://i.imgur.com/UuaL1Pu.png',
        introduction: 'I am user1',
        phone: faker.airline.flightNumber({ length: 10 }),
        country: 'Taiwan',
        role: 'tenant',
        current_role: 'tenant',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        email: 'user2@example.com',
        password: hashedPassword,
        name: 'user2',
        avatar: 'https://i.imgur.com/UuaL1Pu.png',
        introduction: 'I am user2',
        phone: faker.airline.flightNumber({ length: 10 }),
        country: 'Taiwan',
        role: 'tenant',
        current_role: 'tenant',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {})
    await queryInterface.bulkInsert('Users',
      Array.from({ length: 3 }).map(() => ({
        email: faker.internet.email(),
        password: hashedPassword,
        name: faker.person.fullName(),
        avatar: 'https://i.imgur.com/UuaL1Pu.png',
        introduction: faker.lorem.words({ min: 8, max: 15 }),
        phone: faker.airline.flightNumber({ length: 10 }),
        country: faker.location.country(),
        role: 'tenant',
        current_role: 'tenant',
        created_at: new Date(),
        updated_at: new Date()
      }))
    )
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', {})
  }
}
