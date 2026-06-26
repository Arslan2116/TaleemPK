-- ============================================================================
-- 09-batch-enrich-8.sql — enrich 8 existing universities with full official data.
-- All target existing rows by id (verified); names/slugs unchanged. Run in Supabase.
-- ============================================================================

-- #250 MUK — Metropolitan University Karachi
UPDATE institutions SET
  full_name = 'Metropolitan University Karachi',
  website = 'muk.edu.pk',
  established = 2016,
  fee = 'Rs. 43,500–70,500/sem',
  fee_num = 43500,
  fee_year = '2026',
  fee_note = 'Fee structure: 1st semester total Rs. 70,500 (includes Admission Fee Rs. 20,000, Security Deposit Rs. 2,000, Enrollment Fee Rs. 5,000, Medical Rs. 500, Student Activity Rs. 500, Network Charges Rs. 500, Laboratory Fee Rs. 500, Library Fee Rs. 500, Examination Fee Rs. 5,000, and Tuition Fee Rs. 36,000 for 18 credit hours). From 2nd semester onwards: Rs. 43,500 per semester (excluding one-time fees). Tuition fee is Rs. 2,000 per credit hour. Fee is for local students only; overseas and international students have different fee structures. Concession can be given only on Admission Fee.',
  entry = 'Entry Test + Interview',
  merit = 'Minimum 45% marks in Higher Secondary Certificate (HSC) or equivalent for BBA, BS-Commerce, and BS Education programs. Admissions offered on merit irrespective of nationality, gender, ethnic background, creed, or socio-economic status. All applicants go through entry test and interview. For graduate applicants, CGPA is considered. Foreign qualifications require equivalence certificate from IBCC or HEC.',
  seats = '40 students per program per semester (as per HEC NOC)',
  programs = ARRAY['BBA - Bachelor of Business Administration (4 Years)','BS-Commerce - Bachelor of Science in Commerce (4 Years)','BS-Education - Bachelor of Science in Education (4 Years)','BS-Islamic Studies - Bachelor of Science in Islamic Studies (4 Years)']::text[],
  tags = ARRAY['private','sindh','business','education','islamic']::text[],
  scholarships = 'Merit-based and need-based scholarships available. Contact university for specific eligibility and deadlines.',
  description = 'Private sector university established in 2016 under the Government of Sindh, recognized by HEC. Founded by the MAB Foundation on a 20,000-yard property. Located at Safoora Roundabout, Sector 34-A KDA Scheme, 33 Main University Rd, Karachi. Offers undergraduate programs in Business Administration, Commerce, Education, and Islamic Studies.',
  highlights = ARRAY['Chartered by Government of Sindh','HEC recognized degree-awarding institute','Established 2016','Located on a 20,000-yard campus','Affordable per-credit-hour fee model','Merit-based admissions with entry test and interview','Small class sizes (max 40 students per program per semester)']::text[]
WHERE id = 250;
DELETE FROM fee_details WHERE institution_id = 250;
INSERT INTO fee_details (institution_id, label, value, sort_order) VALUES
  (250, '1st Semester Total (including all one-time fees)', 70500, 0),
  (250, 'Subsequent Semesters (per semester)', 43500, 1),
  (250, 'Admission Fee (one-time, non-refundable)', 20000, 2),
  (250, 'Security Deposit (refundable)', 2000, 3),
  (250, 'Enrollment Fee (one-time)', 5000, 4),
  (250, 'Tuition Fee (per credit hour)', 2000, 5),
  (250, 'Tuition Fee (per semester for 18 credit hours)', 36000, 6),
  (250, 'Examination Fee (per semester)', 5000, 7);

