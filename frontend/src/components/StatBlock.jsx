import DOMPurify from 'dompurify';

const DADO_POR_TAMANO = {
  'Diminuto':     { dado: 4,  media: 2.5 },
  'Pequeño':      { dado: 6,  media: 3.5 },
  'Mediano':      { dado: 8,  media: 4.5 },
  'Grande':       { dado: 10, media: 5.5 },
  'Enorme':       { dado: 12, media: 6.5 },
  'Gargantuesco': { dado: 20, media: 10.5 },
};

const NOMBRE_ARMADURA = {
  cuero:             'cuero',
  cuero_tachonado:   'cuero tachonado',
  camisote:          'camisote',
  coraza:            'coraza',
  cota_mallas:       'cota de mallas',
  armadura_placas:   'armadura de placas',
  natural:           'armadura natural',
};


const STAT_ROWS = [
  [
    { key: 'fuerza',       label: 'FUE', salvKey: 'fue' },
    { key: 'destreza',     label: 'DES', salvKey: 'des' },
    { key: 'constitucion', label: 'CON', salvKey: 'con' },
  ],
  [
    { key: 'inteligencia', label: 'INT', salvKey: 'int' },
    { key: 'sabiduria',    label: 'SAB', salvKey: 'sab' },
    { key: 'carisma',      label: 'CAR', salvKey: 'car' },
  ],
];

const VD_TABLE = [
  { key: '0',   xp: 10,     bc: 2 }, { key: '1/8', xp: 25,     bc: 2 },
  { key: '1/4', xp: 50,     bc: 2 }, { key: '1/2', xp: 100,    bc: 2 },
  { key: '1',   xp: 200,    bc: 2 }, { key: '2',   xp: 450,    bc: 2 },
  { key: '3',   xp: 700,    bc: 2 }, { key: '4',   xp: 1100,   bc: 2 },
  { key: '5',   xp: 1800,   bc: 3 }, { key: '6',   xp: 2300,   bc: 3 },
  { key: '7',   xp: 2900,   bc: 3 }, { key: '8',   xp: 3900,   bc: 3 },
  { key: '9',   xp: 5000,   bc: 4 }, { key: '10',  xp: 5900,   bc: 4 },
  { key: '11',  xp: 7200,   bc: 4 }, { key: '12',  xp: 8400,   bc: 4 },
  { key: '13',  xp: 10000,  bc: 5 }, { key: '14',  xp: 11500,  bc: 5 },
  { key: '15',  xp: 13000,  bc: 5 }, { key: '16',  xp: 15000,  bc: 5 },
  { key: '17',  xp: 18000,  bc: 6 }, { key: '18',  xp: 20000,  bc: 6 },
  { key: '19',  xp: 22000,  bc: 6 }, { key: '20',  xp: 25000,  bc: 6 },
  { key: '21',  xp: 33000,  bc: 7 }, { key: '22',  xp: 41000,  bc: 7 },
  { key: '23',  xp: 50000,  bc: 7 }, { key: '24',  xp: 62000,  bc: 7 },
  { key: '25',  xp: 75000,  bc: 8 }, { key: '26',  xp: 90000,  bc: 8 },
  { key: '27',  xp: 105000, bc: 8 }, { key: '28',  xp: 120000, bc: 8 },
  { key: '29',  xp: 135000, bc: 9 }, { key: '30',  xp: 155000, bc: 9 },
];

function getVDEntry(key) {
  return VD_TABLE.find((e) => e.key === String(key)) ?? VD_TABLE[0];
}

function formatVD(key) {
  if (!key && key !== '0') return null;
  const e = getVDEntry(key);
  return `VD ${key} (${e.xp.toLocaleString('es-ES')} XP; BC +${e.bc})`;
}

function formatArr(val) {
  if (Array.isArray(val)) return val.length ? val.join(', ') : null;
  if (!val) return null;
  try { const p = JSON.parse(val); return Array.isArray(p) && p.length ? p.join(', ') : (String(val).trim() || null); }
  catch { return String(val).trim() || null; }
}

const DANO_LABELS = {
  no_magico: 'contundente, perforante y cortante de ataques no mágicos',
  magico:    'contundente, perforante y cortante de ataques mágicos',
};

function formatDano(val) {
  let arr;
  if (Array.isArray(val)) { arr = val; }
  else if (!val) { return null; }
  else { try { arr = JSON.parse(val); if (!Array.isArray(arr)) arr = [String(val).trim()]; } catch { arr = String(val).split(',').map((s) => s.trim()).filter(Boolean); } }
  if (!arr.length) return null;
  return arr.map((item) => DANO_LABELS[item] ?? item).join(', ');
}

