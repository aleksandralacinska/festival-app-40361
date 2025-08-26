require('dotenv').config();
const { pool } = require('../src/config/db');

const TARGETS = [
  { name: 'Mazurski Zespół Pieśni i Tańca Ełk', slug: 'elk' },
  { name: 'Ludowy Zespół Artystyczny Promni', slug: 'promni' },
  { name: 'Zespół Pieśni i Tańca Politechniki Warszawskiej', slug: 'pw' },
  { name: 'Zespół Folklorystyczny PolkaDot', slug: 'polka' },
];

async function ensureSlugColumn() {
  await pool.query(`ALTER TABLE teams ADD COLUMN IF NOT EXISTS slug TEXT;`);
}

async function upsertSlugByName(name, slug) {
  // znajdź wszystkie rekordy o tej nazwie
  const { rows } = await pool.query(
    `SELECT id, name, slug FROM teams WHERE name = $1 ORDER BY id ASC`,
    [name]
  );

  if (rows.length === 0) {
    // być może już jest po slugu (wcześniej dodane)
    const chk = await pool.query(
      `SELECT id, name, slug FROM teams WHERE slug = $1 LIMIT 1`,
      [slug]
    );
    if (chk.rows.length) return chk.rows[0];
    // nic nie rób – seed.sql wstawi zespół w kolejnym kroku
    return null;
  }

  // zachowujemy pierwszy rekord jako główny
  const keeper = rows[0];
  // ustaw/ustandaryzuj slug na keeperze
  await pool.query(`UPDATE teams SET slug=$1 WHERE id=$2`, [slug, keeper.id]);

  // jeśli są duplikaty – przepnij eventy i usuń je
  const dupIds = rows.slice(1).map(r => r.id);
  if (dupIds.length) {
    // przepnij eventy
    await pool.query(
      `UPDATE events SET team_id=$1 WHERE team_id = ANY($2::int[])`,
      [keeper.id, dupIds]
    );
    // usuń duble
    await pool.query(
      `DELETE FROM teams WHERE id = ANY($1::int[])`,
      [dupIds]
    );
  }
  return keeper;
}

async function createUniqueIndex() {
  await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS ux_teams_slug ON teams(slug);`);
}

async function run() {
  try {
    await ensureSlugColumn();

    for (const t of TARGETS) {
      await upsertSlugByName(t.name, t.slug);
    }

    // na końcu unikalny indeks (po deduplikacji)
    await createUniqueIndex();

    console.log('Slug migration finished ✅');
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
