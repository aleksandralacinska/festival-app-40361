const helmet = require('helmet');
const hpp = require('hpp');

function applySecurity(app) {
  // Reverse proxy (Render/Heroku/Nginx) – jeśli ustawione, włącz „trust proxy”
  if (process.env.TRUST_PROXY) {
    app.set('trust proxy', Number(process.env.TRUST_PROXY) || 1);
  }

  // Schowaj nagłówek Express
  app.disable('x-powered-by');

  // Bezpieczne nagłówki; bez CSP (żeby nie blokować map i PWA)
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    })
  );

  // Ochrona przed HTTP Parameter Pollution
  app.use(hpp());

}

module.exports = { applySecurity };