const COMBAT_TRAITS = [
  { key: 'habilidades',           label: 'Habilidades' },
  { key: 'resistencias_dano',     label: 'Resistencias al daño',     format: formatDano },
  { key: 'inmunidades_dano',      label: 'Inmunidades al daño',      format: formatDano },
  { key: 'vulnerabilidades_dano', label: 'Vulnerabilidades al daño', format: formatDano },
  { key: 'inmunidades_condicion', label: 'Inmunidades a condiciones', format: formatArr },
  { key: 'idiomas',               label: 'Idiomas' },
  { key: 'valor_desafio',         label: 'VD', format: formatVD },
];

function parseSentidos(raw) {
  if (!raw) return null;
  if (typeof raw === 'object' && !Array.isArray(raw)) return raw;
  try { return JSON.parse(raw); } catch { return { _raw: String(raw) }; }
}

function formatSentidos(raw) {
  const s = parseSentidos(raw);
  if (!s) return null;
  if (s._raw) return s._raw;
  const parts = [];
  if (s.oscuridad != null)  parts.push(`visión en la oscuridad ${s.oscuridad} m`);
  if (s.ciego != null)      parts.push(`visión ciega ${s.ciego} m`);
  if (s.verdadero != null)  parts.push(`visión verdadera ${s.verdadero} m`);
  if (s.sismico != null)    parts.push(`sentido sísmico ${s.sismico} m`);
  if (s.penumbra)           parts.push('visión en la penumbra');
  if (s.percepcion_pasiva != null) parts.push(`percepción pasiva ${s.percepcion_pasiva}`);
  return parts.length ? parts.join(', ') : null;
}

