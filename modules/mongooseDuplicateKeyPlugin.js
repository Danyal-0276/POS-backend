// modules/mongooseDuplicateKeyPlugin.js (example)
module.exports = function (schema) {
  schema.post('save', function (err, doc, next) {
    if (err?.code === 11000) {
      // Pass through standard duplicate error so the handler can detect it
      return next(err);
    }
    if (/email/i.test(err?.message || '')) {
      err.status = 409;           // add an HTTP status
      err.message = 'email already exists';
      return next(err);
    }
    next(err);
  });
};
