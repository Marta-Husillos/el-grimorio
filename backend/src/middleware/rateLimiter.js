const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429,
  message: { error: 'Demasiados intentos de inicio de sesión. Por favor, inténtalo de nuevo en 15 minutos.' },
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429,
  message: { error: 'Demasiadas peticiones. Por favor, inténtalo de nuevo más tarde.' },
});

module.exports = { loginLimiter, generalLimiter };
