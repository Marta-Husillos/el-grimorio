const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

class MonstruoCache extends Model {}

MonstruoCache.init(
  {
    index: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    nombre_en: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nombre_es: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'MonstruoCache',
    tableName: 'monstruos_cache',
    timestamps: true,
  }
);

module.exports = MonstruoCache;
