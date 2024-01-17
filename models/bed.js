'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Bed extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
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
