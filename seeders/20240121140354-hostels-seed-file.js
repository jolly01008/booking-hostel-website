'use strict'
const { faker } = require('@faker-js/faker')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const landlords = await queryInterface.sequelize.query('SELECT id From Landlords',
      { type: queryInterface.sequelize.QueryTypes.SELECT })
    const hostels = []

    landlords.forEach((landlord, i) => {
      Array.from({ length: 2 }).map((_, j) => {
        return hostels.push({
          name: faker.company.name(),
          address: faker.location.streetAddress({ useFullAddress: true }),
          description: faker.lorem.paragraphs({ min: 2, max: 4 }),
          picture: 'https://loremflickr.com/320/240/hostel,building',
          landlord_id: landlord.id,
          created_at: new Date(),
          updated_at: new Date()
        })
      })
    })
    await queryInterface.bulkInsert('Hostels', hostels)
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Hostels', {})
  }
}
