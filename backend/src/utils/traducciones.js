const TAMANO = {
  Tiny:        'Diminuto',
  Small:       'Pequeño',
  Medium:      'Mediano',
  Large:       'Grande',
  Huge:        'Enorme',
  Gargantuan:  'Gargantuesco',
};

const TIPO = {
  aberration:  'Aberración',
  beast:       'Bestia',
  celestial:   'Celestial',
  construct:   'Constructo',
  dragon:      'Dragón',
  elemental:   'Elemental',
  fey:         'Hada',
  fiend:       'Infernal',
  giant:       'Gigante',
  humanoid:    'Humanoide',
  monstrosity: 'Monstruosidad',
  ooze:        'Cieno',
  plant:       'Planta',
  undead:      'No-muerto',
};

const ALINEAMIENTO = {
  'lawful good':              'legal bueno',
  'neutral good':             'neutral bueno',
  'chaotic good':             'caótico bueno',
  'lawful neutral':           'legal neutral',
  'true neutral':             'neutral verdadero',
  'chaotic neutral':          'caótico neutral',
  'lawful evil':              'legal malvado',
  'neutral evil':             'neutral malvado',
  'chaotic evil':             'caótico malvado',
  'any alignment':            'cualquier alineamiento',
  'any non-good alignment':   'cualquier alineamiento no bueno',
  'any non-lawful alignment': 'cualquier alineamiento no legal',
  'any chaotic alignment':    'cualquier alineamiento caótico',
  'any evil alignment':       'cualquier alineamiento malvado',
  unaligned:                  'sin alineamiento',
  neutral:                    'neutral',
};

// Palabras/frases dentro de cadenas de velocidad: "walk 30 ft., fly 60 ft."
const VELOCIDAD_PALABRAS = {
  'passive perception': 'percepción pasiva', // evitar colisión con sentidos
  walk:    'caminar',
  fly:     'volar',
  swim:    'nadar',
  burrow:  'excavar',
  climb:   'escalar',
  'ft.':   'pies',
};

// Palabras/frases dentro de cadenas de sentidos: "darkvision 60 ft., passive perception 10"
const SENTIDOS_PALABRAS = {
  'passive perception': 'percepción pasiva',
  darkvision:  'visión en la oscuridad',
  blindsight:  'sentido ciego',
  tremorsense: 'sentido sísmico',
  truesight:   'visión verdadera',
  'ft.':       'pies',
};

// Palabras dentro de listas de daño: "fire, poison, bludgeoning, piercing, and slashing from nonmagical weapons"
const DANO_PALABRAS = {
  'nonmagical': 'no mágico',
  acid:         'ácido',
  bludgeoning:  'contundente',
  cold:         'frío',
  fire:         'fuego',
  force:        'fuerza',
  lightning:    'relámpago',
  necrotic:     'necrótico',
  piercing:     'perforante',
  poison:       'veneno',
  psychic:      'psíquico',
  radiant:      'radiante',
  slashing:     'cortante',
  thunder:      'trueno',
  magical:      'mágico',
  silvered:     'plateado',
  adamantine:   'adamantino',
  weapons:      'armas',
  attacks:      'ataques',
  from:         'de',
  and:          'y',
};

// Condiciones: "Exhaustion, Grappled, Paralyzed, Petrified"
const CONDICION_PALABRAS = {
  Blinded:       'Cegado',
  Charmed:       'Encantado',
  Deafened:      'Ensordecido',
  Exhaustion:    'Agotamiento',
  Frightened:    'Asustado',
  Grappled:      'Agarrado',
  Incapacitated: 'Incapacitado',
  Invisible:     'Invisible',
  Paralyzed:     'Paralizado',
  Petrified:     'Petrificado',
  Poisoned:      'Envenenado',
  Prone:         'Derribado',
  Restrained:    'Restringido',
  Stunned:       'Aturdido',
  Unconscious:   'Inconsciente',
};

// Idiomas: "Common, Goblin" → "Común, Góblico"
const IDIOMAS_PALABRAS = {
  'Deep Speech':       'Habla Profunda',
  'but can\'t speak':  'pero no puede hablar',
  Undercommon:  'Infracomún',
  Primordial:   'Primordial',
  Telepathy:    'Telepatía',
  understands:  'entiende',
  Celestial:    'Celestial',
  Draconic:     'Dracónico',
  Halfling:     'Mediando',
  Gnomish:      'Gnómico',
  Infernal:     'Infernal',
  Dwarvish:     'Enano',
  Elvish:       'Élfico',
  Goblin:       'Góblico',
  Sylvan:       'Silvano',
  Abyssal:      'Abisal',
  Auran:        'Auran',
  Aquan:        'Aquan',
  Common:       'Común',
  Ignan:        'Ignan',
  Terran:       'Terran',
  Giant:        'Gigante',
  Orc:          'Orco',
  any:          'cualquier',
  all:          'todos',
};

