import { useState, useEffect, useRef } from 'react';
import api from '../services/api';

const CARD_STYLE = {
  background: '#16213e',
  border: '1px solid rgba(201,168,76,0.3)',
  borderRadius: 10,
  padding: '28px 28px',
  marginBottom: 20,
};

const LABEL_STYLE = {
  display: 'block',
  color: 'rgba(201,168,76,0.7)',
  fontSize: '0.7rem',
  fontFamily: 'Cinzel, serif',
  letterSpacing: '0.1em',
  marginBottom: 6,
};

const INPUT_STYLE = {
  background: 'rgba(0,0,0,0.35)',
  border: '1px solid rgba(201,168,76,0.25)',
  borderRadius: 6,
  color: '#e2e8f0',
  fontSize: '0.9rem',
  padding: '9px 13px',
  width: '100%',
  outline: 'none',
  fontFamily: 'Georgia, serif',
};

function Mensaje({ ok, texto }) {
  if (!texto) return null;
  return (
    <p style={{
      marginTop: 10, fontSize: '0.82rem', fontFamily: 'Georgia, serif',
      color: ok ? '#86efac' : '#fca5a5',
    }}>
      {texto}
    </p>
  );
}

function Inicial({ nombre, size = 100 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'rgba(201,168,76,0.15)',
      border: '2px solid #C9A84C',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <span style={{
        fontFamily: 'Cinzel, serif', fontWeight: 700,
        fontSize: size * 0.38, color: '#C9A84C',
      }}>
        {nombre?.charAt(0).toUpperCase() || '?'}
      </span>
    </div>
  );
}

