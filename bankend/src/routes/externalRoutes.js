const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  listarMonstruos,
  obtenerMonstruo,
  importarMonstruo,
  buscarCache,
} = require('../controllers/externalController');

router.get('/monstruos/buscar-cache', buscarCache);          // ANTES de /:slug
router.get('/monstruos', listarMonstruos);
router.get('/monstruos/:slug', obtenerMonstruo);
router.post('/monstruos/:slug/importar', auth, importarMonstruo);

module.exports = router;
