// middlewares/errorConverter.js
const ApiError = require('../modules/ApiError');

module.exports = (err, req, res, next) => {
  if (err instanceof ApiError) return next(err);

  // Mongo duplicate key
  if (err?.code === 11000 || (err?.name === 'MongoServerError' && err?.keyPattern)) {
    const field = Object.keys(err.keyPattern || {})[0] || 'resource';
    return next(new ApiError(409, `${field} already exists`));
  }

  // Mongoose validation
  if (err?.name === 'ValidationError') {
    const first = Object.values(err.errors || {})[0];
    return next(new ApiError(400, first?.message || 'validation error'));
  }

  // CastError (invalid ObjectId)
  if (err?.name === 'CastError') {
    return next(new ApiError(400, `invalid ${err.path}`));
  }

  // Joi (if you use it)
  if (err?.isJoi) {
    return next(new ApiError(400, err.details?.[0]?.message || 'validation error'));
  }

  // Multer (uploads)
  if (err?.code === 'LIMIT_FILE_SIZE') return next(new ApiError(413, 'file too large'));
  if (err?.code === 'LIMIT_UNEXPECTED_FILE') return next(new ApiError(400, 'unexpected file field'));

  // Fallback
  next(new ApiError(Number(err?.status) || 500, err?.message || 'Internal Server Error'));
};
