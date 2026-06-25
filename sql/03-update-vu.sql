-- ════════════════════════════════════════════════════════════════════
-- TaleemPK — Update Virtual University of Pakistan (VU), id = 33
-- Run in Supabase Dashboard → SQL Editor (bypasses RLS).
-- Replaces the old placeholder data with the full researched dataset.
--
-- NOTE on arrays: tags/programs/highlights are assumed to be Postgres text[]
-- (the type Supabase creates for array columns and what the admin panel writes).
-- If you get a type error like "column tags is of type jsonb", tell the dev and
-- we'll swap ARRAY[...] for the jsonb form.
-- ════════════════════════════════════════════════════════════════════

update institutions set
  name          = 'VU',
  full_name     = 'Virtual University of Pakistan',
  type          = 'university',
  sector        = 'public',
  city          = 'Online / Nationwide',
  province      = 'Federal',
  icon          = '💻',
  established    = 2002,
  website       = 'vu.edu.pk',

  fee           = 'Rs. 15–22K/sem',
  fee_num       = 18000,
  fee_year      = 'Spring 2026',
  fee_note      = 'Per-credit-hour billing (~Rs. 1,000/cr for undergraduate). Postgraduate ~Rs. 22–40K/sem; overseas students ~$125–250/sem.',

  merit         = 'Intermediate / A-Level (HEC minimum eligibility); direct admission for most programs',
  entry         = 'Direct admission (entry test for selected programs only)',
  seats         = 'Open enrollment (online)',

  scholarships  = 'Need-based support, fee concession for students with disabilities, limited merit support',
  hostel        = 'Not applicable (fully online university)',

  description   = 'Virtual University of Pakistan (VU) is Pakistan''s first fully online public-sector university, offering distance education through an LMS, recorded video lectures, online assessments, and a nationwide network of examination campuses. It is built for affordability, flexibility, and working professionals.',

  tags = ARRAY['public','federal','cs','business','sciences','arts']::text[],

  highlights = ARRAY[
    'Pakistan''s first fully online university',
    'Federal public-sector institution',
    'Very affordable fee structure',
    'Flexible study for working professionals',
    'Nationwide exam & support campus network'
  ]::text[],

  programs = ARRAY[
    -- Undergraduate
    'BS Computer Science','BS Software Engineering','BS Information Technology',
    'BS Data Science','BS Artificial Intelligence','BS Biotechnology','BS Bioinformatics',
    'BS Mathematics','BS Physics','BS Statistics','BS Economics','BS Accounting & Finance',
    'BBA','BS Commerce','BS Public Administration','BS Psychology','BS Sociology',
    'BS Mass Communication','BS English','BS Education',
    -- Graduate
    'MBA','Executive MBA','MS Computer Science','MS Software Engineering','MS Data Science',
    'MS Mathematics','MS Economics','MS Management Sciences','M.Ed',
    -- PhD
    'PhD Computer Science','PhD Management','PhD Education','PhD Mathematics'
  ]::text[]
where id = 33;

-- ── Fee breakdown (Detailed Fee Structure section on the page) ──
-- Clear any old rows for VU, then insert the verified breakdown.
delete from fee_details where institution_id = 33;

insert into fee_details (institution_id, label, value, sort_order) values
  (33, 'Admission Fee (one-time)',        'Rs. 3,000',   1),
  (33, 'Registration Fee',                'Rs. 2,500',   2),
  (33, 'Security Fee (refundable)',       'Rs. 2,000',   3),
  (33, 'Tuition Fee (per credit hour)',   'Rs. 1,000',   4),
  (33, 'Enrollment Fee (per semester)',   'Rs. 1,000',   5),
  (33, 'Examination Fee (per semester)',  'Rs. 500',     6),
  (33, 'Endowment Fund',                  'Rs. 1,000',   7),
  (33, 'Convocation Fee (final term)',    'Rs. 2,000',   8),
  (33, 'MS Tuition (per credit hour)',    'Rs. 2,950',   9),
  (33, 'Overseas Tuition (per cr. hour)', 'USD 25–30',  10);

-- ── Verify ──
-- select id, name, fee, fee_year, array_length(programs,1) as program_count,
--        array_length(tags,1) as tag_count
-- from institutions where id = 33;
-- select label, value from fee_details where institution_id = 33 order by sort_order;
