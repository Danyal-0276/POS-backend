module.exports = (defaultLimit = 20, maxLimit = 100) => (req, _res, next) => {
  const page  = Math.max(1, parseInt(req.query.page  || '1', 10));
  const limit = Math.min(maxLimit, parseInt(req.query.limit || defaultLimit, 10));
  req.pagination = { page, limit, skip: (page - 1) * limit };
  next();
};
