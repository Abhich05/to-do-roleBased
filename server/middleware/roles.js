// Role-based access control middleware for Express
module.exports = function(requiredRoles) {
  return function(req, res, next) {
    if (!req.user || !requiredRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient permissions.' });
    }
    next();
  };
};
