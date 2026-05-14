import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function DiceIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-7 h-7 fill-gold" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18L20 8.5v7L12 19.82 4 15.5v-7L12 4.18zM12 7a1 1 0 100 2 1 1 0 000-2zm-3 3a1 1 0 100 2 1 1 0 000-2zm6 0a1 1 0 100 2 1 1 0 000-2zm-3 3a1 1 0 100 2 1 1 0 000-2z" />
    </svg>
  );
}

const MENU_ITEM = {
  display: 'flex', alignItems: 'center', gap: 10,
  padding: '11px 16px', color: '#C9A84C', textDecoration: 'none',
  fontSize: 13, fontFamily: 'Cinzel, serif', cursor: 'pointer',
  background: 'transparent', border: 'none', width: '100%', textAlign: 'left',
  transition: 'background 0.12s',
};

function MenuItem({ as: Tag = 'button', children, ...props }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Tag
      {...props}
      style={{ ...MENU_ITEM, background: hovered ? 'rgba(201,168,76,0.1)' : 'transparent' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </Tag>
  );
}

const DIVIDER = <div style={{ borderTop: '1px solid rgba(201,168,76,0.2)' }} />;

function AvatarCircle({ avatarUrl, nombre, size = 32 }) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt="avatar"
        style={{
          width: size, height: size, borderRadius: '50%',
          objectFit: 'cover', border: '1.5px solid #C9A84C', flexShrink: 0,
        }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: '#C9A84C', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: size * 0.45, color: '#1a1a2e' }}>
        {nombre?.charAt(0).toUpperCase() || '?'}
      </span>
    </div>
  );
}

function Navbar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [abierto, setAbierto] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!usuario) return;
    api.get('/perfil').then((res) => setAvatarUrl(res.data.avatar_url)).catch(() => {});
  }, [usuario]);

  useEffect(() => {
    const handle = (e) => setAvatarUrl(e.detail?.avatar_url ?? null);
    window.addEventListener('avatar-actualizado', handle);
    return () => window.removeEventListener('avatar-actualizado', handle);
  }, []);

  useEffect(() => {
    if (!abierto) return;
    const handle = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setAbierto(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [abierto]);

  const cerrar = () => setAbierto(false);

  const abrirImportar = () => {
    cerrar();
    window.dispatchEvent(new CustomEvent('open-import-modal'));
  };

  const handleLogout = () => {
    cerrar();
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-dungeon-mid border-b border-gold/30 shadow-lg shadow-black/40">
      <div className="max-w-screen-xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <DiceIcon />
          <span className="font-cinzel text-lg font-bold text-gold group-hover:text-gold-light transition tracking-wider">
            El Grimorio
            <span className="text-gold/50 font-normal text-sm ml-2">D&D 5e</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {usuario && (
            <div className="hidden sm:flex items-center gap-2">
              <AvatarCircle avatarUrl={avatarUrl} nombre={usuario.nombre} size={32} />
              <span className="font-cinzel text-sm text-gold/60">
                {usuario.nombre}
              </span>
            </div>
          )}

          <div ref={menuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setAbierto(v => !v)}
              title="Menú"
              style={{
                background: 'none', border: '1px solid rgba(201,168,76,0.4)',
                borderRadius: 6, cursor: 'pointer', color: abierto ? '#e8c97a' : '#C9A84C',
                fontSize: '1.2rem', padding: '5px 11px', lineHeight: 1,
                borderColor: abierto ? 'rgba(201,168,76,0.8)' : 'rgba(201,168,76,0.4)',
                transition: 'color 0.15s, border-color 0.15s',
              }}
            >
              ☰
            </button>

            {abierto && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                background: '#1a1a2e', border: '1px solid #C9A84C',
                borderRadius: 8, minWidth: 220, zIndex: 1000,
                boxShadow: '0 8px 24px rgba(0,0,0,0.6)', overflow: 'hidden',
              }}>
                <MenuItem as={Link} to="/combate" onClick={cerrar}>
                  ⚔️ Gestor de Combate
                </MenuItem>
                {DIVIDER}
                <MenuItem as={Link} to="/crear" onClick={cerrar}>
                  ✚ Crear nuevo PNJ
                </MenuItem>
                {DIVIDER}
                <MenuItem onClick={abrirImportar}>
                  📥 Importar desde API
                </MenuItem>
                {DIVIDER}
                <MenuItem as={Link} to="/perfil" onClick={cerrar}>
                  👤 Mi perfil
                </MenuItem>
                {DIVIDER}
                <MenuItem as={Link} to="/mis-grupos" onClick={cerrar}>
                  👥 Mis Grupos
                </MenuItem>
                {DIVIDER}
                <MenuItem onClick={handleLogout} style={{ color: 'rgba(252,165,165,0.8)' }}>
                  🚪 Cerrar sesión
                </MenuItem>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