-- #251 LIST — Lahore Institute of Science and Technology
UPDATE institutions SET
  full_name = 'Lahore Institute of Science and Technology',
  website = 'list.edu.pk',
  established = 2022,
  fee = 'Rs. 110,000–130,000/sem (varies by program)',
  fee_num = 110000,
  fee_year = '2024',
  fee_note = 'BS Nursing and Post RN: Rs. 110,000/sem tuition + Rs. 30,000 admission (once) + Rs. 5,000 exam/sem + Rs. 3,000 library (once). LHV, CMW, CNA: Rs. 130,000 total package. Other programs (BSCS, BSIT, BSSE, BBA, DPT, etc.) fee not publicly listed; contact university.',
  entry = 'Institute Admission Test + Interview',
  merit = 'UG: Minimum 50% marks in Intermediate/FA/FSc/ICS/I.Com/DAE or equivalent. BS (SE), BS Engineering Technologies (Electrical/Civil), DPT: Minimum 60% marks. Postgraduate: Bachelor''s in second division (min 45% or CGPA 2.0/4.0) + entry test + interview. Age limit: BS max 22 years; Master/MBA max 28 years; MBA Executive max 45 years.',
  programs = ARRAY['BS Computer Science (BSCS)','BS Information Technology (BSIT)','BS Software Engineering (BSSE)','BS Business Administration (BBA)','BS Human Nutrition & Dietetics (BS HND)','BS English','BS Applied Psychology','Doctor of Physical Therapy (DPT - 5 Years)','BSc Electrical Engineering Technology (BSc EET)','BSc Civil Engineering Technology (BSc CET)','BS Nursing (4 Years)','Post RN Nursing (2 Years)','Lady Health Visitor (LHV - 2 Years)','Community Midwifery (CMW - 2 Years)','Certified Nursing Assistant (CNA - 2 Years)','MBA (Master of Business Administration)','MBA Executive']::text[],
  tags = ARRAY['private','punjab','cs','engineering','business','medical','arts']::text[],
  scholarships = 'Merit-based (90%+ marks = 100% tuition waiver; 80%+ marks = 50% waiver; A-Level 3As = 100%; 2As = 50%), Need-Based, Alumni Discount, Kinship Discount, Disability Discount, Encouragement Discount, LIST Alumni Scholarship, Co-Curricular & Sports Scholarship, Specially-Abled Students Scholarship, LIST Staff Scholarship, Contingency Scholarship.',
  description = 'Private sector university in Lahore, chartered by the Government of Punjab and recognized by HEC. Established in 2022. Offers undergraduate and graduate programs in computing, engineering, business, health sciences, and humanities.',
  highlights = ARRAY['Chartered by Government of Punjab','HEC recognized degree-awarding institute','Established in 2022','Merit-based scholarships up to 100% tuition waiver','Multiple scholarship programs available','State-of-the-art facilities and experienced faculty']::text[]
WHERE id = 251;
DELETE FROM fee_details WHERE institution_id = 251;
INSERT INTO fee_details (institution_id, label, value, sort_order) VALUES
  (251, 'BS Nursing / Post RN - Tuition (per semester)', 110000, 0),
  (251, 'BS Nursing / Post RN - Admission Fee (one-time)', 30000, 1),
  (251, 'BS Nursing / Post RN - Examination Fee (per semester)', 5000, 2),
  (251, 'BS Nursing / Post RN - Library Fee (one-time)', 3000, 3),
  (251, 'LHV / CMW / CNA - Total Package', 130000, 4);

