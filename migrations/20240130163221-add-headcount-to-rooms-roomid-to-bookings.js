'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Rooms', 'headcount', { type: Sequelize.DataTypes.INTEGER, after: 'hostel_id' })
    await queryInterface.addColumn('Bookings', 'room_id', { type: Sequelize.DataTypes.INTEGER, after: 'user_id' })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Rooms', 'headcount')
    await queryInterface.removeColumn('Bookings', 'room_id')
  }
}