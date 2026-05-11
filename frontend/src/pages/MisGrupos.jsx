import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getGrupos, crearGrupo, unirseGrupo, getFichasGrupo, salirGrupo,
  getMiembros, cambiarRolMiembro, expulsarMiembro as apiExpulsarMiembro,
} from '../services/api';
import StatBlock from '../components/StatBlock';

// ── Configuración de roles ────────────────────────────────────────────────────

const ROLE_CFG = {
  propietaria: { label: '👑 Propietaria', color: '#FFD700', bg: 'rgba(255,215,0,0.12)',   border: 'rgba(255,215,0,0.35)' },
  editor:      { label: '✏️ Editor',      color: '#5ba4f5', bg: 'rgba(91,164,245,0.12)',  border: 'rgba(91,164,245,0.35)' },
  espectador:  { label: '👁 Espectador',  color: '#7a7a9a', bg: 'rgba(122,122,154,0.12)', border: 'rgba(122,122,154,0.35)' },
};

function RolBadge({ rol }) {
  const cfg = ROLE_CFG[rol] || ROLE_CFG.espectador;
  return (
    <span
      className="font-cinzel"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color, borderRadius: 4, padding: '2px 8px', fontSize: 11, whiteSpace: 'nowrap' }}
    >
      {cfg.label}
    </span>
  );
}

// ── Vista de detalle de un grupo ──────────────────────────────────────────────

