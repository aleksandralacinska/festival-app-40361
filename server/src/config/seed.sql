-- server/src/config/seed.sql
-- Idempotentny seed: lokalizacje, zespoły (4), publiczny harmonogram (koncerty/parada/ceremonia/fajerwerki),
-- oraz prywatne elementy (posiłki, atrakcje, próby, integracja).

-- === LOKALIZACJE ===
INSERT INTO locations (name, type, lat, lng, description)
SELECT 'Scena Główna - Amfiteatr','stage',53.820277872549546,22.345316194067752,'Główna scena festiwalu'
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE name='Scena Główna - Amfiteatr');

INSERT INTO locations (name, type, lat, lng, description)
SELECT 'Leśny Dwór','hotel',53.80872730899938,22.38614549252089,'Zakwaterowanie zespołów i posiłki'
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE name='Leśny Dwór');

INSERT INTO locations (name, type, lat, lng, description)
SELECT 'Punkt Informacyjny ECK','info',53.82088810634076,22.346300426498125,'Info & akredytacje'
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE name='Punkt Informacyjny ECK');

INSERT INTO locations (name, type, lat, lng, description)
SELECT 'Start parady','parade',53.824779934963466,22.36112076402117,'Punkt startowy parady'
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE name='Start parady');

INSERT INTO locations (name, type, lat, lng, description)
SELECT 'Sala A (ECK)','rehearsal',53.82095,22.34630,'Sala prób A w ECK'
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE name='Sala A (ECK)');

INSERT INTO locations (name, type, lat, lng, description)
SELECT 'Sala B (ECK)','rehearsal',53.82090,22.34620,'Sala prób B w ECK'
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE name='Sala B (ECK)');

INSERT INTO locations (name, type, lat, lng, description)
SELECT 'Jezioro Ełckie (Kajaki)','attraction',53.8178,22.3640,'Spływ kajakowy'
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE name='Jezioro Ełckie (Kajaki)');

INSERT INTO locations (name, type, lat, lng, description)
SELECT 'Stacja Kolejki Wąskotorowej','attraction',53.8267,22.3634,'Wycieczka kolejką wąskotorową'
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE name='Stacja Kolejki Wąskotorowej');

INSERT INTO locations (name, type, lat, lng, description)
SELECT 'Park Miejski (Gra terenowa)','attraction',53.8262,22.3559,'Gra terenowa'
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE name='Park Miejski (Gra terenowa)');

-- === ZESPOŁY (UPSERT po slug; wymagany unikalny indeks na teams.slug) ===
INSERT INTO teams (name, slug, country, lodging_location_id)
SELECT 'Mazurski Zespół Pieśni i Tańca Ełk','elk','PL',(SELECT id FROM locations WHERE name='Leśny Dwór')
ON CONFLICT (slug) DO UPDATE
SET name=EXCLUDED.name, country=EXCLUDED.country, lodging_location_id=EXCLUDED.lodging_location_id;

INSERT INTO teams (name, slug, country, lodging_location_id)
SELECT 'Ludowy Zespół Artystyczny Promni','promni','PL',(SELECT id FROM locations WHERE name='Leśny Dwór')
ON CONFLICT (slug) DO UPDATE
SET name=EXCLUDED.name, country=EXCLUDED.country, lodging_location_id=EXCLUDED.lodging_location_id;

INSERT INTO teams (name, slug, country, lodging_location_id)
SELECT 'Zespół Pieśni i Tańca Politechniki Warszawskiej','pw','PL',(SELECT id FROM locations WHERE name='Leśny Dwór')
ON CONFLICT (slug) DO UPDATE
SET name=EXCLUDED.name, country=EXCLUDED.country, lodging_location_id=EXCLUDED.lodging_location_id;

INSERT INTO teams (name, slug, country, lodging_location_id)
SELECT 'Zespół Folklorystyczny PolkaDot','polka','PL',(SELECT id FROM locations WHERE name='Leśny Dwór')
ON CONFLICT (slug) DO UPDATE
SET name=EXCLUDED.name, country=EXCLUDED.country, lodging_location_id=EXCLUDED.lodging_location_id;

-- === PUBLICZNE WYDARZENIA ===
-- Piątek 05.09 (koncert otwarcia)
INSERT INTO events (name, description, start_time, end_time, location_id, team_id, is_public, category)
SELECT 'Koncert otwarcia — Mazurski ZPiT Ełk','',
       '2025-09-05 18:00','2025-09-05 18:15',
       (SELECT id FROM locations WHERE name='Scena Główna - Amfiteatr'),
       (SELECT id FROM teams WHERE slug='elk'), TRUE,'concert'
