const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

class Npc extends Model {}

Npc.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // Información básica
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tamano: {
      type: DataTypes.STRING,
      defaultValue: 'Mediano',
    },
    tipo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    alineamiento: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    etiquetas: {
      type: DataTypes.TEXT, // JSON array de strings
      allowNull: true,
    },
    // Combate
    tipo_armadura:   { type: DataTypes.STRING,  defaultValue: 'sin_armadura' },
    clase_armadura:  { type: DataTypes.INTEGER, defaultValue: 10 },
    num_dados:       { type: DataTypes.INTEGER, allowNull: true },
    puntos_de_golpe: { type: DataTypes.INTEGER, defaultValue: 10 },
    velocidad:       { type: DataTypes.STRING,  defaultValue: '9 m' },
    // Características
    fuerza:       { type: DataTypes.INTEGER, defaultValue: 10 },
    destreza:     { type: DataTypes.INTEGER, defaultValue: 10 },
    constitucion: { type: DataTypes.INTEGER, defaultValue: 10 },
    inteligencia: { type: DataTypes.INTEGER, defaultValue: 10 },
    sabiduria:    { type: DataTypes.INTEGER, defaultValue: 10 },
    carisma:      { type: DataTypes.INTEGER, defaultValue: 10 },
    favorito:     { type: DataTypes.BOOLEAN, defaultValue: false },
    // Iniciativa y tiradas de salvación (JSON: { fue, des, con, int, sab, car })
    iniciativa:  { type: DataTypes.STRING, allowNull: true },
    salvaciones: { type: DataTypes.JSON,   allowNull: true },
    // Atributos de combate
    habilidades_competencias: { type: DataTypes.TEXT, allowNull: true },
    habilidades:              { type: DataTypes.TEXT, allowNull: true },
    resistencias_dano:     { type: DataTypes.JSON, allowNull: true, defaultValue: [] },
    inmunidades_dano:      { type: DataTypes.JSON, allowNull: true, defaultValue: [] },
    vulnerabilidades_dano: { type: DataTypes.JSON, allowNull: true, defaultValue: [] },
    inmunidades_condicion: { type: DataTypes.JSON, allowNull: true, defaultValue: [] },
    sentidos:      { type: DataTypes.TEXT,   allowNull: true },
    idiomas:       { type: DataTypes.TEXT,   allowNull: true },
    valor_desafio: { type: DataTypes.STRING, allowNull: true },
    // Habilidades y rasgos
    titulo_habilidades_especiales: { type: DataTypes.STRING, defaultValue: 'Atributos' },
    habilidades_especiales:        { type: DataTypes.TEXT,   allowNull: true },
    titulo_acciones:               { type: DataTypes.STRING, defaultValue: 'Acciones' },
    acciones:                      { type: DataTypes.TEXT,   allowNull: true },
    titulo_acciones_adicionales:   { type: DataTypes.STRING, defaultValue: 'Acciones adicionales' },
    acciones_adicionales:          { type: DataTypes.TEXT,   allowNull: true },
    titulo_reacciones:             { type: DataTypes.STRING, defaultValue: 'Reacciones' },
    reacciones:                    { type: DataTypes.TEXT,   allowNull: true },
    titulo_acciones_legendarias:   { type: DataTypes.STRING, defaultValue: 'Acciones legendarias' },
    descripcion_acciones_legendarias: { type: DataTypes.TEXT, allowNull: true },
    acciones_legendarias:          { type: DataTypes.TEXT,   allowNull: true },
    titulo_acciones_guarida:       { type: DataTypes.STRING, defaultValue: 'Acciones de guarida' },
    acciones_guarida:              { type: DataTypes.TEXT,   allowNull: true },
    titulo_notas:                  { type: DataTypes.STRING, defaultValue: 'Notas del DM' },
    notas:                         { type: DataTypes.TEXT,   allowNull: true },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Npc',
    tableName: 'npcs',
    indexes: [],
    timestamps: true,
  }
);

module.exports = Npc;
