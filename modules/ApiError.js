// modules/ApiError.js
class ApiError extends Error {
  constructor(status = 500, message = 'Internal Server Error', meta) {
    super(message);
    this.status = status;
    this.meta = meta;
    this.name = 'ApiError'; // <- important
    Error.captureStackTrace?.(this, this.constructor);
  }
}
module.exports = ApiError;
