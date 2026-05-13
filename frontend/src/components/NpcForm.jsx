// NpcForm v2.1 – Multiataque rediseñado
import { useEffect, useImperativeHandle, useRef, useState, forwardRef } from 'react';
import StatBlock from './StatBlock';

// ── Constantes D&D 5e ──────────────────────────────────────────────────────────

const ALINEAMIENTOS = [
  'Legal Bueno', 'Neutral Bueno', 'Caótico Bueno',
  'Legal Neutral', 'Neutral', 'Caótico Neutral',
  'Legal Malvado', 'Neutral Malvado', 'Caótico Malvado',
];
const TAMANOS = ['Diminuto', 'Pequeño', 'Mediano', 'Grande', 'Enorme', 'Gargantuesco'];

const DADO_POR_TAMANO = {
  'Diminuto':     { dado: 4,  media: 2.5 },
  'Pequeño':      { dado: 6,  media: 3.5 },
  'Mediano':      { dado: 8,  media: 4.5 },
  'Grande':       { dado: 10, media: 5.5 },
  'Enorme':       { dado: 12, media: 6.5 },
  'Gargantuesco': { dado: 20, media: 10.5 },
};

const TIPOS_CRIATURA = [
  'Aberración', 'Bestia', 'Celestial', 'Constructo', 'Dragón',
  'Elemental', 'Hada', 'Infernal', 'Gigante', 'Humanoide',
  'Monstruosidad', 'Cieno', 'Planta', 'No-muerto',
];

const TIPOS_ARMADURA = [
  { key: 'sin_armadura',    label: 'Sin armadura',           calcCA: (des) => 10 + des },
  { key: 'cuero',           label: 'Cuero',                  calcCA: (des) => 11 + des },
  { key: 'cuero_tachonado', label: 'Cuero tachonado',        calcCA: (des) => 12 + des },
  { key: 'camisote',        label: 'Camisote de mallas',     calcCA: (des) => 13 + Math.min(des, 2) },
  { key: 'coraza',          label: 'Coraza',                 calcCA: (des) => 14 + Math.min(des, 2) },
  { key: 'cota_mallas',     label: 'Cota de mallas',         calcCA: () => 16 },
  { key: 'armadura_placas', label: 'Armadura de placas',     calcCA: () => 18 },
  { key: 'natural',         label: 'Armadura natural',       calcCA: null }, // valor manual
  { key: 'otro',            label: 'Otro',                   calcCA: null }, // descripción libre
];

const NOMBRE_ARMADURA = Object.fromEntries(TIPOS_ARMADURA.map((t) => [t.key, t.label]));

const STATS = [
  { key: 'fuerza',       label: 'FUE', full: 'Fuerza',       salvKey: 'fue', profKey: 'prof_fue' },
  { key: 'destreza',     label: 'DES', full: 'Destreza',     salvKey: 'des', profKey: 'prof_des' },
  { key: 'constitucion', label: 'CON', full: 'Constitución', salvKey: 'con', profKey: 'prof_con' },
  { key: 'inteligencia', label: 'INT', full: 'Inteligencia', salvKey: 'int', profKey: 'prof_int' },
  { key: 'sabiduria',    label: 'SAB', full: 'Sabiduría',    salvKey: 'sab', profKey: 'prof_sab' },
  { key: 'carisma',      label: 'CAR', full: 'Carisma',      salvKey: 'car', profKey: 'prof_car' },
];

const DEFAULT_SALVACIONES = { fue: null, des: null, con: null, int: null, sab: null, car: null, prof_fue: false, prof_des: false, prof_con: false, prof_int: false, prof_sab: false, prof_car: false };

const HABILIDADES_D5E = [
  { key: 'atletismo',           label: 'Atletismo',           stat: 'fuerza' },
  { key: 'acrobacias',          label: 'Acrobacias',          stat: 'destreza' },
  { key: 'juego_de_manos',      label: 'Juego de manos',      stat: 'destreza' },
  { key: 'sigilo',              label: 'Sigilo',              stat: 'destreza' },
  { key: 'conocimiento_arcano', label: 'Conocimiento arcano', stat: 'inteligencia' },
  { key: 'historia',            label: 'Historia',            stat: 'inteligencia' },
  { key: 'investigacion',       label: 'Investigación',       stat: 'inteligencia' },
  { key: 'naturaleza',          label: 'Naturaleza',          stat: 'inteligencia' },
  { key: 'religion',            label: 'Religión',            stat: 'inteligencia' },
  { key: 'trato_animales',      label: 'Trato con animales',  stat: 'sabiduria' },
  { key: 'perspicacia',         label: 'Perspicacia',         stat: 'sabiduria' },
  { key: 'medicina',            label: 'Medicina',            stat: 'sabiduria' },
  { key: 'percepcion',          label: 'Percepción',          stat: 'sabiduria' },
  { key: 'supervivencia',       label: 'Supervivencia',       stat: 'sabiduria' },
  { key: 'engano',              label: 'Engaño',              stat: 'carisma' },
  { key: 'intimidacion',        label: 'Intimidación',        stat: 'carisma' },
  { key: 'interpretacion',      label: 'Interpretación',      stat: 'carisma' },
  { key: 'persuasion',          label: 'Persuasión',          stat: 'carisma' },
];

const TIPOS_DANO = [
  { key: 'ácido',       label: 'Ácido' },
  { key: 'contundente', label: 'Contundente' },
  { key: 'frío',        label: 'Frío' },
  { key: 'fuego',       label: 'Fuego' },
  { key: 'fuerza',      label: 'Fuerza' },
  { key: 'necrótico',   label: 'Necrótico' },
  { key: 'perforante',  label: 'Perforante' },
  { key: 'cortante',    label: 'Cortante' },
  { key: 'veneno',      label: 'Veneno' },
  { key: 'psíquico',    label: 'Psíquico' },
  { key: 'radiante',    label: 'Radiante' },
  { key: 'rayo',        label: 'Rayo' },
  { key: 'trueno',      label: 'Trueno' },
  { key: 'no_magico',   label: 'No mágico (cont., perf. y cort.)' },
  { key: 'magico',      label: 'Mágico (cont., perf. y cort.)' },
];
const CONDICIONES = [
  { key: 'cegado',       label: 'Cegado' },
  { key: 'encantado',    label: 'Encantado' },
  { key: 'ensordecido',  label: 'Ensordecido' },
  { key: 'asustado',     label: 'Asustado' },
  { key: 'aferrado',     label: 'Aferrado' },
  { key: 'incapacitado', label: 'Incapacitado' },
  { key: 'invisible',    label: 'Invisible' },
  { key: 'paralizado',   label: 'Paralizado' },
  { key: 'petrificado',  label: 'Petrificado' },
  { key: 'envenenado',   label: 'Envenenado' },
  { key: 'derribado',    label: 'Derribado' },
  { key: 'restringido',  label: 'Restringido' },
  { key: 'aturdido',     label: 'Aturdido' },
  { key: 'inconsciente', label: 'Inconsciente' },
  { key: 'agotamiento',  label: 'Agotamiento' },
];

// ── Helpers de cálculo ─────────────────────────────────────────────────────────

function parseArrField(val) {
  if (Array.isArray(val)) return val;
  if (!val) return [];
  try { const p = JSON.parse(val); return Array.isArray(p) ? p : []; }
  catch { return String(val).split(',').map((s) => s.trim()).filter(Boolean); }
}

function modNum(stat) { return Math.floor((Number(stat || 10) - 10) / 2); }
function fmtMod(n) { return n >= 0 ? `+${n}` : `${n}`; }

