'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class bookedBed extends Model {
    static associate (models) {
      bookedBed.belongsTo(models.Booking, { foreignKey: 'bookingId' })
    }
  };
  bookedBed.init({
    bookingId: DataTypes.INTEGER,
    bedRecords: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'bookedBed',
    tableName: 'Booked_beds',
    underscored: true
  })
  return bookedBed
}
