// Minimalny globalny handler błędów (bez ujawniania stacków na produkcji)
function errorHandler(err, _req, res, _next) {
    console.error('[API ERROR]', err);
    const status = err.statusCode || 500;
    res.status(status).json({
      error: 'server_error',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
  
  module.exports = { errorHandler };
  