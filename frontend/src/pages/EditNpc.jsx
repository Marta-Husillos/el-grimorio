import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getNpcById, updateNpc } from '../services/api';
import NpcForm from '../components/NpcForm';

function EditNpc() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [npc, setNpc] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getNpcById(id)
      .then((res) => setNpc(res.data))
      .catch((error) => {
        if (error.response?.status === 401) {
          navigate('/login');
        } else if (error.response?.status === 403) {
          alert('No tienes permisos para editar esta ficha.');
          navigate(-1);
        } else {
          navigate('/');
        }
      });
  }, [id, navigate]);

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      await updateNpc(id, data);
      navigate(`/npc/${id}`);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/login');
      } else if (error.response?.status === 403) {
        alert(error.response.data?.message || 'No tienes permisos para editar esta ficha.');
      } else {
        alert('Error al actualizar el PNJ.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!npc) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="font-cinzel text-gold/40 animate-pulse tracking-widest">Cargando...</p>
      </div>
    );
  }

  return <NpcForm initialData={npc} onSubmit={handleSubmit} loading={loading} />;
}

export default EditNpc;
