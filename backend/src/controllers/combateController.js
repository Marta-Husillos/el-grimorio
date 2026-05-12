const CombateSave = require('../models/combateSave');

// GET /api/combates  — lista los encuentros del usuario (sin datos, solo metadatos)
exports.listar = async (req, res) => {
  try {
    const saves = await CombateSave.findAll({
      where: { usuario_id: req.usuario.id },
      attributes: ['id', 'nombre', 'createdAt', 'updatedAt'],
      order: [['updatedAt', 'DESC']],
    });
    res.json(saves);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/combates/:id  — devuelve un guardado completo (con datos)
exports.obtener = async (req, res) => {
  try {
    const save = await CombateSave.findOne({
      where: { id: req.params.id, usuario_id: req.usuario.id },
    });
    if (!save) return res.status(404).json({ error: 'Guardado no encontrado' });
    res.json(save);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/combates  — crea un nuevo guardado
exports.crear = async (req, res) => {
  try {
    const { nombre, datos } = req.body;
    if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });
    const save = await CombateSave.create({ usuario_id: req.usuario.id, nombre, datos });
    res.status(201).json({ id: save.id, nombre: save.nombre, updatedAt: save.updatedAt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/combates/:id  — sobreescribe un guardado existente
exports.actualizar = async (req, res) => {
  try {
    const save = await CombateSave.findOne({
      where: { id: req.params.id, usuario_id: req.usuario.id },
    });
    if (!save) return res.status(404).json({ error: 'Guardado no encontrado' });
    const { nombre, datos } = req.body;
    await save.update({ nombre: nombre ?? save.nombre, datos: datos ?? save.datos });
    res.json({ id: save.id, nombre: save.nombre, updatedAt: save.updatedAt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/combates/:id
exports.eliminar = async (req, res) => {
  try {
    const save = await CombateSave.findOne({
      where: { id: req.params.id, usuario_id: req.usuario.id },
    });
    if (!save) return res.status(404).json({ error: 'Guardado no encontrado' });
    await save.destroy();
    res.json({ mensaje: 'Encuentro eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