const VD_TABLE = [
  { key: '0',   numeric: 0,     xp: 10,     bc: 2 },
  { key: '1/8', numeric: 0.125, xp: 25,     bc: 2 },
  { key: '1/4', numeric: 0.25,  xp: 50,     bc: 2 },
  { key: '1/2', numeric: 0.5,   xp: 100,    bc: 2 },
  { key: '1',   numeric: 1,     xp: 200,    bc: 2 },
  { key: '2',   numeric: 2,     xp: 450,    bc: 2 },
  { key: '3',   numeric: 3,     xp: 700,    bc: 2 },
  { key: '4',   numeric: 4,     xp: 1100,   bc: 2 },
  { key: '5',   numeric: 5,     xp: 1800,   bc: 3 },
  { key: '6',   numeric: 6,     xp: 2300,   bc: 3 },
  { key: '7',   numeric: 7,     xp: 2900,   bc: 3 },
  { key: '8',   numeric: 8,     xp: 3900,   bc: 3 },
  { key: '9',   numeric: 9,     xp: 5000,   bc: 4 },
  { key: '10',  numeric: 10,    xp: 5900,   bc: 4 },
  { key: '11',  numeric: 11,    xp: 7200,   bc: 4 },
  { key: '12',  numeric: 12,    xp: 8400,   bc: 4 },
  { key: '13',  numeric: 13,    xp: 10000,  bc: 5 },
  { key: '14',  numeric: 14,    xp: 11500,  bc: 5 },
  { key: '15',  numeric: 15,    xp: 13000,  bc: 5 },
  { key: '16',  numeric: 16,    xp: 15000,  bc: 5 },
  { key: '17',  numeric: 17,    xp: 18000,  bc: 6 },
  { key: '18',  numeric: 18,    xp: 20000,  bc: 6 },
  { key: '19',  numeric: 19,    xp: 22000,  bc: 6 },
  { key: '20',  numeric: 20,    xp: 25000,  bc: 6 },
  { key: '21',  numeric: 21,    xp: 33000,  bc: 7 },
  { key: '22',  numeric: 22,    xp: 41000,  bc: 7 },
  { key: '23',  numeric: 23,    xp: 50000,  bc: 7 },
  { key: '24',  numeric: 24,    xp: 62000,  bc: 7 },
  { key: '25',  numeric: 25,    xp: 75000,  bc: 8 },
  { key: '26',  numeric: 26,    xp: 90000,  bc: 8 },
  { key: '27',  numeric: 27,    xp: 105000, bc: 8 },
  { key: '28',  numeric: 28,    xp: 120000, bc: 8 },
  { key: '29',  numeric: 29,    xp: 135000, bc: 9 },
  { key: '30',  numeric: 30,    xp: 155000, bc: 9 },
];

function getVDEntry(key) {
  return VD_TABLE.find((e) => e.key === String(key)) ?? VD_TABLE[0];
}

function calcBC(valorDesafio) {
  return getVDEntry(valorDesafio).bc;
}

function parseCompetencias(val) {
  if (!val) return {};
  if (typeof val === 'object' && !Array.isArray(val)) return val;
  try { return JSON.parse(val) || {}; } catch { return {}; }
}

function parseItems(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  const str = String(value).trim();
  if (!str || str === '[]') return [];
  if (str.startsWith('[')) { try { const p = JSON.parse(str); if (Array.isArray(p)) return p; } catch {} }
  return [{ nombre: '', descripcion: str }];
}

// ── Sugerencias Notas del DM ───────────────────────────────────────────────────

const SUGERENCIAS_NOTAS = [
  { emoji: '🎭', label: 'Motivación oculta' },
  { emoji: '⚔️', label: 'Traicionará si' },
  { emoji: '🤝', label: 'Aliado secreto de' },
  { emoji: '💀', label: 'Punto débil' },
  { emoji: '👁️', label: 'Sabe que los PJs' },
  { emoji: '💰', label: 'Recompensa oculta' },
  { emoji: '🔄', label: 'Cambia de bando si' },
  { emoji: '📜', label: 'Misión personal' },
];

// ── DEFAULT_FORM ───────────────────────────────────────────────────────────────

const DEFAULT_SENTIDOS = { oscuridad: null, ciego: null, verdadero: null, sismico: null, penumbra: false, percepcion_pasiva: 10 };

const TIPOS_SENTIDOS = [
  { key: 'oscuridad', label: 'Visión en la oscuridad', metros: true },
  { key: 'ciego',     label: 'Visión ciega',           metros: true },
  { key: 'verdadero', label: 'Visión verdadera',       metros: true },
  { key: 'sismico',   label: 'Sentido sísmico',        metros: true },
  { key: 'penumbra',  label: 'Visión en la penumbra',  metros: false },
];

function SentidosEditor({ value, onChange }) {
  const s = value || DEFAULT_SENTIDOS;
  const toggle = (key, metros) => {
    if (metros) onChange({ ...s, [key]: s[key] != null ? null : 18 });
    else        onChange({ ...s, [key]: !s[key] });
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {TIPOS_SENTIDOS.map(({ key, label, metros }) => {
        const activo = metros ? s[key] != null : !!s[key];
        return (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" id={`sentido-${key}`} checked={activo}
              onChange={() => toggle(key, metros)} style={{ cursor: 'pointer', accentColor: '#C9A84C', width: 14, height: 14, flexShrink: 0 }} />
            <label htmlFor={`sentido-${key}`} style={{ fontSize: '0.8rem', color: '#e8e8f0', cursor: 'pointer', flex: 1 }}>{label}</label>
            {metros && activo && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <input type="number" value={s[key] ?? ''} min="1"
                  onChange={(e) => onChange({ ...s, [key]: parseInt(e.target.value) || 0 })}
                  className="input-dnd" style={{ width: 60 }} placeholder="18" />
                <span style={{ fontSize: '0.75rem', color: '#7a8a9a' }}>m</span>
              </div>
            )}
          </div>
        );
      })}
      <div style={{ borderTop: '1px solid rgba(201,168,76,0.15)', paddingTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
        <label style={{ fontSize: '0.8rem', color: '#e8e8f0', flex: 1 }}>Percepción pasiva</label>
        <input type="number" value={s.percepcion_pasiva ?? ''}
          onChange={(e) => onChange({ ...s, percepcion_pasiva: e.target.value === '' ? null : parseInt(e.target.value) })}
          className="input-dnd" style={{ width: 70 }} placeholder="10" />
      </div>
    </div>
  );
}

const DEFAULT_FORM = {
  nombre: '', tamano: 'Mediano', tipo: '', alineamiento: '', descripcion: '',
  tipo_armadura: 'sin_armadura', clase_armadura: 10, clase_armadura_manual: false, otro_armadura_desc: '',
  iniciativa: '', num_dados: '', puntos_de_golpe: 10, velocidad: '9 m',
  fuerza: 10, destreza: 10, constitucion: 10, inteligencia: 10, sabiduria: 10, carisma: 10,
  salvaciones: { ...DEFAULT_SALVACIONES },
  etiquetas: '',
  habilidades_competencias: {}, habilidades: '',
  resistencias_dano: [], inmunidades_dano: [], vulnerabilidades_dano: [],
  inmunidades_condicion: [], sentidos: { ...DEFAULT_SENTIDOS }, idiomas: '', valor_desafio: '0',
  habilidades_especiales: '', titulo_habilidades_especiales: 'Atributos',
  multiataque: null, acciones: '', titulo_acciones: 'Acciones',
  acciones_adicionales: '', titulo_acciones_adicionales: 'Acciones adicionales',
  reacciones: '', titulo_reacciones: 'Reacciones',
  descripcion_acciones_legendarias: '', acciones_legendarias: '',
  titulo_acciones_legendarias: 'Acciones legendarias',
  acciones_guarida: '', titulo_acciones_guarida: 'Acciones de guarida',
  notas: '', titulo_notas: 'Notas del DM',
};

// ── Subcomponentes UI ──────────────────────────────────────────────────────────

function EditableLabel({ value, defaultValue, onChange }) {
  const [editing, setEditing] = useState(false);
  if (editing) {
    return (
      <input autoFocus value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => { if (!value.trim()) onChange(defaultValue); setEditing(false); }}
        onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
        className="label-dnd w-full bg-transparent border-b border-gold/50 outline-none pb-0.5"
        style={{ display: 'block' }} />
    );
  }
  return (
    <span className="label-dnd inline-flex items-center gap-1.5">
      {value || defaultValue}
      <button type="button" onClick={(e) => { e.stopPropagation(); setEditing(true); }} title="Editar título"
        style={{ opacity: 0.5, lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '0.8rem' }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = 0.5; }}>✏️</button>
    </span>
  );
}

