const jwt = require('jsonwebtoken');

module.exports = function auth(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'no_token' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { teamId, role }
    next();
  } catch (e) {
    return res.status(401).json({ error: 'invalid_token' });
  }
};
