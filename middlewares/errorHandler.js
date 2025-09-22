// middlewares/errorHandler.js
const ApiError = require('../modules/ApiError');

module.exports = function errorHandler(err, req, res, next) {
  const status = Number(err.status) || 500;
  const payload = {
    status,
    message: err.message || 'Internal Server Error',
  };
  if (err.meta) payload.meta = err.meta;
  if (process.env.NODE_ENV !== 'production' && err.stack) payload.stack = err.stack;

  if (res.headersSent) return next(err);
  res.status(status).json(payload);
};
