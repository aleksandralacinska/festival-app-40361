const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'festival-api' });
});

app.use('/api', require('./routes'));

module.exports = app;