const NOMBRES_ACCIONES = {
  // Frases largas primero para evitar solapamientos en lookups futuros
  'Keen Hearing and Smell':    'Olfato y oído agudos',
  'Sunlight Hypersensitivity': 'Hipersensibilidad a la luz solar',
  'Innate Spellcasting':       'Lanzamiento innato de conjuros',
  'Trampling Charge':          'Carga arrolladora',
  'Frightful Presence':        'Presencia aterradora',
  'Legendary Resistance':      'Resistencia legendaria',
  'Wing Attack':               'Ataque de ala',
  'False Appearance':          'Apariencia falsa',
  'Immutable Form':            'Forma inmutable',
  'Magic Resistance':          'Resistencia a la magia',
  'Magic Weapons':             'Armas mágicas',
  'Spellcasting':              'Lanzamiento de conjuros',
  'Pack Tactics':              'Tácticas de manada',
  'Standing Leap':             'Salto en pie',
  'Spider Climb':              'Trepar por superficies',
  'Web Walker':                'Caminante de telarañas',
  'Hold Breath':               'Contener la respiración',
  'Blood Frenzy':              'Frenesí sanguinario',
  'Death Burst':               'Explosión de muerte',
  'Change Shape':              'Cambiar de forma',
  'Undead Fortitude':          'Fortaleza no-muerta',
  'Sunlight Sensitivity':      'Sensibilidad a la luz solar',
  'Sure-Footed':               'Paso firme',
  "Devil's Sight":             'Vista del diablo',
  'Air Form':                  'Forma de aire',
  'Water Form':                'Forma de agua',
  'Fire Form':                 'Forma de fuego',
  'Earth Form':                'Forma de tierra',
  'Keen Sight':                'Vista aguda',
  'Keen Smell':                'Olfato agudo',
  'Keen Hearing':              'Oído agudo',
  'Multiattack':               'Multigataque',
  'Shapechanger':              'Cambiaformas',
  'Regeneration':              'Regeneración',
  'Invisibility':              'Invisibilidad',
  'Constrict':                 'Constricción',
  'Amorphous':                 'Amorfo',
  'Amphibious':                'Anfibio',
  'Aggressive':                'Agresivo',
  'Reckless':                  'Temerario',
  'Rampage':                   'Arremeter',
  'Teleport':                  'Teletransportarse',
  'Engulf':                    'Envolver',
  'Swallow':                   'Tragar',
  'Flyby':                     'Vuelo rasante',
  'Charge':                    'Carga',
  'Parry':                     'Parada',
  'Tentacle':                  'Tentáculo',
  'Slam':                      'Golpe',
  'Bite':                      'Mordisco',
  'Claw':                      'Zarpazo',
  'Tail':                      'Cola',
};

function traducirNombreAccion(nombre) {
  if (!nombre) return nombre;
  return NOMBRES_ACCIONES[nombre] ?? nombre;
}

// Parsea un campo JSON de entradas [{nombre, descripcion}], traduce los nombres
// y devuelve el mismo tipo que recibió (string → string, array → array).
function traducirEntradas(valor) {
  if (!valor) return valor;
  const esString = typeof valor === 'string';
  let lista;
  if (esString) {
    try { lista = JSON.parse(valor); } catch { return valor; }
  } else {
    lista = valor;
  }
  if (!Array.isArray(lista)) return valor;
  const traducida = lista.map((item) =>
    item && typeof item === 'object'
      ? { ...item, nombre: traducirNombreAccion(item.nombre) }
      : item
  );
  return esString ? JSON.stringify(traducida) : traducida;
}

// Reemplaza frases del diccionario en el texto, priorizando las más largas
// para evitar solapamientos (ej: "passive perception" antes de "perception").
function traducirPorPalabras(texto, diccionario) {
  if (!texto || typeof texto !== 'string') return texto;
  let resultado = texto;
  const entradas = Object.entries(diccionario).sort((a, b) => b[0].length - a[0].length);
  for (const [en, es] of entradas) {
    const patron = new RegExp(`\\b${en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    resultado = resultado.replace(patron, es);
  }
  return resultado;
}

function traducirTamano(tamano) {
  if (!tamano) return tamano;
  return TAMANO[tamano] ?? tamano;
}

function traducirTipo(tipo) {
  if (!tipo) return tipo;
  return TIPO[tipo.toLowerCase()] ?? tipo;
}

function traducirAlineamiento(alineamiento) {
  if (!alineamiento) return alineamiento;
  return ALINEAMIENTO[alineamiento.toLowerCase()] ?? alineamiento;
}

function traducirVelocidad(velocidad) {
  return traducirPorPalabras(velocidad, VELOCIDAD_PALABRAS);
}

function traducirSentidos(sentidos) {
  return traducirPorPalabras(sentidos, SENTIDOS_PALABRAS);
}

function traducirListaDano(lista) {
  if (Array.isArray(lista)) return lista.map((item) => traducirPorPalabras(item, DANO_PALABRAS));
  return traducirPorPalabras(lista, DANO_PALABRAS);
}

function traducirCondiciones(condiciones) {
  if (Array.isArray(condiciones)) return condiciones.map((item) => traducirPorPalabras(item, CONDICION_PALABRAS));
  return traducirPorPalabras(condiciones, CONDICION_PALABRAS);
}

function traducirIdiomas(idiomas) {
  return traducirPorPalabras(idiomas, IDIOMAS_PALABRAS);
}

// Aplica todas las traducciones a un objeto NPC (instancia Sequelize o POJO)
function traducirNpc(npc) {
  const datos = npc.toJSON ? npc.toJSON() : { ...npc };
  return {
    ...datos,
    tamano:               traducirTamano(datos.tamano),
    tipo:                 traducirTipo(datos.tipo),
    alineamiento:         traducirAlineamiento(datos.alineamiento),
    velocidad:            traducirVelocidad(datos.velocidad),
    sentidos:             traducirSentidos(datos.sentidos),
    inmunidades_dano:        traducirListaDano(datos.inmunidades_dano),
    resistencias_dano:       traducirListaDano(datos.resistencias_dano),
    inmunidades_condicion:   traducirCondiciones(datos.inmunidades_condicion),
    idiomas:                 traducirIdiomas(datos.idiomas),
    habilidades_especiales:  traducirEntradas(datos.habilidades_especiales),
    acciones:                traducirEntradas(datos.acciones),
  };
}

module.exports = { traducirNpc };
