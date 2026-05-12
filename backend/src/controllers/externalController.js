const { Op } = require('sequelize');
const Npc = require('../models/npc');
const MonstruoCache = require('../models/monstruoCache');
const { traducirEntradas, traducirTexto } = require('../utils/deepl');

const DND5E_API = 'https://www.dnd5eapi.co/api/2014';
const TTL_MS = 60 * 60 * 1000; // 1 hora
const cache = new Map(); // key -> { data, expiresAt }

async function fetchDnd5e(path) {
  const cached = cache.get(path);
  if (cached && Date.now() < cached.expiresAt) return cached.data;

  const res = await fetch(`${DND5E_API}${path}`);
  if (!res.ok) throw new Error(`Error al llamar a D&D 5e API: ${res.status} ${res.statusText}`);
  const data = await res.json();
  cache.set(path, { data, expiresAt: Date.now() + TTL_MS });
  return data;
}

// Obtiene todos los monstruos y los cachea (solo 334, cabe en memoria)
async function obtenerTodosLosMonstruos() {
  const data = await fetchDnd5e('/monsters');
  return data.results ?? [];
}

function formatearVelocidad(speed) {
  if (!speed || typeof speed !== 'object') return String(speed || '');
  return Object.entries(speed)
    .filter(([k, v]) => k !== 'hover' && v)
    .map(([k, v]) => `${k} ${v}`)
    .join(', ');
}

function formatearCA(ac) {
  if (typeof ac === 'number') return ac;
  if (Array.isArray(ac) && ac.length > 0) return ac[0].value ?? ac[0];
  return ac;
}

function formatearSentidos(senses) {
  if (!senses || typeof senses !== 'object') return String(senses || '');
  return Object.entries(senses)
    .map(([k, v]) => `${k.replace(/_/g, ' ')} ${v}`)
    .join(', ');
}

function formatearEntradas(lista) {
  if (!Array.isArray(lista) || lista.length === 0) return null;
  return JSON.stringify(lista.map(({ name, desc }) => ({ nombre: name, descripcion: desc })));
}

function formatearLista(valor) {
  if (!valor) return null;
  if (typeof valor === 'string') return valor || null;
  if (Array.isArray(valor)) {
    const items = valor.map((v) => (typeof v === 'string' ? v : v.name ?? '')).filter(Boolean);
    return items.length ? items.join(', ') : null;
  }
  return null;
}

function formatearSave(val) {
  if (val == null) return null;
  const n = Number(val);
  if (isNaN(n)) return null;
  return n >= 0 ? `+${n}` : `${n}`;
}

function extraerSaves(proficiencies) {
  const saves = {};
  for (const p of (proficiencies || [])) {
    const idx = p.proficiency?.index ?? '';
    if (idx.startsWith('saving-throw-')) {
      const stat = idx.replace('saving-throw-', ''); // str, dex, con, int, wis, cha
      saves[stat] = p.value;
    }
  }
  return saves;
}

function formatearSkills(proficiencies) {
  const skills = (proficiencies || []).filter((p) => {
    const idx = p.proficiency?.index ?? '';
    return idx.startsWith('skill-');
  });
  if (!skills.length) return null;
  return skills
    .map((p) => {
      const name = p.proficiency.name.replace('Skill: ', '');
      return `${name} ${p.value >= 0 ? '+' : ''}${p.value}`;
    })
    .join(', ');
}

const TIPO_EN_ES = {
  aberration:   'Aberración',
  beast:        'Bestia',
  celestial:    'Celestial',
  construct:    'Constructo',
  dragon:       'Dragón',
  elemental:    'Elemental',
  fey:          'Hada',
  fiend:        'Infernal',
  giant:        'Gigante',
  humanoid:     'Humanoide',
  monstrosity:  'Monstruosidad',
  ooze:         'Cieno',
  plant:        'Planta',
  undead:       'No-muerto',
};

function mapearTipo(type) {
  if (!type) return null;
  const clave = String(type).toLowerCase().trim();
  return TIPO_EN_ES[clave] ?? type;
}

function normalizarCR(cr) {
  if (cr == null) return null;
  // La API devuelve fracciones como 0.125, 0.25, 0.5
  if (cr === 0.125) return '1/8';
  if (cr === 0.25)  return '1/4';
  if (cr === 0.5)   return '1/2';
  return String(Math.round(cr));
}

