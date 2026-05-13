const router = require('express').Router();
const auth = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimiter');
const { registro, login, perfil, logout, forgotPassword, resetPassword } = require('../controllers/authController');

router.post('/registro', registro);
router.post('/login', loginLimiter, login);
router.get('/perfil', auth, perfil);
router.get('/verify', auth, (req, res) => res.json({ ok: true }));
router.post('/logout', logout); // sin auth: debe funcionar aunque el token haya expirado
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
