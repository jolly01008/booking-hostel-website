'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Bed extends Model {
    static associate (models) {
      Bed.belongsTo(models.Room, { foreignKey: 'roomId' })
      Bed.hasMany(models.bookedBed, { foreignKey: 'bedId' })
    }
  };
  Bed.init({
    reserved: DataTypes.BOOLEAN,
    roomId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Bed',
    tableName: 'Beds',
    underscored: true
  })
  return Bed
}
