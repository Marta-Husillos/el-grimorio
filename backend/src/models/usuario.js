const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Usuario = sequelize.define(
  'Usuario',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    password: { type: DataTypes.STRING(255), allowNull: false },
    resetToken: { type: DataTypes.STRING(64), allowNull: true },
    resetTokenExpires: { type: DataTypes.DATE, allowNull: true },
    avatar_url: { type: DataTypes.STRING(500), allowNull: true, defaultValue: null },
  },
  { tableName: 'usuarios' }
);

module.exports = Usuario;
