'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Room extends Model {
    static associate (models) {
      Room.belongsTo(models.Hostel, { foreignKey: 'hostelId' })
      Room.hasMany(models.Bed, { foreignKey: 'roomId' })
      Room.hasMany(models.Booking, { foreignKey: 'roomId' })
    }
  };
  Room.init({
    title: DataTypes.STRING,
    type: DataTypes.STRING,
    description: DataTypes.TEXT,
    price: DataTypes.INTEGER,
    facilities: DataTypes.TEXT,
    pictures: DataTypes.STRING,
    reservationStatus: DataTypes.STRING,
    hostelId: DataTypes.INTEGER,
    headcount: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Room',
    tableName: 'Rooms',
    underscored: true
  })
  return Room
}
