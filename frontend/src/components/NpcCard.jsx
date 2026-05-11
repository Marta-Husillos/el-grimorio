import { useState } from 'react';
import { Link } from 'react-router-dom';
import CompartirModal from './CompartirModal';

const STAT_KEYS = ['fuerza', 'destreza', 'constitucion', 'inteligencia', 'sabiduria', 'carisma'];
const STAT_LABELS = ['FUE', 'DES', 'CON', 'INT', 'SAB', 'CAR'];

function getMod(val) {
  const m = Math.floor((Number(val) - 10) / 2);
  return m >= 0 ? `+${m}` : `${m}`;
}

const ICON_BTN = {
  background: 'transparent', border: 'none', cursor: 'pointer',
  padding: 4, lineHeight: 0, transition: 'color 0.2s',
};

function IconEditar() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  );
}

function IconBorrar() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  );
}

function IconEstrella({ activa }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill={activa ? '#FFD700' : 'none'} stroke="#FFD700" strokeWidth="2">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
}

function NpcCard({ npc, onDelete, onToggleFavorito }) {
  const [confirmando, setConfirmando] = useState(false);
  const [eligiendoFaccion, setEligiendoFaccion] = useState(false);
  const [compartirAbierto, setCompartirAbierto] = useState(false);
  const [hoverEditar, setHoverEditar] = useState(false);
  const [hoverBorrar, setHoverBorrar] = useState(false);

  const handleAñadirCombate = (faccion) => {
    const existentes = (() => { try { return JSON.parse(localStorage.getItem('combate_nuevas_criaturas') || '[]'); } catch { return []; } })();
    existentes.push({
      id: npc.id,
      nombre: npc.nombre,
      tipo: npc.tipo,
      faccion,
      hp: npc.puntos_de_golpe,
      maxHp: npc.puntos_de_golpe,
      ac: npc.clase_armadura,
      iniciativa: npc.iniciativa,
      destreza: npc.destreza,
      fuerza: npc.fuerza,
      resistencias_dano: npc.resistencias_dano || [],
      inmunidades_dano: npc.inmunidades_dano || [],
      vulnerabilidades_dano: npc.vulnerabilidades_dano || [],
      inmunidades_condicion: npc.inmunidades_condicion || [],
      acciones: (() => { try { const v = npc.acciones; if (!v) return []; if (Array.isArray(v)) return v; return JSON.parse(v) || []; } catch { return []; } })(),
    });
    localStorage.setItem('combate_nuevas_criaturas', JSON.stringify(existentes));
    window.location.href = '/combate';
  };
  const etiqueta = (() => { try { const v = npc.etiquetas; if (!v) return ''; if (typeof v === 'string') { try { const p = JSON.parse(v); return Array.isArray(p) ? (p[0] || '') : String(p || ''); } catch { return v.trim(); } } return ''; } catch { return ''; } })();
  const tipoConEtiqueta = [npc.tipo, etiqueta ? `(${etiqueta})` : null].filter(Boolean).join(' ');
  const subtitle = [npc.tamano, tipoConEtiqueta].filter(Boolean).join(' ');

  return (
    <>
      <div className="relative bg-dungeon-mid border border-gold/40 rounded-lg overflow-hidden hover:border-gold/80 transition-all duration-200 hover:shadow-lg hover:shadow-gold/10 flex flex-col">
        {/* Cabecera roja */}
        <div className="bg-dragon px-4 py-3 relative">
          <button
            onClick={() => onToggleFavorito(npc.id)}
            title={npc.favorito ? 'Quitar de favoritos' : 'Añadir a favoritos'}
            style={{ position: 'absolute', top: 6, right: 8, ...ICON_BTN }}
          >
            <IconEstrella activa={npc.favorito} />
          </button>
          <h2 className="font-cinzel font-bold text-white text-lg leading-tight pr-6">{npc.nombre}</h2>
          {subtitle && (
            <p className="text-red-200 text-xs italic mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* Cuerpo */}
        <div className="px-4 py-3 flex-1 space-y-2">
          {npc.alineamiento && (
            <p className="text-gold/70 text-xs font-baskerville italic">{npc.alineamiento}</p>
          )}
          {/* Stats rápidas */}
          <div className="grid grid-cols-6 gap-1 my-2">
            {STAT_KEYS.map((key, i) => (
              <div key={key} className="text-center bg-dungeon rounded py-1">
                <p className="text-gold text-xs font-cinzel font-semibold">{STAT_LABELS[i]}</p>
                <p className="text-white text-xs">{getMod(npc[key] ?? 10)}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-3 text-xs text-gray-400 font-baskerville">
            {npc.clase_armadura != null && <span>CA {npc.clase_armadura}</span>}
            {npc.puntos_de_golpe != null && <span>PG {npc.puntos_de_golpe}</span>}
            {npc.velocidad && <span>{npc.velocidad}</span>}
          </div>
        </div>

        {/* Pie */}
        <div className="border-t border-gold/20 px-4 py-2">
          {confirmando ? (
            <div>
              <p className="text-gray-300 text-xs font-baskerville mb-2">
                ¿Seguro que quieres eliminar a <strong>{npc.nombre}</strong>? Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => onDelete(npc.id)}
                  className="flex-1 py-1 text-xs font-cinzel text-white rounded transition"
                  style={{ backgroundColor: 'rgba(153,27,27,0.8)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(185,28,28,0.9)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(153,27,27,0.8)'; }}
                >
                  Eliminar
                </button>
                <button
                  onClick={() => setConfirmando(false)}
                  className="flex-1 py-1 text-xs font-cinzel text-gold/60 hover:text-gold rounded border border-gold/30 hover:border-gold/60 transition"
                  style={{ background: 'none' }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {eligiendoFaccion ? (
                <div className="space-y-1.5">
                  <p className="text-gray-400 text-xs font-cinzel text-center">¿Rol en combate?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAñadirCombate('enemigo')}
                      className="flex-1 py-1.5 text-xs font-cinzel tracking-wide rounded border border-dragon/50 hover:border-dragon text-red-400 hover:text-red-300 transition"
                      style={{ background: 'rgba(122,28,28,0.15)' }}
                    >
                      ⚔️ Enemigo
                    </button>
                    <button
                      onClick={() => handleAñadirCombate('aliado')}
                      className="flex-1 py-1.5 text-xs font-cinzel tracking-wide rounded border border-blue-500/50 hover:border-blue-400 text-blue-400 hover:text-blue-300 transition"
                      style={{ background: 'rgba(91,164,245,0.1)' }}
                    >
                      🛡️ Aliado
                    </button>
                  </div>
                  <button
                    onClick={() => setEligiendoFaccion(false)}
                    className="w-full py-1 text-xs font-cinzel text-gold/40 hover:text-gold/70 transition"
                    style={{ background: 'none', border: 'none' }}
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEligiendoFaccion(true)}
                  className="w-full py-1.5 text-xs font-cinzel tracking-wide rounded border border-dragon/50 hover:border-dragon text-red-400 hover:text-red-300 transition"
                  style={{ background: 'rgba(122,28,28,0.1)' }}
                >
                  ⚔️ Añadir al combate
                </button>
              )}
              <div className="flex items-center justify-between">
                <Link
                  to={`/npc/${npc.id}`}
                  className="text-gold hover:text-gold-light text-xs font-cinzel tracking-wide transition"
                >
                  Ver ficha completa →
                </Link>
                <div className="flex gap-1 items-center">
                  <button
                    onClick={() => setCompartirAbierto(true)}
                    title="Compartir con grupo"
                    style={{ ...ICON_BTN, color: 'rgba(255,255,255,0.5)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#C9A84C'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  </button>
                  <Link
                    to={`/npc/${npc.id}/editar`}
                    title="Editar"
                    style={{ ...ICON_BTN, color: hoverEditar ? '#FFD700' : 'rgba(255,255,255,0.7)', display: 'inline-flex' }}
                    onMouseEnter={() => setHoverEditar(true)}
                    onMouseLeave={() => setHoverEditar(false)}
                  >
                    <IconEditar />
                  </Link>
                  <button
                    onClick={() => setConfirmando(true)}
                    title="Eliminar"
                    style={{ ...ICON_BTN, color: hoverBorrar ? '#e94560' : 'rgba(255,255,255,0.7)' }}
                    onMouseEnter={() => setHoverBorrar(true)}
                    onMouseLeave={() => setHoverBorrar(false)}
                  >
                    <IconBorrar />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {compartirAbierto && (
        <CompartirModal npc={npc} onCerrar={() => setCompartirAbierto(false)} />
      )}
    </>
  );
}

export default NpcCard;
