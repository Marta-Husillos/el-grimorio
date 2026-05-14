import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [form, setForm] = useState({ password: '', confirmar: '' });
  const [exito, setExito] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmar) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setCargando(true);
    try {
      await api.post('/auth/reset-password', { token, password: form.password });
      setExito(true);
    } catch (err) {
      setError(err.response?.data?.error || 'El enlace no es válido o ha expirado.');
    } finally {
      setCargando(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-dungeon flex items-center justify-center px-4">
        <div style={{
          background: '#16213e', border: '1px solid rgba(201,168,76,0.4)',
          borderRadius: 12, padding: '40px 36px', width: '100%', maxWidth: 420,
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        }}>
          <p className="text-red-300 font-baskerville text-center">Enlace inválido.</p>
          <p className="text-gold/40 text-sm text-center font-baskerville mt-4">
            <Link to="/recuperar-contrasena" className="text-gold hover:text-gold-light transition">
              Solicitar nuevo enlace
            </Link>
          </p>
        </div>
      </div>
    );
  }

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

        <h2 className="font-cinzel text-lg text-gold/80 mb-6">Nueva contraseña</h2>

        {exito ? (
          <>
            <div style={{ background: 'rgba(10,40,20,0.4)', border: '1px solid rgba(100,200,100,0.3)', borderRadius: 6, padding: '16px 14px', marginBottom: 16 }}>
              <p className="text-green-300 text-sm font-baskerville">
                Contraseña restablecida correctamente.
              </p>
            </div>
            <p className="text-gold/40 text-sm text-center font-baskerville mt-4">
              <Link to="/login" className="text-gold hover:text-gold-light transition">
                Iniciar sesión
              </Link>
            </p>
          </>
        ) : (
          <>
            {error && (
              <div style={{ background: 'rgba(122,28,28,0.3)', border: '1px solid rgba(122,28,28,0.6)', borderRadius: 6, padding: '10px 14px', marginBottom: 16 }}>
                <p className="text-red-300 text-sm font-baskerville">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gold/70 text-xs font-cinzel mb-1">Nueva contraseña</label>
                <input
                  type="password" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required autoFocus minLength={6}
                  className="input-dnd w-full"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-gold/70 text-xs font-cinzel mb-1">Confirmar contraseña</label>
                <input
                  type="password" value={form.confirmar}
                  onChange={(e) => setForm({ ...form, confirmar: e.target.value })}
                  required minLength={6}
                  className="input-dnd w-full"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit" disabled={cargando}
                className="btn-gold w-full py-3 mt-2"
              >
                {cargando ? 'Guardando...' : 'Restablecer contraseña'}
              </button>
            </form>
          </>
        )}

        <p className="text-gold/40 text-sm text-center font-baskerville mt-6">
          <Link to="/login" className="text-gold hover:text-gold-light transition">
            ← Volver al inicio de sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
