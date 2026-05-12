const deepl = require('deepl-node');

let translator = null;

function getTranslator() {
  if (!translator) {
    const key = process.env.DEEPL_API_KEY;
    console.log('[DeepL] API key cargada:', key ? `${key.slice(0, 8)}...` : 'NO ENCONTRADA');
    if (!key) throw new Error('DEEPL_API_KEY no configurada en variables de entorno');
    translator = new deepl.Translator(key);
  }
  return translator;
}

// Traduce un array de strings en una sola llamada a la API
async function traducirLote(textos) {
  const vacios = textos.map((t) => !t || !t.trim());
  const aTraducir = textos.filter((_, i) => !vacios[i]);
  if (!aTraducir.length) return textos;

  console.log('[DeepL] Traduciendo:', aTraducir);
  const results = await getTranslator().translateText(aTraducir, 'en', 'es');
  const traducidos = results.map((r) => r.text);
  console.log('[DeepL] Resultado:', traducidos);

  let idx = 0;
  return textos.map((original, i) => (vacios[i] ? original : traducidos[idx++]));
}

// Recibe un JSON string de [{nombre, descripcion, ...}],
// traduce nombre y descripcion de cada entrada y devuelve el JSON string actualizado.
// Si DeepL falla, devuelve el valor original sin modificar.
async function traducirEntradas(jsonString) {
  if (!jsonString) return jsonString;
  let lista;
  try { lista = JSON.parse(jsonString); } catch { return jsonString; }
  if (!Array.isArray(lista) || lista.length === 0) return jsonString;

  console.log('[DeepL] traducirEntradas — entradas recibidas:', lista.length);

  const nombres = lista.map((item) => item.nombre ?? '');
  const descs   = lista.map((item) => item.descripcion ?? '');

  const [nombresES, descsES] = await Promise.all([
    traducirLote(nombres),
    traducirLote(descs),
  ]);

  const traducida = lista.map((item, i) => ({
    ...item,
    nombre:      nombresES[i] || item.nombre,
    descripcion: descsES[i]   || item.descripcion,
  }));

  return JSON.stringify(traducida);
}

async function traducirTexto(texto) {
  if (!texto || typeof texto !== 'string') return texto;
  console.log('[DeepL] Traduciendo:', texto);
  const [resultado] = await traducirLote([texto]);
  console.log('[DeepL] Resultado:', resultado);
  return resultado || texto;
}

module.exports = { traducirEntradas, traducirTexto, traducirLote };
