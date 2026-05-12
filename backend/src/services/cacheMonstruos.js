const MonstruoCache = require('../models/monstruoCache');
const { traducirLote } = require('../utils/deepl');

const DND5E_API = 'https://www.dnd5eapi.co/api/2014';
const TOTAL_ESPERADO = 334;
const BLOQUE = 50;

async function inicializarCache() {
  const count = await MonstruoCache.count();
  if (count >= TOTAL_ESPERADO) {
    console.log(`[Cache] Ya inicializada (${count} monstruos).`);
    return;
  }

  console.log('[Cache] Descargando lista completa de monstruos...');
  const res = await fetch(`${DND5E_API}/monsters`);
  if (!res.ok) throw new Error(`Error al descargar lista: ${res.status}`);
  const { results } = await res.json();

  // Solo procesar los que aún no están en caché
  const enCache = await MonstruoCache.findAll({ attributes: ['index'] });
  const indexesEnCache = new Set(enCache.map((m) => m.index));
  const pendientes = results.filter((m) => !indexesEnCache.has(m.index));

  if (!pendientes.length) {
    console.log('[Cache] No hay pendientes de traducir.');
    return;
  }

  const bloques = [];
  for (let i = 0; i < pendientes.length; i += BLOQUE) {
    bloques.push(pendientes.slice(i, i + BLOQUE));
  }

  console.log(`[Cache] ${pendientes.length} nombres pendientes → ${bloques.length} bloques de ${BLOQUE}`);

  for (let i = 0; i < bloques.length; i++) {
    console.log(`[Cache] Traduciendo bloque ${i + 1}/${bloques.length}...`);
    const bloque = bloques[i];
    const nombresEN = bloque.map((m) => m.name);
    const nombresES = await traducirLote(nombresEN);

    const registros = bloque.map((m, j) => ({
      index: m.index,
      nombre_en: m.name,
      nombre_es: nombresES[j] || m.name,
    }));

    await MonstruoCache.bulkCreate(registros, { ignoreDuplicates: true });
  }

  const total = await MonstruoCache.count();
  console.log(`[Cache] Completada — ${total} monstruos en caché.`);
}

module.exports = { inicializarCache };