-- #197 UADIK — University of Agriculture, Dera Ismail Khan
UPDATE institutions SET
  full_name = 'University of Agriculture, Dera Ismail Khan',
  website = 'uad.edu.pk',
  established = 2018,
  fee = 'Rs. 25,000/sem (approx.)',
  fee_num = 25000,
  fee_year = '2025-2026',
  fee_note = 'Per-semester tuition is approximately Rs. 25,000. The university reserves the right to change the fee structure from time to time. Fee may vary by program; contact university for exact figures.',
  entry = 'University Entry Test',
  merit = 'Minimum 50% marks in entry test and previous academic record. For BS programs: 12-year pre-engineering or equivalent with mathematics, minimum 50%, are eligible to sit the entry test.',
  programs = ARRAY['BSc(Hons) Agriculture','BS Forestry','BS Zoology','BS Botany','BS Mathematics','BS English','BS Environmental Sciences','BS Nutrition','BS Medical Laboratory Technology','BS Physical Therapy and Rehabilitation','Diploma in Veterinary and Animal Sciences (3 Years)','Diploma in Medical Sciences (2 Years)','Livestock Assistant Diploma (2 Years)','MSc Agriculture','MSc Zoology','MSc Botany','MSc Mathematics','MPhil Agriculture','MPhil Zoology','MPhil Botany','MPhil Mathematics','MPhil English']::text[],
  tags = ARRAY['public','kpk','agriculture','sciences','medical','arts']::text[],
  scholarships = 'HEC Ehsaas Scholarship, HEC Need-Based Scholarship, HEC-German Need-Based Scholarships, UAD Need-Based Scholarship, UAD Merit-Based Scholarship, Mora Scholarship, FATA Scholarship, Frontier Education Foundation (FEF)',
  description = 'Public sector university established in March 2018, chartered by the Khyber Pakhtunkhwa Provincial Assembly and recognized by HEC. Located near Qureshi Morr, Dera Ismail Khan. Started academic activities in Fall 2019. Accredited by Pakistan Veterinary Medical Council (PVMC) and Pakistan Agricultural Council (PARC).',
  highlights = ARRAY['Chartered by Government of Khyber Pakhtunkhwa','HEC recognized degree-awarding institute','PVMC and PARC accredited programs','Established in March 2018','Affordable tuition fee (approx. Rs. 25,000/semester)','Multiple scholarship programs available','Research focus with specialized research institutes']::text[]
WHERE id = 197;
DELETE FROM fee_details WHERE institution_id = 197;
INSERT INTO fee_details (institution_id, label, value, sort_order) VALUES
  (197, 'Undergraduate Programs (per semester)', 25000, 0);

-- #154 USMS — University of Sufism and Modern Sciences
UPDATE institutions SET
  full_name = 'University of Sufism and Modern Sciences',
  website = 'usms.edu.pk',
  established = 2011,
  fee = 'Rs. 23,000/sem (UG)',
  fee_num = 23000,
  fee_year = '2025-2026',
  fee_note = 'Flat tuition fee of Rs. 23,000 per semester for most undergraduate programs. Admission processing fee of Rs. 3,000 (non-refundable). MPhil admission processing fee is Rs. 5,000. Fee may vary for postgraduate programs; contact university for details.',
  entry = 'USMS Pre-Entry Test / Interview',
  merit = 'Minimum 50% marks in HSC/Intermediate/A-Level or equivalent. DAE holders with STEVTA equivalence can also apply. Result-awaiting students may apply provisionally. For postgraduate: 14 or 16 years of relevant education with minimum second division.',
  programs = ARRAY['BBA - Bachelor of Business Administration (4 Years)','BS Accounting & Finance (4 Years)','BS Commerce (4 Years)','BS Computer Science (4 Years)','BS Information Technology (4 Years)','BS English - Linguistics & Literature (4 Years)','B.Ed (Hons) - Education (4 Years)','B.Ed - Education (2.5 Years)','B.Ed - Education (1.5 Years)','MPhil Management Sciences (2 Years)','MS Data Science']::text[],
  tags = ARRAY['public','sindh','islamic','business','cs','education','arts']::text[],
  scholarships = 'Ehsaas Undergraduate Scholarship Program, Prime Minister Youth Laptop Scheme, Benazir Undergraduate Scholarship, Sindh Education Endowment Fund, Punjab Education Endowment Fund, Need-Cum-Merit Based Scholarships, Zakat Scholarship, Minority-Based Scholarships.',
  hostel = 'Limited hostel facilities available for both male and female students on a first-come, first-served basis.',
  description = 'Public sector university in Bhit Shah, Matiari District, Sindh. Chartered by Government of Sindh on 21 November 2011. HEC recognized institution situated near the shrine of Sufi Saint Hazrat Shah Abdul Latif Bhittai. Its mission is to blend traditional Sufi values with modern sciences.',
  highlights = ARRAY['Public sector university chartered by Government of Sindh','HEC recognized degree-awarding institute','Located near shrine of Hazrat Shah Abdul Latif Bhittai','Affordable tuition fee (Rs. 23,000/semester)','Limited hostel facilities available','Multiple scholarship programs available','Unique blend of Sufi values and modern sciences']::text[]
