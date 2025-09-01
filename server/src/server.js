require('dotenv').config();
const express = require('express');
const compression = require('compression');
const morgan = require('morgan');
const cors = require('cors');

const { applySecurity } = require('./middleware/security');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiters');
const { errorHandler } = require('./middleware/errorHandler');

// === ROUTES ===
const healthRoutes = require('./routes/health');
const eventsRoutes = require('./routes/events');
const locationsRoutes = require('./routes/locations');
const authRoutes = require('./routes/auth');

const adminAuth = require('./routes/adminAuth');
const teamsRoutes = require('./routes/teams');
const pushRoutes = require('./routes/push');

const app = express();

// --- CORS ---
const CLIENT = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

const ALLOWED_ORIGINS = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  CLIENT,
  'https://elk-festival.netlify.app',
].filter(Boolean));

// Podpowiedz dla proxy/CDN, że odpowiedź zależy od Origin
app.use((req, res, next) => {
  res.setHeader('Vary', 'Origin');
  next();
});

app.use(cors({
  origin(origin, cb) {
    // brak Origin (np. curl) -> OK
    if (!origin) return cb(null, true);
    try {
      const u = new URL(origin);
      const allowed =
        ALLOWED_ORIGINS.has(origin) ||
        u.hostname.endsWith('.netlify.app') || // wszystkie subdomeny Netlify
        u.hostname.endsWith('.netlify.com');

      // jeśli nie jest dozwolone — po prostu brak nagłówków CORS
      return cb(null, !!allowed);
    } catch {
      return cb(null, false);
    }
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  maxAge: 86400,
  optionsSuccessStatus: 204,
}));


// Logi HTTP
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Security headers, HPP, itp.
applySecurity(app);

// Body parser + kompresja
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// LIMITERY
app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);

// === MOUNT ROUTES (WSZYSTKIE) ===
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/locations', locationsRoutes);
app.use('/api/admin', adminAuth);
app.use('/api/teams', teamsRoutes);
app.use('/api/team', teamsRoutes);
app.use('/api/push', pushRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'not_found' });
});

// Globalny handler błędów
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
