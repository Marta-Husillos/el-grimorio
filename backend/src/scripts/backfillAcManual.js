const Npc = require('../models/npc');
const { calcularCA } = require('../utils/armorRules');

// Idempotente: solo procesa NPCs con clase_armadura_manual = false.
// Tras la primera ejecución, las llamadas posteriores únicamente afectarán
// a registros nuevos creados con el flag a false que tengan un AC que diverja
// del valor calculado (es decir, overrides realizados sin pasar por la UI).
async function backfillAcManual() {
  const npcs = await Npc.findAll({ where: { clase_armadura_manual: false } });
  let marcadosManual = 0;
  let yaCorrectos = 0;

  for (const npc of npcs) {
    const acEsperado = calcularCA(npc.tipo_armadura, npc.destreza);

    if (acEsperado === null) {
      // 'natural', 'otro' o 'Otro: ...' → siempre manual
      await npc.update({ clase_armadura_manual: true });
      marcadosManual++;
    } else if (acEsperado === npc.clase_armadura) {
      // Coincide con el cálculo: no hace falta tocar nada
      yaCorrectos++;
    } else {
      // Diverge → override manual
      await npc.update({ clase_armadura_manual: true });
      marcadosManual++;
    }
  }

  console.log(
    `Backfill de clase_armadura_manual completado: ${marcadosManual} NPCs marcados como manuales, ${yaCorrectos} NPCs ya tenían AC calculado correcto.`
  );
}

module.exports = backfillAcManual;