WHERE id = 154;
DELETE FROM fee_details WHERE institution_id = 154;
INSERT INTO fee_details (institution_id, label, value, sort_order) VALUES
  (154, 'BS / BBA / B.Ed (Hons) - Tuition (per semester)', 23000, 0),
  (154, 'BS Computer Science - Tuition (per semester)', 23000, 1),
  (154, 'BS Information Technology - Tuition (per semester)', 23000, 2),
  (154, 'BS Commerce - Tuition (per semester)', 23000, 3),
  (154, 'BS Accounting & Finance - Tuition (per semester)', 23000, 4),
  (154, 'BS English - Tuition (per semester)', 23000, 5),
  (154, 'B.Ed (1.5 Years) - Tuition (per semester)', 23000, 6),
  (154, 'B.Ed (2.5 Years) - Tuition (per semester)', 23000, 7),
  (154, 'Admission Processing Fee (UG - one-time)', 3000, 8),
  (154, 'Admission Processing Fee (MPhil - one-time)', 5000, 9);

-- #252 GNIES — Ghazi National Institute of Engineering and Sciences
UPDATE institutions SET
  full_name = 'Ghazi National Institute of Engineering and Sciences',
  website = 'gnies.edu.pk',
  established = 2021,
  fee = 'Contact university / Not publicly listed',
  fee_num = NULL,
  fee_year = '2026',
  fee_note = 'Specific semester/program fees are not publicly available on the university website or in search results. The university is a private sector degree-awarding institute chartered by the Government of Punjab. Students are advised to contact the admission office directly for the complete fee structure.',
  entry = 'Merit-based / LAT (for LLB)',
  merit = 'Minimum 45% marks in FA/FSc for LLB; LAT with 50% marks required. BS Physics: Minimum 45% marks in FSc (Pre-Medical/Engineering) with Physics and Mathematics or DAE in relevant field. Post-Associate Degree in Physics: Minimum 45% marks or CGPA 2.00/4.00. Admissions offered in Fall and Spring sessions.',
  programs = ARRAY['BBA (Hons) Business Administration','B.Ed Education','LLB Law','BS Botany','BS Chemistry','BS Communication & Media Studies','BS Computer Science','BS Digital Marketing','BS English','BS Fashion Design','BS Fine Arts (BFA)','BS Information Technology','BS Islamic Studies','BS Mathematics','BS Media Studies','BS Microbiology','BS Physics','BS Psychology','BS Urdu','BS Zoology','ADCP Advanced Diploma in Clinical Psychology','EMBA Executive MBA','PMDCP Post Magistral Diploma in Clinical Psychology']::text[],
  tags = ARRAY['private','punjab','business','cs','sciences','arts','law','education']::text[],
  scholarships = 'Merit-based and need-based scholarships available for undergraduate and postgraduate students. Contact university for specific eligibility and deadlines.',
  hostel = 'Available (on-campus)',
  description = 'Private sector degree-awarding institute chartered by the Government of Punjab and recognized by HEC, Pakistan Bar Council, NCEAC, NACTA, and NBEAC. Located in Dera Ghazi Khan, established in 2021. Offers undergraduate and postgraduate programs in engineering, sciences, business, law, and humanities.',
  highlights = ARRAY['Chartered by Government of Punjab','HEC recognized degree-awarding institute','Pakistan Bar Council approved (LLB)','NCEAC, NACTA, and NBEAC accredited','Hostel facilities available','Scholarships for deserving students','Fall and Spring admissions']::text[]
WHERE id = 252;
DELETE FROM fee_details WHERE institution_id = 252;

