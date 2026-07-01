-- ============================================================
-- Data-quality fixes for institutions.city
-- Run in Supabase SQL Editor. Har section independent hai.
-- ============================================================

-- 1. Larkano → Larkana (spelling standardize, id 272 University of Larkano)
UPDATE institutions SET city = 'Larkana' WHERE city = 'Larkano';

-- 2. DG Khan → Dera Ghazi Khan (id 102 Ghazi University; baaki sab pehle se full naam use karte hain)
UPDATE institutions SET city = 'Dera Ghazi Khan' WHERE city = 'DG Khan';

-- 3. Khairpur Mirs → Khairpur (same city — MUET id 17 "Jamshoro / Khairpur Mirs")
UPDATE institutions SET city = REPLACE(city, 'Khairpur Mirs', 'Khairpur') WHERE city ILIKE '%Khairpur Mirs%';

-- 4. Benazirabad → Shaheed Benazirabad (official district name, id 150)
UPDATE institutions SET city = 'Shaheed Benazirabad' WHERE city = 'Benazirabad';

-- 5. Province suffix city se hatao — dropdown mein "KPK"/"Punjab" cities ban rahi thin
UPDATE institutions SET city = 'Peshawar' WHERE id = 29;  -- was "Peshawar, KPK"
UPDATE institutions SET city = 'Taxila'   WHERE id = 24;  -- was "Taxila, Punjab"

-- 6. NED campus label saaf karo — "(TIEST)" dropdown mein ajeeb dikhta hai
UPDATE institutions SET city = 'Karachi / Tharparkar' WHERE id = 10;  -- was "Karachi / Tharparkar (TIEST)"

-- ============================================================
-- ⚠️ MANUAL REVIEW — pehle confirm karo, phir uncomment karke chalao
-- ============================================================

-- A. DUPLICATE UNIVERSITY: Shaheed Benazir Bhutto University do dafa listed hai:
--    id 150 = "Shaheed Benazir Bhutto University Benazirabad"
--    id 233 = "Shaheed Benazir Bhutto University, Shaheed Benazirabad"
--    Yeh same university hai. Ek delete karo (jis mein kam data ho):
-- DELETE FROM institutions WHERE id = 233;

-- B. TAG-GU (id 231, Talal Abu-Ghazaleh Global University) — city "Amman" (Jordan),
--    province "International". Yeh Pakistani university nahi. Agar site sirf
--    "HEC universities in Pakistan" claim karti hai toh isko remove karo:
-- DELETE FROM institutions WHERE id = 231;

-- ============================================================
-- Verify: fixes ke baad city list check karo
-- SELECT DISTINCT city FROM institutions ORDER BY city;
-- ============================================================
