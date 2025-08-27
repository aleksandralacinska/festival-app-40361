require('dotenv').config();
const express = require('express');
const compression = require('compression');
const morgan = require('morgan');

const { applySecurity } = require('./middleware/security');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiters');
const { errorHandler } = require('./middleware/errorHandler');

// === ROUTES ===
const healthRoutes = require('./routes/health');
const eventsRoutes = require('./routes/events');
const locationsRoutes = require('./routes/locations');
const authRoutes = require('./routes/auth');

const app = express();

// Logi HTTP
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Security headers, CORS, HPP, body limit
applySecurity(app);

// Kompresja odpowiedzi
app.use(compression());

// LIMITERY
app.use('/api', apiLimiter);
// Bardziej surowy limiter tylko dla endpointów autoryzacji (bruteforce)
app.use('/api/auth', authLimiter);

// === MOUNT ROUTES ===
app.use('/api/health', healthRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/locations', locationsRoutes);
app.use('/api/auth', authRoutes);

// 404 fallback (API)
app.use((req, res) => {
  res.status(404).json({ error: 'not_found' });
});

// Globalny handler błędów (ostatni)
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
