const { Pool } = require('pg');

const url = process.env.DATABASE_URL || '';
const isLocal =
  url.includes('localhost') || url.includes('127.0.0.1');

const pool = new Pool({
  connectionString: url,
  ssl: isLocal ? false : { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
});

module.exports = { pool };
