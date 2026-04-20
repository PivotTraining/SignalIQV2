-- ─────────────────────────────────────────────────────────────────────────────
-- Signal IQ v2 — Seed Data
-- Run AFTER schema.sql. SQL Editor → paste → Run
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── Owners ──────────────────────────────────────────────────────────────────
insert into owners (id, name, role, email, active) values
  ('11111111-0000-0000-0000-000000000001', 'Chris Davis',   'Founder',   'chris@pivottraining.com',   true),
  ('11111111-0000-0000-0000-000000000002', 'Jazmine Davis',  'CoFounder', 'jazmine@pivottraining.com', true)
on conflict (id) do nothing;

-- ─── Tags ────────────────────────────────────────────────────────────────────
insert into tags (tag_name, category, color) values
  ('ICP-Tier1',          'ICP',       'Purple'),
  ('ICP-Tier2',          'ICP',       'Blue'),
  ('Hot Sequence',       'Lifecycle', 'Red'),
  ('Nurture',            'Lifecycle', 'Green'),
  ('Decision-Ready',     'Lifecycle', 'Amber'),
  ('School / EDU',       'ICP',       'Blue'),
  ('Non-profit',         'ICP',       'Green'),
  ('Corporate Wellness', 'ICP',       'Purple'),
  ('Follow-up 30d',      'Temp',      'Gray'),
  ('Referred',           'Custom',    'Amber')
on conflict do nothing;

-- ─── Contacts ────────────────────────────────────────────────────────────────
insert into contacts (id, name, title, company, email, headcount, industry,
  intent, signal_stack, intent_velocity, budget_indicator,
  authority_match, timing_window, social_proof, last_touch, next_move, owner_id)
values
  (
    'cccccccc-0000-0000-0000-000000000001',
    'Marcus Reyes', 'VP Growth', 'Nimbus Labs', 'marcus@nimbuslabs.com',
    42, 'DevTools SaaS',
    85, 92, 85, 78, 88, 90, 80,
    '2026-04-19',
    'Pattern interrupt. Do not pitch. Two-sentence curiosity hook.',
    '11111111-0000-0000-0000-000000000001'
  ),
  (
    'cccccccc-0000-0000-0000-000000000002',
    'Keira Thompson', 'Head of People', 'Brightline Health', 'keira@brightlinehealth.com',
    210, 'Digital Health',
    90, 95, 90, 85, 92, 88, 91,
    '2026-04-20',
    'Move to close. Send proposal within 24h.',
    '11111111-0000-0000-0000-000000000001'
  ),
  (
    'cccccccc-0000-0000-0000-000000000003',
    'Jordan Walsh', 'CTO', 'LedgerPoint', 'jordan@ledgerpoint.com',
    16, 'Fintech',
    45, 60, 45, 70, 72, 55, 65,
    '2026-04-11',
    'Permission-to-reconnect message. No ask. 5-day silence.',
    '11111111-0000-0000-0000-000000000001'
  ),
  (
    'cccccccc-0000-0000-0000-000000000004',
    'Ana Okafor', 'Director of L&D', 'NovaBridge Corp', 'ana@novabridge.com',
    380, 'Enterprise Software',
    75, 78, 75, 82, 85, 70, 79,
    '2026-04-18',
    'Co-regulation play. Share a client win. Invite low-stakes response.',
    '11111111-0000-0000-0000-000000000001'
  ),
  (
    'cccccccc-0000-0000-0000-000000000005',
    'Diego Ramos', 'Founder', 'Pulsecart', 'diego@pulsecart.com',
    4, 'E-commerce Tools',
    40, 55, 60, 35, 95, 40, 50,
    '2026-04-07',
    'Nurture. Below budget threshold — quarterly touch only.',
    '11111111-0000-0000-0000-000000000001'
  ),
  (
    'cccccccc-0000-0000-0000-000000000006',
    'Priya Shah', 'COO', 'Vantage Loop', 'priya@vantageloop.com',
    34, 'Ops & Analytics',
    55, 70, 55, 78, 80, 72, 68,
    '2026-04-17',
    'Reframe. Show ROI in ops efficiency language.',
    '11111111-0000-0000-0000-000000000001'
  )
on conflict (id) do nothing;

-- ─── Interactions ─────────────────────────────────────────────────────────────
insert into interactions (contact_id, date, channel, direction, depth, intent, notes, latency_hours)
values
  -- Marcus Reyes (3 touches)
  ('cccccccc-0000-0000-0000-000000000001', '2026-04-10', 'linkedin', 'out', 2, 50,
   'Congrats on the Series A — following your DevTools journey.',     null),
  ('cccccccc-0000-0000-0000-000000000001', '2026-04-15', 'email',    'out', 3, 60,
   'Sent GTM teardown for DevTools expansion.',                        null),
  ('cccccccc-0000-0000-0000-000000000001', '2026-04-19', 'email',    'in',  4, 85,
   'This is exactly what we are wrestling with. Can we talk Thursday?', 6),

  -- Keira Thompson (2 touches)
  ('cccccccc-0000-0000-0000-000000000002', '2026-04-14', 'email',    'out', 3, 70,
   'Shared case study on people-ops transformation.',                  null),
  ('cccccccc-0000-0000-0000-000000000002', '2026-04-20', 'email',    'in',  5, 90,
   'We want to move forward. Who handles contracts on your side?',     3),

  -- Jordan Walsh (2 touches)
  ('cccccccc-0000-0000-0000-000000000003', '2026-04-02', 'email',    'out', 2, 40,
   'Checking in — any traction on the compliance automation front?',   null),
  ('cccccccc-0000-0000-0000-000000000003', '2026-04-11', 'email',    'in',  1, 20,
   'ok',                                                               22),

  -- Ana Okafor (2 touches)
  ('cccccccc-0000-0000-0000-000000000004', '2026-04-12', 'call',     'out', 4, 65,
   '30-min discovery call. Strong ICP fit confirmed.',                 null),
  ('cccccccc-0000-0000-0000-000000000004', '2026-04-18', 'email',    'in',  4, 85,
   'Yes please. How do we move forward on pricing?',                   26),

  -- Diego Ramos (2 touches)
  ('cccccccc-0000-0000-0000-000000000005', '2026-04-03', 'email',    'out', 2, 35,
   'Diego — sharing a note on indie GTM when you are past the $10K line.', null),
  ('cccccccc-0000-0000-0000-000000000005', '2026-04-04', 'email',    'in',  2, 30,
   'Thanks, appreciate you thinking of me. Maybe later when we hit the next milestone.', 18),

  -- Priya Shah (2 touches)
  ('cccccccc-0000-0000-0000-000000000006', '2026-04-10', 'email',    'out', 3, 55,
   'Sent ops efficiency ROI breakdown — Snowflake + Hex stack.',       null),
  ('cccccccc-0000-0000-0000-000000000006', '2026-04-17', 'email',    'in',  3, 55,
   'Interesting framing. Let me share this with my ops lead.',         48);