WHERE NOT EXISTS (SELECT 1 FROM events WHERE name='Koncert otwarcia — Mazurski ZPiT Ełk' AND start_time='2025-09-05 18:00');

INSERT INTO events (name, description, start_time, end_time, location_id, team_id, is_public, category)
SELECT 'Koncert otwarcia — Ludowy Zespół Artystyczny Promni','',
       '2025-09-05 18:15','2025-09-05 18:30',
       (SELECT id FROM locations WHERE name='Scena Główna - Amfiteatr'),
       (SELECT id FROM teams WHERE slug='promni'), TRUE,'concert'
WHERE NOT EXISTS (SELECT 1 FROM events WHERE name='Koncert otwarcia — Ludowy Zespół Artystyczny Promni' AND start_time='2025-09-05 18:15');

INSERT INTO events (name, description, start_time, end_time, location_id, team_id, is_public, category)
SELECT 'Koncert otwarcia — ZPiT Politechniki Warszawskiej','',
       '2025-09-05 18:30','2025-09-05 18:45',
       (SELECT id FROM locations WHERE name='Scena Główna - Amfiteatr'),
       (SELECT id FROM teams WHERE slug='pw'), TRUE,'concert'
WHERE NOT EXISTS (SELECT 1 FROM events WHERE name='Koncert otwarcia — ZPiT Politechniki Warszawskiej' AND start_time='2025-09-05 18:30');

INSERT INTO events (name, description, start_time, end_time, location_id, team_id, is_public, category)
SELECT 'Koncert otwarcia — Zespół Folklorystyczny PolkaDot','',
       '2025-09-05 18:45','2025-09-05 19:00',
       (SELECT id FROM locations WHERE name='Scena Główna - Amfiteatr'),
       (SELECT id FROM teams WHERE slug='polka'), TRUE,'concert'
WHERE NOT EXISTS (SELECT 1 FROM events WHERE name='Koncert otwarcia — Zespół Folklorystyczny PolkaDot' AND start_time='2025-09-05 18:45');

INSERT INTO events (name, description, start_time, end_time, location_id, team_id, is_public, category)
SELECT 'Koncert gościa — Zespół wokalny Zazula','',
       '2025-09-05 19:05','2025-09-05 20:00',
       (SELECT id FROM locations WHERE name='Scena Główna - Amfiteatr'),
       NULL, TRUE,'concert'
WHERE NOT EXISTS (SELECT 1 FROM events WHERE name='Koncert gościa — Zespół wokalny Zazula' AND start_time='2025-09-05 19:05');

-- Sobota 06.09 (rotacja: 1,4,2,3 + Zazula)
INSERT INTO events (name, description, start_time, end_time, location_id, team_id, is_public, category)
SELECT 'Koncert festiwalowy — Mazurski ZPiT Ełk','',
       '2025-09-06 18:00','2025-09-06 18:15',
       (SELECT id FROM locations WHERE name='Scena Główna - Amfiteatr'),
       (SELECT id FROM teams WHERE slug='elk'), TRUE,'concert'
WHERE NOT EXISTS (SELECT 1 FROM events WHERE name='Koncert festiwalowy — Mazurski ZPiT Ełk' AND start_time='2025-09-06 18:00');

INSERT INTO events (name, description, start_time, end_time, location_id, team_id, is_public, category)
SELECT 'Koncert festiwalowy — Zespół Folklorystyczny PolkaDot','',
       '2025-09-06 18:15','2025-09-06 18:45',
       (SELECT id FROM locations WHERE name='Scena Główna - Amfiteatr'),
       (SELECT id FROM teams WHERE slug='polka'), TRUE,'concert'
WHERE NOT EXISTS (SELECT 1 FROM events WHERE name='Koncert festiwalowy — Zespół Folklorystyczny PolkaDot' AND start_time='2025-09-06 18:15');

INSERT INTO events (name, description, start_time, end_time, location_id, team_id, is_public, category)
SELECT 'Koncert festiwalowy — Ludowy Zespół Artystyczny Promni','',
       '2025-09-06 18:45','2025-09-06 19:15',
       (SELECT id FROM locations WHERE name='Scena Główna - Amfiteatr'),
       (SELECT id FROM teams WHERE slug='promni'), TRUE,'concert'
