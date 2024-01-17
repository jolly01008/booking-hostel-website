'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
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
