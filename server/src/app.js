const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// proste healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'festival-api' });
});

module.exports = app;
