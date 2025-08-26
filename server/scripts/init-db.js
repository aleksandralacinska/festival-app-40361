require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../src/config/db');

async function run() {
  try {
    const schema = fs.readFileSync(path.join(__dirname, '..', 'src', 'config', 'schema.sql'), 'utf8');
    await pool.query(schema);
    const seed = fs.readFileSync(path.join(__dirname, '..', 'src', 'config', 'seed.sql'), 'utf8');
    await pool.query(seed);
    console.log('DB initialized ✅');
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
