const jwt = require('jsonwebtoken');
const { User } = require('../config/database');

function auth(requireAuthentication = true) {
  return async (req, res, next) => {
    const authorizationHeader = req.headers['authorization'];
    if (!authorizationHeader) {
      if (!requireAuthentication) return next();
      return res.status(401).json({ message: 'Authorization header missing' });
    }
    const bearerToken = authorizationHeader.split(' ')[1];
    if (!bearerToken) return res.status(401).json({ message: 'Invalid Authorization header' });
    try {
      const decodedJwtPayload = jwt.verify(bearerToken, process.env.JWT_SECRET || 'supersecret_jwt_key');
      const authenticatedUser = await User.findByPk(decodedJwtPayload.id);
      if (!authenticatedUser) return res.status(401).json({ message: 'Invalid token user' });
      req.user = authenticatedUser;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
}

function requireRole(requiredRole) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (req.user.role !== requiredRole) return res.status(403).json({ message: 'Forbidden' });
    next();
  };
}

module.exports = { auth, requireRole };
