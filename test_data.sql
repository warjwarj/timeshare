-- ============================================================
-- Test Data for Timeshare
-- ============================================================
-- Passwords are argon2 hashes of "password"

-- ============================================================
-- USERS
-- ============================================================
INSERT INTO users (id, uuid, name, email, password, role, created_at, updated_at) VALUES
(1, '11111111-1111-1111-1111-111111111111'::uuid, 'Alice Johnson',   'alice@example.com',   '$argon2i$v=19$m=16,t=2,p=1$OXE4MzJ5ZXJhb3Bpc2QwOWhqaW85b2lhc2pkL2Rhc2RvaWpo$UEgOsPbQFtOBeHodZq/brQ', 'admin',  CURRENT_DATE, CURRENT_DATE),
(2, '22222222-2222-2222-2222-222222222222'::uuid, 'Bob Smith',       'bob@example.com',     '$argon2i$v=19$m=16,t=2,p=1$OXE4MzJ5ZXJhb3Bpc2QwOWhqaW85b2lhc2pkL2Rhc2RvaWpo$UEgOsPbQFtOBeHodZq/brQ', 'user',   CURRENT_DATE, CURRENT_DATE),
(3, '33333333-3333-3333-3333-333333333333'::uuid, 'Charlie Davis',   'charlie@example.com', '$argon2i$v=19$m=16,t=2,p=1$OXE4MzJ5ZXJhb3Bpc2QwOWhqaW85b2lhc2pkL2Rhc2RvaWpo$UEgOsPbQFtOBeHodZq/brQ', 'user',   CURRENT_DATE, CURRENT_DATE),
(4, '44444444-4444-4444-4444-444444444444'::uuid, 'Diana Martinez',  'diana@example.com',   '$argon2i$v=19$m=16,t=2,p=1$OXE4MzJ5ZXJhb3Bpc2QwOWhqaW85b2lhc2pkL2Rhc2RvaWpo$UEgOsPbQFtOBeHodZq/brQ', 'admin',  CURRENT_DATE, CURRENT_DATE),
(5, '55555555-5555-5555-5555-555555555555'::uuid, 'Ethan Brown',     'ethan@example.com',   '$argon2i$v=19$m=16,t=2,p=1$OXE4MzJ5ZXJhb3Bpc2QwOWhqaW85b2lhc2pkL2Rhc2RvaWpo$UEgOsPbQFtOBeHodZq/brQ', 'user',   CURRENT_DATE, CURRENT_DATE);

