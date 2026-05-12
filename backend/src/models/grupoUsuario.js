const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const GrupoUsuario = sequelize.define(
  'GrupoUsuario',
  {
    grupo_id: { type: DataTypes.INTEGER, allowNull: false },
    usuario_id: { type: DataTypes.INTEGER, allowNull: false },
    rol: { type: DataTypes.ENUM('propietaria', 'editor', 'espectador'), defaultValue: 'espectador' },
  },
  { tableName: 'grupo_usuarios', timestamps: false }
);

module.exports = GrupoUsuario;
