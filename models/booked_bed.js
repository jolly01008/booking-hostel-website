'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class bookedBed extends Model {
    static associate (models) {
      bookedBed.belongsTo(models.Bed, { foreignKey: 'bedId' })
      bookedBed.belongsTo(models.Booking, { foreignKey: 'bookingId' })
    }
  };
  bookedBed.init({
    bookingId: DataTypes.INTEGER,
    bedId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'bookedBed',
    tableName: 'bookedBeds',
    underscored: true
  })
  return bookedBed
}
