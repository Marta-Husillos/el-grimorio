const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const CombateSave = sequelize.define(
  'CombateSave',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    usuario_id: { type: DataTypes.INTEGER, allowNull: false },
    nombre: { type: DataTypes.STRING(80), allowNull: false },
    datos: { type: DataTypes.JSON, allowNull: false },
  },
  { tableName: 'combate_saves', timestamps: true }
);

module.exports = CombateSave;
