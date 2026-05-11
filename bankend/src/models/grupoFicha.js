const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const GrupoFicha = sequelize.define(
  'GrupoFicha',
  {
    grupo_id: { type: DataTypes.INTEGER, allowNull: false },
    npc_id: { type: DataTypes.INTEGER, allowNull: false },
    compartido_por: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    tableName: 'grupo_fichas',
    timestamps: false,
    indexes: [{ unique: true, fields: ['grupo_id', 'npc_id'] }],
  }
);

module.exports = GrupoFicha;
