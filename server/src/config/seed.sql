-- Przykładowe punkty Ełku (przybliżone)
INSERT INTO locations (name, type, lat, lng, description) VALUES
('Scena Główna - Amfiteatr', 'stage', 53.820277872549546, 22.345316194067752, 'Główna scena festiwalu'),
('Leśny Dwór', 'hotel', 53.80872730899938, 22.38614549252089, 'Zakwaterowanie zespołów'),
('Punkt Informacyjny ECK', 'info', 53.82088810634076, 22.346300426498125, 'Info & akredytacje'),
('Start parady', 'parade', 53.824779934963466, 22.36112076402117, 'Punkt startowy parady')
ON CONFLICT DO NOTHING;

-- Przykładowy zespół
INSERT INTO teams (name, country) VALUES
('Mazurski Zespół Pieśni i Tańca Ełk', 'PL')
ON CONFLICT DO NOTHING;

-- Przykładowe wydarzenia
INSERT INTO events (name, description, start_time, end_time, location_id, team_id)
SELECT
  'Koncert Otwarcia', 'Uroczyste rozpoczęcie', NOW() + INTERVAL '2 hour', NOW() + INTERVAL '4 hour',
  (SELECT id FROM locations WHERE name='Scena Główna - Amfiteatr' LIMIT 1),
  (SELECT id FROM teams WHERE name='Mazurski Zespół Pieśni i Tańca Ełk' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM events WHERE name='Koncert Otwarcia');

INSERT INTO events (name, description, start_time, end_time, location_id, team_id)
SELECT
  'Parada Miejska', 'Przemarsz zespołów', NOW() + INTERVAL '1 day 10 hour', NULL,
  (SELECT id FROM locations WHERE name='Punkt Informacyjny ECK' LIMIT 1),
  NULL
WHERE NOT EXISTS (SELECT 1 FROM events WHERE name='Parada Miejska');