WHERE NOT EXISTS (SELECT 1 FROM events WHERE name='Koncert festiwalowy — Ludowy Zespół Artystyczny Promni' AND start_time='2025-09-06 18:45');

INSERT INTO events (name, description, start_time, end_time, location_id, team_id, is_public, category)
SELECT 'Koncert festiwalowy — ZPiT Politechniki Warszawskiej','',
       '2025-09-06 19:15','2025-09-06 19:45',
       (SELECT id FROM locations WHERE name='Scena Główna - Amfiteatr'),
       (SELECT id FROM teams WHERE slug='pw'), TRUE,'concert'
WHERE NOT EXISTS (SELECT 1 FROM events WHERE name='Koncert festiwalowy — ZPiT Politechniki Warszawskiej' AND start_time='2025-09-06 19:15');

INSERT INTO events (name, description, start_time, end_time, location_id, team_id, is_public, category)
SELECT 'Koncert gościa — Zespół wokalny Zazula','',
       '2025-09-06 19:50','2025-09-06 20:40',
       (SELECT id FROM locations WHERE name='Scena Główna - Amfiteatr'),
       NULL, TRUE,'concert'
WHERE NOT EXISTS (SELECT 1 FROM events WHERE name='Koncert gościa — Zespół wokalny Zazula' AND start_time='2025-09-06 19:50');

-- Niedziela 07.09 (parada + wręczenie + 3,1,4,2 + fajerwerki)
INSERT INTO events (name, description, start_time, end_time, location_id, team_id, is_public, category)
SELECT 'Parada uliczna','',
       '2025-09-07 17:00','2025-09-07 18:00',
       (SELECT id FROM locations WHERE name='Start parady'),
       NULL, TRUE,'parade'
WHERE NOT EXISTS (SELECT 1 FROM events WHERE name='Parada uliczna' AND start_time='2025-09-07 17:00');

INSERT INTO events (name, description, start_time, end_time, location_id, team_id, is_public, category)
SELECT 'Wręczenie nagród','',
       '2025-09-07 18:00','2025-09-07 18:20',
       (SELECT id FROM locations WHERE name='Scena Główna - Amfiteatr'),
       NULL, TRUE,'ceremony'
WHERE NOT EXISTS (SELECT 1 FROM events WHERE name='Wręczenie nagród' AND start_time='2025-09-07 18:00');

INSERT INTO events (name, description, start_time, end_time, location_id, team_id, is_public, category)
SELECT 'Koncert zamknięcia — ZPiT Politechniki Warszawskiej','',
       '2025-09-07 18:20','2025-09-07 18:40',
       (SELECT id FROM locations WHERE name='Scena Główna - Amfiteatr'),
       (SELECT id FROM teams WHERE slug='pw'), TRUE,'concert'
WHERE NOT EXISTS (SELECT 1 FROM events WHERE name='Koncert zamknięcia — ZPiT Politechniki Warszawskiej' AND start_time='2025-09-07 18:20');

INSERT INTO events (name, description, start_time, end_time, location_id, team_id, is_public, category)
SELECT 'Koncert zamknięcia — Mazurski ZPiT Ełk','',
       '2025-09-07 18:40','2025-09-07 19:00',
       (SELECT id FROM locations WHERE name='Scena Główna - Amfiteatr'),
       (SELECT id FROM teams WHERE slug='elk'), TRUE,'concert'
WHERE NOT EXISTS (SELECT 1 FROM events WHERE name='Koncert zamknięcia — Mazurski ZPiT Ełk' AND start_time='2025-09-07 18:40');

INSERT INTO events (name, description, start_time, end_time, location_id, team_id, is_public, category)
SELECT 'Koncert zamknięcia — Zespół Folklorystyczny PolkaDot','',
       '2025-09-07 19:00','2025-09-07 19:20',
       (SELECT id FROM locations WHERE name='Scena Główna - Amfiteatr'),
       (SELECT id FROM teams WHERE slug='polka'), TRUE,'concert'
WHERE NOT EXISTS (SELECT 1 FROM events WHERE name='Koncert zamknięcia — Zespół Folklorystyczny PolkaDot' AND start_time='2025-09-07 19:00');