function toHtml(text) {
  if (!text) return '';
  // Decode all layers of entity escaping (fixes &amp;amp;amp; style corruption)
  if (text.includes('&')) {
    let decoded = text;
    let prev;
    do {
      prev = decoded;
      decoded = decoded
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'");
    } while (decoded !== prev);
    text = decoded;
  }
  // If the decoded text contains HTML tags or named/numeric entities, treat as HTML
  if (/<[a-z][\s\S]*>/i.test(text) || /&[a-z#]\w*;/i.test(text)) return text;
  // Plain text: escape and convert newlines
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
}

function ToolbarBtn({ cmd, label, style = {}, onMouseDown }) {
  return (
    <button type="button" title={label} onMouseDown={onMouseDown}
      style={{ width: 26, height: 24, fontSize: '0.78rem', fontWeight: 700, color: 'rgba(201,168,76,0.8)', backgroundColor: 'transparent', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 3, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', ...style }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(201,168,76,0.15)'; e.currentTarget.style.color = '#C9A84C'; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'rgba(201,168,76,0.8)'; }}>
      {cmd}
    </button>
  );
}

const RichEditor = forwardRef(function RichEditor({ value, onChange, placeholder, minHeight = 70 }, ref) {
  const editorRef = useRef(null);
  const lastValueRef = useRef(null);
  const [empty, setEmpty] = useState(!value);
  useEffect(() => {
    const html = toHtml(value);
    if (editorRef.current && html !== lastValueRef.current) {
      editorRef.current.innerHTML = html; lastValueRef.current = html; setEmpty(!html);
    }
  }, [value]);
  const syncContent = () => {
    const html = editorRef.current?.innerHTML ?? '';
    const isEmpty = html === '' || html === '<br>';
    if (isEmpty) { editorRef.current.innerHTML = ''; lastValueRef.current = ''; setEmpty(true); onChange(''); }
    else { lastValueRef.current = html; setEmpty(false); onChange(html); }
  };
  useImperativeHandle(ref, () => ({
    insert(html) {
      if (!editorRef.current) return;
      const current = editorRef.current.innerHTML;
      const prefix = current && current !== '<br>' ? '<br>' : '';
      editorRef.current.innerHTML = current + prefix + html;
      // move cursor to end
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
      editorRef.current.focus();
      syncContent();
    },
  }));
  const execCmd = (cmd) => { document.execCommand(cmd, false, null); editorRef.current?.focus(); syncContent(); };
  const TOOLBAR = [
    { cmd: 'B', label: 'Negrita', exec: () => execCmd('bold'), style: { fontFamily: 'serif', fontWeight: 900 } },
    { cmd: 'I', label: 'Cursiva', exec: () => execCmd('italic'), style: { fontStyle: 'italic' } },
    { cmd: 'U', label: 'Subrayado', exec: () => execCmd('underline'), style: { textDecoration: 'underline' } },
  ];
  return (
    <div style={{ border: '1px solid rgba(201,168,76,0.2)', borderRadius: '0 0 4px 4px', overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.2)' }}>
      <div style={{ display: 'flex', gap: 4, padding: '4px 8px', backgroundColor: 'rgba(0,0,0,0.35)', borderBottom: '1px solid rgba(201,168,76,0.12)' }}>
        {TOOLBAR.map(({ cmd, label, exec, style }) => (
          <ToolbarBtn key={cmd} cmd={cmd} label={label} style={style} onMouseDown={(e) => { e.preventDefault(); exec(); }} />
        ))}
      </div>
      <div style={{ position: 'relative' }}>
        {empty && placeholder && <div style={{ position: 'absolute', top: 7, left: 10, color: 'rgba(156,163,175,0.4)', fontSize: '0.78rem', pointerEvents: 'none' }}>{placeholder}</div>}
        <div ref={editorRef} contentEditable suppressContentEditableWarning onInput={syncContent}
          style={{ minHeight, padding: '7px 10px', outline: 'none', fontSize: '0.82rem', color: '#e2e8f0', lineHeight: 1.6, wordBreak: 'break-word' }} />
      </div>
    </div>
  );
});

function ItemList({ items, onChange, addLabel, namePlaceholder, showMultiataque = false }) {
  const emptyItem = showMultiataque
    ? { nombre: '', descripcion: '', multiataque: false, requiere_impacto: false, accion_requerida: '', tiene_limite: false, max_criaturas: 1, estado_aplicado: '' }
    : { nombre: '', descripcion: '' };
  const addItem = () => onChange([...items, emptyItem]);
  const removeItem = (i) => onChange(items.filter((_, idx) => idx !== i));
  const updateItem = (i, field, val) => onChange(items.map((item, idx) => idx === i ? { ...item, [field]: val } : item));
  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((item, i) => (
          <div key={i} style={{ border: '1px solid rgba(201,168,76,0.22)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', backgroundColor: 'rgba(0,0,0,0.4)', borderBottom: '1px solid rgba(201,168,76,0.15)' }}>
              <input value={item.nombre} onChange={(e) => updateItem(i, 'nombre', e.target.value)} placeholder={namePlaceholder || 'Nombre...'}
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#e2e8f0', fontSize: '0.82rem', fontWeight: 700, fontFamily: "'Cinzel', serif", letterSpacing: '0.02em' }} />
              <button type="button" onClick={() => removeItem(i)} title="Eliminar"
                style={{ opacity: 0.45, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', padding: '0 2px', lineHeight: 1, flexShrink: 0 }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; }} onMouseLeave={(e) => { e.currentTarget.style.opacity = 0.45; }}>🗑️</button>
            </div>
            {showMultiataque && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', backgroundColor: 'rgba(0,0,0,0.25)', borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.68rem', color: item.multiataque ? '#C9A84C' : 'rgba(201,168,76,0.35)', cursor: 'pointer', userSelect: 'none', flexShrink: 0 }}>
                  <input type="checkbox" checked={!!item.multiataque}
                    onChange={(e) => updateItem(i, 'multiataque', e.target.checked)}
                    style={{ accentColor: '#C9A84C', cursor: 'pointer', width: 11, height: 11 }} />
                  ⚔️ Multiataque
                </label>
                <span style={{ color: 'rgba(201,168,76,0.2)', fontSize: '0.65rem' }}>|</span>
                <label style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.68rem', color: item.requiere_impacto ? '#a78bfa' : 'rgba(167,139,250,0.35)', cursor: 'pointer', userSelect: 'none', flexShrink: 0 }}>
                  <input type="checkbox" checked={!!item.requiere_impacto}
                    onChange={(e) => updateItem(i, 'requiere_impacto', e.target.checked)}
                    style={{ accentColor: '#a78bfa', cursor: 'pointer', width: 11, height: 11 }} />
                  🔒 Req. impacto
                </label>
                {item.requiere_impacto && (
                  <select value={item.accion_requerida || ''}
                    onChange={(e) => updateItem(i, 'accion_requerida', e.target.value)}
                    style={{ flex: 1, background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: 3, color: '#e2e8f0', fontSize: '0.7rem', padding: '2px 4px', outline: 'none' }}>
                    <option value="">— acción requerida —</option>
                    {items.map((other, j) => j !== i && other.nombre ? (
                      <option key={j} value={other.nombre}>{other.nombre}</option>
                    ) : null)}
                  </select>
                )}
              </div>
            )}
            {showMultiataque && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', backgroundColor: 'rgba(0,0,0,0.25)', borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.68rem', color: item.tiene_limite ? '#5bc8f4' : 'rgba(91,200,244,0.35)', cursor: 'pointer', userSelect: 'none', flexShrink: 0 }}>
                  <input type="checkbox" checked={!!item.tiene_limite}
                    onChange={(e) => updateItem(i, 'tiene_limite', e.target.checked)}
                    style={{ accentColor: '#5bc8f4', cursor: 'pointer', width: 11, height: 11 }} />
                  🔢 Límite criaturas
                </label>
                {item.tiene_limite && (
                  <>
                    <input type="number" value={item.max_criaturas || 1} min={1} max={20}
                      onChange={(e) => updateItem(i, 'max_criaturas', Math.max(1, parseInt(e.target.value) || 1))}
                      title="Máximo de criaturas afectadas simultáneamente"
                      style={{ width: 42, background: 'rgba(91,200,244,0.08)', border: '1px solid rgba(91,200,244,0.3)', borderRadius: 3, color: '#5bc8f4', fontSize: '0.75rem', padding: '2px 4px', outline: 'none', textAlign: 'center', flexShrink: 0 }} />
                    <input type="text" value={item.estado_aplicado || ''}
                      onChange={(e) => updateItem(i, 'estado_aplicado', e.target.value)}
                      placeholder="Estado (ej: Aferrada)"
                      style={{ flex: 1, background: 'rgba(91,200,244,0.05)', border: '1px solid rgba(91,200,244,0.2)', borderRadius: 3, color: '#e2e8f0', fontSize: '0.72rem', padding: '2px 6px', outline: 'none', minWidth: 0 }} />
                  </>
                )}
              </div>
            )}
            <RichEditor value={item.descripcion} onChange={(val) => updateItem(i, 'descripcion', val)} placeholder="Descripción..." minHeight={55} />
          </div>
        ))}
      </div>
      <button type="button" onClick={addItem}
        style={{ width: '100%', marginTop: 8, padding: '7px 12px', border: '1px dashed rgba(201,168,76,0.35)', borderRadius: 4, background: 'none', color: 'rgba(201,168,76,0.55)', fontSize: '0.75rem', fontFamily: "'Cinzel', serif", letterSpacing: '0.06em', cursor: 'pointer' }}
        onMouseEnter={(e) => { e.currentTarget.style.color = '#C9A84C'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.7)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(201,168,76,0.55)'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.35)'; }}>
        ＋ {addLabel}
      </button>
    </div>
  );
}

