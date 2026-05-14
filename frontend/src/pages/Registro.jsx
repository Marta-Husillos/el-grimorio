import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Registro() {
  const { registro } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      await registro(form.nombre, form.email, form.password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear la cuenta');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-dungeon flex items-center justify-center px-4">
      <div style={{
        background: '#16213e', border: '1px solid rgba(201,168,76,0.4)',
        borderRadius: 12, padding: '40px 36px', width: '100%', maxWidth: 420,
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      }}>
        <h1 className="font-cinzel text-2xl font-bold text-gold text-center mb-1">
          El Grimorio
        </h1>
        <p className="text-gold/50 text-sm text-center font-baskerville italic mb-8">D&D 5e</p>

        <h2 className="font-cinzel text-lg text-gold/80 mb-6">Crear cuenta</h2>

        {error && (
          <div style={{ background: 'rgba(122,28,28,0.3)', border: '1px solid rgba(122,28,28,0.6)', borderRadius: 6, padding: '10px 14px', marginBottom: 16 }}>
            <p className="text-red-300 text-sm font-baskerville">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gold/70 text-xs font-cinzel mb-1">Nombre</label>
            <input
              type="text" name="nombre" value={form.nombre} onChange={handleChange}
              required autoFocus
              className="input-dnd w-full"
              placeholder="Tu nombre de Dungeon Master"
            />
          </div>
          <div>
            <label className="block text-gold/70 text-xs font-cinzel mb-1">Email</label>
            <input
              type="email" name="email" value={form.email} onChange={handleChange}
              required
              className="input-dnd w-full"
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <label className="block text-gold/70 text-xs font-cinzel mb-1">Contraseña</label>
            <input
              type="password" name="password" value={form.password} onChange={handleChange}
              required minLength={6}
              className="input-dnd w-full"
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <button
            type="submit" disabled={cargando}
            className="btn-gold w-full py-3 mt-2"
          >
            {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-gold/40 text-sm text-center font-baskerville mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-gold hover:text-gold-light transition">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
