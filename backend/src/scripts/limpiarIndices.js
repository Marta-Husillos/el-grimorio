// Ejecutar UNA VEZ antes de arrancar Docker para limpiar índices acumulados:
//   node backend/src/scripts/limpiarIndices.js
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const { sequelize } = require('../config/db');

async function limpiarIndices() {
  try {
    await sequelize.authenticate();
    console.log('Conexión establecida.');

    const dbName = sequelize.config.database;
    const [indices] = await sequelize.query(
      `SELECT INDEX_NAME FROM information_schema.STATISTICS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'npcs' AND INDEX_NAME != 'PRIMARY'
       GROUP BY INDEX_NAME`,
      { replacements: [dbName] }
    );

    console.log(`Encontrados ${indices.length} índice(s) a eliminar`);

    for (const idx of indices) {
      await sequelize.query(`ALTER TABLE npcs DROP INDEX \`${idx.INDEX_NAME}\``);
      console.log(`  Eliminado: ${idx.INDEX_NAME}`);
    }

    console.log('Índices limpiados correctamente.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

limpiarIndices();
