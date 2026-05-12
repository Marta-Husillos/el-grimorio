const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL conectado correctamente.');

    // Migración de roles: ampliar ENUM antes de renombrar valores,
    // para que MySQL no rechace los datos existentes durante el alter.
    try {
      await sequelize.query(
        "ALTER TABLE grupo_usuarios MODIFY COLUMN rol ENUM('propietaria','editor','espectador','admin','miembro') DEFAULT 'espectador'"
      );
      await sequelize.query("UPDATE grupo_usuarios SET rol = 'propietaria' WHERE rol = 'admin'");
      await sequelize.query("UPDATE grupo_usuarios SET rol = 'editor' WHERE rol = 'miembro'");
      console.log('Migración de roles completada.');
    } catch (_) {
      // La tabla aún no existe o ya está migrada; se ignora.
    }

    // Migración: convertir campos de texto a JSON array antes de que alter cambie el tipo
    try {
      const arrFields = ['resistencias_dano', 'inmunidades_dano', 'vulnerabilidades_dano', 'inmunidades_condicion'];
      const [rows] = await sequelize.query(
        `SELECT id, ${arrFields.map((f) => `\`${f}\``).join(', ')} FROM npcs`
      );
      for (const row of rows) {
        const sets = []; const vals = [];
        for (const field of arrFields) {
          const v = row[field];
          if (typeof v !== 'string') continue;
          try { JSON.parse(v); } catch {
            sets.push(`\`${field}\` = ?`);
            vals.push(JSON.stringify(v.split(',').map((s) => s.trim()).filter(Boolean)));
          }
        }
        if (sets.length) await sequelize.query(
          `UPDATE npcs SET ${sets.join(', ')} WHERE id = ?`,
          { replacements: [...vals, row.id] }
        );
      }
      console.log('Migración de arrays completada.');
    } catch (_) { /* tabla aún no existe */ }

    // Migración: consolidar sal_* y prof_sal_* → salvaciones JSON
    try {
      const salFields = ['fuerza','destreza','constitucion','inteligencia','sabiduria','carisma'];
      const cols = await sequelize.query("SHOW COLUMNS FROM npcs", { type: sequelize.QueryTypes.SELECT });
      const colNames = cols.map(c => c.Field);
      const hasOldSal = salFields.some(f => colNames.includes(`sal_${f}`));
      if (hasOldSal) {
        const [rows] = await sequelize.query(
          `SELECT id, sal_fuerza, sal_destreza, sal_constitucion, sal_inteligencia, sal_sabiduria, sal_carisma,
                  prof_sal_fuerza, prof_sal_destreza, prof_sal_constitucion, prof_sal_inteligencia, prof_sal_sabiduria, prof_sal_carisma
           FROM npcs`
        );
        for (const row of rows) {
          const sal = {
            fue: row.sal_fuerza || null, des: row.sal_destreza || null,
            con: row.sal_constitucion || null, int: row.sal_inteligencia || null,
            sab: row.sal_sabiduria || null, car: row.sal_carisma || null,
            prof_fue: !!row.prof_sal_fuerza, prof_des: !!row.prof_sal_destreza,
            prof_con: !!row.prof_sal_constitucion, prof_int: !!row.prof_sal_inteligencia,
            prof_sab: !!row.prof_sal_sabiduria, prof_car: !!row.prof_sal_carisma,
          };
          await sequelize.query(
            `UPDATE npcs SET salvaciones = ? WHERE id = ?`,
            { replacements: [JSON.stringify(sal), row.id] }
          );
        }
        console.log('Migración sal_* → salvaciones completada.');
      }
    } catch (_) { /* tabla o columnas aún no existen */ }

    // Limpiar índices acumulados en todas las tablas antes de sync para evitar el límite de 64 de MySQL
    try {
      const dbName = sequelize.config.database;
      const [indices] = await sequelize.query(
        `SELECT TABLE_NAME, INDEX_NAME FROM information_schema.STATISTICS
         WHERE TABLE_SCHEMA = ? AND INDEX_NAME != 'PRIMARY'
         GROUP BY TABLE_NAME, INDEX_NAME`,
        { replacements: [dbName] }
      );
      for (const idx of indices) {
        await sequelize.query(`ALTER TABLE \`${idx.TABLE_NAME}\` DROP INDEX \`${idx.INDEX_NAME}\``);
      }
      if (indices.length) console.log(`Limpiados ${indices.length} índices de todas las tablas.`);
    } catch (_) { /* tablas aún no existen */ }

    await sequelize.sync({ alter: true });
    console.log('Tablas sincronizadas.');
  } catch (error) {
    console.error(`Error al conectar a MySQL: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
