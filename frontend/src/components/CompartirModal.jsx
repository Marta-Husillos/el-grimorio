import { useState, useEffect } from 'react';
import { getGrupos, compartirFichaGrupo, quitarFichaGrupo } from '../services/api';

export default function CompartirModal({ npc, onCerrar }) {
  const [grupos, setGrupos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [pendiente, setPendiente] = useState(null); // grupoId en proceso

  useEffect(() => {
    console.log('[CompartirModal] npc.id =', npc.id, '| npc =', npc);
    getGrupos({ npc_id: npc.id })
      .then((r) => {
        console.log('[CompartirModal] grupos recibidos:', r.data);
        setGrupos(r.data);
      })
      .catch((err) => {
        console.error('[CompartirModal] error al cargar grupos:', err);
        setGrupos([]);
      })
      .finally(() => setCargando(false));
  }, [npc.id]);

  const handleCompartir = async (grupoId) => {
    setPendiente(grupoId);
    try {
      await compartirFichaGrupo(grupoId, npc.id);
      setGrupos((prev) =>
        prev.map((g) => g.id === grupoId ? { ...g, yaCompartida: true } : g)
      );
    } catch (err) {
      alert(err.response?.data?.error || 'Error al compartir');
    } finally {
      setPendiente(null);
    }
  };

  const handleQuitar = async (grupoId) => {
    setPendiente(grupoId);
    try {
      await quitarFichaGrupo(grupoId, npc.id);
      setGrupos((prev) =>
        prev.map((g) => g.id === grupoId ? { ...g, yaCompartida: false } : g)
      );
    } catch (err) {
      alert(err.response?.data?.error || 'Error al retirar');
    } finally {
      setPendiente(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={onCerrar}
    >
      <div
        style={{ background: '#16213e', border: '1px solid rgba(201,168,76,0.4)', borderRadius: 12, padding: '28px 28px', width: '100%', maxWidth: 400, boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-cinzel text-gold font-bold text-lg">Compartir ficha</h3>
          <button onClick={onCerrar} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(201,168,76,0.5)', fontSize: '1.2rem', lineHeight: 1 }}>✕</button>
        </div>
        <p className="text-gold/60 font-baskerville text-sm mb-5">
          <strong className="text-gold/80">{npc.nombre}</strong> — elige con qué grupos compartir:
        </p>

        {cargando ? (
          <p className="text-gold/40 font-baskerville italic text-center py-6">Cargando grupos...</p>
        ) : grupos.length === 0 ? (
          <p className="text-gold/40 font-baskerville italic text-center py-6">
            No perteneces a ningún grupo aún.
          </p>
        ) : (
          <div className="space-y-2">
            {grupos.map((grupo) => (
              <div key={grupo.id}
                className="flex items-center justify-between rounded-lg px-4 py-3"
                style={{
                  background: grupo.yaCompartida ? 'rgba(34,197,94,0.07)' : 'rgba(201,168,76,0.06)',
                  border: `1px solid ${grupo.yaCompartida ? 'rgba(34,197,94,0.3)' : 'rgba(201,168,76,0.2)'}`,
                }}
              >
                <div>
                  <p className="font-cinzel text-gold/90 text-sm">{grupo.nombre}</p>
                  <p className="text-gold/40 text-xs font-cinzel">{grupo.codigo_invitacion}</p>
                </div>

                {grupo.yaCompartida ? (
                  <div className="flex items-center gap-2">
                    <span className="text-green-400 font-cinzel text-xs">✓ Compartida</span>
                    <button
                      onClick={() => handleQuitar(grupo.id)}
                      disabled={pendiente === grupo.id}
                      title="Dejar de compartir"
                      className="text-xs font-cinzel text-red-400/60 hover:text-red-400 transition"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px' }}
                    >
                      {pendiente === grupo.id ? '...' : 'Quitar'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleCompartir(grupo.id)}
                    disabled={pendiente === grupo.id}
                    className="text-xs font-cinzel text-gold/70 hover:text-gold transition py-1 px-3 rounded border border-gold/30 hover:border-gold/60"
                    style={{ background: 'rgba(201,168,76,0.08)' }}
                  >
                    {pendiente === grupo.id ? '...' : 'Compartir'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
