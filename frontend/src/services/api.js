import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// ── PNJs propios ─────────────────────────────────────────────────────────────
export const getNpcs = () => api.get('/npcs');
export const getNpcById = (id) => api.get(`/npcs/${id}`);
export const createNpc = (data) => api.post('/npcs', data);
export const updateNpc = (id, data) => api.put(`/npcs/${id}`, data);
export const deleteNpc = (id) => api.delete(`/npcs/${id}`);
export const toggleFavorito = (id) => api.put(`/npcs/${id}/favorito`);

// ── Autenticación ─────────────────────────────────────────────────────────────
export const apiLogin = (email, password) => api.post('/auth/login', { email, password });
export const apiRegistro = (nombre, email, password) => api.post('/auth/registro', { nombre, email, password });
export const apiPerfil = () => api.get('/auth/perfil');

// ── Grupos ────────────────────────────────────────────────────────────────────
export const getGrupos = (params = {}) => api.get('/grupos', { params });
export const crearGrupo = (data) => api.post('/grupos', data);
export const unirseGrupo = (codigo) => api.post('/grupos/unirse', { codigo });
export const compartirFichaGrupo = (grupoId, npc_id) => api.post(`/grupos/${grupoId}/fichas`, { npc_id });
export const quitarFichaGrupo = (grupoId, npc_id) => api.delete(`/grupos/${grupoId}/fichas/${npc_id}`);
export const getFichasGrupo = (grupoId) => api.get(`/grupos/${grupoId}/fichas`);
export const salirGrupo = (grupoId) => api.delete(`/grupos/${grupoId}/salir`);
export const getMiembros = (grupoId) => api.get(`/grupos/${grupoId}/miembros`);
export const cambiarRolMiembro = (grupoId, usuarioId, rol) => api.put(`/grupos/${grupoId}/miembros/${usuarioId}/rol`, { rol });
export const expulsarMiembro = (grupoId, usuarioId) => api.delete(`/grupos/${grupoId}/miembros/${usuarioId}`);

// ── API externa D&D 5e (Open5e) ──────────────────────────────────────────────
export const getExternalMonstruos = (params = {}) =>
  api.get('/external/monstruos', { params });
export const getExternalMonstruo = (slug) => api.get(`/external/monstruos/${slug}`);
export const importarMonstruo = (slug) => api.post(`/external/monstruos/${slug}/importar`);
export const buscarMonstruosCache = (q) =>
  api.get('/external/monstruos/buscar-cache', { params: { q } });

export default api;
