module.exports = (allowedStates) => (req, _res, next) => {
  const { order } = req;                        // req.order injected earlier
  if (!allowedStates.includes(order.status))
    return next(new Error(`Order must be in [${allowedStates}] to perform this action`));
  next();
};
