const router = require('express').Router();
const auth = require('../middleware/auth');
const {
  crearGrupo, listarGrupos, unirse,
  listarMiembros, cambiarRol, expulsarMiembro,
  compartirFicha, fichasGrupo, quitarFicha, salir,
} = require('../controllers/grupoController');

router.use(auth);

router.get('/',          listarGrupos);
router.post('/',         crearGrupo);
router.post('/unirse',   unirse);

router.get('/:id/miembros',                 listarMiembros);
router.put('/:id/miembros/:usuario_id/rol', cambiarRol);
router.delete('/:id/miembros/:usuario_id',  expulsarMiembro);

router.post('/:id/fichas',           compartirFicha);
router.get('/:id/fichas',            fichasGrupo);
router.delete('/:id/fichas/:npc_id', quitarFicha);
router.delete('/:id/salir',          salir);

module.exports = router;
