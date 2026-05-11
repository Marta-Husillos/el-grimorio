import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginCreatures from '../components/LoginCreatures';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [activeField, setActiveField] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-dungeon flex items-center justify-center px-4">
      <div id="lc-card-anchor" style={{
        background: '#16213e', border: '1px solid rgba(201,168,76,0.4)',
        borderRadius: 12, padding: '40px 36px', width: '100%', maxWidth: 420,
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)', position: 'relative',
      }}>
        <LoginCreatures activeField={activeField} />
        <h1 className="font-cinzel text-2xl font-bold text-gold text-center mb-1">
          Fichas de PNJ
        </h1>
        <p className="text-gold/50 text-sm text-center font-baskerville italic mb-8">D&D 5e</p>

        <h2 className="font-cinzel text-lg text-gold/80 mb-6">Iniciar sesión</h2>

        {error && (
          <div style={{ background: 'rgba(122,28,28,0.3)', border: '1px solid rgba(122,28,28,0.6)', borderRadius: 6, padding: '10px 14px', marginBottom: 16 }}>
            <p className="text-red-300 text-sm font-baskerville">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gold/70 text-xs font-cinzel mb-1">Email</label>
            <input
              id="lc-email-input"
              type="email" name="email" value={form.email} onChange={handleChange}
              required autoFocus
              className="input-dnd w-full"
              placeholder="tu@email.com"
              onFocus={() => setActiveField('email')}
              onBlur={() => setActiveField(null)}
            />
          </div>
          <div>
            <label className="block text-gold/70 text-xs font-cinzel mb-1">Contraseña</label>
            <input
              type="password" name="password" value={form.password} onChange={handleChange}
              required
              className="input-dnd w-full"
              placeholder="••••••••"
              onFocus={() => setActiveField('password')}
              onBlur={() => setActiveField(null)}
            />
          </div>
          <button
            type="submit" disabled={cargando}
            className="btn-gold w-full py-3 mt-2"
          >
            {cargando ? 'Entrando...' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="text-gold/40 text-sm text-center font-baskerville mt-6">
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="text-gold hover:text-gold-light transition">
            Regístrate
          </Link>
        </p>
        <p className="text-gold/40 text-sm text-center font-baskerville mt-2">
          <Link to="/recuperar-contrasena" className="text-gold/60 hover:text-gold transition">
            ¿Olvidaste tu contraseña?
          </Link>
        </p>
      </div>
    </div>
  );
}
