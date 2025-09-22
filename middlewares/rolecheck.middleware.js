module.exports = function checkRoles(allowedRole) {
  return function (req, res, next) {
    try {
      const userRole = req.user?.userType; 

    
      if (!userRole || userRole !== allowedRole) {
        return res.status(403).json({ status : 403, message: 'Access denied: you are not allowed to request this service' });
      }

      next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  };
};
