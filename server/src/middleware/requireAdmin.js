const jwt = require('jsonwebtoken');

module.exports = function requireAdmin(req, res, next) {
  const hdr = req.headers.authorization || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'unauthorized' });
  try {
    const data = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
    if (data.role !== 'admin') return res.status(403).json({ error: 'forbidden' });
    req.admin = { id: data.id || 'admin' };
    next();
  } catch {
    return res.status(401).json({ error: 'unauthorized' });
  }
};