export default function Perfil() {
  const [datos, setDatos] = useState(null);
  const [nombre, setNombre] = useState('');
  const [msgNombre, setMsgNombre] = useState({ ok: false, texto: '' });
  const [guardandoNombre, setGuardandoNombre] = useState(false);

  const [pass, setPass] = useState({ actual: '', nueva: '', confirmar: '' });
  const [msgPass, setMsgPass] = useState({ ok: false, texto: '' });
  const [guardandoPass, setGuardandoPass] = useState(false);

  const [subiendoAvatar, setSubiendoAvatar] = useState(false);
  const [msgAvatar, setMsgAvatar] = useState({ ok: false, texto: '' });
  const fileRef = useRef(null);

  useEffect(() => {
    api.get('/perfil').then((res) => {
      setDatos(res.data);
      setNombre(res.data.nombre);
    }).catch(() => {});
  }, []);

  const handleAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setMsgAvatar({ ok: false, texto: 'La imagen no puede superar los 10 MB.' });
      e.target.value = '';
      return;
    }
    setSubiendoAvatar(true);
    setMsgAvatar({ ok: false, texto: '' });
    const form = new FormData();
    form.append('avatar', file);
    try {
      const res = await api.post('/perfil/avatar', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setDatos((d) => ({ ...d, avatar_url: res.data.avatar_url }));
      setMsgAvatar({ ok: true, texto: 'Foto actualizada.' });
      window.dispatchEvent(new CustomEvent('avatar-actualizado', { detail: { avatar_url: res.data.avatar_url } }));
    } catch (err) {
      setMsgAvatar({ ok: false, texto: err.response?.data?.error || 'Error al subir la imagen.' });
    } finally {
      setSubiendoAvatar(false);
      e.target.value = '';
    }
  };

  const handleNombre = async (e) => {
    e.preventDefault();
    setMsgNombre({ ok: false, texto: '' });
    if (nombre.trim().length < 2) {
      setMsgNombre({ ok: false, texto: 'El nombre debe tener al menos 2 caracteres.' });
      return;
    }
    setGuardandoNombre(true);
    try {
      const res = await api.put('/perfil/nombre', { nombre });
      setDatos((d) => ({ ...d, nombre: res.data.nombre }));
      setMsgNombre({ ok: true, texto: 'Nombre actualizado.' });
    } catch (err) {
      setMsgNombre({ ok: false, texto: err.response?.data?.error || 'Error al actualizar el nombre.' });
    } finally {
      setGuardandoNombre(false);
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    setMsgPass({ ok: false, texto: '' });
    if (pass.nueva !== pass.confirmar) {
      setMsgPass({ ok: false, texto: 'Las contraseñas nuevas no coinciden.' });
      return;
    }
    if (pass.nueva.length < 8) {
      setMsgPass({ ok: false, texto: 'La nueva contraseña debe tener al menos 8 caracteres.' });
      return;
    }
    setGuardandoPass(true);
    try {
      await api.put('/perfil/contrasena', { actual: pass.actual, nueva: pass.nueva });
      setPass({ actual: '', nueva: '', confirmar: '' });
      setMsgPass({ ok: true, texto: 'Contraseña actualizada correctamente.' });
    } catch (err) {
      setMsgPass({ ok: false, texto: err.response?.data?.error || 'Error al cambiar la contraseña.' });
    } finally {
      setGuardandoPass(false);
    }
  };

  if (!datos) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="font-cinzel text-gold/40 animate-pulse tracking-widest">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-10">
      <h1 className="font-cinzel text-2xl font-bold text-gold tracking-widest mb-2">Mi perfil</h1>
      <div className="w-32 h-px bg-gradient-to-r from-gold/60 to-transparent mb-8" />

      {/* ── Foto de perfil ────────────────────────────────────── */}
      <div style={CARD_STYLE}>
        <h2 className="font-cinzel text-sm text-gold/70 tracking-widest uppercase mb-5">Foto de perfil</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {datos.avatar_url ? (
            <img
              src={datos.avatar_url}
              alt="Avatar"
              style={{
                width: 100, height: 100, borderRadius: '50%',
                objectFit: 'cover', border: '2px solid #C9A84C', flexShrink: 0,
              }}
            />
          ) : (
            <Inicial nombre={datos.nombre} size={100} />
          )}
          <div>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={subiendoAvatar}
              className="btn-outline px-5 py-2 text-sm"
            >
              {subiendoAvatar ? 'Subiendo...' : 'Cambiar foto'}
            </button>
            <p style={{ color: 'rgba(201,168,76,0.4)', fontSize: '0.75rem', marginTop: 6, fontFamily: 'Georgia, serif' }}>
              JPG, PNG o WebP · máx. 10 MB
            </p>
            <Mensaje ok={msgAvatar.ok} texto={msgAvatar.texto} />
          </div>
        </div>
        <input
          ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }} onChange={handleAvatar}
        />
      </div>

      {/* ── Cambiar nombre ────────────────────────────────────── */}
      <div style={CARD_STYLE}>
        <h2 className="font-cinzel text-sm text-gold/70 tracking-widest uppercase mb-5">Nombre</h2>
        <form onSubmit={handleNombre}>
          <label style={LABEL_STYLE}>Nombre de usuario</label>
          <input
            style={INPUT_STYLE} value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            onFocus={(e) => { e.target.style.borderColor = 'rgba(201,168,76,0.6)'; }}
            onBlur={(e) => { e.target.style.borderColor = 'rgba(201,168,76,0.25)'; }}
            minLength={2} required
          />
          <p style={{ color: 'rgba(201,168,76,0.35)', fontSize: '0.75rem', marginTop: 4, fontFamily: 'Georgia, serif' }}>
            {datos.email}
          </p>
          <button
            type="submit" disabled={guardandoNombre}
            className="btn-gold px-6 py-2 text-sm mt-4"
          >
            {guardandoNombre ? 'Guardando...' : 'Guardar nombre'}
          </button>
          <Mensaje ok={msgNombre.ok} texto={msgNombre.texto} />
        </form>
      </div>

      {/* ── Cambiar contraseña ───────────────────────────────── */}
      <div style={CARD_STYLE}>
        <h2 className="font-cinzel text-sm text-gold/70 tracking-widest uppercase mb-5">Contraseña</h2>
        <form onSubmit={handlePassword} className="space-y-3">
          {[
            { key: 'actual', label: 'Contraseña actual' },
            { key: 'nueva', label: 'Nueva contraseña' },
            { key: 'confirmar', label: 'Confirmar nueva contraseña' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label style={LABEL_STYLE}>{label}</label>
              <input
                type="password" style={INPUT_STYLE}
                value={pass[key]}
                onChange={(e) => setPass({ ...pass, [key]: e.target.value })}
                onFocus={(e) => { e.target.style.borderColor = 'rgba(201,168,76,0.6)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(201,168,76,0.25)'; }}
                placeholder="••••••••" required
              />
            </div>
          ))}
          <button
            type="submit" disabled={guardandoPass}
            className="btn-gold px-6 py-2 text-sm mt-2"
          >
            {guardandoPass ? 'Guardando...' : 'Cambiar contraseña'}
          </button>
          <Mensaje ok={msgPass.ok} texto={msgPass.texto} />
        </form>
      </div>
    </div>
  );
}
