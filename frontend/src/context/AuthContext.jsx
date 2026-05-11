import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    localStorage.removeItem('token'); // limpieza de migración — eliminar tras un ciclo
    const guardado = localStorage.getItem('usuario');
    if (guardado) {
      api.get('/auth/verify')
        .then(() => { try { setUsuario(JSON.parse(guardado)); } catch {} })
        .catch(() => {
          localStorage.removeItem('usuario');
          setUsuario(null);
        })
        .finally(() => setCargando(false));
    } else {
      setCargando(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('usuario', JSON.stringify(res.data.usuario));
    setUsuario(res.data.usuario);
    return res.data;
  };

  const registro = async (nombre, email, password) => {
    const res = await api.post('/auth/registro', { nombre, email, password });
    localStorage.setItem('usuario', JSON.stringify(res.data.usuario));
    setUsuario(res.data.usuario);
    return res.data;
  };

  const logout = async () => {
    await api.post('/auth/logout');
    localStorage.removeItem('usuario');
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, logout, registro }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