function getMod(val) {
  const m = Math.floor((Number(val || 10) - 10) / 2);
  return m >= 0 ? `+${m}` : `${m}`;
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

function parseItems(value) {
  if (!value) return null;
  if (Array.isArray(value)) {
    const valid = value.filter((it) => it.nombre || it.descripcion);
    return valid.length ? valid : null;
  }
  const str = String(value).trim();
  if (!str || str === '[]') return null;
  if (str.startsWith('[')) {
    try {
      const parsed = JSON.parse(str);
      if (Array.isArray(parsed)) {
        const valid = parsed.filter((it) => it.nombre || it.descripcion);
        return valid.length ? valid : null;
      }
    } catch {}
  }
  return [{ nombre: '', descripcion: str }];
}

function Divider() {
  return (
    <div style={{ height: '6px', background: 'linear-gradient(to right, #7A1C1C 0%, #C9A84C 50%, #7A1C1C 100%)', margin: '6px 0', breakAfter: 'avoid', pageBreakAfter: 'avoid' }} />
  );
}

function SectionTitle({ children }) {
  return (
    <h3 style={{ fontFamily: "'Cinzel', Georgia, serif", color: '#7A1C1C', borderBottom: '1px solid #7A1C1C', fontSize: '1.05rem', fontWeight: '700', paddingBottom: '2px', marginBottom: '6px' }}>
      {children}
    </h3>
  );
}

function ItemSection({ title, items, intro }) {
  if (!items) return null;
  return (
    <div style={{ padding: '6px 18px 8px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
      <SectionTitle>{title}</SectionTitle>
      {intro && <p style={{ fontSize: '0.82rem', margin: '4px 0 8px', color: '#555', fontStyle: 'italic' }}>{intro}</p>}
      {items.map((item, i) => (
        <p key={i} style={{ fontSize: '0.85rem', margin: '5px 0', lineHeight: 1.5 }}>
          {item.nombre && <><strong>{item.nombre}{item.multiataque && item.num_ataques > 1 ? ` (×${item.num_ataques})` : ''}.</strong>{' '}</>}
          <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(toHtml(item.descripcion)) }} />
        </p>
      ))}
    </div>
  );
}

function parseEtiqueta(val) {
  if (!val) return '';
  if (typeof val === 'string') {
    try { const p = JSON.parse(val); return Array.isArray(p) ? (p[0] || '') : String(p || ''); } catch { return val.trim(); }
  }
  return '';
}

function StatBlock({ npc, twoColumns = false }) {
  const etiqueta = parseEtiqueta(npc.etiquetas);
  const tipoConEtiqueta = [npc.tipo, etiqueta ? `(${etiqueta})` : null].filter(Boolean).join(' ');
  const subtitle = [npc.tamano, tipoConEtiqueta, npc.alineamiento].filter(Boolean).join(', ');

  // HP formula: PG = tipoDado + ((numDados - 1) * (tipoDado / 2)) + (numDados * modCON)
  const dadoInfo = DADO_POR_TAMANO[npc.tamano];
  const numDados = Number(npc.num_dados);
  const formulaPG = numDados > 0 && dadoInfo
    ? (() => {
        const modCON = Math.floor((Number(npc.constitucion || 10) - 10) / 2);
        const bonusCON = numDados * modCON;
        const diceStr = `${numDados}d${dadoInfo.dado}`;
        return bonusCON === 0 ? `(${diceStr})` : bonusCON > 0 ? `(${diceStr} + ${bonusCON})` : `(${diceStr} - ${Math.abs(bonusCON)})`;
      })()
    : null;

  // Iniciativa: usa el valor almacenado o calcula desde DES
  const modDES = Math.floor((Number(npc.destreza || 10) - 10) / 2);
  const iniciativaDisplay = (npc.iniciativa && String(npc.iniciativa).trim())
    ? npc.iniciativa
    : `${modDES >= 0 ? '+' : ''}${modDES} (${10 + modDES})`;

  // Armor type label
  const nombreArmadura = (() => {
    if (!npc.tipo_armadura || npc.tipo_armadura === 'sin_armadura') return null;
    if (npc.tipo_armadura.startsWith('Otro:')) return npc.tipo_armadura.slice(5).trim() || null;
    return NOMBRE_ARMADURA[npc.tipo_armadura] ?? null;
  })();

  const hasDescription = npc.descripcion && npc.descripcion.trim();
  const hasNotas = npc.notas && npc.notas.trim();
  const hasCombatTraits = COMBAT_TRAITS.some((t) => { const v = npc[t.key]; return Array.isArray(v) ? v.length > 0 : v && String(v).trim(); });


  const habilidades         = parseItems(npc.habilidades_especiales);
  const acciones            = parseItems(npc.acciones);
  const accionesAdicionales = parseItems(npc.acciones_adicionales);
  const reacciones          = parseItems(npc.reacciones);
  const accionesLeg         = parseItems(npc.acciones_legendarias);
  const accionesGuarida     = parseItems(npc.acciones_guarida);

  return (
    <div style={{ fontFamily: "'Libre Baskerville', Georgia, serif", backgroundColor: '#FDF1DC', color: '#1a1a1a', boxShadow: '0 4px 24px rgba(0,0,0,0.5)', borderRadius: '4px', overflow: 'hidden', minWidth: 0 }}>

      {/* ── Cabecera ── */}
      <div style={{ backgroundColor: '#7A1C1C', padding: '14px 18px' }}>
        <h2 style={{ fontFamily: "'Cinzel', Georgia, serif", color: '#FDF1DC', fontSize: '1.5rem', fontWeight: '700', lineHeight: 1.2, margin: 0 }}>
          {npc.nombre || 'Nombre del PNJ'}
        </h2>
        {subtitle && (
          <p style={{ color: '#f5c6c6', fontSize: '0.82rem', fontStyle: 'italic', marginTop: '4px' }}>{subtitle}</p>
        )}
      </div>

      {/* ── Cuerpo (una o dos columnas) ── */}
      <div style={twoColumns ? { columnCount: 2, columnGap: '16px', columnFill: 'balance', columnRule: '1px solid rgba(122,28,28,0.15)' } : {}}>

      <Divider />

      {/* ── CA, Iniciativa, PG, Velocidad ── */}
      <div style={{ padding: '4px 18px', fontSize: '0.88rem', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
        <p style={{ margin: '3px 0' }}>
          <strong>CA:</strong> {npc.clase_armadura ?? 10}{nombreArmadura ? ` (${nombreArmadura})` : ''}
          <span style={{ marginLeft: '1.5rem' }}><strong>Iniciativa:</strong> {iniciativaDisplay}</span>
        </p>
        <p style={{ margin: '3px 0' }}><strong>Puntos de Golpe:</strong> {npc.puntos_de_golpe ?? 10}{formulaPG ? ` ${formulaPG}` : ''}</p>
        <p style={{ margin: '3px 0' }}><strong>Velocidad:</strong> {npc.velocidad || '9 m'}</p>
        {(() => { const txt = formatSentidos(npc.sentidos); return txt ? <p style={{ margin: '3px 0' }}><strong>Sentidos:</strong> {txt}</p> : null; })()}
      </div>

      <Divider />

      {/* ── Tabla de estadísticas: 2 filas × 3 stats × (VALOR / MOD. / SALV.) ── */}
      <div style={{ padding: '6px 10px 4px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
        {STAT_ROWS.map((row, ri) => (
          <div
            key={ri}
            style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0,
              borderBottom: ri === 0 ? '1px solid rgba(122,28,28,0.2)' : 'none',
              paddingBottom: ri === 0 ? 6 : 0,
              paddingTop: ri === 1 ? 6 : 0,
            }}
          >
            {row.map((stat, si) => {
              const val = npc[stat.key] ?? 10;
              const mod = getMod(val);
              const salv = npc.salvaciones?.[stat.salvKey] && String(npc.salvaciones[stat.salvKey]).trim() ? npc.salvaciones[stat.salvKey] : mod;
              return (
                <div key={stat.key} style={{ textAlign: 'center', borderRight: si < 2 ? '1px solid rgba(122,28,28,0.15)' : 'none', padding: '0 4px' }}>
                  <p style={{ fontFamily: "'Cinzel', serif", color: '#7A1C1C', fontWeight: 700, fontSize: '0.65rem', marginBottom: 4 }}>
                    {stat.label}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                    {[{ sub: 'VALOR', v: val }, { sub: 'MOD.', v: mod }, { sub: 'SALV.', v: salv }].map(({ sub, v }) => (
                      <div key={sub} style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '0.5rem', color: '#888', margin: '0 0 1px', letterSpacing: '0.03em' }}>{sub}</p>
                        <p style={{ fontWeight: 700, fontSize: '0.85rem', lineHeight: 1 }}>{v}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <Divider />

      {/* ── Habilidades, resistencias, sentidos, idiomas, VD ── */}
      {hasCombatTraits && (
        <div style={{ padding: '2px 18px 4px', fontSize: '0.85rem', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
          {COMBAT_TRAITS.filter((t) => { const v = npc[t.key]; return Array.isArray(v) ? v.length > 0 : v && String(v).trim(); }).map(({ key, label, format }) => {
            const display = format ? format(npc[key]) : npc[key];
            if (!display) return null;
            return (
              <p key={key} style={{ margin: '4px 0', lineHeight: 1.5 }}>
                {key === 'valor_desafio' ? <strong><em>{display}</em></strong> : <><strong><em>{label}:</em></strong> {display}</>}
              </p>
            );
          })}
        </div>
      )}

      {hasCombatTraits && <Divider />}

      {/* ── Descripción ── */}
      {hasDescription && (
        <div style={{ padding: '6px 18px 2px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
          <p style={{ fontSize: '0.85rem', fontStyle: 'italic', color: '#444', margin: 0 }}>{npc.descripcion}</p>
        </div>
      )}

      {/* ── Atributos (habilidades especiales) ── */}
      <ItemSection title={npc.titulo_habilidades_especiales || 'Atributos'} items={habilidades} />

      {/* ── Acciones ── */}
      <ItemSection title={npc.titulo_acciones || 'Acciones'} items={acciones} />

      {/* ── Acciones adicionales ── */}
      <ItemSection title={npc.titulo_acciones_adicionales || 'Acciones adicionales'} items={accionesAdicionales} />

      {/* ── Reacciones ── */}
      <ItemSection title={npc.titulo_reacciones || 'Reacciones'} items={reacciones} />

      {/* ── Acciones legendarias ── */}
      <ItemSection
        title={npc.titulo_acciones_legendarias || 'Acciones legendarias'}
        items={accionesLeg}
        intro={npc.descripcion_acciones_legendarias || null}
      />

      {/* ── Acciones de guarida ── */}
      <ItemSection title={npc.titulo_acciones_guarida || 'Acciones de guarida'} items={accionesGuarida} />

      {/* ── Notas del DM ── */}
      {hasNotas && (
        <div style={{ padding: '6px 18px 10px', borderTop: '1px dashed #C9A84C', marginTop: '4px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
          <p style={{ fontSize: '0.75rem', color: '#777', fontWeight: 700, fontStyle: 'italic', margin: '0 0 4px' }}>
            {npc.titulo_notas || 'Notas del DM'}:
          </p>
          <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(toHtml(npc.notas)) }} style={{ fontSize: '0.75rem', color: '#777', fontStyle: 'italic', lineHeight: 1.5 }} />
        </div>
      )}

      </div>{/* fin columnas */}
    </div>
  );
}

export default StatBlock;
