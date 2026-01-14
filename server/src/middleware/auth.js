const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ success: false, error: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, role, email }
    next();
  } catch (e) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(403).json({ success: false, error: 'Forbidden' });
  }
  // SUPER_ADMIN bypasses all role checks
  if (req.user.role === 'SUPER_ADMIN') {
    return next();
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, error: 'Forbidden' });
  }
  next();
};

module.exports = { authenticate, requireRole };
