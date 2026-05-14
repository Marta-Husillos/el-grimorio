import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setEnviado(true);
    } catch {
      setError('Error al enviar el email. Inténtalo de nuevo.');
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

        <h2 className="font-cinzel text-lg text-gold/80 mb-2">Recuperar contraseña</h2>

        {enviado ? (
          <div style={{ background: 'rgba(10,40,20,0.4)', border: '1px solid rgba(100,200,100,0.3)', borderRadius: 6, padding: '16px 14px', marginTop: 8 }}>
            <p className="text-green-300 text-sm font-baskerville">
              Si el email está registrado, recibirás un enlace de recuperación en breve.
            </p>
          </div>
        ) : (
          <>
            <p className="text-gold/50 text-sm font-baskerville mb-6">
              Introduce tu email y te enviaremos un enlace para restablecer tu contraseña.
            </p>

            {error && (
              <div style={{ background: 'rgba(122,28,28,0.3)', border: '1px solid rgba(122,28,28,0.6)', borderRadius: 6, padding: '10px 14px', marginBottom: 16 }}>
                <p className="text-red-300 text-sm font-baskerville">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gold/70 text-xs font-cinzel mb-1">Email</label>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  required autoFocus
                  className="input-dnd w-full"
                  placeholder="tu@email.com"
                />
              </div>
              <button
                type="submit" disabled={cargando}
                className="btn-gold w-full py-3 mt-2"
              >
                {cargando ? 'Enviando...' : 'Enviar enlace'}
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
