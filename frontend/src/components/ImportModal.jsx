import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getExternalMonstruo, importarMonstruo, buscarMonstruosCache } from '../services/api';

// Los datos vienen de Open5e tal cual (valores en inglés).
// Los campos mapeados son: nombre, tamano, tipo, alineamiento, clase_armadura,
// puntos_de_golpe, dados_pg, velocidad, fuerza, destreza, constitucion,
// inteligencia, sabiduria, carisma, habilidades_especiales, acciones,
// inmunidades_dano, resistencias_dano, inmunidades_condicion, cr, xp

function getMod(val) {
  const m = Math.floor((Number(val || 10) - 10) / 2);
  return m >= 0 ? `+${m}` : `${m}`;
}

const STATS = [
  { key: 'fuerza', label: 'FUE' },
  { key: 'destreza', label: 'DES' },
  { key: 'constitucion', label: 'CON' },
  { key: 'inteligencia', label: 'INT' },
  { key: 'sabiduria', label: 'SAB' },
  { key: 'carisma', label: 'CAR' },
];

// ── Vista previa del monstruo ─────────────────────────────────────────────────

function MonsterPreview({ monster, onImport, importing }) {
  const subtitle = [monster.tamano, monster.tipo, monster.alineamiento]
    .filter(Boolean)
    .join(', ');

  // Acepta JSON array de {nombre,descripcion} o texto plano separado por \n\n
  const parsearEntradas = (valor) => {
    if (!valor) return [];
    if (typeof valor === 'string' && valor.trimStart().startsWith('[')) {
      try {
        const parsed = JSON.parse(valor);
        if (Array.isArray(parsed)) return parsed;
      } catch { /* fallthrough */ }
    }
    return valor.split('\n\n').filter(Boolean).map((bloque) => {
      const punto = bloque.indexOf('.');
      return {
        nombre: punto > -1 ? bloque.slice(0, punto + 1) : '',
        descripcion: punto > -1 ? bloque.slice(punto + 1).trim() : bloque,
      };
    });
  };
  const habilidades = parsearEntradas(monster.habilidades_especiales);
  const acciones = parsearEntradas(monster.acciones);

  return (
    <div className="h-full flex flex-col" style={{ fontFamily: "'Libre Baskerville', Georgia, serif" }}>
      {/* Cabecera */}
      <div style={{ backgroundColor: '#7A1C1C', padding: '14px 18px', flexShrink: 0 }}>
        <h3 style={{ fontFamily: "'Cinzel', serif", color: '#FDF1DC', fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>
          {monster.nombre}
        </h3>
        {subtitle && (
          <p style={{ color: '#f5c6c6', fontSize: '0.8rem', fontStyle: 'italic', marginTop: 4 }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Separador dorado */}
      <div style={{ height: 5, background: 'linear-gradient(to right, #7A1C1C, #C9A84C, #7A1C1C)', flexShrink: 0 }} />

      {/* Cuerpo scrollable */}
      <div style={{ backgroundColor: '#FDF1DC', color: '#1a1a1a', flex: 1, overflowY: 'auto', padding: '10px 18px' }}>

        {/* Estadísticas de combate */}
        <div style={{ fontSize: '0.88rem', marginBottom: 6 }}>
          <p style={{ margin: '3px 0' }}>
            <strong>Clase de Armadura</strong> {monster.clase_armadura}
          </p>
          <p style={{ margin: '3px 0' }}>
            <strong>Puntos de Golpe</strong> {monster.puntos_de_golpe}
            {monster.dados_pg && <span style={{ color: '#666' }}> ({monster.dados_pg})</span>}
          </p>
          <p style={{ margin: '3px 0' }}>
            <strong>Velocidad</strong> {monster.velocidad}
          </p>
          {monster.cr != null && (
            <p style={{ margin: '3px 0' }}>
              <strong>Desafío</strong> {monster.cr}
              {monster.xp != null && <span style={{ color: '#666' }}> ({monster.xp.toLocaleString()} XP)</span>}
            </p>
          )}
        </div>

        {/* Separador dorado */}
        <div style={{ height: 5, background: 'linear-gradient(to right, #7A1C1C, #C9A84C, #7A1C1C)', margin: '6px 0' }} />

        {/* Las 6 características */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 4, textAlign: 'center', marginBottom: 6 }}>
          {STATS.map(({ key, label }) => (
            <div key={key}>
              <p style={{ color: '#7A1C1C', fontWeight: 700, fontSize: '0.68rem', fontFamily: "'Cinzel',serif" }}>{label}</p>
              <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{monster[key] ?? 10}</p>
              <p style={{ color: '#555', fontSize: '0.72rem' }}>({getMod(monster[key] ?? 10)})</p>
            </div>
          ))}
        </div>

        {/* Separador dorado */}
        <div style={{ height: 5, background: 'linear-gradient(to right, #7A1C1C, #C9A84C, #7A1C1C)', margin: '6px 0' }} />

        {/* Sentidos, inmunidades y resistencias */}
        {monster.sentidos && (
          <p style={{ fontSize: '0.8rem', margin: '4px 0' }}>
            <strong>Sentidos:</strong> {monster.sentidos}
          </p>
        )}
        {monster.inmunidades_dano && (
          <p style={{ fontSize: '0.8rem', margin: '4px 0' }}>
            <strong>Inmunidades al daño:</strong> {monster.inmunidades_dano}
          </p>
        )}
        {monster.resistencias_dano && (
          <p style={{ fontSize: '0.8rem', margin: '4px 0' }}>
            <strong>Resistencias:</strong> {monster.resistencias_dano}
          </p>
        )}
        {monster.inmunidades_condicion && (
          <p style={{ fontSize: '0.8rem', margin: '4px 0' }}>
            <strong>Inmunidades a condiciones:</strong> {monster.inmunidades_condicion}
          </p>
        )}

        {/* Habilidades especiales */}
        {habilidades.length > 0 && (
          <div style={{ marginTop: 8, marginBottom: 4 }}>
            {habilidades.slice(0, 3).map((h, i) => {
              const desc = h.descripcion ?? '';
              return (
                <p key={i} style={{ fontSize: '0.8rem', margin: '5px 0' }}>
                  {h.nombre && <em><strong>{h.nombre} </strong></em>}
                  {desc.slice(0, 120)}{desc.length > 120 ? '…' : ''}
                </p>
              );
            })}
            {habilidades.length > 3 && (
              <p style={{ fontSize: '0.75rem', color: '#888', fontStyle: 'italic' }}>
                +{habilidades.length - 3} habilidades más
              </p>
            )}
          </div>
        )}

        {/* Acciones */}
        {acciones.length > 0 && (
          <div style={{ marginTop: 6 }}>
            <h4 style={{ fontFamily: "'Cinzel',serif", color: '#7A1C1C', borderBottom: '1px solid #7A1C1C', fontSize: '1rem', fontWeight: 700, marginBottom: 4 }}>
              Acciones
            </h4>
            {acciones.slice(0, 3).map((a, i) => {
              const desc = a.descripcion ?? '';
              return (
                <p key={i} style={{ fontSize: '0.8rem', margin: '5px 0' }}>
                  {a.nombre && <em><strong>{a.nombre} </strong></em>}
                  {desc.slice(0, 120)}{desc.length > 120 ? '…' : ''}
                </p>
              );
            })}
            {acciones.length > 3 && (
              <p style={{ fontSize: '0.75rem', color: '#888', fontStyle: 'italic' }}>
                +{acciones.length - 3} acciones más
              </p>
            )}
          </div>
        )}
      </div>

      {/* Botón importar */}
      <div style={{ backgroundColor: '#16213e', padding: '12px 18px', flexShrink: 0, borderTop: '1px solid rgba(201,168,76,0.3)' }}>
        <button
          onClick={onImport}
          disabled={importing}
          className="btn-gold w-full py-3 text-sm"
        >
          {importing ? 'Importando...' : `Importar "${monster.nombre}"`}
        </button>
      </div>
    </div>
  );
}

// ── Modal principal ───────────────────────────────────────────────────────────

function ImportModal({ onClose }) {
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  const [lista, setLista] = useState([]);   // [{slug, displayName}]
  const [filtro, setFiltro] = useState('');
  const [cargando, setCargando] = useState(false);
  const [errorLista, setErrorLista] = useState(null);
  const [totalResultados, setTotalResultados] = useState(0);

  const [seleccionado, setSeleccionado] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  const [importing, setImporting] = useState(false);
  const [importOk, setImportOk] = useState(null);

  // Busca en la caché de nombres traducidos (nombre_es y nombre_en)
  const buscarConCache = (texto) => {
    setCargando(true);
    setErrorLista(null);

    buscarMonstruosCache(texto)
      .then((res) => {
        const resultados = res.data;
        setLista(resultados.map((m) => ({ slug: m.index, displayName: m.nombre_es })));
        setTotalResultados(resultados.length);
      })
      .catch(() => setErrorLista('No se pudo cargar la lista. Inténtalo de nuevo.'))
      .finally(() => setCargando(false));
  };

  // Carga inicial + foco + tecla Escape
  useEffect(() => {
    buscarConCache('');
    setTimeout(() => searchRef.current?.focus(), 100);
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      clearTimeout(debounceRef.current);
    };
  }, [onClose]);

  // Input con debounce de 400 ms
  const handleFiltro = (e) => {
    const valor = e.target.value;
    setFiltro(valor);
    setSeleccionado(null);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => buscarConCache(valor), 400);
  };

  // Detalle del monstruo seleccionado
  useEffect(() => {
    if (!seleccionado) return;
    setCargandoDetalle(true);
    setDetalle(null);
    setImportOk(null);
    getExternalMonstruo(seleccionado.slug)
      .then((res) => setDetalle(res.data))
      .catch(() => setDetalle(null))
      .finally(() => setCargandoDetalle(false));
  }, [seleccionado]);

  const handleImportar = async () => {
    if (!seleccionado) return;
    setImporting(true);
    try {
      const res = await importarMonstruo(seleccionado.slug);
      setImportOk(res.data.nombre);
      setTimeout(() => {
        onClose();
        navigate(`/npc/${res.data.id}`);
      }, 1200);
    } catch {
      alert('Error al importar el monstruo. Inténtalo de nuevo.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full flex flex-col"
        style={{
          maxWidth: 900,
          height: 'min(90vh, 700px)',
          backgroundColor: '#16213e',
          border: '1px solid rgba(201,168,76,0.4)',
          borderRadius: 8,
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
        }}
      >
        {/* Cabecera del modal */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px', borderBottom: '1px solid rgba(201,168,76,0.3)', flexShrink: 0,
        }}>
          <div>
            <h2 className="font-cinzel font-bold text-gold text-lg tracking-wide">
              Importar desde Open5e
            </h2>
            <p className="font-baskerville text-gray-400 text-xs mt-0.5">
              {cargando
                ? 'Buscando…'
                : filtro
                  ? `${totalResultados} resultado${totalResultados !== 1 ? 's' : ''} para "${filtro}"`
                  : `${totalResultados} monstruos · D&D 5e API`}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gold transition text-xl leading-none">
            ✕
          </button>
        </div>

        {/* Cuerpo */}
        <div className="flex flex-1 overflow-hidden">

          {/* Columna izquierda: búsqueda + lista */}
          <div className="flex flex-col border-r" style={{ width: 280, flexShrink: 0, borderColor: 'rgba(201,168,76,0.2)' }}>
            <div style={{ padding: '12px 14px', flexShrink: 0, borderBottom: '1px solid rgba(201,168,76,0.15)' }}>
              <div className="relative">
                <input
                  ref={searchRef}
                  type="text"
                  value={filtro}
                  onChange={handleFiltro}
                  placeholder="Buscar monstruo..."
                  className="input-dnd text-sm pr-8"
                />
                {cargando && (
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gold/60 text-xs animate-spin">
                    ◌
                  </span>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">

              {/* Spinner búsqueda inicial (lista vacía) */}
              {cargando && lista.length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <p className="font-cinzel text-gold/40 text-xs animate-pulse tracking-widest">
                    Buscando…
                  </p>
                </div>
              )}

              {/* Error */}
              {errorLista && (
                <p className="font-baskerville text-red-400 text-xs text-center py-8 px-4">
                  {errorLista}
                </p>
              )}

              {/* Lista de resultados */}
              {!errorLista && lista.map((m) => (
                <button
                  key={m.slug}
                  type="button"
                  onClick={() => setSeleccionado(m)}
                  className="w-full text-left px-4 py-2.5 transition-all"
                  style={{
                    backgroundColor: seleccionado?.slug === m.slug ? 'rgba(201,168,76,0.15)' : 'transparent',
                    borderLeft: seleccionado?.slug === m.slug ? '3px solid #C9A84C' : '3px solid transparent',
                  }}
                >
                  <p className="font-baskerville text-sm" style={{ color: seleccionado?.slug === m.slug ? '#C9A84C' : '#ccc' }}>
                    {m.displayName}
                  </p>
                </button>
              ))}

              {/* Sin resultados */}
              {!cargando && !errorLista && lista.length === 0 && (
                <p className="font-baskerville text-gray-500 text-xs text-center py-8 px-4">
                  No se encontraron monstruos con ese nombre
                </p>
              )}

            </div>
          </div>

          {/* Columna derecha: previsualización */}
          <div className="flex-1 overflow-hidden">
            {!seleccionado && (
              <div className="h-full flex flex-col items-center justify-center text-center px-8">
                <p className="font-cinzel text-gold/30 text-sm tracking-widest mb-2">Selecciona un monstruo</p>
                <p className="font-baskerville text-gray-600 text-xs">
                  Haz clic en cualquier monstruo de la lista para ver su ficha de estadísticas
                </p>
              </div>
            )}
            {seleccionado && cargandoDetalle && (
              <div className="h-full flex items-center justify-center">
                <p className="font-cinzel text-gold/40 text-sm animate-pulse tracking-widest">Cargando estadísticas...</p>
              </div>
            )}
            {seleccionado && !cargandoDetalle && detalle && (
              <div className="h-full flex flex-col relative">
                {importOk && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center" style={{ backgroundColor: 'rgba(22,33,62,0.95)' }}>
                    <p className="font-cinzel text-gold text-2xl mb-2">¡Importado!</p>
                    <p className="font-baskerville text-gray-300 text-sm">"{importOk}" guardado correctamente</p>
                    <p className="font-baskerville text-gray-500 text-xs mt-2">Redirigiendo...</p>
                  </div>
                )}
                <MonsterPreview monster={detalle} onImport={handleImportar} importing={importing} />
              </div>
            )}
            {seleccionado && !cargandoDetalle && !detalle && (
              <div className="h-full flex items-center justify-center">
                <p className="font-baskerville text-red-400 text-sm">Error al cargar los detalles del monstruo</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImportModal;
