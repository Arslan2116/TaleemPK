-- ============================================================================
-- 08-update-uolayyah.sql — enrich University of Layyah = existing institution id 106
-- (TaleemPK name 'UOLayyah'). Keeps name so the /university/uolayyah slug stays intact.
-- Run in Supabase SQL Editor (admin).
-- ============================================================================

UPDATE institutions SET
  full_name   = 'University of Layyah',
  website     = 'ul.edu.pk',
  established  = 2022,
  fee         = 'Rs. 22,230–28,460/sem (UG)',
  fee_num     = 25000,
  fee_year    = '2026',
  fee_note    = 'Per-semester fees for undergraduate programs range from Rs. 22,230 to Rs. 28,460. B.Sc (Hons) Agriculture: Rs. 22,230/sem; BS Economics: Rs. 22,460/sem; BBA: Rs. 23,120/sem; BS Education: Rs. 28,460/sem; BS Applied Psychology: Rs. 28,460/sem. Some programs (BS Agricultural Biotechnology, Botany, Chemistry, Computer Science) have fee marked NA. Fee structure is for local students only; overseas and international students differ.',
  entry       = 'University Entry Test / Merit-based',
  merit       = 'Admissions on merit based on previous academic record and entry test. Eligibility: Intermediate (FA/FSc/ICS/I.Com/DAE) or equivalent with minimum required percentage as per program. Open to all genders and students from all areas.',
  programs    = ARRAY[
    'B.Sc (Hons) Agriculture','BS Agricultural Biotechnology','BS Applied Psychology','BS Botany',
    'BS Chemistry','BS Computer Science','BS Economics','BS Education',
    'BBA (Hons) Business Administration','BS English','BS Environmental Sciences',
    'BS Food Science & Technology','BS Information Technology','BS Mathematics','BS Microbiology',
    'BS Physics','BS Political Science','BS Sociology','BS Software Engineering','BS Statistics',
    'BS Urdu','BS Zoology','Diploma Courses (various disciplines)']::text[],
  tags        = ARRAY['public','punjab','agriculture','sciences','cs','business','arts']::text[],
  scholarships= 'Merit-Based Scholarships, Need-Based Financial Aid, Ehsaas Undergraduate Scholarship, Punjab Educational Endowment Fund (PEEF), Orphan/Disabled Student Scholarships, Minority Student Scholarships, Faculty/Staff Children Concessions.',
  description = 'Public sector university established on 8 December 2022 under the Government of Punjab Act, evolving from the BZU Sub-Campus Layyah established in 2009. HEC recognized degree-awarding institute located on Katchehry Road, Layyah. Offers 23 undergraduate degree programs along with diploma courses in Sciences, Agriculture, Social Sciences, Business, and Languages.',
  highlights  = ARRAY[
    'Public sector university chartered by Government of Punjab',
    'HEC recognized degree-awarding institute (established 2022)',
    'Originally established as BZU Sub-Campus Layyah in 2009',
    'Affordable fee structure (Rs. 22,230–28,460/semester)',
    'Faculty of Computing & Engineering established in 2024',
    'Merit-based scholarships and laptop schemes available']::text[]
WHERE id = 106;

-- Fee breakdown (only programs with a published amount; NA programs omitted)
DELETE FROM fee_details WHERE institution_id = 106;
INSERT INTO fee_details (institution_id, label, value, sort_order) VALUES
  (106, 'B.Sc (Hons) Agriculture (per semester)', 22230, 0),
  (106, 'BS Economics (per semester)', 22460, 1),
  (106, 'BBA (Hons) Business Administration (per semester)', 23120, 2),
  (106, 'BS Education (per semester)', 28460, 3),
  (106, 'BS Applied Psychology (per semester)', 28460, 4);

-- After running: node build-university-pages.js (regenerate uolayyah.html), then commit.
