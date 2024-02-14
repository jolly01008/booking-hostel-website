'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    static associate (models) {
      Booking.belongsTo(models.Room, { foreignKey: 'roomId' })
      Booking.belongsTo(models.User, { foreignKey: 'userId' })
      Booking.hasMany(models.bookedBed, { foreignKey: 'bookingId' })
    }
  };
  Booking.init({
    tenantName: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    bookingDate: DataTypes.DATE,
    numberOfAdults: DataTypes.INTEGER,
    numberOfKids: DataTypes.INTEGER,
    totalPrice: DataTypes.INTEGER,
    userId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Booking',
    tableName: 'Bookings',
    underscored: true
  })
  return Booking
}
