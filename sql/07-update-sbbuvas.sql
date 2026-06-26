-- ============================================================================
-- 07-update-sbbuvas.sql — enrich SBBUVAS (Sakrand) = existing institution id 152
-- (TaleemPK had it as placeholder "SBBUVS / SBB University of Veterinary Sciences").
-- Keeps name='SBBUVS' so the /university/sbbuvs slug & URL stay intact.
-- Run in Supabase SQL Editor (admin).
-- ============================================================================

UPDATE institutions SET
  full_name   = 'Shaheed Benazir Bhutto University of Veterinary and Animal Sciences',
  website     = 'sbbuvas.edu.pk',
  fee         = 'Rs. 23,950–45,450/sem (varies by batch & scheme)',
  fee_num     = 23950,
  fee_year    = '2026',
  fee_note    = 'Fee structure varies significantly by batch and admission scheme. Semester registration fees: 2K22/2K23: Rs. 9,300; 2K24: Rs. 17,950; 2K25: Rs. 27,450. Self-Finance/Sponsor Scheme total at-admission cost: Rs. 64,450 (Admission Fee Rs. 25,000 + Tuition Fee Rs. 12,000 + other charges). Merit-based total at-admission: Rs. 45,450. New entrants base fee: Rs. 23,950. Late registration penalties: Rs. 1,000–3,000. Self-Finance scheme: Rs. 600,000 (Sindh & other provinces).',
  entry       = 'Pre-Entry Test / GRE-type Test (for M.Phil)',
  merit       = 'Undergraduate: Minimum 50% marks in Intermediate/HSC/A-Levels. Merit formula (CPN): 50% Entry Test + 40% Intermediate/HSC + 10% Matric. M.Phil: DVM or BS in relevant field with min 50% marks + GRE-type test.',
  programs    = ARRAY[
    'Doctor of Veterinary Medicine (DVM - 5 Years)','BS Poultry Science','BS Fisheries & Aquaculture',
    'BS Wildlife Management','BS Forestry','BS Food Science & Technology','BS Biotechnology',
    'BS Biochemistry','BS Information Technology','Bachelor of Business Administration (BBA)',
    'M.Phil Veterinary Microbiology','M.Phil Veterinary Pathology','M.Phil Veterinary Surgery',
    'M.Phil Theriogenology','M.Phil Poultry Science','M.Phil Dairy Technology',
    'M.Phil Veterinary Anatomy & Histology']::text[],
  tags        = ARRAY['public','sindh','veterinary','agriculture','sciences','cs','business']::text[],
  scholarships= 'Ehsaas Undergraduate Scholarship, Need Cum Merit-Based Scholarship, merit-based awards, need-based financial aid, research funding opportunities.',
  description = 'Public sector university located in Sakrand, Sindh. Recognized by HEC and accredited by Pakistan Veterinary Medical Council (PVMC). Offers DVM, BS, and M.Phil programs in veterinary, animal sciences, biotechnology, IT, and management.',
  highlights  = ARRAY[
    'HEC recognized & PVMC accredited',
    'Public sector university in Sakrand, Sindh',
    'Offers DVM (5-year) and BS programs',
    'M.Phil programs in multiple veterinary disciplines',
    'Merit formula: 50% Entry Test + 40% HSC + 10% Matric',
    'Self-Finance and Sponsor schemes available']::text[]
WHERE id = 152;

-- Fee breakdown (replace any existing rows for a clean set)
DELETE FROM fee_details WHERE institution_id = 152;
INSERT INTO fee_details (institution_id, label, value, sort_order) VALUES
  (152, '2K22/2K23 Batch - Semester Registration', 9300, 0),
  (152, '2K24 Batch - Semester Registration', 17950, 1),
  (152, '2K25 Batch - Semester Registration', 27450, 2),
  (152, 'Admission Fee (Self-Finance/Sponsor - one-time)', 25000, 3),
  (152, 'Tuition Fee (per semester)', 12000, 4),
  (152, 'Merit-Based Total (at-admission)', 45450, 5),
  (152, 'Self-Finance/Sponsor Total (at-admission)', 64450, 6),
  (152, 'New Entrants Base Fee', 23950, 7),
  (152, 'Late Registration Penalty (after due date)', 1000, 8),
  (152, 'Late Registration Penalty (after 13 Feb 2026)', 3000, 9),
  (152, 'Self-Finance Scheme (total lump sum)', 600000, 10);

-- After running: node build-university-pages.js (regenerate sbbuvs.html), then commit.
