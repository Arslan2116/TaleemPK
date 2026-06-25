-- ════════════════════════════════════════════════════════════════════
-- TaleemPK — Update DHA Suffa University (DSU), id = 120
-- Run in Supabase Dashboard → SQL Editor (bypasses RLS).
-- NOTE: short name changes "DHA Suffa" → "DSU" (slug dha-suffa → dsu).
-- After running, regenerate pages:  node build-university-pages.js && node generate-sitemap.js
-- ════════════════════════════════════════════════════════════════════

update institutions set
  name          = 'DSU',
  full_name     = 'DHA Suffa University',
  type          = 'university',
  sector        = 'private',
  city          = 'Karachi',
  province      = 'Sindh',
  icon          = '🏢',
  established    = 2012,
  website       = 'dsu.edu.pk',

  fee           = 'Rs. 98K–1.6L/sem',
  fee_num       = 120000,
  fee_year      = 'Fall 2026',
  fee_note      = 'Recurring fee varies by program (per semester, excl. one-time admission/caution): Humanities ~Rs. 98K, Business ~Rs. 108K, Computing ~Rs. 120–143K, Engineering ~Rs. 133–160K. First semester is higher (includes one-time charges).',

  merit         = 'DSU Admission Test + academic record; min 60% (Engineering) or 50% (CS/Business)',
  entry         = 'DSU Admission Test (GRE/HAT General for MS/MPhil/PhD)',
  scholarships  = 'Merit, need-based (up to 90% tuition waiver), board-position (90%), sibling/employee/alumni waivers. One waiver category at a time.',
  hostel        = null,

  description   = 'DHA Suffa University (DSU) is a private multidisciplinary university in Karachi offering engineering, computing, business, humanities and graduate research programs. It runs a main campus in DHA Karachi and an additional DCK campus with selected undergraduate offerings.',

  tags = ARRAY['private','sindh','engineering','cs','business','arts']::text[],

  highlights = ARRAY[
    'Karachi-based private multidisciplinary university',
    'Strong computing cluster: CS, SE, AI, Data Science, Cyber Security',
    'Engineering + Business + Social Sciences mix',
    'Separate Main Campus and DCK Campus program availability',
    'Merit, need-based and fee-waiver structure publicly defined'
  ]::text[],

  programs = ARRAY[
    -- Engineering
    'BE Electrical Engineering','BE Mechanical Engineering','BE Civil Engineering',
    'BS Computer Engineering','BS Computer Engineering Technology',
    -- Computing
    'BS Computer Science','BS Software Engineering','BS Data Science',
    'BS Artificial Intelligence','BS Cyber Security','BS Multimedia & Gaming',
    -- Architecture
    'BS Architecture',
    -- Business
    'BBA','BS Business Analytics & Programming','BS Accounting and Finance','BS Financial Technology',
    -- Humanities
    'BS International Relations','BS English','BS Psychology',
    -- Graduate
    'ME Mechanical Engineering','ME Electrical Engineering','MS Computer Science',
    'MS Management Sciences','MBA','MPhil Psychology','MPhil International Relations',
    -- PhD
    'PhD Mechanical Engineering','PhD Electrical Engineering','PhD Computer Science','PhD Management Sciences'
  ]::text[]
where id = 120;

-- ── Fee breakdown (Detailed Fee Structure section) ──
delete from fee_details where institution_id = 120;
insert into fee_details (institution_id, label, value, sort_order) values
  (120, 'Admission Fee (one-time)',            'Rs. 15,000',         1),
  (120, 'Caution Money (refundable)',          'Rs. 10,000',         2),
  (120, 'IT Charges (one-time)',               'Rs. 6,000',          3),
  (120, 'Misc Charges (one-time)',             'Rs. 7,000',          4),
  (120, 'Examination Fee (per course)',        'Rs. 1,000',          5),
  (120, 'Humanities — per semester',           '~Rs. 97,650',        6),
  (120, 'Business (BBA) — per semester',       '~Rs. 108,000',       7),
  (120, 'Computer Science — per semester',     '~Rs. 119,510',       8),
  (120, 'Engineering (BE) — per semester',     'Rs. 133,000–159,750',9),
  (120, 'MBA / MS / ME — per semester',        '~Rs. 137,000',      10),
  (120, 'PhD — per semester',                  '~Rs. 124,000',      11);

-- ── Verify ──
-- select id, name, fee, fee_year, array_length(programs,1) as programs, array_length(tags,1) as tags
-- from institutions where id = 120;
-- select label, value from fee_details where institution_id = 120 order by sort_order;