-- #253 UMS — The University of Modern Sciences
UPDATE institutions SET
  full_name = 'The University of Modern Sciences',
  website = 'ums.edu.pk',
  established = 2018,
  fee = 'Varies by program (Rs. 90,000–219,615/sem)',
  fee_num = NULL,
  fee_year = '2025-26',
  fee_note = 'Fee structure differs significantly by program level. MS/M.Phil: Rs. 90,000/sem tuition + one-time fees. Pharm.D/DPT: Rs. 150,000–219,615/sem tuition (increasing yearly). 4-year programs (BBA, BSIT, BSMLT, BSRIT): Rs. 90,000–119,790/sem tuition (increasing yearly). 50% discount on all programs (merit & need-based).',
  entry = 'Merit-based',
  merit = '5-Year Programs (MBBS, DPT, Pharm.D): Minimum 60% marks in Pre-Medical or equivalent. 4-Year Programs (BBA, BS IT, BS MLT, BS RIT, BSN): Minimum 50% marks in Pre-Medical/Pre-Engineering or equivalent. Postgraduate (MS/M.Phil): 4-year BS degree or equivalent 16 years of education in a relevant field.',
  programs = ARRAY['MBBS (5 Years)','Doctor of Pharmacy (Pharm.D - 5 Years)','Doctor of Physical Therapy (DPT - 5 Years)','BS Medical Laboratory Technology (BS MLT - 4 Years)','BS Biochemistry (4 Years)','Bachelor of Business Administration (BBA - 4 Years)','BS Information Technology (BS IT - 4 Years)','BS Forensic Science / Forensic Biology (4 Years)','BS Radiologic Technology (4 Years)','Generic BSN (4 Years + 1 Year Internship)','Post RN BSN / Post RN BSM (2 Years)','Post Basic Specialized Diploma in ICU & CCU (1 Year)','Certified Nursing Assistant (CNA - 2 Years)','MS Business Administration (2 Years)','M.Phil Bio-Chemistry (2 Years)']::text[],
  tags = ARRAY['private','sindh','medical','business','cs']::text[],
  scholarships = 'Merit-based and need-based scholarships available. 50% discount on all programs (merit & need-based). Undergraduates must maintain minimum cumulative GPA of 3.0 to retain merit scholarship. Limited seats apply. Female students strongly encouraged to apply.',
  hostel = 'Available (hostel accommodation)',
  description = 'Private university established in 2018 in Tando Muhammad Khan, Sindh. Chartered by Government of Sindh and recognized by HEC. First private institution in rural Sindh, founded by PACSF to address the urgent need for quality education in underserved areas.',
  highlights = ARRAY['Chartered by Government of Sindh','HEC recognized degree-awarding institute','First private university in rural Sindh','500-bed teaching hospital for clinical training','Merit and need-based scholarships (50% discount)','Free transport and hostel accommodation','Well-equipped labs, smart classrooms, digital library','NCEAC accredited computing programs']::text[]
WHERE id = 253;
DELETE FROM fee_details WHERE institution_id = 253;
INSERT INTO fee_details (institution_id, label, value, sort_order) VALUES
  (253, 'MS/M.Phil Programs - Tuition (per semester)', 90000, 0),
  (253, 'MS/M.Phil Programs - Admission Fee (one-time)', 20000, 1),
  (253, 'MS/M.Phil Programs - University Fee (one-time)', 10000, 2),
  (253, 'Pharm.D / DPT - Tuition Year 1 (per semester)', 150000, 3),
  (253, 'Pharm.D / DPT - Tuition Year 5 (per semester)', 219615, 4),
  (253, 'Pharm.D / DPT - Admission Fee (one-time)', 50000, 5),
  (253, '4-Year Programs (BBA, BSIT, BSMLT, BSRIT) - Tuition Year 1 (per semester)', 90000, 6),
  (253, '4-Year Programs - Tuition Year 4 (per semester)', 119790, 7),
  (253, '4-Year Programs - Admission Fee (one-time)', 20000, 8),
  (253, 'Security Deposit (refundable - one-time)', 25000, 9),
  (253, 'Library Fee (per semester)', 1000, 10),
  (253, 'Student Activity Fee (per semester)', 2000, 11);

