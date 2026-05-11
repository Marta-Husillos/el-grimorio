import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createNpc } from '../services/api';
import NpcForm from '../components/NpcForm';

function CreateNpc() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await createNpc(data);
      navigate(`/npc/${res.data.id}`);
    } catch (error) {
      alert('Error al crear el PNJ. Comprueba la conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return <NpcForm onSubmit={handleSubmit} loading={loading} />;
}

export default CreateNpc;
