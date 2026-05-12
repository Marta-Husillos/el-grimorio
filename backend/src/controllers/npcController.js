const { Op } = require('sequelize');
const Npc = require('../models/npc');
const GrupoFicha = require('../models/grupoFicha');
const GrupoUsuario = require('../models/grupoUsuario');
const { traducirNpc } = require('../utils/traducciones');

// Devuelve la membresía del usuario en cualquier grupo donde esté compartida la ficha,
// filtrando por los roles indicados. Retorna null si no tiene acceso.
async function membresiaEnGrupoConFicha(npcId, usuarioId, roles) {
  const fichasEnGrupos = await GrupoFicha.findAll({ where: { npc_id: npcId } });
  if (!fichasEnGrupos.length) return null;
  const grupoIds = fichasEnGrupos.map((f) => f.grupo_id);
  return GrupoUsuario.findOne({
    where: { grupo_id: grupoIds, usuario_id: usuarioId, rol: roles },
  });
}

// GET /api/npcs — solo los del usuario autenticado
const getNpcs = async (req, res) => {
  try {
    const npcs = await Npc.findAll({
      where: { usuario_id: req.usuario.id },
      order: [
        ['favorito', 'DESC'],
        ['nombre',   'ASC'],
      ],
    });
    res.json(npcs.map(traducirNpc));
  } catch (error) {
    console.error('[getNpcs] Error:', error);
    if (error.name?.startsWith('Sequelize')) return res.status(400).json({ message: 'Los datos proporcionados no son válidos.' });
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// GET /api/npcs/:id
const getNpcById = async (req, res) => {
  try {
    const npc = await Npc.findByPk(req.params.id);
    if (!npc) return res.status(404).json({ message: 'PNJ no encontrado' });

    if (npc.usuario_id !== req.usuario.id) {
      const membresia = await membresiaEnGrupoConFicha(npc.id, req.usuario.id, ['propietaria', 'editor']);
      if (!membresia) {
        return res.status(403).json({ message: 'No tienes permisos para ver esta ficha' });
      }
    }

    res.json(traducirNpc(npc));
  } catch (error) {
    console.error('[getNpcById] Error:', error);
    if (error.name?.startsWith('Sequelize')) return res.status(400).json({ message: 'Los datos proporcionados no son válidos.' });
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// POST /api/npcs
const createNpc = async (req, res) => {
  try {
    const npc = await Npc.create({ ...req.body, usuario_id: req.usuario.id });
    res.status(201).json(npc);
  } catch (error) {
    console.error('Error al guardar:', error);
    if (error.name?.startsWith('Sequelize')) return res.status(400).json({ message: 'Los datos proporcionados no son válidos.' });
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// PUT /api/npcs/:id
const updateNpc = async (req, res) => {
  try {
    const npc = await Npc.findByPk(req.params.id);
    if (!npc) return res.status(404).json({ message: 'PNJ no encontrado' });

    if (npc.usuario_id !== req.usuario.id) {
      // No es el dueño → comprobar si es editor o propietaria en un grupo donde esté compartida
      const membresia = await membresiaEnGrupoConFicha(npc.id, req.usuario.id, ['propietaria', 'editor']);
      if (!membresia) {
        return res.status(403).json({ message: 'No tienes permiso para editar esta ficha' });
      }
    }

    await npc.update(req.body);
    res.json(npc);
  } catch (error) {
    console.error('Error al guardar:', error);
    if (error.name?.startsWith('Sequelize')) return res.status(400).json({ message: 'Los datos proporcionados no son válidos.' });
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// DELETE /api/npcs/:id
const deleteNpc = async (req, res) => {
  try {
    const npc = await Npc.findByPk(req.params.id);
    if (!npc) return res.status(404).json({ message: 'PNJ no encontrado' });

    if (npc.usuario_id !== req.usuario.id) {
      // No es el dueño → solo la propietaria del grupo puede borrar la ficha original
      const membresia = await membresiaEnGrupoConFicha(npc.id, req.usuario.id, ['propietaria']);
      if (!membresia) {
        return res.status(403).json({ message: 'No tienes permiso para eliminar esta ficha' });
      }
    }

    await npc.destroy();
    res.json({ message: 'PNJ eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar:', error);
    if (error.name?.startsWith('Sequelize')) return res.status(400).json({ message: 'Los datos proporcionados no son válidos.' });
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// PUT /api/npcs/:id/favorito
const toggleFavorito = async (req, res) => {
  try {
    const npc = await Npc.findOne({
      where: { id: req.params.id, usuario_id: req.usuario.id },
    });
    if (!npc) return res.status(404).json({ message: 'PNJ no encontrado' });
    await npc.update({ favorito: !npc.favorito });
    res.json({ favorito: npc.favorito });
  } catch (error) {
    console.error('Error al actualizar favorito:', error);
    if (error.name?.startsWith('Sequelize')) return res.status(400).json({ message: 'Los datos proporcionados no son válidos.' });
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

module.exports = { getNpcs, getNpcById, createNpc, updateNpc, deleteNpc, toggleFavorito };
