const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const auth = require('../middleware/auth');
const { registro, login, perfil, logout, forgotPassword, resetPassword } = require('../controllers/authController');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Demasiados intentos de inicio de sesión. Inténtalo de nuevo en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/registro', registro);
router.post('/login', loginLimiter, login);
router.get('/perfil', auth, perfil);
router.get('/verify', auth, (req, res) => res.json({ ok: true }));
router.post('/logout', logout); // sin auth: debe funcionar aunque el token haya expirado
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