INSERT INTO events (name, description, start_time, end_time, location_id, team_id, is_public, category)
SELECT 'Koncert zamknięcia — Ludowy Zespół Artystyczny Promni','',
       '2025-09-07 19:20','2025-09-07 19:40',
       (SELECT id FROM locations WHERE name='Scena Główna - Amfiteatr'),
       (SELECT id FROM teams WHERE slug='promni'), TRUE,'concert'
WHERE NOT EXISTS (SELECT 1 FROM events WHERE name='Koncert zamknięcia — Ludowy Zespół Artystyczny Promni' AND start_time='2025-09-07 19:20');

INSERT INTO events (name, description, start_time, end_time, location_id, team_id, is_public, category)
SELECT 'Pokaz sztucznych ogni','',
       '2025-09-07 19:45','2025-09-07 20:00',
       (SELECT id FROM locations WHERE name='Scena Główna - Amfiteatr'),
       NULL, TRUE,'fireworks'
WHERE NOT EXISTS (SELECT 1 FROM events WHERE name='Pokaz sztucznych ogni' AND start_time='2025-09-07 19:45');

-- === PRYWATNE (posiłki) — pt/sob/nd dla 4 zespołów ===
-- ŚNIADANIA
INSERT INTO events (name, description, start_time, end_time, location_id, team_id, is_public, category)
SELECT 'Śniadanie','',
       d.s, d.s + INTERVAL '1 hour 30 minutes',
       (SELECT id FROM locations WHERE name='Leśny Dwór'),
       t.id, FALSE,'meal'
FROM (VALUES
  ('2025-09-05 08:00'::timestamp),
  ('2025-09-06 08:00'::timestamp),
  ('2025-09-07 08:00'::timestamp)
) AS d(s)
JOIN (VALUES ('elk'),('promni'),('pw'),('polka')) AS sl(slug) ON TRUE
JOIN teams t ON t.slug = sl.slug
WHERE NOT EXISTS (
  SELECT 1 FROM events e WHERE e.name='Śniadanie' AND e.start_time=d.s AND e.team_id=t.id
);

-- OBIADY
INSERT INTO events (name, description, start_time, end_time, location_id, team_id, is_public, category)
SELECT 'Obiad','',
       d.s, d.s + INTERVAL '1 hour',
       (SELECT id FROM locations WHERE name='Leśny Dwór'),
       t.id, FALSE,'meal'
FROM (VALUES
  ('2025-09-05 13:00'::timestamp),
  ('2025-09-06 13:00'::timestamp),
  ('2025-09-07 13:00'::timestamp)
) AS d(s)
JOIN (VALUES ('elk'),('promni'),('pw'),('polka')) AS sl(slug) ON TRUE
JOIN teams t ON t.slug = sl.slug
WHERE NOT EXISTS (
  SELECT 1 FROM events e WHERE e.name='Obiad' AND e.start_time=d.s AND e.team_id=t.id
);

-- KOLACJE
INSERT INTO events (name, description, start_time, end_time, location_id, team_id, is_public, category)
SELECT 'Kolacja','',
       d.s, d.s + INTERVAL '1 hour',
       (SELECT id FROM locations WHERE name='Leśny Dwór'),
       t.id, FALSE,'meal'
FROM (VALUES
  ('2025-09-05 20:15'::timestamp),
  ('2025-09-06 20:45'::timestamp),
  ('2025-09-07 20:15'::timestamp)
) AS d(s)
JOIN (VALUES ('elk'),('promni'),('pw'),('polka')) AS sl(slug) ON TRUE
JOIN teams t ON t.slug = sl.slug
WHERE NOT EXISTS (
  SELECT 1 FROM events e WHERE e.name='Kolacja' AND e.start_time=d.s AND e.team_id=t.id
);

-- === ATRAKCJE (pt/sob/nd) dla 4 zespołów ===
INSERT INTO events (name, description, start_time, end_time, location_id, team_id, is_public, category)
SELECT plan.n,'', plan.s, plan.e, plan.loc, t.id, FALSE,'attraction'
FROM (
  SELECT 'Kajaki — Jezioro Ełckie' AS n, '2025-09-05 10:00'::timestamp AS s, '2025-09-05 12:00'::timestamp AS e,
         (SELECT id FROM locations WHERE name='Jezioro Ełckie (Kajaki)') AS loc
  UNION ALL
  SELECT 'Kolejka wąskotorowa — wycieczka', '2025-09-06 10:00','2025-09-06 12:30',
         (SELECT id FROM locations WHERE name='Stacja Kolejki Wąskotorowej')
  UNION ALL
  SELECT 'Gra terenowa — Park miejski', '2025-09-07 10:00','2025-09-07 12:00',
         (SELECT id FROM locations WHERE name='Park Miejski (Gra terenowa)')
) AS plan
JOIN (VALUES ('elk'),('promni'),('pw'),('polka')) AS sl(slug) ON TRUE
JOIN teams t ON t.slug = sl.slug
WHERE NOT EXISTS (
  SELECT 1 FROM events e WHERE e.name=plan.n AND e.start_time=plan.s AND e.team_id=t.id
);

