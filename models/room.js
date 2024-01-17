'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Room extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
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
    hostelId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Room',
    tableName: 'Rooms',
    underscored: true
  })
  return Room
}