// ── Editor de Multiataque ──────────────────────────────────────────────────────

function MultiataqueSectionEditor({ value, acciones, onChange }) {
  const enabled = value != null; // coerce: handles both null and undefined
  const actionNames = (acciones || []).filter(a => a.multiataque).map(a => a.nombre).filter(Boolean);

  if (!enabled) {
    return (
      <button type="button" onClick={() => {
        const nuevo = { nombre: 'Multiataque', descripcion: '', combinaciones: [[{ accion: '', veces: 1 }]] };
        console.log('Añadiendo multiataque:', nuevo);
        onChange(nuevo);
      }}
        style={{ width: '100%', marginBottom: 8, padding: '7px 12px', border: '1px dashed rgba(201,168,76,0.35)', borderRadius: 4, background: 'none', color: 'rgba(201,168,76,0.55)', fontSize: '0.75rem', fontFamily: "'Cinzel', serif", letterSpacing: '0.06em', cursor: 'pointer' }}
        onMouseEnter={(e) => { e.currentTarget.style.color = '#C9A84C'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.7)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(201,168,76,0.55)'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.35)'; }}>
        ⚔️ + Añadir Multiataque
      </button>
    );
  }

  const combinaciones = value.combinaciones || [];
  const setField = (field, val) => onChange({ ...value, [field]: val });
  const addCombo = () => setField('combinaciones', [...combinaciones, [{ accion: '', veces: 1 }]]);
  const removeCombo = (ci) => setField('combinaciones', combinaciones.filter((_, i) => i !== ci));
  const addSlot = (ci) => {
    const combos = combinaciones.map((c, i) => i === ci ? [...c, { accion: '', veces: 1 }] : c);
    setField('combinaciones', combos);
  };
  const removeSlot = (ci, si) => {
    const combos = combinaciones.map((c, i) => i === ci ? c.filter((_, j) => j !== si) : c);
    setField('combinaciones', combos);
  };
  const updateSlot = (ci, si, field, val) => {
    const combos = combinaciones.map((c, i) =>
      i === ci ? c.map((s, j) => j === si ? { ...s, [field]: val } : s) : c
    );
    setField('combinaciones', combos);
  };

  return (
    <div style={{ border: '1px solid rgba(122,28,28,0.5)', borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', backgroundColor: 'rgba(122,28,28,0.25)', borderBottom: '1px solid rgba(201,168,76,0.2)' }}>
        <span style={{ fontSize: '0.72rem', color: '#C9A84C', flexShrink: 0 }}>⚔️</span>
        <input value={value.nombre || 'Multiataque'}
          onChange={(e) => setField('nombre', e.target.value)}
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#e2e8f0', fontSize: '0.82rem', fontWeight: 700, fontFamily: "'Cinzel', serif", letterSpacing: '0.02em' }}
          placeholder="Multiataque" />
        <button type="button" onClick={() => onChange(null)}
          style={{ opacity: 0.45, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', padding: '0 2px', lineHeight: 1, flexShrink: 0 }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = 0.45; }}>🗑️</button>
      </div>
      <div style={{ padding: '6px 8px', backgroundColor: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
        <textarea value={value.descripcion || ''} onChange={(e) => setField('descripcion', e.target.value)}
          placeholder="Ej: La criatura puede realizar dos ataques entre las siguientes opciones..."
          rows={2}
          style={{ width: '100%', background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 3, color: '#e2e8f0', fontSize: '0.78rem', padding: '4px 8px', outline: 'none', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
      </div>
      <div style={{ padding: '6px 8px', backgroundColor: 'rgba(0,0,0,0.15)' }}>
        <div style={{ fontSize: '0.62rem', color: 'rgba(201,168,76,0.45)', marginBottom: 5, letterSpacing: '0.05em' }}>COMBINACIONES DISPONIBLES</div>
        {combinaciones.map((combo, ci) => (
          <div key={ci} style={{ display: 'flex', alignItems: 'flex-start', gap: 4, marginBottom: 4 }}>
            <span style={{ fontSize: '0.62rem', color: 'rgba(201,168,76,0.35)', paddingTop: 5, minWidth: 14, textAlign: 'right' }}>{ci + 1}.</span>
            <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: 3, padding: '4px 5px', border: '1px solid rgba(201,168,76,0.12)' }}>
              {combo.map((slot, si) => (
                <div key={si} style={{ display: 'flex', alignItems: 'center', gap: 2, background: 'rgba(201,168,76,0.07)', borderRadius: 3, padding: '2px 5px', border: '1px solid rgba(201,168,76,0.18)' }}>
                  <select value={slot.accion || ''}
                    onChange={(e) => updateSlot(ci, si, 'accion', e.target.value)}
                    style={{ background: 'transparent', border: 'none', outline: 'none', color: slot.accion ? '#e2e8f0' : 'rgba(156,163,175,0.5)', fontSize: '0.72rem', cursor: 'pointer', maxWidth: 120 }}>
                    {actionNames.length === 0
                      ? <option value="" disabled>— marca ⚔️ en acciones —</option>
                      : <><option value="">— acción —</option>{actionNames.map(n => <option key={n} value={n}>{n}</option>)}</>
                    }
                  </select>
                  <span style={{ fontSize: '0.62rem', color: 'rgba(201,168,76,0.4)' }}>×</span>
                  <input type="number" value={slot.veces || 1} min={1} max={5}
                    onChange={(e) => updateSlot(ci, si, 'veces', Math.max(1, parseInt(e.target.value) || 1))}
                    style={{ width: 30, background: 'transparent', border: 'none', outline: 'none', color: '#C9A84C', fontSize: '0.75rem', fontWeight: 700, textAlign: 'center' }} />
                  {combo.length > 1 && (
                    <button type="button" onClick={() => removeSlot(ci, si)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem', padding: '0 1px', lineHeight: 1 }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#e94560'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.25)'; }}>×</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => addSlot(ci)}
                style={{ fontSize: '0.65rem', color: 'rgba(201,168,76,0.45)', background: 'none', border: '1px dashed rgba(201,168,76,0.25)', borderRadius: 3, padding: '2px 6px', cursor: 'pointer', lineHeight: 1.4 }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#C9A84C'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(201,168,76,0.45)'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.25)'; }}>+</button>
            </div>
            <button type="button" onClick={() => removeCombo(ci)}
              style={{ opacity: 0.35, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', padding: '3px 2px', lineHeight: 1, flexShrink: 0 }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = 0.35; }}>×</button>
          </div>
        ))}
        <button type="button" onClick={addCombo}
          style={{ width: '100%', marginTop: 4, padding: '5px 10px', border: '1px dashed rgba(201,168,76,0.25)', borderRadius: 3, background: 'none', color: 'rgba(201,168,76,0.45)', fontSize: '0.72rem', cursor: 'pointer' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#C9A84C'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(201,168,76,0.45)'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.25)'; }}>
          ＋ Añadir combinación
        </button>
      </div>
    </div>
  );
}

// ── Selector de habilidades con competencia ────────────────────────────────────

const STAT_LABELS_SHORT = { fuerza: 'FUE', destreza: 'DES', inteligencia: 'INT', sabiduria: 'SAB', carisma: 'CAR' };

const ROW_BASE = { display: 'flex', alignItems: 'center', gap: 4, padding: '2px 4px', borderLeft: '2px solid transparent', borderRadius: 2, cursor: 'pointer', transition: 'all 0.15s', fontSize: '0.73rem' };
const SKILL_ROW = { display: 'grid', gridTemplateColumns: '1fr auto auto auto', alignItems: 'center', gap: 4, padding: '2px 4px', borderLeft: '2px solid transparent', borderRadius: 2, cursor: 'pointer', transition: 'all 0.15s', fontSize: '0.73rem' };
const rowEnter = (e) => { e.currentTarget.style.backgroundColor = 'rgba(255,215,0,0.06)'; e.currentTarget.style.borderLeftColor = 'rgba(255,215,0,0.4)'; };
const rowLeave = (e) => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.borderLeftColor = 'transparent'; };

function SkillPicker({ competencias, stats, bc, onChange }) {
  const setSkill = (key, nivel) => {
    const next = { ...competencias };
    if (!nivel || nivel === competencias[key]) { delete next[key]; } else { next[key] = nivel; }
    onChange(next);
  };

  const renderRow = ({ key, label, stat }) => {
    const m = modNum(stats[stat]);
    const profVal = fmtMod(m + bc);
    const maestVal = fmtMod(m + bc * 2);
    const nivel = competencias[key] ?? null;
    return (
      <div key={key} style={SKILL_ROW} onMouseEnter={rowEnter} onMouseLeave={rowLeave}>
        <span style={{ color: nivel ? '#e8c97a' : '#bbb', paddingRight: 8 }}>{label}</span>
        <span style={{ color: 'rgba(201,168,76,0.35)', fontSize: '0.58rem' }}>{STAT_LABELS_SHORT[stat]}</span>
        {[{ v: 'prof', label: profVal, title: 'Competencia' }, { v: 'maest', label: maestVal, title: 'Maestría' }].map(({ v, label: lbl, title }) => (
          <button key={v} type="button" onClick={(e) => { e.stopPropagation(); setSkill(key, v); }} title={title}
            style={{ padding: '1px 5px', fontSize: '0.63rem', border: '1px solid', borderRadius: 3, cursor: 'pointer', minWidth: 30, textAlign: 'center', fontWeight: nivel === v ? 700 : 400, borderColor: nivel === v ? '#C9A84C' : 'rgba(201,168,76,0.2)', backgroundColor: nivel === v ? 'rgba(201,168,76,0.15)' : 'transparent', color: nivel === v ? '#C9A84C' : 'rgba(201,168,76,0.35)' }}>
            {lbl}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div>
      <p style={{ fontSize: '0.62rem', color: 'rgba(201,168,76,0.45)', marginBottom: 6, letterSpacing: '0.05em' }}>
        BC +{bc} · Haz clic en un valor para activarlo, de nuevo para desactivarlo
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
        <div>{HABILIDADES_D5E.slice(0, 9).map(renderRow)}</div>
        <div>{HABILIDADES_D5E.slice(9).map(renderRow)}</div>
      </div>
    </div>
  );
}

function CheckPicker({ tags, value, onChange }) {
  const [open, setOpen] = useState(false);
  const selected = new Set(
    Array.isArray(value) ? value :
    (value || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
  );
  const toggle = (key) => {
    const next = new Set(selected);
    if (next.has(key)) next.delete(key); else next.add(key);
    onChange([...next]);
  };
  const selLabels = tags.filter((t) => selected.has(t.key)).map((t) => t.label);
  const third = Math.ceil(tags.length / 3);
  const cols = [tags.slice(0, third), tags.slice(third, third * 2), tags.slice(third * 2)];
  return (
    <div style={{ border: '1px solid rgba(201,168,76,0.2)', borderRadius: 4, overflow: 'hidden' }}>
      <button type="button" onClick={() => setOpen((o) => !o)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: 'rgba(0,0,0,0.3)', border: 'none', cursor: 'pointer', fontSize: '0.73rem', gap: 8 }}>
        <span style={{ color: selLabels.length ? '#e8c97a' : 'rgba(201,168,76,0.35)', textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
          {selLabels.length ? selLabels.join(', ') : 'Ninguno seleccionado'}
        </span>
        <span style={{ color: 'rgba(201,168,76,0.5)', flexShrink: 0, transition: 'transform 0.15s', transform: open ? 'rotate(180deg)' : 'none' }}>▼</span>
      </button>
      {open && (
        <div style={{ padding: '8px 10px', backgroundColor: 'rgba(0,0,0,0.15)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 8px' }}>
          {cols.map((col, ci) => (
            <div key={ci}>
              {col.map(({ key, label }) => {
                const active = selected.has(key);
                return (
                  <div key={key} onClick={() => toggle(key)} style={ROW_BASE} onMouseEnter={rowEnter} onMouseLeave={rowLeave}>
                    <span style={{ width: 11, height: 11, flexShrink: 0, border: `1px solid ${active ? '#C9A84C' : 'rgba(201,168,76,0.25)'}`, borderRadius: 2, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', backgroundColor: active ? 'rgba(201,168,76,0.18)' : 'transparent', color: active ? '#C9A84C' : 'transparent', fontSize: '0.52rem' }}>✓</span>
                    <span style={{ color: active ? '#e8c97a' : '#aaa' }}>{label}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Estructuras de sección ─────────────────────────────────────────────────────

function SubSection({ title, defaultValue, onTitleChange, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderTop: '1px solid rgba(201,168,76,0.13)', paddingTop: 2 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
        <EditableLabel value={title} defaultValue={defaultValue} onChange={onTitleChange} />
        <button type="button" onClick={() => setOpen((o) => !o)}
          style={{ color: open ? 'rgba(201,168,76,0.7)' : 'rgba(201,168,76,0.35)', fontSize: '0.6rem', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', flexShrink: 0, transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}>▼</button>
      </div>
      {open && <div style={{ paddingBottom: 10 }}>{children}</div>}
    </div>
  );
}

function CollapseSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gold/20 rounded-lg overflow-hidden mb-3">
      <button type="button" onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-dungeon/60 hover:bg-dungeon/80 transition">
        <span className="font-cinzel text-sm text-gold font-semibold tracking-wider">{title}</span>
        <span className="text-gold/60 text-xs transition-transform duration-200" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
      </button>
      {open && <div className="px-4 py-4 bg-dungeon-mid/40 space-y-3">{children}</div>}
    </div>
  );
}

function Field({ label, children }) {
  return <div><label className="label-dnd">{label}</label>{children}</div>;
}

// ── Formulario principal ───────────────────────────────────────────────────────

function NpcForm({ initialData = {}, onSubmit, loading }) {
  const [form, setForm] = useState(() => ({
    ...DEFAULT_FORM,
    ...initialData,
    tipo_armadura: initialData.tipo_armadura?.startsWith('Otro:')
      ? 'otro'
      : (initialData.tipo_armadura || 'sin_armadura'),
    otro_armadura_desc: initialData.tipo_armadura?.startsWith('Otro:')
      ? initialData.tipo_armadura.slice(5).trim()
      : '',
    habilidades_competencias: parseCompetencias(initialData.habilidades_competencias),
    resistencias_dano:    parseArrField(initialData.resistencias_dano),
    inmunidades_dano:     parseArrField(initialData.inmunidades_dano),
    vulnerabilidades_dano:parseArrField(initialData.vulnerabilidades_dano),
    inmunidades_condicion:parseArrField(initialData.inmunidades_condicion),
    sentidos: (() => { try { const v = initialData.sentidos; if (!v) return { ...DEFAULT_SENTIDOS }; if (typeof v === 'object' && !Array.isArray(v)) return { ...DEFAULT_SENTIDOS, ...v }; return { ...DEFAULT_SENTIDOS, ...JSON.parse(v) }; } catch { return { ...DEFAULT_SENTIDOS }; } })(),
    habilidades_especiales: parseItems(initialData.habilidades_especiales),
    ...(()=>{
      const rawAcc = initialData.acciones ? parseItems(initialData.acciones) : [];
      const multiItem = rawAcc.find(a => a.tipo === 'multiataque') || null;
      const regAcc = rawAcc.filter(a => a.tipo !== 'multiataque');
      const multiataque = multiItem ? { nombre: multiItem.nombre||'Multiataque', descripcion: multiItem.descripcion||'', combinaciones: multiItem.combinaciones||[] } : null;
      console.log('[NpcForm] init multiataque:', multiataque, '| rawAcc:', rawAcc.length, 'items');
      return {
        multiataque,
        acciones: regAcc.length ? regAcc : [{ nombre: '', descripcion: '' }],
      };
    })(),
    acciones_adicionales: parseItems(initialData.acciones_adicionales),
    reacciones:           parseItems(initialData.reacciones),
    acciones_legendarias: parseItems(initialData.acciones_legendarias),
    acciones_guarida:     parseItems(initialData.acciones_guarida),
    etiquetas:            (() => { try { const v = initialData.etiquetas; if (!v) return ''; if (typeof v === 'string') { const p = JSON.parse(v); return Array.isArray(p) ? (p[0] || '') : String(p || ''); } return ''; } catch { return String(initialData.etiquetas || ''); } })(),
    salvaciones: (() => { try { const v = initialData.salvaciones; if (!v) return { ...DEFAULT_SALVACIONES }; if (typeof v === 'object') return { ...DEFAULT_SALVACIONES, ...v }; return { ...DEFAULT_SALVACIONES, ...JSON.parse(v) }; } catch { return { ...DEFAULT_SALVACIONES }; } })(),
  }));


  const set = (name, value) => {
    if (name === 'multiataque') console.log('[NpcForm] set multiataque →', value);
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const [telepatia, setTelepatia] = useState(() => {
    const t = String(initialData.idiomas || '').match(/;\s*telepatía\s+(\d+)\s*m/i);
    return { activa: !!t, metros: t ? Number(t[1]) : 18 };
  });

  // Sincroniza telepatía con el campo idiomas
  useEffect(() => {
    setForm((prev) => {
      const base = String(prev.idiomas || '').replace(/;\s*telepatía\s+\d+\s*m/i, '').trimEnd();
      const next = telepatia.activa ? `${base}; telepatía ${telepatia.metros} m` : base;
      return prev.idiomas === next ? prev : { ...prev, idiomas: next };
    });
  }, [telepatia.activa, telepatia.metros]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    set(name, type === 'checkbox' ? checked : type === 'number' ? Number(value) : value);
  };

  // ── Auto-cálculo 1: Puntos de Golpe ─────────────────────────────────────────
  // PG = tipoDado + ((numDados - 1) * (tipoDado / 2)) + (numDados * modCON)
  useEffect(() => {
    const n = Number(form.num_dados);
    if (!n || n <= 0) return;
    const dado = DADO_POR_TAMANO[form.tamano];
    if (!dado) return;
    const modCON = modNum(form.constitucion);
    const pg = Math.max(1, dado.dado + (n - 1) * (dado.dado / 2) + n * modCON);
    setForm((prev) => ({ ...prev, puntos_de_golpe: pg }));
  }, [form.num_dados, form.tamano, form.constitucion]);

  // ── Auto-cálculo 3: Clase de Armadura ────────────────────────────────────────
  const caInitializedRef = useRef(false);
  useEffect(() => {
    if (!caInitializedRef.current) {
      caInitializedRef.current = true;
      return;
    }
    if (form.clase_armadura_manual) return; // override manual: no recalcular
    const tipo = TIPOS_ARMADURA.find((t) => t.key === form.tipo_armadura);
    if (!tipo || tipo.calcCA === null) return; // 'natural' / 'otro' = manual
    const desMod = modNum(form.destreza);
    setForm((prev) => ({ ...prev, clase_armadura: tipo.calcCA(desMod) }));
  }, [form.tipo_armadura, form.destreza, form.clase_armadura_manual]);

  // ── Auto-cálculo 4: Tiradas de Salvación ─────────────────────────────────────
  useEffect(() => {
    const bc = calcBC(form.valor_desafio);
    const updates = {};
    STATS.forEach(({ key, salvKey, profKey }) => {
      const m = modNum(form[key]);
      const val = form.salvaciones?.[profKey] ? m + bc : m;
      updates[salvKey] = fmtMod(val);
    });
    setForm((prev) => ({ ...prev, salvaciones: { ...prev.salvaciones, ...updates } }));
  }, [
    form.fuerza, form.destreza, form.constitucion,
    form.inteligencia, form.sabiduria, form.carisma,
    form.salvaciones?.prof_fue, form.salvaciones?.prof_des, form.salvaciones?.prof_con,
    form.salvaciones?.prof_int, form.salvaciones?.prof_sab, form.salvaciones?.prof_car,
    form.valor_desafio,
  ]);

  // ── Auto-cálculo 5: Habilidades con competencia ───────────────────────────────
  useEffect(() => {
    const comps = form.habilidades_competencias;
    const hasAny = Object.values(comps).some(Boolean);
    if (!hasAny) return;
    const bc = calcBC(form.valor_desafio);
    const statsMap = { fuerza: form.fuerza, destreza: form.destreza, constitucion: form.constitucion, inteligencia: form.inteligencia, sabiduria: form.sabiduria, carisma: form.carisma };
    const parts = HABILIDADES_D5E
      .filter((h) => comps[h.key])
      .map((h) => {
        const m = modNum(statsMap[h.stat]);
        const val = comps[h.key] === 'maest' ? m + bc * 2 : m + bc;
        return `${h.label} ${fmtMod(val)}`;
      });
    setForm((prev) => ({ ...prev, habilidades: parts.join(', ') }));
  }, [
    form.habilidades_competencias,
    form.fuerza, form.destreza, form.inteligencia, form.sabiduria, form.carisma,
    form.valor_desafio,
  ]);

  // ── Auto-cálculo 6: Percepción pasiva ────────────────────────────────────────
  useEffect(() => {
    const sabMod = Math.floor((Number(form.sabiduria || 10) - 10) / 2);
    const bc = calcBC(form.valor_desafio);
    const comps = form.habilidades_competencias;
    let pp = 10 + sabMod;
    if (comps['percepcion'] === 'maest') pp += bc * 2;
    else if (comps['percepcion']) pp += bc;
    setForm((prev) => ({ ...prev, sentidos: { ...(prev.sentidos || DEFAULT_SENTIDOS), percepcion_pasiva: pp } }));
  }, [form.sabiduria, form.habilidades_competencias, form.valor_desafio]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const raw = {
      ...form,
      tipo_armadura: form.tipo_armadura === 'otro'
        ? (form.otro_armadura_desc.trim() ? `Otro: ${form.otro_armadura_desc.trim()}` : 'Otro')
        : form.tipo_armadura,
      habilidades_competencias: JSON.stringify(form.habilidades_competencias),
      sentidos: JSON.stringify(form.sentidos),
      habilidades_especiales: JSON.stringify(form.habilidades_especiales),
      acciones:               JSON.stringify(form.multiataque
        ? [{tipo:'multiataque', nombre:form.multiataque.nombre||'Multiataque', descripcion:form.multiataque.descripcion||'', combinaciones:form.multiataque.combinaciones||[]}, ...form.acciones]
        : form.acciones),
      acciones_adicionales:   JSON.stringify(form.acciones_adicionales),
      reacciones:             JSON.stringify(form.reacciones),
      acciones_legendarias:   JSON.stringify(form.acciones_legendarias),
      acciones_guarida:       JSON.stringify(form.acciones_guarida),
      etiquetas:              form.etiquetas || null,
    };
    // Convertir cadenas vacías a null en todos los campos excepto el nombre
    const sanitized = Object.fromEntries(
      Object.entries(raw).map(([k, v]) =>
        k === 'nombre' ? [k, v] : [k, v === '' ? null : v]
      )
    );
    // num_dados 0 tampoco es válido → null
    if (!sanitized.num_dados) sanitized.num_dados = null;
    // otro_armadura_desc es campo de UI, no va al backend
    delete sanitized.otro_armadura_desc;
    onSubmit(sanitized);
  };

  // Fórmula PG para mostrar
  const dadoInfo = DADO_POR_TAMANO[form.tamano];
  const n = Number(form.num_dados);
  const formulaPG = n > 0 && dadoInfo
    ? (() => {
        const modCON = modNum(form.constitucion);
        const bonusCON = n * modCON;
        const total = Math.max(1, dadoInfo.dado + (n - 1) * (dadoInfo.dado / 2) + bonusCON);
        const diceStr = `${n}d${dadoInfo.dado}`;
        const diceExpr = bonusCON === 0 ? `(${diceStr})` : bonusCON > 0 ? `(${diceStr} + ${bonusCON})` : `(${diceStr} - ${Math.abs(bonusCON)})`;
        return `${total} ${diceExpr}`;
      })()
    : null;

  const bc = calcBC(form.valor_desafio);

  // ── Controles del statblock ───────────────────────────────────────────────────
  const [previewWidth, setPreviewWidth] = useState(() => {
    try { return parseInt(localStorage.getItem('statblock_width')) || 500; } catch { return 500; }
  });
  const [previewHeight, setPreviewHeight] = useState(() => {
    try { return parseInt(localStorage.getItem('statblock_height')) || 700; } catch { return 700; }
  });
  const [twoColumns, setTwoColumns] = useState(() => {
    try { return localStorage.getItem('statblock_columns') === '2'; } catch { return false; }
  });
  useEffect(() => { localStorage.setItem('statblock_width',   previewWidth);  }, [previewWidth]);
  useEffect(() => { localStorage.setItem('statblock_height',  previewHeight); }, [previewHeight]);
  useEffect(() => { localStorage.setItem('statblock_columns', twoColumns ? '2' : '1'); }, [twoColumns]);

  const statblockContainerRef = useRef(null);
  const startCornerDrag = (corner, e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = previewWidth;
    const startH = previewHeight;
    document.body.style.userSelect = 'none';
    const onMove = (ev) => {
      let newW = (corner === 'se' || corner === 'ne')
        ? startW + (ev.clientX - startX)
        : startW - (ev.clientX - startX);
      let newH = (corner === 'se' || corner === 'sw')
        ? startH + (ev.clientY - startY)
        : startH - (ev.clientY - startY);
      newW = Math.max(300, newW);
      newH = Math.max(400, newH);
      setPreviewWidth(Math.round(newW));
      setPreviewHeight(Math.round(newH));
    };
    const onUp = () => {
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const CTRL_BTN = {
    fontFamily: 'Cinzel, serif', fontSize: 11, cursor: 'pointer',
    padding: '4px 10px', borderRadius: 4, border: '1px solid rgba(201,168,76,0.35)',
    background: 'rgba(201,168,76,0.07)', color: '#C9A84C',
    transition: 'background 0.12s, border-color 0.12s',
  };

  const notasEditorRef = useRef(null);
  const statblockRef = useRef(null);
  const handlePrint = () => {
    const el = statblockRef.current;
    if (!el) return;
    const win = window.open('', '_blank', 'width=900,height=700');
    win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Statblock</title>
      <link rel="stylesheet" href="/fonts/fonts.css">
      <style>*{margin:0;padding:0;box-sizing:border-box;}body{background:#fff;padding:20px;}@media print{*{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}</style>
    </head><body>${el.innerHTML}<script>window.onload=()=>{window.print();}<\/script></body></html>`);
    win.document.close();
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-start">
      {/* ── Panel izquierdo ── */}
      <div
        className="w-full bg-dungeon-mid overflow-y-auto lg:h-[calc(100vh-56px)] lg:sticky lg:top-0"
        style={{ flex: 1, minWidth: 280, overflow: 'hidden auto' }}
      >
        <form onSubmit={handleSubmit} className="p-5">
          <h1 className="font-cinzel text-2xl font-bold text-gold mb-5 pb-2 border-b border-gold/30">
            {initialData.nombre ? 'Editar PNJ' : 'Nuevo PNJ'}
          </h1>

          {/* ── Información básica ── */}
          <CollapseSection title="Información básica">
            <Field label="Nombre *">
              <input name="nombre" value={form.nombre} onChange={handleChange} required placeholder="Ej: Malachar el Sombrío" className="input-dnd" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Tamaño">
                <select name="tamano" value={form.tamano} onChange={handleChange} className="input-dnd">
                  {TAMANOS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Tipo">
                <select name="tipo" value={form.tipo} onChange={handleChange} className="input-dnd">
                  <option value="">-- Selecciona un tipo --</option>
                  {TIPOS_CRIATURA.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Alineamiento">
              <select name="alineamiento" value={form.alineamiento} onChange={handleChange} className="input-dnd">
                <option value="">-- Seleccionar --</option>
                {ALINEAMIENTOS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </Field>
            <Field label="Descripción">
              <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={3} placeholder="Apariencia, personalidad, motivaciones..." className="input-dnd resize-none" />
            </Field>
            <Field label="Subtipo / Etiqueta">
              <input
                name="etiquetas"
                value={form.etiquetas}
                onChange={handleChange}
                placeholder="Ej: demonio, diablo, yuan-ti pureblood..."
                className="input-dnd"
              />
              <p style={{ fontSize: '0.65rem', color: 'rgba(201,168,76,0.4)', marginTop: 4 }}>
                Aparece entre paréntesis junto al tipo (ej: Infernal <em>(Demonio)</em>)
              </p>
            </Field>
          </CollapseSection>

          {/* ── Combate ── */}
          <CollapseSection title="Combate">
            {/* Tipo armadura */}
            <Field label="Tipo de armadura">
              <select
                name="tipo_armadura"
                value={form.tipo_armadura}
                onChange={(e) => setForm((prev) => ({
                  ...prev,
                  tipo_armadura: e.target.value,
                  clase_armadura_manual: false, // volver a cálculo automático
                }))}
                className="input-dnd"
              >
                {TIPOS_ARMADURA.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
              </select>
              {form.tipo_armadura === 'otro' && (
                <input
                  type="text"
                  name="otro_armadura_desc"
                  value={form.otro_armadura_desc}
                  onChange={handleChange}
                  placeholder="Describe el tipo de armadura (ej: escamas de dragón, magia antigua...)"
                  className="input-dnd mt-2"
                  maxLength={100}
                />
              )}
            </Field>

            {/* CA */}
            <Field label="Clase de Armadura">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  name="clase_armadura"
                  min={0}
                  max={30}
                  value={form.clase_armadura}
                  onChange={(e) => setForm((prev) => ({
                    ...prev,
                    clase_armadura: e.target.value === '' ? '' : Number(e.target.value),
                    clase_armadura_manual: true, // marcar como override manual
                  }))}
                  className="input-dnd text-center"
                />
                {form.clase_armadura_manual && (
                  <>
                    <span className="text-xs text-amber-600 font-semibold">✏️ Manual</span>
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, clase_armadura_manual: false }))}
                      className="text-xs text-gold hover:underline"
                    >
                      ↻ Volver a cálculo automático
                    </button>
                  </>
                )}
              </div>
            </Field>

            {/* PG con calculadora de dados */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Puntos de Golpe">
                <input type="number" name="puntos_de_golpe" min={1} value={form.puntos_de_golpe} onChange={handleChange} className="input-dnd text-center" />
                {formulaPG && (
                  <p style={{ fontSize: '0.68rem', color: 'rgba(201,168,76,0.5)', marginTop: 3, textAlign: 'center' }}>{formulaPG}</p>
                )}
              </Field>
              <Field label={`Dados (d${dadoInfo?.dado ?? 8} por ${form.tamano})`}>
                <input type="number" name="num_dados" min={1} value={form.num_dados} onChange={handleChange} placeholder="Nº de dados" className="input-dnd text-center" />
              </Field>
            </div>

            <Field label="Velocidad">
              <input name="velocidad" value={form.velocidad} onChange={handleChange} placeholder="9 m" className="input-dnd" />
            </Field>
          </CollapseSection>

          {/* ── Estadísticas ── */}
          <CollapseSection title="Estadísticas">
            <p style={{ fontSize: '0.62rem', color: 'rgba(201,168,76,0.4)', marginBottom: 6, letterSpacing: '0.04em' }}>
              BC +{bc} (según VD) · Activa el checkbox ✓ para aplicar competencia a la salvación
            </p>
            <div className="grid grid-cols-3 gap-3">
              {STATS.map(({ key, label, full, salvKey, profKey }) => {
                const profActive = !!form.salvaciones?.[profKey];
                const autoSalv = fmtMod(profActive ? modNum(form[key]) + bc : modNum(form[key]));
                return (
                  <div key={key} className="text-center">
                    <label className="label-dnd" style={{ fontSize: '0.65rem' }}>{full}</label>
                    <input type="number" min={1} max={30} step={1} value={form[key]}
                      onKeyDown={(e) => {
                        if (['-', 'e', 'E', '+', '.', ','].includes(e.key)) e.preventDefault();
                      }}
                      onChange={(e) => {
                        const n = parseInt(e.target.value);
                        if (isNaN(n)) return;
                        set(key, Math.min(30, Math.max(1, n)));
                      }}
                      className="input-dnd text-center text-lg font-bold" />
                    <p className="text-gold/60 text-xs mt-1">{label} {fmtMod(modNum(form[key]))}</p>
                    {/* Checkbox de competencia + valor de salvación (solo lectura) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 4 }}>
                      <input type="checkbox" checked={profActive}
                        onChange={(e) => set('salvaciones', { ...form.salvaciones, [profKey]: e.target.checked })}
                        style={{ accentColor: '#C9A84C', cursor: 'pointer', flexShrink: 0 }} title="Competencia en salvación" />
                      <span style={{ fontSize: '0.85rem', flex: 1, textAlign: 'center', color: profActive ? '#C9A84C' : 'rgba(201,168,76,0.5)', fontWeight: 600 }}>
                        {autoSalv}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.56rem', color: 'rgba(201,168,76,0.35)', marginTop: 1 }}>✓ comp · salv.</p>
                  </div>
                );
              })}
            </div>
          </CollapseSection>

          {/* ── Atributos adicionales ── */}
          <CollapseSection title="Atributos adicionales" defaultOpen={false}>
            {/* Habilidades con competencia */}
            <div style={{ marginBottom: 4 }}>
              <label className="label-dnd">Habilidades</label>
              <SkillPicker
                competencias={form.habilidades_competencias}
                stats={form}
                bc={bc}
                onChange={(comps) => set('habilidades_competencias', comps)}
              />
              <input name="habilidades" value={form.habilidades} onChange={handleChange}
                placeholder="O escribe manualmente: Percepción +7, Sigilo +5..."
                className="input-dnd mt-2" style={{ fontSize: '0.8rem' }} />
            </div>

            <Field label="Resistencias al daño">
              <CheckPicker tags={TIPOS_DANO} value={form.resistencias_dano} onChange={(v) => set('resistencias_dano', v)} />
            </Field>
            <Field label="Inmunidades al daño">
              <CheckPicker tags={TIPOS_DANO} value={form.inmunidades_dano} onChange={(v) => set('inmunidades_dano', v)} />
            </Field>
            <Field label="Vulnerabilidades al daño">
              <CheckPicker tags={TIPOS_DANO} value={form.vulnerabilidades_dano} onChange={(v) => set('vulnerabilidades_dano', v)} />
            </Field>
            <Field label="Inmunidades a condiciones">
              <CheckPicker tags={CONDICIONES} value={form.inmunidades_condicion} onChange={(v) => set('inmunidades_condicion', v)} />
            </Field>
            <Field label="Sentidos">
              <SentidosEditor value={form.sentidos} onChange={(v) => set('sentidos', v)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Idiomas">
                <input name="idiomas" value={form.idiomas} onChange={handleChange} placeholder="Común, Élfico..." className="input-dnd" />
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5 }}>
                  <input type="checkbox" id="telepatia-cb" checked={telepatia.activa}
                    onChange={(e) => setTelepatia((t) => ({ ...t, activa: e.target.checked }))}
                    style={{ accentColor: '#C9A84C', cursor: 'pointer', flexShrink: 0 }} />
                  <label htmlFor="telepatia-cb" className="label-dnd" style={{ fontSize: '0.7rem', cursor: 'pointer', margin: 0 }}>
                    Telepatía
                  </label>
                  {telepatia.activa && (
                    <>
                      <input type="number" min={1} value={telepatia.metros}
                        onChange={(e) => setTelepatia((t) => ({ ...t, metros: Number(e.target.value) }))}
                        className="input-dnd text-center"
                        style={{ width: 52, fontSize: '0.8rem', padding: '2px 4px' }} />
                      <span className="label-dnd" style={{ fontSize: '0.7rem', margin: 0 }}>m</span>
                    </>
                  )}
                </div>
              </Field>
              <Field label="Valor de Desafío">
                {(() => {
                  const vdEntry = getVDEntry(form.valor_desafio);
                  return (
                    <>
                      <select name="valor_desafio" value={form.valor_desafio || '0'} onChange={handleChange} className="input-dnd">
                        {VD_TABLE.map(({ key }) => (
                          <option key={key} value={key}>VD {key}</option>
                        ))}
                      </select>
                      <p style={{ fontSize: '0.7rem', color: 'rgba(201,168,76,0.6)', marginTop: 4 }}>
                        {vdEntry.xp.toLocaleString('es-ES')} XP · BC +{vdEntry.bc}
                      </p>
                    </>
                  );
                })()}
              </Field>
            </div>
          </CollapseSection>

          {/* ── Habilidades y rasgos ── */}
          <CollapseSection title="Habilidades y rasgos" defaultOpen={true}>
            <SubSection title={form.titulo_habilidades_especiales} defaultValue="Atributos" onTitleChange={(v) => set('titulo_habilidades_especiales', v)}>
              <ItemList items={form.habilidades_especiales} onChange={(v) => set('habilidades_especiales', v)} addLabel="Añadir atributo" namePlaceholder="Nombre del atributo..." />
            </SubSection>
            <SubSection title={form.titulo_acciones} defaultValue="Acciones" onTitleChange={(v) => set('titulo_acciones', v)} defaultOpen={true}>
              <MultiataqueSectionEditor value={form.multiataque} acciones={form.acciones} onChange={(v) => set('multiataque', v)} />
              <ItemList items={form.acciones} onChange={(v) => set('acciones', v)} addLabel="Añadir acción" namePlaceholder="Nombre de la acción..." showMultiataque={true} />
            </SubSection>
            <SubSection title={form.titulo_acciones_adicionales} defaultValue="Acciones adicionales" onTitleChange={(v) => set('titulo_acciones_adicionales', v)}>
              <ItemList items={form.acciones_adicionales} onChange={(v) => set('acciones_adicionales', v)} addLabel="Añadir acción adicional" namePlaceholder="Nombre de la acción adicional..." />
            </SubSection>
            <SubSection title={form.titulo_reacciones} defaultValue="Reacciones" onTitleChange={(v) => set('titulo_reacciones', v)}>
              <ItemList items={form.reacciones} onChange={(v) => set('reacciones', v)} addLabel="Añadir reacción" namePlaceholder="Nombre de la reacción..." />
            </SubSection>
            <SubSection title={form.titulo_acciones_legendarias} defaultValue="Acciones legendarias" onTitleChange={(v) => set('titulo_acciones_legendarias', v)}>
              <textarea name="descripcion_acciones_legendarias" value={form.descripcion_acciones_legendarias} onChange={handleChange}
                rows={2} placeholder="Ej: Puede realizar 3 acciones legendarias al final del turno de otro personaje..."
                className="input-dnd resize-none mb-2" style={{ fontSize: '0.8rem' }} />
              <ItemList items={form.acciones_legendarias} onChange={(v) => set('acciones_legendarias', v)} addLabel="Añadir acción legendaria" namePlaceholder="Nombre de la acción legendaria..." />
            </SubSection>
            <SubSection title={form.titulo_acciones_guarida} defaultValue="Acciones de guarida" onTitleChange={(v) => set('titulo_acciones_guarida', v)}>
              <ItemList items={form.acciones_guarida} onChange={(v) => set('acciones_guarida', v)} addLabel="Añadir acción de guarida" namePlaceholder="Nombre de la acción de guarida..." />
            </SubSection>
            <div style={{ borderTop: '1px dashed rgba(201,168,76,0.2)', paddingTop: 10, marginTop: 2 }}>
              <EditableLabel value={form.titulo_notas} defaultValue="Notas del DM" onChange={(v) => set('titulo_notas', v)} />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6, marginTop: 4 }}>
                {SUGERENCIAS_NOTAS.map(({ emoji, label }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => notasEditorRef.current?.insert(`<strong>${label}:</strong> [escribir aquí]`)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 3,
                      padding: '2px 8px', fontSize: '0.72rem',
                      backgroundColor: 'rgba(26,39,68,0.9)',
                      border: '1px solid rgba(201,168,76,0.3)',
                      borderRadius: 12, cursor: 'pointer',
                      color: 'rgba(232,201,122,0.85)',
                      lineHeight: 1.6, transition: 'background 0.12s, border-color 0.12s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(44,62,100,0.95)'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.7)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(26,39,68,0.9)'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)'; }}
                  >
                    <span>{emoji}</span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>
              <RichEditor ref={notasEditorRef} value={form.notas} onChange={(v) => set('notas', v)} placeholder="Secretos, motivaciones ocultas, conexiones..." minHeight={70} />
            </div>
          </CollapseSection>

          <button type="submit" disabled={loading} className="btn-gold w-full mt-2 py-3 text-base">
            {loading ? 'Guardando...' : 'Guardar PNJ'}
          </button>
        </form>
      </div>

      {/* ── Panel derecho: statblock en tiempo real ── */}
      <div
        ref={statblockContainerRef}
        className="bg-dungeon/50"
        style={{ width: previewWidth, height: previewHeight, flexShrink: 0, overflow: 'auto', position: 'relative' }}
      >
        <div className="p-4 lg:p-5 flex flex-col items-center">

          {/* Barra de controles */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={() => setTwoColumns(v => !v)} style={{ ...CTRL_BTN, minWidth: 104 }}>
              {twoColumns ? '▌▐ Una columna' : '║ Dos columnas'}
            </button>
            <div style={{ width: 1, height: 18, background: 'rgba(201,168,76,0.2)', margin: '0 2px' }} />
            <button onClick={handlePrint} title="Imprimir" style={CTRL_BTN}>🖨️ Imprimir</button>
          </div>

          {/* Statblock */}
          <div ref={statblockRef}>
            <StatBlock npc={form} twoColumns={twoColumns} />
          </div>

        </div>

        {/* Esquinas de redimensionado */}
        {[
          { corner: 'nw', pos: { top: 0,    left:  0 }, radius: { borderTopLeftRadius:     4 } },
          { corner: 'ne', pos: { top: 0,    right: 0 }, radius: { borderTopRightRadius:    4 } },
          { corner: 'sw', pos: { bottom: 0, left:  0 }, radius: { borderBottomLeftRadius:  4 } },
          { corner: 'se', pos: { bottom: 0, right: 0 }, radius: { borderBottomRightRadius: 4 } },
        ].map(({ corner, pos, radius }) => (
          <div
            key={corner}
            onMouseDown={(e) => startCornerDrag(corner, e)}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.5'; }}
            style={{
              position: 'absolute', width: 16, height: 16,
              backgroundColor: '#FFD700', opacity: 0.5,
              cursor: `${corner}-resize`, zIndex: 10,
              ...pos, ...radius,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default NpcForm;
