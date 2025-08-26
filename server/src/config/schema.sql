CREATE TABLE IF NOT EXISTS locations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'stage' | 'hotel' | 'food' | 'info'
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  description TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT,
  pin_hash TEXT,               -- uzupełnić później (logowanie PIN)
  lodging_location_id INT REFERENCES locations(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  location_id INT REFERENCES locations(id) ON DELETE SET NULL,
  team_id INT REFERENCES teams(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_events_location ON events(location_id);
