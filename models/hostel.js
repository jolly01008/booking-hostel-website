'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Hostel extends Model {
    static associate (models) {
      Hostel.belongsTo(models.Landlord, { foreignKey: 'landlordId' })
      Hostel.hasMany(models.Room, { foreignKey: 'hostelId' })
    }
  };
  Hostel.init({
    name: DataTypes.STRING,
    address: DataTypes.STRING,
    description: DataTypes.TEXT,
    picture: DataTypes.STRING,
    landlordId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Hostel',
    tableName: 'Hostels',
    underscored: true
  })
  return Hostel
}
