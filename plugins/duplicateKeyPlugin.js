// plugins/duplicateKeyPlugin.js
module.exports = function duplicateKeyPlugin(schema) {
  function normalizeDuplicate(err, doc, next) {
    if (err && (err.code === 11000 || (err.name === 'MongoServerError' && err.keyPattern))) {
      const field = Object.keys(err.keyPattern || {})[0] || 'resource';
      err.status = 409;
      err.message = `${field} already exists`;
    }
    next(err);
  }

  // Normalize dup-key errors for all write ops
  schema.post('save', normalizeDuplicate);
  schema.post('insertMany', normalizeDuplicate);
  schema.post('updateOne', normalizeDuplicate);
  schema.post('findOneAndUpdate', normalizeDuplicate);
  schema.post('updateMany', normalizeDuplicate);
};