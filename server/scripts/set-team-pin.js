require('dotenv').config();
const bcrypt = require('bcrypt');
const { pool } = require('../src/config/db');

const [,, teamName, pin] = process.argv;

if (!teamName || !pin) {
  console.error('Usage: node scripts/set-team-pin.js "Team Name" 1234');
  process.exit(1);
}

(async () => {
  try {
    const hash = await bcrypt.hash(String(pin), 10);
    const { rowCount } = await pool.query(
      'UPDATE teams SET pin_hash=$1 WHERE name=$2',
      [hash, teamName]
    );
    if (!rowCount) {
      console.error('Team not found');
      process.exit(1);
    }
    console.log(`PIN set for team "${teamName}" ✅`);
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
