'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const allMixedDorms = await queryInterface.sequelize.query(' SELECT id FROM Rooms WHERE type = \'mixed_dorm\' ',
      { type: queryInterface.sequelize.QueryTypes.SELECT })

    const mixedDormAllBeds = []

    allMixedDorms.forEach((mixedDorm, i) => {
      // 每一間混合房，都給5張尚未被預訂的床
      Array.from({ length: 5 }).map((_, j) => {
        return mixedDormAllBeds.push({
          room_id: mixedDorm.id,
          created_at: new Date(),
          updated_at: new Date()
        })
      })
    })
    await queryInterface.bulkInsert('Beds', mixedDormAllBeds)
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Beds', {})
  }
}
