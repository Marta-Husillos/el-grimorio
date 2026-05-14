const crypto = require('crypto');
const Grupo = require('../models/grupo');
const GrupoUsuario = require('../models/grupoUsuario');
const GrupoFicha = require('../models/grupoFicha');
const Npc = require('../models/npc');
const Usuario = require('../models/usuario');

// ── Helpers de permisos ───────────────────────────────────────────────────────

async function getMembresiaConRol(grupoId, usuarioId) {
  return GrupoUsuario.findOne({ where: { grupo_id: grupoId, usuario_id: usuarioId } });
}

// POST /api/grupos
exports.crearGrupo = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });
    if (nombre.trim().length > 100) {
      return res.status(400).json({ error: 'El nombre no puede superar los 100 caracteres' });
    }
    if (descripcion && descripcion.trim().length > 500) {
      return res.status(400).json({ error: 'La descripción no puede superar los 500 caracteres' });
    }

    const codigo_invitacion = crypto.randomBytes(4).toString('hex').toUpperCase();
    const grupo = await Grupo.create({
      nombre, descripcion, creador_id: req.usuario.id, codigo_invitacion,
    });
    await GrupoUsuario.create({ grupo_id: grupo.id, usuario_id: req.usuario.id, rol: 'propietaria' });

    res.status(201).json({ ...grupo.toJSON(), rol: 'propietaria' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/grupos  (acepta ?npc_id=X para añadir campo yaCompartida)
exports.listarGrupos = async (req, res) => {
  try {
    const membresias = await GrupoUsuario.findAll({ where: { usuario_id: req.usuario.id } });
    const grupoIds = membresias.map((m) => m.grupo_id);
    if (!grupoIds.length) return res.json([]);

    const grupos = await Grupo.findAll({ where: { id: grupoIds } });

    const npcId = req.query.npc_id ? Number(req.query.npc_id) : null;
    console.log('[listarGrupos] npc_id recibido:', req.query.npc_id, '→ npcId:', npcId);

    let fichasCompartidas = [];
    if (npcId) {
      fichasCompartidas = await GrupoFicha.findAll({ where: { npc_id: npcId, grupo_id: grupoIds } });
    }

    const result = grupos.map((g) => ({
      ...g.toJSON(),
      rol: membresias.find((m) => m.grupo_id === g.id)?.rol ?? 'espectador',
      yaCompartida: npcId ? fichasCompartidas.some((f) => f.grupo_id === g.id) : false,
    }));
    console.log('[listarGrupos] grupos con yaCompartida:', result.map((g) => ({ id: g.id, nombre: g.nombre, yaCompartida: g.yaCompartida })));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/grupos/unirse
exports.unirse = async (req, res) => {
  try {
    const { codigo } = req.body;
    if (!codigo) return res.status(400).json({ error: 'Código requerido' });

    const grupo = await Grupo.findOne({ where: { codigo_invitacion: codigo.trim().toUpperCase() } });
    if (!grupo) return res.status(404).json({ error: 'Código de invitación inválido' });

    const yaEsMiembro = await GrupoUsuario.findOne({
      where: { grupo_id: grupo.id, usuario_id: req.usuario.id },
    });
    if (yaEsMiembro) return res.status(409).json({ error: 'Ya eres miembro de este grupo' });

    await GrupoUsuario.create({ grupo_id: grupo.id, usuario_id: req.usuario.id, rol: 'espectador' });
    res.json({ ...grupo.toJSON(), rol: 'espectador' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/grupos/:id  — solo propietaria
exports.editarGrupo = async (req, res) => {
  try {
    const grupoId = req.params.id;
    const { nombre, descripcion } = req.body;

    const solicitante = await getMembresiaConRol(grupoId, req.usuario.id);
    if (!solicitante || solicitante.rol !== 'propietaria') {
      return res.status(403).json({ error: 'Solo la propietaria puede editar el grupo' });
    }

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }
    if (nombre.trim().length > 100) {
      return res.status(400).json({ error: 'El nombre no puede superar los 100 caracteres' });
    }
    if (descripcion && descripcion.trim().length > 500) {
      return res.status(400).json({ error: 'La descripción no puede superar los 500 caracteres' });
    }

    const grupo = await Grupo.findByPk(grupoId);
    if (!grupo) return res.status(404).json({ error: 'Grupo no encontrado' });

    await grupo.update({
      nombre: nombre.trim(),
      descripcion: descripcion?.trim() || null,
    });

    res.json({ id: grupo.id, nombre: grupo.nombre, descripcion: grupo.descripcion, updatedAt: grupo.updatedAt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/grupos/:id/miembros
exports.listarMiembros = async (req, res) => {
  try {
    const grupoId = req.params.id;
    const miembro = await getMembresiaConRol(grupoId, req.usuario.id);
    if (!miembro) return res.status(403).json({ error: 'No eres miembro de este grupo' });

    const membresias = await GrupoUsuario.findAll({ where: { grupo_id: grupoId } });
    const usuarioIds = membresias.map((m) => m.usuario_id);
    const usuarios = await Usuario.findAll({ where: { id: usuarioIds }, attributes: ['id', 'nombre', 'email'] });

    const result = membresias.map((m) => {
      const user = usuarios.find((u) => u.id === m.usuario_id);
      return { usuario_id: m.usuario_id, nombre: user?.nombre, email: user?.email, rol: m.rol };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/grupos/:id/miembros/:usuario_id/rol  — solo propietaria
exports.cambiarRol = async (req, res) => {
  try {
    const { id: grupoId, usuario_id: targetId } = req.params;
    const { rol } = req.body;

    if (!['editor', 'espectador'].includes(rol)) {
      return res.status(400).json({ error: 'Rol inválido. Usa "editor" o "espectador"' });
    }

    const solicitante = await getMembresiaConRol(grupoId, req.usuario.id);
    if (!solicitante || solicitante.rol !== 'propietaria') {
      return res.status(403).json({ error: 'Solo la propietaria puede cambiar roles' });
    }

    const target = await getMembresiaConRol(grupoId, targetId);
    if (!target) return res.status(404).json({ error: 'Miembro no encontrado' });
    if (target.rol === 'propietaria') return res.status(400).json({ error: 'No se puede cambiar el rol de la propietaria' });

    await target.update({ rol });
    res.json({ mensaje: 'Rol actualizado', rol });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/grupos/:id/miembros/:usuario_id  — solo propietaria
exports.expulsarMiembro = async (req, res) => {
  try {
    const { id: grupoId, usuario_id: targetId } = req.params;

    const solicitante = await getMembresiaConRol(grupoId, req.usuario.id);
    if (!solicitante || solicitante.rol !== 'propietaria') {
      return res.status(403).json({ error: 'Solo la propietaria puede expulsar miembros' });
    }

    const target = await getMembresiaConRol(grupoId, targetId);
    if (!target) return res.status(404).json({ error: 'Miembro no encontrado' });
    if (target.rol === 'propietaria') return res.status(400).json({ error: 'No puedes expulsar a la propietaria' });

    await target.destroy();
    res.json({ mensaje: 'Miembro expulsado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/grupos/:id/fichas  — solo propietaria y editor
exports.compartirFicha = async (req, res) => {
  try {
    const grupoId = req.params.id;
    const { npc_id } = req.body;

    const miembro = await getMembresiaConRol(grupoId, req.usuario.id);
    if (!miembro) return res.status(403).json({ error: 'No eres miembro de este grupo' });
    if (miembro.rol === 'espectador') return res.status(403).json({ error: 'Los espectadores no pueden compartir fichas' });

    const npc = await Npc.findOne({ where: { id: npc_id, usuario_id: req.usuario.id } });
    if (!npc) return res.status(404).json({ error: 'Ficha no encontrada o no te pertenece' });

    const yaCompartido = await GrupoFicha.findOne({ where: { grupo_id: grupoId, npc_id } });
    if (yaCompartido) return res.status(409).json({ error: 'Esta ficha ya está compartida en este grupo' });

    await GrupoFicha.create({ grupo_id: grupoId, npc_id, compartido_por: req.usuario.id });
    res.status(201).json({ mensaje: 'Ficha compartida correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/grupos/:id/fichas  — todos los miembros
exports.fichasGrupo = async (req, res) => {
  try {
    const grupoId = req.params.id;

    const miembro = await getMembresiaConRol(grupoId, req.usuario.id);
    if (!miembro) return res.status(403).json({ error: 'No eres miembro de este grupo' });

    const fichas = await GrupoFicha.findAll({ where: { grupo_id: grupoId } });
    if (!fichas.length) return res.json([]);

    const npcIds = fichas.map((f) => f.npc_id);
    const npcs = await Npc.findAll({ where: { id: npcIds } });

    const compartidores = await Promise.all(
      fichas.map((f) => Usuario.findByPk(f.compartido_por, { attributes: ['nombre'] }))
    );
    const result = npcs.map((npc) => {
      const ficha = fichas.find((f) => f.npc_id === npc.id);
      const compartidor = compartidores[fichas.indexOf(ficha)];
      return { ...npc.toJSON(), compartido_por_nombre: compartidor?.nombre ?? null };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/grupos/:id/fichas/:npc_id  — solo propietaria
exports.quitarFicha = async (req, res) => {
  try {
    const { id: grupoId, npc_id } = req.params;

    const miembro = await getMembresiaConRol(grupoId, req.usuario.id);
    if (!miembro) return res.status(403).json({ error: 'No eres miembro de este grupo' });
    if (miembro.rol !== 'propietaria') return res.status(403).json({ error: 'Solo la propietaria puede retirar fichas del grupo' });

    const ficha = await GrupoFicha.findOne({ where: { grupo_id: grupoId, npc_id } });
    if (!ficha) return res.status(404).json({ error: 'La ficha no está compartida en este grupo' });

    await ficha.destroy();
    res.json({ mensaje: 'Ficha retirada del grupo' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/grupos/:id/salir
exports.salir = async (req, res) => {
  try {
    const miembro = await getMembresiaConRol(req.params.id, req.usuario.id);
    if (!miembro) return res.status(404).json({ error: 'No eres miembro de este grupo' });
    if (miembro.rol === 'propietaria') return res.status(400).json({ error: 'La propietaria no puede abandonar el grupo; elimínalo primero' });
    await miembro.destroy();
    res.json({ mensaje: 'Has abandonado el grupo' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
