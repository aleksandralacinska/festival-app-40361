const rateLimit = require('express-rate-limit');

// Globalny limiter (całe API)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 300,                  // max 300 żądań / IP / okno
  standardHeaders: true,
  legacyHeaders: false,
});

// Bardziej surowy limiter dla logowania PIN (ochrona przed bruteforce)
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 min
  max: 10,                   // 10 prób / IP / okno
  message: { error: 'too_many_auth_attempts' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { apiLimiter, authLimiter };
