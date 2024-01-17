'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Hostel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
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