function mapearMonstruo(raw) {
  const cr = raw.challenge_rating ?? null;
  const valorDesafio = normalizarCR(cr);

  const saves = extraerSaves(raw.proficiencies);

  return {
    nombre:               raw.name,
    tamano:               raw.size ?? null,
    tipo:                 mapearTipo(raw.type),
    alineamiento:         raw.alignment ?? null,
    clase_armadura:       formatearCA(raw.armor_class),
    puntos_de_golpe:      raw.hit_points,
    velocidad:            formatearVelocidad(raw.speed),
    fuerza:               raw.strength,
    destreza:             raw.dexterity,
    constitucion:         raw.constitution,
    inteligencia:         raw.intelligence,
    sabiduria:            raw.wisdom,
    carisma:              raw.charisma,
    iniciativa:           null,
    sal_fuerza:           formatearSave(saves.str),
    sal_destreza:         formatearSave(saves.dex),
    sal_constitucion:     formatearSave(saves.con),
    sal_inteligencia:     formatearSave(saves.int),
    sal_sabiduria:        formatearSave(saves.wis),
    sal_carisma:          formatearSave(saves.cha),
    habilidades:          formatearSkills(raw.proficiencies),
    resistencias_dano:    formatearLista(raw.damage_resistances),
    inmunidades_dano:     formatearLista(raw.damage_immunities),
    vulnerabilidades_dano:formatearLista(raw.damage_vulnerabilities),
    inmunidades_condicion:formatearLista(raw.condition_immunities),
    sentidos:             formatearSentidos(raw.senses),
    idiomas:              raw.languages ?? null,
    valor_desafio:        valorDesafio,
    habilidades_especiales:           formatearEntradas(raw.special_abilities),
    acciones:                         formatearEntradas(raw.actions),
    acciones_adicionales:             formatearEntradas(raw.bonus_actions),
    reacciones:                       formatearEntradas(raw.reactions),
    descripcion_acciones_legendarias: raw.legendary_desc ?? null,
    acciones_legendarias:             formatearEntradas(raw.legendary_actions),
    acciones_guarida:                 null,
    dados_pg: raw.hit_dice ?? null,
    cr,
    xp: raw.xp ?? null,
  };
}

// GET /api/external/monstruos?buscar=X&pagina=1&limite=20
const listarMonstruos = async (req, res) => {
  try {
    const buscar = (req.query.buscar ?? '').trim().toLowerCase();
    const limite = Math.min(Math.max(parseInt(req.query.limite, 10) || 20, 1), 100);
    const pagina = Math.max(parseInt(req.query.pagina, 10) || 1, 1);

    const todos = await obtenerTodosLosMonstruos();

    const filtrados = buscar
      ? todos.filter((m) => m.name.toLowerCase().includes(buscar))
      : todos;

    const total = filtrados.length;
    const offset = (pagina - 1) * limite;
    const resultados = filtrados.slice(offset, offset + limite).map(({ index, name }) => ({ slug: index, name }));
    const hayMas = offset + limite < total;

    res.json({ resultados, total, hayMas, pagina, limite });
  } catch (error) {
    console.error('[listarMonstruos]', error);
    res.status(502).json({ message: 'Error al obtener datos de la API externa.' });
  }
};

// GET /api/external/monstruos/:slug
const obtenerMonstruo = async (req, res) => {
  try {
    const raw = await fetchDnd5e(`/monsters/${req.params.slug}`);
    res.json(mapearMonstruo(raw));
  } catch (error) {
    console.error('[obtenerMonstruo]', error);
    res.status(502).json({ message: 'Error al obtener datos de la API externa.' });
  }
};

// POST /api/external/monstruos/:slug/importar
const importarMonstruo = async (req, res) => {
  try {
    const raw = await fetchDnd5e(`/monsters/${req.params.slug}`);
    const mapeado = mapearMonstruo(raw);

    console.log('[importarMonstruo] Monstruo mapeado, iniciando traducción DeepL para:', mapeado.nombre);
    // Traducir textos libres con DeepL (fallo silencioso: se guarda en inglés si la API no responde)
    const [
      nombre,
      habilidades_especiales,
      acciones,
      acciones_legendarias,
      reacciones,
    ] = await Promise.all([
      traducirTexto(mapeado.nombre).catch(() => mapeado.nombre),
      traducirEntradas(mapeado.habilidades_especiales).catch(() => mapeado.habilidades_especiales),
      traducirEntradas(mapeado.acciones).catch(() => mapeado.acciones),
      traducirEntradas(mapeado.acciones_legendarias).catch(() => mapeado.acciones_legendarias),
      traducirEntradas(mapeado.reacciones).catch(() => mapeado.reacciones),
    ]);

    const { dados_pg, cr, xp, ...datosDB } = {
      ...mapeado,
      nombre,
      habilidades_especiales,
      acciones,
      acciones_legendarias,
      reacciones,
    };

    console.log('[importarMonstruo] Traducción completada, guardando en BD...');
    const npc = await Npc.create({ ...datosDB, usuario_id: req.usuario?.id ?? null });
    res.status(201).json(npc);
  } catch (error) {
    console.error('[importarMonstruo] Error:', error.message);
    if (error.errors) {
      error.errors.forEach((e) =>
        console.error(`  • Campo "${e.path}": ${e.message} (valor: ${e.value})`)
      );
    }
    if (error.name?.startsWith('Sequelize')) return res.status(400).json({ message: 'Los datos proporcionados no son válidos.' });
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// GET /api/external/monstruos/buscar-cache?q=texto
const buscarCache = async (req, res) => {
  try {
    const q = (req.query.q ?? '').trim();
    const donde = q
      ? { [Op.or]: [{ nombre_es: { [Op.like]: `%${q}%` } }, { nombre_en: { [Op.like]: `%${q}%` } }] }
      : {};

    const resultados = await MonstruoCache.findAll({
      where: donde,
      attributes: ['index', 'nombre_en', 'nombre_es'],
      order: [['nombre_es', 'ASC']],
      limit: q ? 50 : 400,
    });

    res.json(resultados);
  } catch (error) {
    console.error('[buscarCache] Error:', error.message);
    if (error.name?.startsWith('Sequelize')) return res.status(400).json({ message: 'Los datos proporcionados no son válidos.' });
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

module.exports = { listarMonstruos, obtenerMonstruo, importarMonstruo, buscarCache };
