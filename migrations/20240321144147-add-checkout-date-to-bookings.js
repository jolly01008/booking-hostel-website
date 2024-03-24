'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Bookings', 'checkout_date', {
      type: Sequelize.DataTypes.DATE,
      after: 'booking_date'
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Bookings', 'checkout_date')
  }
}