-- #135 SBBCU — Shaheed Benazir Bhutto City University
UPDATE institutions SET
  full_name = 'Shaheed Benazir Bhutto City University',
  website = 'sbbcu.edu.pk',
  established = 2013,
  fee = 'Contact university / Not publicly listed',
  fee_num = NULL,
  fee_year = '2026',
  fee_note = 'Comprehensive semester tuition fees are not publicly listed on the university official website or in available search results. The university states its fee structure is designed to ensure affordability and quality education for all, and that exact fees may vary by program. One source lists a course fee of Rs. 75,000 per year, but this could not be verified. Students are advised to contact the admission office directly for the complete fee structure.',
  entry = 'Merit-based / Contact university',
  merit = 'Admission based on previous academic record. Contact university for specific eligibility criteria.',
  programs = ARRAY['BBA Business Administration','B.Com Commerce','B.Ed Education','Bachelors in Computer Science','Bachelors in Information Technology','BFD / BTD Diplomas in Fashion & Textile Design','MBA Master of Business Administration','M.Ed Master of Education','BS Electrical Technology','BS Electronic Technology']::text[],
  tags = ARRAY['private','sindh','business','cs','education','arts','engineering']::text[],
  scholarships = 'Merit-based and need-based scholarships are available to support students. Contact university for specific eligibility and deadlines.',
  description = 'Private degree-awarding institution located in Karachi, Sindh. Established in 2013 under the Government of Sindh and recognized by HEC. The university aims to provide quality education across business, technology, arts, and education disciplines.',
  highlights = ARRAY['Chartered by Government of Sindh','HEC recognized degree-awarding institute','Established in 2013','Private sector university in Karachi','Offers undergraduate and postgraduate programs']::text[]
WHERE id = 135;
DELETE FROM fee_details WHERE institution_id = 135;

-- #140 Malir — Malir University of Science and Technology
UPDATE institutions SET
  full_name = 'Malir University of Science and Technology',
  website = 'maliruniversity.edu.pk',
  established = 2022,
  fee = 'Free of cost (Tuition-free) / One-time fees only',
  fee_num = 0,
  fee_year = '2026-27',
  fee_note = 'The university offers free-of-cost undergraduate education. Students only pay one-time fees including Admission Fee (Rs. 10,000), ID Card (Rs. 1,500), Enrollment Card (Rs. 1,500), and Examination Fee (Rs. 2,500 per semester). Retake exams and graduation certificates have additional nominal charges.',
  entry = 'University Admission Test / Recognized Entry Test',
  merit = 'Minimum 50% marks in Intermediate (HSSC) or equivalent (A-Levels, etc.) from a recognized board. Foreign qualifications require IBCC equivalency certificate. Shortlisted candidates called for interview. For BS Psychology: Intermediate in any discipline with at least 50% marks; age limit 17-35 years.',
  programs = ARRAY['BS Medical Laboratory Technology (MLT)','BS Psychology','BS Public Health','BS Nursing']::text[],
  tags = ARRAY['private','sindh','medical','sciences']::text[],
  scholarships = '100% free education (tuition-free) for all undergraduate students through the Zafar & Atia Foundation Charitable Trust. Additional merit and need-based scholarships may be available.',
  hostel = 'Hostel available on campus. Nursing and midwifery students have hostel at campus; costs (tuition, food, room) covered by donors.',
  description = 'Private non-profit university located in Koohi Goth, Bin Qasim Town, Karachi. Established in 2022 by the Zafar & Atia Foundation Charitable Trust. Recognized and chartered by Government of Sindh and accredited by HEC, PMDC and NCEAC. Committed to providing free-of-cost, quality undergraduate education to underserved rural communities.',
  highlights = ARRAY['100% free undergraduate education (tuition-free)','Chartered by Government of Sindh (2022)','HEC recognized and PMDC/NCEAC accredited','Founded by Zafar & Atia Foundation Charitable Trust','Located in Koohi Goth, Bin Qasim Town, Karachi','Hostel facilities available for nursing students','Research-driven curriculum with ORIC established']::text[]
WHERE id = 140;
DELETE FROM fee_details WHERE institution_id = 140;
INSERT INTO fee_details (institution_id, label, value, sort_order) VALUES
  (140, 'Admission Fee (one-time)', 10000, 0),
  (140, 'Student ID Card (one-time)', 1500, 1),
  (140, 'Enrollment Card (one-time)', 1500, 2),
  (140, 'Examination Fee (per semester)', 2500, 3),
  (140, 'Retake Examination Fee', 2500, 4),
  (140, 'Provisional Certificate (after graduation)', 2500, 5),
  (140, 'Consolidated Marks Sheet (after graduation)', 5000, 6),
  (140, 'Degree Issuance (after graduation)', 5000, 7);

-- After running: node build-university-pages.js && node generate-sitemap.js, then commit.
