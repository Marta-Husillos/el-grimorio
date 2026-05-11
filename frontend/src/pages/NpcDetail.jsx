import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { getNpcById, deleteNpc } from '../services/api';
import StatBlock from '../components/StatBlock';

function NpcDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [npc, setNpc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNpcById(id)
      .then((res) => setNpc(res.data))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar la ficha de "${npc.nombre}"? Esta acción no se puede deshacer.`)) return;
    await deleteNpc(id);
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="font-cinzel text-gold/40 animate-pulse tracking-widest">Cargando ficha...</p>
      </div>
    );
  }

  if (!npc) return null;

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-8">
      {/* Navegación y acciones */}
      <div className="no-print flex items-center justify-between mb-6">
        <Link to="/" className="font-cinzel text-gold/60 hover:text-gold text-sm transition">
          ← Volver al listado
        </Link>
        <div className="flex gap-3">
          <Link to={`/npc/${id}/editar`} className="btn-outline">
            Editar
          </Link>
          <button
            onClick={() => window.print()}
            className="btn-outline"
          >
            🖨️ Imprimir
          </button>
          <button
            onClick={handleDelete}
            className="border border-red-800/50 hover:border-red-600 text-red-500 hover:text-red-400 font-cinzel px-4 py-2 rounded transition text-sm tracking-wide"
          >
            Eliminar
          </button>
        </div>
      </div>

      {/* StatBlock centrado */}
      <div className="max-w-xl mx-auto">
        <StatBlock npc={npc} />
      </div>

      {/* Notas del DM (si las hay, se muestran separadas del statblock) */}
      {npc.notas && npc.notas.trim() && (
        <div className="max-w-xl mx-auto mt-6 border border-gold/20 rounded-lg p-5 bg-dungeon-mid">
          <h3 className="font-cinzel text-gold text-sm font-semibold tracking-wider mb-2 uppercase">
            {npc.titulo_notas || 'Notas del DM'}
          </h3>
          <div
            className="font-baskerville text-gray-300 text-sm"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(npc.notas) }}
          />
        </div>
      )}
    </div>
  );
}

export default NpcDetail;
