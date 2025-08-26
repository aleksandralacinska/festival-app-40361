-- === LOCATIONS ===
CREATE TABLE IF NOT EXISTS locations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'stage' | 'hotel' | 'food' | 'info' | 'parade' | 'rehearsal' | 'attraction'
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  description TEXT DEFAULT ''
);

-- === TEAMS ===
CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT,
  pin_hash TEXT,
  lodging_location_id INT REFERENCES locations(id) ON DELETE SET NULL
  -- slug dodamy patch'em niżej, by nie blokować istniejących danych
);

-- === EVENTS ===
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  location_id INT REFERENCES locations(id) ON DELETE SET NULL,
  team_id INT REFERENCES teams(id) ON DELETE SET NULL
  -- is_public + category dodamy patch'em niżej
);

-- Indexy bazowe
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_events_location ON events(location_id);

-- =========================
-- PATCH: nowe kolumny/indeksy (bez destrukcji danych)
-- =========================

-- teams.slug (jeszcze bez unikalności - dodamy po migracji slugów)
ALTER TABLE teams
  ADD COLUMN IF NOT EXISTS slug TEXT;

-- events.is_public + events.category
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS category  TEXT;

CREATE INDEX IF NOT EXISTS idx_events_is_public ON events(is_public);
CREATE INDEX IF NOT EXISTS idx_events_category  ON events(category);
