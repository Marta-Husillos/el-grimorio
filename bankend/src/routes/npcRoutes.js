const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const {
  getNpcs, getNpcById, createNpc, updateNpc, deleteNpc, toggleFavorito,
} = require('../controllers/npcController');

router.use(auth);

const validarNpc = [
  body('nombre').optional().isString().isLength({ max: 255 }).withMessage('El nombre no puede superar 255 caracteres.'),
  body('puntos_de_golpe').optional().isInt({ min: 1, max: 9999 }).withMessage('Los PG deben estar entre 1 y 9999.'),
  body('clase_armadura').optional().isInt({ min: 0, max: 99 }).withMessage('La CA debe estar entre 0 y 99.'),
  body('fuerza').optional().isInt({ min: 1, max: 30 }).withMessage('Los atributos deben estar entre 1 y 30.'),
  body('destreza').optional().isInt({ min: 1, max: 30 }),
  body('constitucion').optional().isInt({ min: 1, max: 30 }),
  body('inteligencia').optional().isInt({ min: 1, max: 30 }),
  body('sabiduria').optional().isInt({ min: 1, max: 30 }),
  body('carisma').optional().isInt({ min: 1, max: 30 }),
];

const checkValidacion = (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ message: 'Los datos proporcionados no son válidos.', errores: errores.array() });
  }
  next();
};

router.get('/', getNpcs);
router.post('/', validarNpc, checkValidacion, createNpc);
router.get('/:id', getNpcById);
router.put('/:id', validarNpc, checkValidacion, updateNpc);
router.delete('/:id', deleteNpc);
router.put('/:id/favorito', toggleFavorito);

module.exports = router;
