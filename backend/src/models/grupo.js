const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Grupo = sequelize.define(
  'Grupo',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    descripcion: { type: DataTypes.TEXT, allowNull: true },
    creador_id: { type: DataTypes.INTEGER, allowNull: false },
    codigo_invitacion: { type: DataTypes.STRING(20), unique: true },
  },
  { tableName: 'grupos' }
);

module.exports = Grupo;
