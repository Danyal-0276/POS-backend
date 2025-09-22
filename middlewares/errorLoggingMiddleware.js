// middlewares/errorLoggingMiddleware.js
const logger = require('../modules/logger');

module.exports = (err, req, res, next) => {
  // Log whatever you want…
  logger.error('Error occurred:', {
    message: err.message,
    status: err.status,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  // IMPORTANT: do NOT send a response here
  // No res.status(...), no res.json(...), nothing.
  next(err);
};
