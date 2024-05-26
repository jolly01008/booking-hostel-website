'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Booked_beds', 'bed_records', {
      type: Sequelize.DataTypes.STRING,
      after: 'booking_id'
    })
    await queryInterface.removeColumn('Booked_beds', 'bed_id')
    await queryInterface.removeColumn('Rooms', 'reservation_status')
    await queryInterface.removeColumn('Beds', 'reserved')
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Booked_beds', 'bed_records')
    await queryInterface.addColumn('Booked_beds', 'bed_id', {
      type: Sequelize.DataTypes.INTEGER,
      after: 'booking_id'
    })
    await queryInterface.addColumn('Rooms', 'reservation_status', {
      type: Sequelize.DataTypes.STRING,
      after: 'pictures'
    })
    await queryInterface.addColumn('Beds', 'reserved', {
      type: Sequelize.DataTypes.STRING,
      after: 'id'
    })
  }
}
