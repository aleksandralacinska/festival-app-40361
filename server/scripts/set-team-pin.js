require('dotenv').config();
const bcrypt = require('bcrypt');
const { pool } = require('../src/config/db');

const [, , identifier, pin] = process.argv; // slug LUB pełna nazwa

if (!identifier || !pin) {
  console.error('Usage: node scripts/set-team-pin.js <slug | full team name> <pin>');
  process.exit(1);
}

(async () => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, slug FROM teams WHERE slug = $1 OR name = $1 LIMIT 1`,
      [identifier]
    );
    const team = rows[0];
    if (!team) {
      console.error(`Team not found by: ${identifier}`);
      process.exit(1);
    }

    const hash = await bcrypt.hash(String(pin), 10);
    await pool.query(`UPDATE teams SET pin_hash=$1 WHERE id=$2`, [hash, team.id]);

    console.log(`PIN set for team "${team.name}" (slug: ${team.slug || '—'}) ✅`);
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
