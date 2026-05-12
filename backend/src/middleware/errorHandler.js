const SEQUELIZE_ERRORS = new Set([
  'SequelizeValidationError',
  'SequelizeUniqueConstraintError',
  'SequelizeDatabaseError',
  'SequelizeForeignKeyConstraintError',
]);

const errorHandler = (err, req, res, next) => {
  if (err.name && SEQUELIZE_ERRORS.has(err.name)) {
    return res.status(400).json({ message: 'Los datos proporcionados no son válidos.' });
  }
  console.error(err);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({ message: 'Error interno del servidor.' });
};

module.exports = errorHandler;