-- ============================================================
-- ORGANISATIONS (hierarchical)
-- ============================================================
-- Acme Corp is a root org; Engineering and Marketing are children
INSERT INTO organisations (id, uuid, parent_id, name, created_at, updated_at) VALUES
(1, '019c4ea9-deba-7e4f-8334-e2f7ace5e4e1'::uuid, NULL, 'Acme Corp',        CURRENT_DATE, CURRENT_DATE),
(2, 'aaaa2222-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 1,    'Engineering',      CURRENT_DATE, CURRENT_DATE),
(3, 'aaaa3333-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 1,    'Marketing',        CURRENT_DATE, CURRENT_DATE),
(4, 'aaaa4444-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, NULL, 'Globex Inc',       CURRENT_DATE, CURRENT_DATE);

-- ============================================================
-- EVENTS
-- ============================================================
INSERT INTO events (id, uuid, name, start, "end", iana_timezone, colour, created_at, updated_at) VALUES
(1, 'eeee1111-eeee-eeee-eeee-eeeeeeeeeeee'::uuid, 'Sprint Planning',   CURRENT_DATE + TIME '09:00:00', CURRENT_DATE + TIME '10:00:00', 'America/New_York',  '#3B82F6', CURRENT_DATE, CURRENT_DATE),
(2, 'eeee2222-eeee-eeee-eeee-eeeeeeeeeeee'::uuid, 'Team Standup',      CURRENT_DATE + TIME '09:00:00', CURRENT_DATE + TIME '09:15:00', 'America/New_York',  '#10B981', CURRENT_DATE, CURRENT_DATE),
(3, 'eeee3333-eeee-eeee-eeee-eeeeeeeeeeee'::uuid, 'Marketing Review',  CURRENT_DATE + TIME '14:00:00', CURRENT_DATE + TIME '15:30:00', 'Europe/London',     '#F59E0B', CURRENT_DATE, CURRENT_DATE),
(4, 'eeee4444-eeee-eeee-eeee-eeeeeeeeeeee'::uuid, 'All Hands',         CURRENT_DATE + TIME '16:00:00', CURRENT_DATE + TIME '17:00:00', 'America/New_York',  '#EF4444', CURRENT_DATE, CURRENT_DATE),
(5, 'eeee5555-eeee-eeee-eeee-eeeeeeeeeeee'::uuid, 'Client Demo',       CURRENT_DATE + TIME '11:00:00', CURRENT_DATE + TIME '12:00:00', 'Asia/Tokyo',        '#8B5CF6', CURRENT_DATE, CURRENT_DATE),
(6, 'eeee6666-eeee-eeee-eeee-eeeeeeeeeeee'::uuid, '1:1 with Manager',  CURRENT_DATE + TIME '10:00:00', CURRENT_DATE + TIME '10:30:00', 'Europe/London',     '#EC4899', CURRENT_DATE, CURRENT_DATE);

-- ============================================================
-- AVAILABILITY RULES
-- ============================================================
-- Alice: available weekdays 9-17 UTC
INSERT INTO availability_rules (id, uuid, user_id, name, prevents_booking, weekdays, start_time, end_time, start_datetime, end_datetime, iana_timezone, created_at, updated_at) VALUES
(1, 'dddd1111-dddd-dddd-dddd-dddddddddddd'::uuid, 1, 'Work hours',             false, '{1,2,3,4,5}', '09:00:00', '17:00:00', NULL, NULL, 'America/New_York',  CURRENT_DATE, CURRENT_DATE),
-- Alice: blocked for lunch 12-13
(2, 'dddd2222-dddd-dddd-dddd-dddddddddddd'::uuid, 1, 'Lunch break',            true,  '{1,2,3,4,5}', '12:00:00', '13:00:00', NULL, NULL, 'America/New_York',  CURRENT_DATE, CURRENT_DATE),
-- Bob: available Mon-Thu 10-18
(3, 'dddd3333-dddd-dddd-dddd-dddddddddddd'::uuid, 2, 'Flexible hours',         false, '{1,2,3,4}',   '10:00:00', '18:00:00', NULL, NULL, 'Europe/London',     CURRENT_DATE, CURRENT_DATE),
-- Charlie: on vacation starting from today for 5 days
(4, 'dddd4444-dddd-dddd-dddd-dddddddddddd'::uuid, 3, 'March vacation',         true,  NULL,          NULL,       NULL,       CURRENT_DATE, CURRENT_DATE + INTERVAL '4 days', 'America/New_York', CURRENT_DATE, CURRENT_DATE),
-- Diana: available all week 8-16
(5, 'dddd5555-dddd-dddd-dddd-dddddddddddd'::uuid, 4, 'Standard schedule',      false, '{1,2,3,4,5}', '08:00:00', '16:00:00', NULL, NULL, 'Europe/London',     CURRENT_DATE, CURRENT_DATE),
-- Ethan: no weekends
(6, 'dddd6666-dddd-dddd-dddd-dddddddddddd'::uuid, 5, 'No weekends',            true,  '{6,0}',       '00:00:00', '23:59:59', NULL, NULL, 'Asia/Tokyo',        CURRENT_DATE, CURRENT_DATE);

-- ============================================================
-- ORGANISATION_USERS (junction)
-- ============================================================
INSERT INTO organisation_users (org_id, user_id, created_at, updated_at, role) VALUES
(1, 1, NOW() + (INTERVAL '1 day' * (floor(random() * 21) - 10)),
         NOW() + (INTERVAL '1 day' * (floor(random() * 21) - 10)), 'admin'),
(1, 4, NOW() + (INTERVAL '1 day' * (floor(random() * 21) - 10)),
         NOW() + (INTERVAL '1 day' * (floor(random() * 21) - 10)), 'admin'),
(2, 1, NOW() + (INTERVAL '1 day' * (floor(random() * 21) - 10)),
         NOW() + (INTERVAL '1 day' * (floor(random() * 21) - 10)), 'user'),
(2, 2, NOW() + (INTERVAL '1 day' * (floor(random() * 21) - 10)),
         NOW() + (INTERVAL '1 day' * (floor(random() * 21) - 10)), 'admin'),
(2, 3, NOW() + (INTERVAL '1 day' * (floor(random() * 21) - 10)),
         NOW() + (INTERVAL '1 day' * (floor(random() * 21) - 10)), 'user'),
(3, 4, NOW() + (INTERVAL '1 day' * (floor(random() * 21) - 10)),
         NOW() + (INTERVAL '1 day' * (floor(random() * 21) - 10)), 'user'),
(3, 5, NOW() + (INTERVAL '1 day' * (floor(random() * 21) - 10)),
         NOW() + (INTERVAL '1 day' * (floor(random() * 21) - 10)), 'user'),
(4, 5, NOW() + (INTERVAL '1 day' * (floor(random() * 21) - 10)),
         NOW() + (INTERVAL '1 day' * (floor(random() * 21) - 10)), 'manager');


-- ============================================================
-- ORGANISATION_EVENTS (junction)
-- ============================================================
INSERT INTO organisation_events (org_id, event_id, created_at, updated_at, role) VALUES
(2, 1, NOW() + (INTERVAL '1 day' * (floor(random() * 21) - 10)),
         NOW() + (INTERVAL '1 day' * (floor(random() * 21) - 10)), 'owner'),
(2, 2, NOW() + (INTERVAL '1 day' * (floor(random() * 21) - 10)),
         NOW() + (INTERVAL '1 day' * (floor(random() * 21) - 10)), 'owner'),
(3, 3, NOW() + (INTERVAL '1 day' * (floor(random() * 21) - 10)),
         NOW() + (INTERVAL '1 day' * (floor(random() * 21) - 10)), 'owner'),
(1, 4, NOW() + (INTERVAL '1 day' * (floor(random() * 21) - 10)),
         NOW() + (INTERVAL '1 day' * (floor(random() * 21) - 10)), 'owner'),
(2, 5, NOW() + (INTERVAL '1 day' * (floor(random() * 21) - 10)),
         NOW() + (INTERVAL '1 day' * (floor(random() * 21) - 10)), 'owner'),
(3, 6, NOW() + (INTERVAL '1 day' * (floor(random() * 21) - 10)),
         NOW() + (INTERVAL '1 day' * (floor(random() * 21) - 10)), 'owner');


-- ============================================================
-- USER_EVENTS (junction)
-- ============================================================
INSERT INTO user_events (user_id, event_id, created_at, updated_at, role) VALUES
(1, 1, NOW() + (INTERVAL '1 day' * (floor(random() * 21) - 10)),
         NOW() + (INTERVAL '1 day' * (floor(random() * 21) - 10)), 'organiser'),
(1, 2, NOW() + (INTERVAL '1 day' * (floor(random() * 21) - 10)),
         NOW() + (INTERVAL '1 day' * (floor(random() * 21) - 10)), 'organiser'),
(2, 1, NOW() + (INTERVAL '1 day' * (floor(random() * 21) - 10)),
         NOW() + (INTERVAL '1 day' * (floor(random() * 21) - 10)), 'attendee'),
(2, 2, NOW() + (INTERVAL '1 day' * (floor(random() * 21) - 10)),
         NOW() + (INTERVAL '1 day' * (floor(random() * 21) - 10)), 'attendee'),
(2, 5, NOW() + (INTERVAL '1 day' * (floor(random() * 21) - 10)),
         NOW() + (INTERVAL '1 day' * (floor(random() * 21) - 10)), 'organiser'),
(3, 1, NOW() + (INTERVAL '1 day' * (floor(random() * 21) - 10)),
         NOW() + (INTERVAL '1 day' * (floor(random() * 21) - 10)), 'attendee'),
(3, 2, NOW() + (INTERVAL '1 day' * (floor(random() * 21) - 10)),
         NOW() + (INTERVAL '1 day' * (floor(random() * 21) - 10)), 'attendee'),
(4, 3, NOW() + (INTERVAL '1 day' * (floor(random() * 21) - 10)),
         NOW() + (INTERVAL '1 day' * (floor(random() * 21) - 10)), 'organiser'),
(4, 4, NOW() + (INTERVAL '1 day' * (floor(random() * 21) - 10)),
         NOW() + (INTERVAL '1 day' * (floor(random() * 21) - 10)), 'organiser'),
(4, 6, NOW() + (INTERVAL '1 day' * (floor(random() * 21) - 10)),
         NOW() + (INTERVAL '1 day' * (floor(random() * 21) - 10)), 'organiser'),
(5, 3, NOW() + (INTERVAL '1 day' * (floor(random() * 21) - 10)),
         NOW() + (INTERVAL '1 day' * (floor(random() * 21) - 10)), 'attendee'),
(5, 4, NOW() + (INTERVAL '1 day' * (floor(random() * 21) - 10)),
         NOW() + (INTERVAL '1 day' * (floor(random() * 21) - 10)), 'attendee'),
(1, 4, NOW() + (INTERVAL '1 day' * (floor(random() * 21) - 10)),
         NOW() + (INTERVAL '1 day' * (floor(random() * 21) - 10)), 'organiser');


-- ============================================================
-- RESET SEQUENCES (so auto-increment continues after seeded IDs)
-- ============================================================
SELECT setval(pg_get_serial_sequence('users', 'id'),              (SELECT MAX(id) FROM users));
SELECT setval(pg_get_serial_sequence('organisations', 'id'),      (SELECT MAX(id) FROM organisations));
SELECT setval(pg_get_serial_sequence('events', 'id'),             (SELECT MAX(id) FROM events));
SELECT setval(pg_get_serial_sequence('availability_rules', 'id'), (SELECT MAX(id) FROM availability_rules));