function GrupoDetalle({ grupo, onVolver }) {
  const [fichas, setFichas]             = useState([]);
  const [miembros, setMiembros]         = useState([]);
  const [cargando, setCargando]         = useState(true);
  const [fichaVista, setFichaVista]     = useState(null);
  const [tab, setTab]                   = useState('fichas');
  const [pendienteRol, setPendienteRol] = useState(null);

  const esPropietaria  = grupo.rol === 'propietaria';
  const puedeEditar    = grupo.rol === 'propietaria' || grupo.rol === 'editor';
  const puedeVerCodigo = grupo.rol === 'propietaria' || grupo.rol === 'editor';

  useEffect(() => {
    Promise.all([getFichasGrupo(grupo.id), getMiembros(grupo.id)])
      .then(([fr, mr]) => { setFichas(fr.data); setMiembros(mr.data); })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, [grupo.id]);

  const handleCambiarRol = async (usuarioId, nuevoRol) => {
    setPendienteRol(usuarioId);
    try {
      await cambiarRolMiembro(grupo.id, usuarioId, nuevoRol);
      setMiembros((prev) => prev.map((m) => m.usuario_id === usuarioId ? { ...m, rol: nuevoRol } : m));
    } catch (err) {
      alert(err.response?.data?.error || 'Error al cambiar rol');
    } finally {
      setPendienteRol(null);
    }
  };

  const handleExpulsar = async (usuarioId, nombre) => {
    if (!window.confirm(`¿Expulsar a ${nombre} del grupo?`)) return;
    try {
      await apiExpulsarMiembro(grupo.id, usuarioId);
      setMiembros((prev) => prev.filter((m) => m.usuario_id !== usuarioId));
    } catch (err) {
      alert(err.response?.data?.error || 'Error al expulsar miembro');
    }
  };

  const tabStyle = (active) => ({
    background: active ? 'rgba(201,168,76,0.12)' : 'transparent',
    border: `1px solid ${active ? 'rgba(201,168,76,0.5)' : 'rgba(201,168,76,0.2)'}`,
    color: active ? '#C9A84C' : 'rgba(201,168,76,0.45)',
    borderRadius: 6, padding: '6px 18px', fontSize: 12, cursor: 'pointer',
  });

  return (
    <div>
      {/* Cabecera */}
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <button onClick={onVolver} className="text-gold/60 hover:text-gold transition font-cinzel text-sm">
          ← Mis grupos
        </button>
        <h2 className="font-cinzel text-xl font-bold text-gold">{grupo.nombre}</h2>
        <RolBadge rol={grupo.rol} />
      </div>

      {/* Código de invitación — solo propietaria y editor */}
      {puedeVerCodigo && (
        <div className="mb-5 p-3 rounded" style={{ background: 'rgba(201,168,76,0.07)', border: '1px solid rgba(201,168,76,0.2)' }}>
          <p className="text-gold/60 text-xs font-cinzel">
            Código de invitación: <strong className="text-gold tracking-widest">{grupo.codigo_invitacion}</strong>
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        <button style={tabStyle(tab === 'fichas')}   onClick={() => setTab('fichas')}   className="font-cinzel">
          Fichas {!cargando && `(${fichas.length})`}
        </button>
        <button style={tabStyle(tab === 'miembros')} onClick={() => setTab('miembros')} className="font-cinzel">
          Miembros {!cargando && `(${miembros.length})`}
        </button>
      </div>

      {cargando ? (
        <p className="text-gold/50 font-baskerville italic text-center py-8">Cargando...</p>
      ) : tab === 'fichas' ? (
        fichas.length === 0 ? (
          <p className="text-gold/40 font-baskerville italic text-center py-8">
            Aún no hay fichas compartidas en este grupo.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {fichas.map((npc) => (
              <div key={npc.id}
                className="bg-dungeon-mid border border-gold/30 rounded-lg overflow-hidden hover:border-gold/60 transition"
              >
                <div className="bg-dragon px-4 py-3 cursor-pointer" onClick={() => setFichaVista(npc)}>
                  <h3 className="font-cinzel font-bold text-white">{npc.nombre}</h3>
                  <p className="text-red-200 text-xs italic">{[npc.tamano, npc.tipo].filter(Boolean).join(', ')}</p>
                </div>
                <div className="px-4 py-2 flex items-center justify-between">
                  <p className="text-gold/50 text-xs font-cinzel">
                    Por: {npc.compartido_por_nombre || 'Desconocido'}
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setFichaVista(npc)}
                      className="text-xs font-cinzel text-gold/50 hover:text-gold transition"
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      Ver
                    </button>
                    {puedeEditar && (
                      <Link
                        to={`/npc/${npc.id}/editar`}
                        className="text-xs font-cinzel transition"
                        style={{ color: '#5ba4f5', textDecoration: 'none' }}
                      >
                        Editar
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        miembros.length === 0 ? (
          <p className="text-gold/40 font-baskerville italic text-center py-8">Sin miembros.</p>
        ) : (
          <div className="space-y-2">
            {miembros.map((m) => (
              <div key={m.usuario_id}
                className="flex items-center justify-between rounded-lg px-4 py-3"
                style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.15)' }}
              >
                <div>
                  <p className="font-cinzel text-gold/90 text-sm">{m.nombre}</p>
                  <p className="text-gold/40 text-xs font-baskerville">{m.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  {esPropietaria && m.rol !== 'propietaria' ? (
                    <>
                      <select
                        value={m.rol}
                        disabled={pendienteRol === m.usuario_id}
                        onChange={(e) => handleCambiarRol(m.usuario_id, e.target.value)}
                        className="font-cinzel text-xs rounded px-2 py-1"
                        style={{ background: '#16213e', border: '1px solid rgba(201,168,76,0.35)', color: '#C9A84C', cursor: 'pointer' }}
                      >
                        <option value="editor">✏️ Editor</option>
                        <option value="espectador">👁 Espectador</option>
                      </select>
                      <button
                        onClick={() => handleExpulsar(m.usuario_id, m.nombre)}
                        className="text-xs font-cinzel text-red-400/60 hover:text-red-400 transition"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px' }}
                      >
                        Expulsar
                      </button>
                    </>
                  ) : (
                    <RolBadge rol={m.rol} />
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Modal ficha completa */}
      {fichaVista && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={() => setFichaVista(null)}
        >
          <div
            className="relative overflow-auto"
            style={{ maxWidth: 500, width: '100%', maxHeight: '90vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setFichaVista(null)}
              style={{ position: 'absolute', top: 8, right: 8, zIndex: 10, background: 'rgba(26,26,46,0.8)', border: '1px solid rgba(201,168,76,0.4)', borderRadius: 6, color: '#C9A84C', cursor: 'pointer', padding: '4px 10px', fontSize: 12 }}
              className="font-cinzel"
            >
              ✕ Cerrar
            </button>
            <StatBlock npc={fichaVista} />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Página principal Mis Grupos ───────────────────────────────────────────────

export default function MisGrupos() {
  const [grupos, setGrupos]           = useState([]);
  const [cargando, setCargando]       = useState(true);
  const [grupoActivo, setGrupoActivo] = useState(null);

  const [mostrarCrear, setMostrarCrear]   = useState(false);
  const [mostrarUnirse, setMostrarUnirse] = useState(false);
  const [formCrear, setFormCrear]         = useState({ nombre: '', descripcion: '' });
  const [codigo, setCodigo]               = useState('');
  const [error, setError]                 = useState('');
  const [exito, setExito]                 = useState('');

  const cargarGrupos = () => {
    setCargando(true);
    getGrupos()
      .then((r) => setGrupos(r.data))
      .catch(() => setGrupos([]))
      .finally(() => setCargando(false));
  };

  useEffect(() => { cargarGrupos(); }, []);

  const handleCrear = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await crearGrupo(formCrear);
      setGrupos((prev) => [...prev, res.data]);
      setMostrarCrear(false);
      setFormCrear({ nombre: '', descripcion: '' });
      setExito(`Grupo "${res.data.nombre}" creado. Código: ${res.data.codigo_invitacion}`);
      setTimeout(() => setExito(''), 5000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear el grupo');
    }
  };

  const handleUnirse = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await unirseGrupo(codigo);
      setGrupos((prev) => [...prev, res.data]);
      setMostrarUnirse(false);
      setCodigo('');
      setExito(`Te has unido a "${res.data.nombre}"`);
      setTimeout(() => setExito(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al unirse al grupo');
    }
  };

  const handleSalir = async (grupoId) => {
    if (!window.confirm('¿Abandonar este grupo?')) return;
    try {
      await salirGrupo(grupoId);
      setGrupos((prev) => prev.filter((g) => g.id !== grupoId));
    } catch (err) {
      alert(err.response?.data?.error || 'Error al salir del grupo');
    }
  };

  if (grupoActivo) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <GrupoDetalle grupo={grupoActivo} onVolver={() => setGrupoActivo(null)} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-3">
        <h1 className="font-cinzel text-2xl font-bold text-gold">Mis Grupos</h1>
        <div className="flex gap-3">
          <button onClick={() => { setMostrarUnirse(true); setMostrarCrear(false); setError(''); }} className="btn-gold py-2 px-4 text-sm">
            Unirse con código
          </button>
          <button onClick={() => { setMostrarCrear(true); setMostrarUnirse(false); setError(''); }} className="btn-gold py-2 px-4 text-sm">
            ✚ Crear grupo
          </button>
        </div>
      </div>

      <div className="mb-6 font-baskerville text-sm text-gray-400/70">
        <p className="mb-1">Los grupos te permiten compartir tus fichas de PNJ con otros usuarios. Cada miembro tiene un rol:</p>
        <ul className="ml-4 space-y-0.5" style={{ listStyleType: 'disc' }}>
          <li><span className="text-gold/60 font-cinzel text-xs">Propietaria</span> — control total, puede editar y eliminar</li>
          <li><span className="text-gold/60 font-cinzel text-xs">Editor</span> — puede ver y editar las fichas del grupo</li>
          <li><span className="text-gold/60 font-cinzel text-xs">Espectador</span> — solo puede consultar las fichas</li>
        </ul>
      </div>

      {exito && (
        <div className="mb-4 p-3 rounded font-baskerville text-sm"
          style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#86efac' }}>
          {exito}
        </div>
      )}

      {/* Form crear */}
      {mostrarCrear && (
        <div className="mb-6 p-5 rounded-lg" style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.3)' }}>
          <h3 className="font-cinzel text-gold mb-4">Crear nuevo grupo</h3>
          {error && <p className="text-red-300 text-sm font-baskerville mb-3">{error}</p>}
          <form onSubmit={handleCrear} className="space-y-3">
            <input
              className="input-dnd w-full" placeholder="Nombre del grupo *" required
              value={formCrear.nombre} onChange={(e) => setFormCrear({ ...formCrear, nombre: e.target.value })}
            />
            <input
              className="input-dnd w-full" placeholder="Descripción (opcional)"
              value={formCrear.descripcion} onChange={(e) => setFormCrear({ ...formCrear, descripcion: e.target.value })}
            />
            <div className="flex gap-3">
              <button type="submit" className="btn-gold py-2 px-5 text-sm">Crear</button>
              <button type="button" onClick={() => setMostrarCrear(false)} className="text-gold/50 hover:text-gold text-sm font-cinzel transition">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* Form unirse */}
      {mostrarUnirse && (
        <div className="mb-6 p-5 rounded-lg" style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.3)' }}>
          <h3 className="font-cinzel text-gold mb-4">Unirse a un grupo</h3>
          {error && <p className="text-red-300 text-sm font-baskerville mb-3">{error}</p>}
          <form onSubmit={handleUnirse} className="flex gap-3">
            <input
              className="input-dnd flex-1" placeholder="Código de invitación (ej: A1B2C3D4)" required
              value={codigo} onChange={(e) => setCodigo(e.target.value)}
            />
            <button type="submit" className="btn-gold py-2 px-5 text-sm">Unirse</button>
            <button type="button" onClick={() => setMostrarUnirse(false)} className="text-gold/50 hover:text-gold text-sm font-cinzel transition">Cancelar</button>
          </form>
        </div>
      )}

      {cargando ? (
        <p className="text-gold/50 font-baskerville italic text-center py-12">Cargando grupos...</p>
      ) : grupos.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gold/40 font-baskerville italic text-lg">No perteneces a ningún grupo aún.</p>
          <p className="text-gold/30 font-baskerville text-sm mt-2">Crea uno o únete con un código de invitación.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {grupos.map((grupo) => (
            <div key={grupo.id}
              className="bg-dungeon-mid border border-gold/30 rounded-lg overflow-hidden hover:border-gold/60 transition"
            >
              <div className="bg-dungeon-light px-5 py-4 flex items-start justify-between">
                <div>
                  <h3 className="font-cinzel font-bold text-gold text-lg">{grupo.nombre}</h3>
                  {grupo.descripcion && (
                    <p className="text-gold/50 text-sm font-baskerville mt-1">{grupo.descripcion}</p>
                  )}
                </div>
                <div className="ml-3 mt-0.5">
                  <RolBadge rol={grupo.rol} />
                </div>
              </div>
              <div className="px-5 py-3">
                {(grupo.rol === 'propietaria' || grupo.rol === 'editor') && (
                  <p className="text-gold/40 text-xs font-cinzel mb-3">
                    Código: <span className="text-gold/70 font-bold tracking-widest">{grupo.codigo_invitacion}</span>
                  </p>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={() => setGrupoActivo(grupo)}
                    className="flex-1 py-1.5 text-xs font-cinzel text-gold/80 hover:text-gold rounded border border-gold/30 hover:border-gold/60 transition"
                    style={{ background: 'rgba(201,168,76,0.06)' }}
                  >
                    Ver fichas →
                  </button>
                  {grupo.rol !== 'propietaria' && (
                    <button
                      onClick={() => handleSalir(grupo.id)}
                      className="py-1.5 px-3 text-xs font-cinzel text-red-400/60 hover:text-red-400 transition"
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                      title="Abandonar grupo"
                    >
                      Salir
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
