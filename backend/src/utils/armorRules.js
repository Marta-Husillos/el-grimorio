// Esta tabla DEBE mantenerse sincronizada con la del frontend en NpcForm.jsx
// (constante TIPOS_ARMADURA). Si añades, modificas o eliminas un tipo de
// armadura, actualiza ambos archivos.
const TIPOS_ARMADURA = [
  { key: 'sin_armadura',    calcCA: (des) => 10 + des },
  { key: 'cuero',           calcCA: (des) => 11 + des },
  { key: 'cuero_tachonado', calcCA: (des) => 12 + des },
  { key: 'camisote',        calcCA: (des) => 13 + Math.min(des, 2) },
  { key: 'coraza',          calcCA: (des) => 14 + Math.min(des, 2) },
  { key: 'cota_mallas',     calcCA: () => 16 },
  { key: 'armadura_placas', calcCA: () => 18 },
  { key: 'natural',         calcCA: null },
  { key: 'otro',            calcCA: null },
];

function modNum(stat) {
  return Math.floor((Number(stat || 10) - 10) / 2);
}

// Devuelve el AC calculado para el tipo+DEX dados, o null si el tipo
// implica AC manual (natural / otro / valores libres tipo "Otro: ...").
function calcularCA(tipoArmadura, destreza) {
  if (!tipoArmadura) return null;
  if (typeof tipoArmadura === 'string' && tipoArmadura.startsWith('Otro')) return null;
  const tipo = TIPOS_ARMADURA.find((t) => t.key === tipoArmadura);
  if (!tipo || tipo.calcCA === null) return null;
  return tipo.calcCA(modNum(destreza));
}

module.exports = { TIPOS_ARMADURA, calcularCA };