-- === PRÓBY wg matrycy (Sala A: t1/t2; Sala B: t3/t4) ===
-- PT 14:30-15:30 (t1 A, t3 B); 15:45-16:45 (t2 A, t4 B)
INSERT INTO events (name, description, start_time, end_time, location_id, team_id, is_public, category)
SELECT 'Próba — Sala A','', '2025-09-05 14:30','2025-09-05 15:30',
       (SELECT id FROM locations WHERE name='Sala A (ECK)'),
       (SELECT id FROM teams WHERE slug='elk'), FALSE,'rehearsal'
WHERE NOT EXISTS (SELECT 1 FROM events WHERE name='Próba — Sala A' AND start_time='2025-09-05 14:30' AND team_id=(SELECT id FROM teams WHERE slug='elk'));

INSERT INTO events (name, description, start_time, end_time, location_id, team_id, is_public, category)
SELECT 'Próba — Sala B','', '2025-09-05 14:30','2025-09-05 15:30',
       (SELECT id FROM locations WHERE name='Sala B (ECK)'),
       (SELECT id FROM teams WHERE slug='pw'), FALSE,'rehearsal'
WHERE NOT EXISTS (SELECT 1 FROM events WHERE name='Próba — Sala B' AND start_time='2025-09-05 14:30' AND team_id=(SELECT id FROM teams WHERE slug='pw'));

INSERT INTO events (name, description, start_time, end_time, location_id, team_id, is_public, category)
SELECT 'Próba — Sala A','', '2025-09-05 15:45','2025-09-05 16:45',
       (SELECT id FROM locations WHERE name='Sala A (ECK)'),
       (SELECT id FROM teams WHERE slug='promni'), FALSE,'rehearsal'
WHERE NOT EXISTS (SELECT 1 FROM events WHERE name='Próba — Sala A' AND start_time='2025-09-05 15:45' AND team_id=(SELECT id FROM teams WHERE slug='promni'));

INSERT INTO events (name, description, start_time, end_time, location_id, team_id, is_public, category)
SELECT 'Próba — Sala B','', '2025-09-05 15:45','2025-09-05 16:45',
       (SELECT id FROM locations WHERE name='Sala B (ECK)'),
       (SELECT id FROM teams WHERE slug='polka'), FALSE,'rehearsal'
WHERE NOT EXISTS (SELECT 1 FROM events WHERE name='Próba — Sala B' AND start_time='2025-09-05 15:45' AND team_id=(SELECT id FROM teams WHERE slug='polka'));

-- SO 14:30-15:30 (t2 A, t4 B); 15:45-16:45 (t1 A, t3 B)
INSERT INTO events (name, description, start_time, end_time, location_id, team_id, is_public, category)
SELECT 'Próba — Sala A','', '2025-09-06 14:30','2025-09-06 15:30',
       (SELECT id FROM locations WHERE name='Sala A (ECK)'),
       (SELECT id FROM teams WHERE slug='promni'), FALSE,'rehearsal'
WHERE NOT EXISTS (SELECT 1 FROM events WHERE name='Próba — Sala A' AND start_time='2025-09-06 14:30' AND team_id=(SELECT id FROM teams WHERE slug='promni'));

INSERT INTO events (name, description, start_time, end_time, location_id, team_id, is_public, category)
SELECT 'Próba — Sala B','', '2025-09-06 14:30','2025-09-06 15:30',
       (SELECT id FROM locations WHERE name='Sala B (ECK)'),
       (SELECT id FROM teams WHERE slug='polka'), FALSE,'rehearsal'
WHERE NOT EXISTS (SELECT 1 FROM events WHERE name='Próba — Sala B' AND start_time='2025-09-06 14:30' AND team_id=(SELECT id FROM teams WHERE slug='polka'));

