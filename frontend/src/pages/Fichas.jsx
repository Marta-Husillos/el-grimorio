import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getNpcs, deleteNpc, toggleFavorito } from '../services/api';
import NpcCard from '../components/NpcCard';

const ALINEAMIENTOS = [
  'Legal bueno', 'Neutral bueno', 'Caótico bueno',
  'Legal neutral', 'Neutral', 'Caótico neutral',
  'Legal malvado', 'Neutral malvado', 'Caótico malvado',
  'Sin alineamiento',
];

const INPUT_STYLE = {
  background: 'rgba(0,0,0,0.35)',
  border: '1px solid rgba(201,168,76,0.25)',
  borderRadius: 6,
  color: '#e2e8f0',
  fontSize: '0.85rem',
  padding: '7px 12px',
  outline: 'none',
  width: '100%',
};

function DiceD20() {
  return (
    <svg viewBox="0 0 100 100" className="w-16 h-16 opacity-80" xmlns="http://www.w3.org/2000/svg">
      <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" stroke="#C9A84C" strokeWidth="2" fill="none" />
      <polygon points="50,5 95,27.5 50,42" fill="#C9A84C" opacity="0.3" />
      <polygon points="50,5 5,27.5 50,42" fill="#C9A84C" opacity="0.5" />
      <polygon points="5,27.5 50,42 5,72.5" fill="#C9A84C" opacity="0.25" />
      <polygon points="95,27.5 95,72.5 50,42" fill="#C9A84C" opacity="0.4" />
      <polygon points="5,72.5 50,42 50,95" fill="#C9A84C" opacity="0.35" />
      <polygon points="95,72.5 50,95 50,42" fill="#C9A84C" opacity="0.2" />
      <text x="50" y="65" textAnchor="middle" fontSize="22" fontFamily="'Cinzel',serif" fill="#C9A84C" fontWeight="bold">20</text>
    </svg>
  );
}

