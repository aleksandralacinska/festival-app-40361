const helmet = require('helmet');
const cors = require('cors');
const hpp = require('hpp');

function buildCorsOptions() {
  // Dozwolone originy w ENV (przecinek-separacja)
  const list = (process.env.CORS_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  return {
    origin: function (origin, callback) {
      // Zezwól na brak origin (np. curl, testy) oraz wpisy z listy
      if (!origin || list.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: false,
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization']
  };
}

function applySecurity(app) {
  // Ukryj Express header
  app.disable('x-powered-by');

  // Jeżeli reverse proxy (Render/Heroku/Nginx)
  if (process.env.TRUST_PROXY) {
    app.set('trust proxy', Number(process.env.TRUST_PROXY) || 1);
  }

  // Helmet – bez CSP (żeby nie zablokować Google Maps)
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));

  // CORS
  app.use(cors(buildCorsOptions()));

  // Ochrona przed param pollution
  app.use(hpp());

  // Ogranicz body size
  app.use(require('express').json({ limit: '100kb' }));
}

module.exports = { applySecurity };