INSERT INTO events (name, description, start_time, end_time, location_id, team_id, is_public, category)
SELECT 'Próba — Sala A','', '2025-09-06 15:45','2025-09-06 16:45',
       (SELECT id FROM locations WHERE name='Sala A (ECK)'),
       (SELECT id FROM teams WHERE slug='elk'), FALSE,'rehearsal'
WHERE NOT EXISTS (SELECT 1 FROM events WHERE name='Próba — Sala A' AND start_time='2025-09-06 15:45' AND team_id=(SELECT id FROM teams WHERE slug='elk'));

INSERT INTO events (name, description, start_time, end_time, location_id, team_id, is_public, category)
SELECT 'Próba — Sala B','', '2025-09-06 15:45','2025-09-06 16:45',
       (SELECT id FROM locations WHERE name='Sala B (ECK)'),
       (SELECT id FROM teams WHERE slug='pw'), FALSE,'rehearsal'
WHERE NOT EXISTS (SELECT 1 FROM events WHERE name='Próba — Sala B' AND start_time='2025-09-06 15:45' AND team_id=(SELECT id FROM teams WHERE slug='pw'));

-- ND 14:30-15:30 (t2 A, t3 B); 15:45-16:45 (t1 A, t4 B)
INSERT INTO events (name, description, start_time, end_time, location_id, team_id, is_public, category)
SELECT 'Próba — Sala A','', '2025-09-07 14:30','2025-09-07 15:30',
       (SELECT id FROM locations WHERE name='Sala A (ECK)'),
       (SELECT id FROM teams WHERE slug='promni'), FALSE,'rehearsal'
WHERE NOT EXISTS (SELECT 1 FROM events WHERE name='Próba — Sala A' AND start_time='2025-09-07 14:30' AND team_id=(SELECT id FROM teams WHERE slug='promni'));

INSERT INTO events (name, description, start_time, end_time, location_id, team_id, is_public, category)
SELECT 'Próba — Sala B','', '2025-09-07 14:30','2025-09-07 15:30',
       (SELECT id FROM locations WHERE name='Sala B (ECK)'),
       (SELECT id FROM teams WHERE slug='pw'), FALSE,'rehearsal'
WHERE NOT EXISTS (SELECT 1 FROM events WHERE name='Próba — Sala B' AND start_time='2025-09-07 14:30' AND team_id=(SELECT id FROM teams WHERE slug='pw'));

INSERT INTO events (name, description, start_time, end_time, location_id, team_id, is_public, category)
SELECT 'Próba — Sala A','', '2025-09-07 15:45','2025-09-07 16:45',
       (SELECT id FROM locations WHERE name='Sala A (ECK)'),
       (SELECT id FROM teams WHERE slug='elk'), FALSE,'rehearsal'
WHERE NOT EXISTS (SELECT 1 FROM events WHERE name='Próba — Sala A' AND start_time='2025-09-07 15:45' AND team_id=(SELECT id FROM teams WHERE slug='elk'));

INSERT INTO events (name, description, start_time, end_time, location_id, team_id, is_public, category)
SELECT 'Próba — Sala B','', '2025-09-07 15:45','2025-09-07 16:45',
       (SELECT id FROM locations WHERE name='Sala B (ECK)'),
       (SELECT id FROM teams WHERE slug='polka'), FALSE,'rehearsal'
WHERE NOT EXISTS (SELECT 1 FROM events WHERE name='Próba — Sala B' AND start_time='2025-09-07 15:45' AND team_id=(SELECT id FROM teams WHERE slug='polka'));

-- IMPREZA INTEGRACYJNA (sobota 21:00-23:30) – dla wszystkich zespołów
INSERT INTO events (name, description, start_time, end_time, location_id, team_id, is_public, category)
SELECT 'Impreza integracyjna','Ognisko i tańce',
       '2025-09-06 21:00','2025-09-06 23:30',
       (SELECT id FROM locations WHERE name='Leśny Dwór'),
       t.id, FALSE,'party'
FROM (VALUES ('elk'),('promni'),('pw'),('polka')) AS sl(slug)
JOIN teams t ON t.slug = sl.slug
WHERE NOT EXISTS (
  SELECT 1 FROM events e WHERE e.name='Impreza integracyjna' AND e.start_time='2025-09-06 21:00' AND e.team_id=t.id
);