function Fichas() {
  const [npcs, setNpcs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroAlineamiento, setFiltroAlineamiento] = useState('');

  const cargarNpcs = () => {
    setLoading(true);
    getNpcs()
      .then((res) => setNpcs(res.data))
      .catch(() => setError('Error al conectar con el servidor'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargarNpcs();
  }, []);

  const handleDelete = (id) => {
    deleteNpc(id).then(cargarNpcs).catch(() => alert('Error al eliminar el PNJ'));
  };

  const handleToggleFavorito = (id) => {
    toggleFavorito(id).then(cargarNpcs).catch(() => {});
  };

  const tiposDisponibles = [...new Set(npcs.map((n) => n.tipo).filter(Boolean))].sort();

  const npcsFiltrados = npcs.filter((n) => {
    if (busqueda && !n.nombre?.toLowerCase().includes(busqueda.toLowerCase())) return false;
    if (filtroTipo && n.tipo !== filtroTipo) return false;
    if (filtroAlineamiento && n.alineamiento !== filtroAlineamiento) return false;
    return true;
  });

  const hayFiltros = busqueda || filtroTipo || filtroAlineamiento;

  return (
    <div style={{ animation: 'fadeIn 0.8s ease-in-out' }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div className="max-w-screen-xl mx-auto px-6 py-8">
        {/* Cabecera */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <DiceD20 />
          </div>
          <h1 className="font-cinzel text-4xl font-black text-gold tracking-widest mb-2">
            Fichas de PNJ
          </h1>
          <p className="font-cinzel text-gold/50 text-sm tracking-[0.3em] uppercase mb-6">
            Dungeons & Dragons 5ª Edición
          </p>
          <div className="w-48 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent mx-auto mb-6" />

          {/* Botones de acción */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link to="/crear" className="btn-gold px-8 py-3 text-base">
              + Crear nuevo PNJ
            </Link>
            <button
              onClick={() => window.dispatchEvent(new Event('open-import-modal'))}
              className="btn-outline px-6 py-3 text-base flex items-center gap-2"
            >
              <span>⬇</span>
              Importar desde D&D API
            </button>
          </div>
        </div>

        {/* Estado de carga / error */}
        {loading && (
          <div className="text-center py-20">
            <p className="font-cinzel text-gold/50 text-sm tracking-widest animate-pulse">
              Cargando fichas...
            </p>
          </div>
        )}
        {error && (
          <div className="text-center py-20">
            <p className="font-baskerville text-red-400">{error}</p>
          </div>
        )}

        {/* Grid de tarjetas */}
        {!loading && !error && (
          <>
            {npcs.length === 0 ? (
              <div className="text-center py-20 border border-gold/20 rounded-lg">
                <p className="font-cinzel text-gold/40 text-lg mb-2">No hay PNJs creados</p>
                <p className="font-baskerville text-gray-500 text-sm">
                  Crea tu primer personaje o importa uno desde la API de D&D 5e
                </p>
              </div>
            ) : (
              <>
                {/* Barra de búsqueda y filtros */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar personaje..."
                    style={{ ...INPUT_STYLE, flex: '2 1 180px' }}
                    onFocus={(e) => { e.target.style.borderColor = 'rgba(201,168,76,0.6)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'rgba(201,168,76,0.25)'; }}
                  />
                  <select
                    value={filtroTipo}
                    onChange={(e) => setFiltroTipo(e.target.value)}
                    style={{ ...INPUT_STYLE, flex: '1 1 140px' }}
                    onFocus={(e) => { e.target.style.borderColor = 'rgba(201,168,76,0.6)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'rgba(201,168,76,0.25)'; }}
                  >
                    <option value="">Todos los tipos</option>
                    {tiposDisponibles.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <select
                    value={filtroAlineamiento}
                    onChange={(e) => setFiltroAlineamiento(e.target.value)}
                    style={{ ...INPUT_STYLE, flex: '1 1 160px' }}
                    onFocus={(e) => { e.target.style.borderColor = 'rgba(201,168,76,0.6)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'rgba(201,168,76,0.25)'; }}
                  >
                    <option value="">Todos los alineamientos</option>
                    {ALINEAMIENTOS.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>

                <p className="font-cinzel text-gold/40 text-xs tracking-widest uppercase mb-6">
                  {npcsFiltrados.length} {npcsFiltrados.length === 1 ? 'personaje' : 'personajes'}
                  {hayFiltros && npcs.length !== npcsFiltrados.length && (
                    <span style={{ color: 'rgba(201,168,76,0.3)', fontWeight: 400 }}> de {npcs.length}</span>
                  )}
                </p>

                {npcsFiltrados.length === 0 ? (
                  <div className="text-center py-16 border border-gold/20 rounded-lg">
                    <p className="font-cinzel text-gold/40 text-base mb-1">No se encontró ningún PNJ con ese nombre.</p>
                    <p className="font-baskerville text-gray-500 text-sm">Prueba con otros filtros.</p>
                  </div>
                ) : (
                  (() => {
                    const favoritos = npcsFiltrados.filter((n) => n.favorito);
                    const resto = npcsFiltrados.filter((n) => !n.favorito);
                    return (
                      <>
                        {favoritos.length > 0 && (
                          <div className="mb-8">
                            <p className="font-cinzel text-gold/60 text-xs tracking-widest uppercase mb-3 flex items-center gap-2">
                              <span>★</span> Favoritos
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                              {favoritos.map((npc) => (
                                <NpcCard key={npc.id} npc={npc} onDelete={handleDelete} onToggleFavorito={handleToggleFavorito} />
                              ))}
                            </div>
                          </div>
                        )}
                        {resto.length > 0 && (
                          <div>
                            <p className="font-cinzel text-gold/40 text-xs tracking-widest uppercase mb-3">
                              {hayFiltros ? 'Resultados' : 'Todos los personajes'}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                              {resto.map((npc) => (
                                <NpcCard key={npc.id} npc={npc} onDelete={handleDelete} onToggleFavorito={handleToggleFavorito} />
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Fichas;
