const path = require('path');
const fs = require('fs');
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const multer = require('multer');
const auth = require('../middleware/auth');
const Usuario = require('../models/usuario');

const AVATARS_DIR = path.join(__dirname, '../../public/avatars');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, AVATARS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar_${req.usuario.id}_${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Solo se permiten imágenes JPG, PNG o WebP'));
  },
});

// GET /api/perfil
router.get('/', auth, async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.usuario.id, {
      attributes: ['id', 'nombre', 'email', 'avatar_url'],
    });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(usuario);
  } catch {
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// PUT /api/perfil/nombre
router.put('/nombre', auth, async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre || nombre.trim().length < 2)
      return res.status(400).json({ error: 'El nombre debe tener al menos 2 caracteres.' });

    const usuario = await Usuario.findByPk(req.usuario.id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    await usuario.update({ nombre: nombre.trim() });
    res.json({ nombre: usuario.nombre });
  } catch {
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// PUT /api/perfil/contrasena
router.put('/contrasena', auth, async (req, res) => {
  try {
    const { actual, nueva } = req.body;
    if (!actual || !nueva)
      return res.status(400).json({ error: 'Faltan campos obligatorios.' });
    if (nueva.length < 8)
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 8 caracteres.' });

    const usuario = await Usuario.findByPk(req.usuario.id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    const ok = await bcrypt.compare(actual, usuario.password);
    if (!ok) return res.status(401).json({ error: 'La contraseña actual no es correcta.' });

    const hash = await bcrypt.hash(nueva, 10);
    await usuario.update({ password: hash });
    res.json({ mensaje: 'Contraseña actualizada correctamente.' });
  } catch {
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// POST /api/perfil/avatar
router.post('/avatar', auth, (req, res) => {
  upload.single('avatar')(req, res, async (err) => {
    if (err) {
      console.error('[multer] Error:', err.code, err.message);
      if (err.code === 'LIMIT_FILE_SIZE')
        return res.status(400).json({ error: 'La imagen no puede superar los 2 MB.' });
      return res.status(400).json({ error: err.message || 'Error al subir la imagen.' });
    }
    if (!req.file) return res.status(400).json({ error: 'No se recibió ningún archivo.' });

    try {
      const usuario = await Usuario.findByPk(req.usuario.id);
      if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

      if (usuario.avatar_url) {
        const old = path.join(AVATARS_DIR, path.basename(usuario.avatar_url));
        fs.unlink(old, () => {});
      }

      const avatar_url = `/avatars/${req.file.filename}`;
      await usuario.update({ avatar_url });
      res.json({ avatar_url });
    } catch {
      res.status(500).json({ error: 'Error interno del servidor.' });
    }
  });
});

module.exports = router;
