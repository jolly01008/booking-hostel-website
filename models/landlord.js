'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Landlord extends Model {
    static associate (models) {
      Landlord.belongsTo(models.User, { foreignKey: 'userId' })
      Landlord.hasMany(models.Hostel, { foreignKey: 'landlordId' })
    }
  };
  Landlord.init({
    name: DataTypes.STRING,
    avatar: DataTypes.STRING,
    introduction: DataTypes.TEXT,
    phone: DataTypes.STRING,
    country: DataTypes.STRING,
    userId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Landlord',
    tableName: 'Landlords',
    underscored: true
  })
  return Landlord
}
