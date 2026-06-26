-- ============================================================================
-- 10-batch-enrich-9.sql — enrich 9 existing universities with full official data.
-- All target existing rows by id (verified); names/slugs unchanged. Run in Supabase.
-- ============================================================================

-- #90 Times — TIMES University, Multan
UPDATE institutions SET
  full_name = 'TIMES University, Multan',
  website = 'tum.edu.pk',
  established = 2020,
  fee = 'Rs. 60,000/sem (approx.)',
  fee_num = 60000,
  fee_year = '2026',
  fee_note = 'Affordable fee structure compared to government universities. Merit-based scholarships and fee concessions available for talented and deserving students. Hostel facility available for female students. Contact university for program-specific fees.',
  entry = 'University Admission Test / GAT (for MS/M.Phil/PhD)',
  merit = 'Merit-based admission. Result-awaiting students eligible for provisional admission. For MS/M.Phil/PhD: GAT-type admission test conducted by the institute or GAT (Subject) by a recognized testing body is mandatory.',
  programs = ARRAY['ADP Medical Laboratory Technology','BBA Business Administration','BS Human Nutrition & Dietetics','BS Medical Laboratory Sciences','BS Nursing','BS Operation Theater','BS Physical Therapy (DPT)','BS Public Health','BS Radiology','LLB Law','Pharm-D Pharmacy','MS/M.Phil Management Sciences','MS/M.Phil Food Science & Nutrition','MS/M.Phil Medical Laboratory Sciences','MS/M.Phil Public Health','MS/M.Phil Physical Therapy','MS/M.Phil English','MS/M.Phil Islamic Studies','MS/M.Phil International Relations','MS/M.Phil Chemistry','MS/M.Phil Computer Science','MBA Business Administration','LLM Law','PhD in various disciplines']::text[],
  tags = ARRAY['private','punjab','medical','business','law','cs','arts']::text[],
  scholarships = 'Merit-based scholarships, need-based scholarships, Chief Minister''s Merit Scholarship (30,000 fully funded scholarships covering 100% tuition fees in partnership with Government of Punjab).',
  hostel = 'Available for female students (modern, comfortable, and secure hostel facilities).',
  description = 'Private university chartered by the Government of Punjab on 16 September 2020 (Act XXV of 2020). Recognized by the Higher Education Commission (HEC). Located in Multan, Pakistan. Offers undergraduate, graduate, and doctoral programs across faculties including Law, Management Sciences, Medicine & Allied Health Sciences, Pharmaceutical Science, Social Sciences, and Science & Technology.',
  highlights = ARRAY['Chartered by Government of Punjab (2020)','HEC recognized degree-awarding institute','Affordable fee structure','Merit-based and need-based scholarships available','Hostel facilities for female students','Modern campus with digital classrooms','14 academic departments across 7 faculties']::text[]
WHERE id = 90;
DELETE FROM fee_details WHERE institution_id = 90;
INSERT INTO fee_details (institution_id, label, value, sort_order) VALUES
  (90, 'BS / BBA / LLB / Pharm-D / DPT (per semester)', 60000, 0),
  (90, 'ADP Programs (per semester)', 60000, 1);

-- #275 SAPSUT — Shuhada-e-Army Public School University of Technology, Nowshera
UPDATE institutions SET
  full_name = 'Shuhada-e-Army Public School University of Technology, Nowshera',
  website = 'uotnowshera.edu.pk',
  established = 2015,
  fee = 'Rs. 27,610–38,885/sem',
  fee_num = 33247,
  fee_year = 'Spring 2026',
  fee_note = 'Affordable semester tuition fee (open merit). BSc Engineering Technology & BS Robotics: Rs. 27,610/sem. BS Computer Science: Rs. 30,120/sem. MS Electrical Engineering Technology: Rs. 38,885/sem. Application processing fee: Rs. 500. Hostel fee: Rs. 10,000 per annum + Rs. 2,000 refundable security. Accredited with NTC and recognized by HEC. No entrance test for BS Robotics & Intelligent Systems. Need and merit-based scholarships available. 100% tuition fee waiver for siblings and children of Shuhada.',
  entry = 'UOT Entrance Test / ETEA (for BSc Engineering Technology programs only)',
  merit = 'Merit determined on basis of 1st year intermediate / 2nd year DAE, matric, and entry test marks (where applicable). Minimum 50% unadjusted marks in intermediate (Pre-Engineering/Pre-Medical/DAE relevant) or equivalent. Result-awaited candidates may apply. For MS: Bachelor''s (16 years) in relevant field with CGPA 2.00/4.00 or 55% marks + 50% in GRE/HAT/GAT (General) or university entry test.',
  programs = ARRAY['BSc Electrical Engineering Technology','BSc Electronics Engineering Technology','BSc Energy Engineering Technology','BSc Mechanical Engineering Technology','BS Robotics and Intelligent Systems','BS Computer Science','MS Electrical Engineering Technology']::text[],
  tags = ARRAY['public','kpk','engineering','cs']::text[],
  scholarships = 'Need and merit-based scholarships. 100% tuition fee waiver for siblings and children of Shuhada.',
  hostel = 'Available. Furnished rooms for 2, 3, and 4 students. Fee: Rs. 10,000 per annum + Rs. 2,000 refundable security. Allotment on first-come-first-served basis to outstation students.',
  description = 'Public sector technology university located in Amangarh, Nowshera, Khyber Pakhtunkhwa. Established in 2015. Recognized by HEC and accredited by National Technology Council (NTC) and NCEAC. Offers undergraduate and graduate programs in engineering, technology, robotics, and computer science.',
  highlights = ARRAY['Affordable semester tuition fee','HEC recognized & NTC/NCEAC accredited','No entrance test for BS Robotics & Intelligent Systems','100% tuition fee waiver for siblings & children of Shuhada','Need and merit-based scholarships available','Hostel facilities available','Spring 2026 admissions open']::text[]
WHERE id = 275;
DELETE FROM fee_details WHERE institution_id = 275;
INSERT INTO fee_details (institution_id, label, value, sort_order) VALUES
  (275, 'BSc Engineering Technology Programs (per semester)', 27610, 0),
  (275, 'BS Robotics & Intelligent Systems (per semester)', 27610, 1),
  (275, 'BS Computer Science (per semester)', 30120, 2),
  (275, 'MS Electrical Engineering Technology (per semester)', 38885, 3),
  (275, 'Application Processing Fee (one-time)', 500, 4),
  (275, 'Hostel Fee (per annum)', 10000, 5),
  (275, 'Hostel Security Fee (refundable, one-time)', 2000, 6);

-- #274 PRESTON-KHI — Preston University, Karachi
UPDATE institutions SET
  full_name = 'Preston University, Karachi',
  website = 'prestonkhi.edu.pk',
  established = 2004,
  fee = 'Rs. 3,400–3,500/credit hour',
  fee_num = 3450,
  fee_year = '2026',
  fee_note = 'Fee is charged per credit hour. Undergraduate programs: Rs. 3,400/credit hour. Postgraduate programs: Rs. 3,500/credit hour. BBA total fee approx. Rs. 502,600; BSCS total fee approx. Rs. 527,200 for 4-year duration. Scholarships available (merit up to 100%, need-based, government employee discounts).',
  entry = 'Preston Entrance Test / Interview',
  merit = 'Minimum 50% in Intermediate/DAE for UG; 16 years education with CGPA 2.0/4.0 or 60% marks for MS/M.Phil. NTS GAT or university test with 50% minimum score required for graduate programs. Result-awaiting students can apply.',
  programs = ARRAY['BBA Business Administration','BS Accounting & Finance','BS Biotechnology','BS Biology','BS Chemical Technology','BS Civil Technology','BS Computer Science','BS Economics','BS Electrical Technology','BS Electronics Technology','BS Information Technology','BS International Relations','BS Mathematics','BS Mechanical Technology','BS Physics','BS Psychology','BS Telecommunication','B.Ed. Education','MBA Master of Business Administration','MBA Executive','MCS Computer Science','M.Ed. Education','MSc Economics','MSc International Relations','MSc Psychology','M.Phil. (multiple disciplines)','PhD (multiple disciplines)']::text[],
  tags = ARRAY['private','sindh','business','cs','engineering','arts']::text[],
  scholarships = 'Merit scholarships up to 100% fee waiver, need-based scholarships, government employee discounts, armed forces discounts. 600 scholarships offered annually across all campuses.',
  description = 'Private university established in 2004, chartered by Government of Sindh and recognized by HEC. Located at 15, Banglore Town, Shahrah-e-Faisal, Karachi. Offers diverse undergraduate, graduate, and doctoral programs across multiple disciplines. Accredited by PEC and NCEAC for relevant programs.',
  highlights = ARRAY['Chartered by Government of Sindh','HEC recognized university','PEC and NCEAC accredited programs','Affordable per-credit-hour fee structure','Merit and need-based scholarships available','Multiple program offerings across disciplines']::text[]
WHERE id = 274;
DELETE FROM fee_details WHERE institution_id = 274;
INSERT INTO fee_details (institution_id, label, value, sort_order) VALUES
  (274, 'Undergraduate Programs (per credit hour)', 3400, 0),
  (274, 'Postgraduate Programs (per credit hour)', 3500, 1),
  (274, 'BBA (4-year total)', 502600, 2),
  (274, 'BS Computer Science (4-year total)', 527200, 3);

-- #272 UOLRK — The University of Larkano
UPDATE institutions SET
  full_name = 'The University of Larkano',
  website = 'uolrk.edu.pk',
  established = 2023,
  fee = 'Contact university',
  fee_num = NULL,
  fee_year = '2026',
  fee_note = 'Specific semester tuition fees are not publicly listed on the university website or in available search results. For accurate and official fee information, please contact the university admission office directly.',
  entry = 'University Admission Test (equivalent to GRE/HAT General)',
  merit = 'Undergraduate (BS/BBA): Minimum 50% marks in HSC or equivalent. Undergraduate (Engineering): Minimum 60% marks in HSC Part-I or equivalent. Postgraduate: A minimum CGPA of 2.00/4.00 or 60% marks in the annual system is required.',
  programs = ARRAY['BBA Business Administration','BS Accounting & Finance','BS Commerce','BS Public Administration','BS Economics','BS Economics & Finance','BS Computer Science','BS Software Engineering','BS Artificial Intelligence','BS Mathematics','BS English Language & Literature','BS Education (B.Ed. Hons.)','BE Civil Engineering','BE Mechanical Engineering','BE Electrical Engineering','BE Electronics Engineering','BSc (Hons) Agriculture','BSc (Hons) Agronomy','BSc (Hons) Plant Breeding & Genetics','BSc (Hons) Soil Science','BSc (Hons) Entomology','BSc (Hons) Plant Pathology']::text[],
  tags = ARRAY['public','sindh','business','cs','engineering','agriculture','arts']::text[],
  scholarships = 'Students are advised to contact the university financial aid office or visit the HEC portal for information on available scholarships.',
  hostel = 'Available',
  description = 'Public research university located in Larkana, Sindh, established on 20 August 2023. Recognized by the Higher Education Commission (HEC), Pakistan Engineering Council (PEC), and Pakistan Bar Council. Created by the merger of several educational institutions, which now form its faculties.',
  highlights = ARRAY['Public sector university chartered by Government of Sindh','HEC recognized degree-awarding institute','Established in August 2023','Offers programs in Engineering, Agriculture, Business, and Social Sciences','Hostel accommodation available']::text[]
WHERE id = 272;
DELETE FROM fee_details WHERE institution_id = 272;

-- #208 MCKRU — Mir Chakar Khan Rind University, Sibi
UPDATE institutions SET
  full_name = 'Mir Chakar Khan Rind University, Sibi',
  website = 'mckru.edu.pk',
  established = 2018,
  fee = 'Contact university',
  fee_num = NULL,
  fee_year = '2025',
  fee_note = 'Application processing fee: Rs. 1,500 for undergraduate programs and Rs. 2,500 for postgraduate programs. The university offers various fee concessions and scholarships including merit-based fee waivers for top students and need-based concessions ranging from 25%-100%. Specific semester tuition fees are not publicly listed. Contact the university for program-specific fee details.',
  entry = 'Merit-based / LAT (for LLB)',
  merit = 'Undergraduate: Minimum 50% marks in Intermediate (FSc/FA/ICS/I.Com) or equivalent. LLB: FA/FSc/A-Level with at least 2nd division + valid LAT score from HEC. Postgraduate (MPhil): Bachelor''s degree with min CGPA 2.5/4.0 and 50% marks in GAT (General). Result-awaiting candidates may apply.',
  programs = ARRAY['BBA - Bachelor of Business Administration','BS Computer Science','BS English','BS Botany','B.Sc (Hons) Agriculture','B.Ed (Hons) Elementary','B.Ed (Hons) - 2.5 Years','B.Ed (Hons) - 1.5 Years','LLB - 5 Years','MPhil (ongoing)','Masters Programs (2 Years)','Certificate Courses (3 Months)','Diploma Courses (1 Year)']::text[],
  tags = ARRAY['public','balochistan','business','cs','education','law','agriculture','sciences','arts']::text[],
  scholarships = 'Merit-based: top 10% students receive fee concession every semester based on GPA. Need-based: 25%-100% fee concession for financially weak students. Work-Study Program: 5% students receive fee waiver. BEEF Scholarship (CGPA 3.0+), Benazir Undergraduate Scholarship, PEEF Scholarships, MCKRU Siblings Scholarship (50% fee concession).',
  hostel = 'Contact university',
  description = 'Public sector university located in Sibi, Balochistan, established in 2018. Recognized by the Higher Education Commission (HEC) and accredited by the National Agriculture Education Accreditation Council (NAEAC) for relevant programs. Named after the Baloch folk hero Mir Chakar Khan Rind. Committed to providing quality education with a focus on undergraduate research and regional development.',
  highlights = ARRAY['Public sector university chartered by Government of Balochistan','HEC recognized degree-awarding institute','NAEAC accredited for agriculture programs','Merit-based fee concessions for top 10% students','Need-based financial aid up to 100%','Work-Study Program for 5% students','Siblings Scholarship with 50% fee concession','Located in Sibi, Balochistan']::text[]
WHERE id = 208;
DELETE FROM fee_details WHERE institution_id = 208;
INSERT INTO fee_details (institution_id, label, value, sort_order) VALUES
  (208, 'Undergraduate Application Processing Fee', 1500, 0),
  (208, 'Postgraduate Application Processing Fee', 2500, 1);

-- #271 MCKRUT — Mir Chakar Khan Rind University of Technology
UPDATE institutions SET
  full_name = 'Mir Chakar Khan Rind University of Technology',
  website = 'mcut.edu.pk',
  established = 2019,
  fee = 'Contact university',
  fee_num = NULL,
  fee_year = '2026',
  fee_note = 'The university offers heavily subsidized tuition models, making engineering certificates accessible to low-income student populations. Specific semester-wise fees are not publicly listed. The university also offers need-based and merit-based scholarships.',
  entry = 'Merit-based',
  merit = 'For BS Programs: F.Sc. Pre-Engineering, ICS, or DAE degree in the relevant discipline. For DAE Programs: Matric Science or equivalent.',
  programs = ARRAY['BS Information Engineering Technology','BS Chemical Engineering Technology','BS Electrical Engineering Technology','BS Civil Engineering Technology','BS Mechanical Engineering Technology','BS Petroleum Engineering Technology','BS Computer Science','BS Artificial Intelligence','BS Software Engineering','BS Food Science and Technology','BS Renewable Energy Technology','BS Architectural Engineering Technology','BS Health and Safety','BS Medical Laboratory Technology','BS Radiology and Imaging Technology','BS Graphic Design and Animation','BBA (IT) - Bachelor of Business Administration','DAE Civil Technology','DAE Electrical Technology','DAE Chemical Technology','DAE Petroleum Technology','DAE Electronics Technology','DAE Mechanical Technology','DAE Petrochemical Technology','DAE Computer Information Technology']::text[],
  tags = ARRAY['public','punjab','engineering','cs','medical']::text[],
  scholarships = 'The university offers need-based and merit-based scholarships for undergraduate students. Specific scholarships include: Need-Based Scholarship, HSAS Scholarship, and Diya Foundation Scholarship.',
  hostel = 'Contact university',
  description = 'Mir Chakar Khan Rind University of Technology (MCKRUT) is a public university located in Dera Ghazi Khan District, Punjab. It is the only technology university in Dera Ghazi Khan District, established in 2019. Recognized by the Higher Education Commission (HEC) and accredited by the National Technology Council (NTC).',
  highlights = ARRAY['Public sector university chartered by Government of Punjab','HEC recognized & NTC accredited','Only technology university in Dera Ghazi Khan District','Established in 2019','Offers BS and DAE programs in engineering and technology','Heavily subsidized tuition models for low-income students']::text[]
WHERE id = 271;
DELETE FROM fee_details WHERE institution_id = 271;

-- #270 KMU-KHI — Karachi Metropolitan University
UPDATE institutions SET
  full_name = 'Karachi Metropolitan University',
  website = 'thekmu.edu.pk',
  established = 2023,
  fee = 'Varies by program (see fee breakdown)',
  fee_num = NULL,
  fee_year = '2026',
  fee_note = 'Fee structure differs significantly between Medical/Dental programs and other disciplines. Medical/Dental fees increased significantly in 2023. BBA program charges Rs. 2,500/credit hour with Rs. 25,000 admission fee. Self-finance and merit-based fee structures available.',
  entry = 'University Entrance Test / MDCAT (for MBBS)',
  merit = 'MBBS/BDS: Intermediate (Pre-Medical) with at least 60% marks or equivalent. BS Computer Science: Intermediate HSSC with Mathematics, minimum 50% marks. BBA: As per university criteria.',
  programs = ARRAY['MBBS (Bachelor of Medicine, Bachelor of Surgery)','BDS (Bachelor of Dental Surgery)','BBA (Bachelor of Business Administration)','BS Business Analytics','BS Computer Science','BS Software Engineering','BS Artificial Intelligence','BS Cyber Security','BS Cloud Computing','BS Nursing (BSN - 4 Years)','Community Midwifery (CMW)','DPT (Doctor of Physical Therapy)','Pharm-D (Doctor of Pharmacy)']::text[],
  tags = ARRAY['public','sindh','medical','business','cs']::text[],
  scholarships = 'Merit-based and need-based scholarships available as per HEC guidelines for public universities. Financial assistance to ensure accessibility.',
  hostel = 'Contact university',
  description = 'Public sector university established under Sindh Assembly Act No. LIV of 2023, comprising Karachi Medical and Dental College (KMDC) and Abbasi Shaheed Hospital as its constituent units. Located in Block M, North Nazimabad, Karachi. Recognized by HEC and committed to delivering quality education with an entrepreneurial and technology-driven approach.',
  highlights = ARRAY['Public sector university chartered by Government of Sindh','HEC recognized institution','Comprises KMDC and Abbasi Shaheed Hospital','Affordable fee structure with per-credit-hour model','Merit and need-based scholarships available','Located in Block M, North Nazimabad, Karachi']::text[]
WHERE id = 270;
DELETE FROM fee_details WHERE institution_id = 270;
INSERT INTO fee_details (institution_id, label, value, sort_order) VALUES
  (270, 'MBBS/BDS - Open Merit Tuition (per semester)', 117600, 0),
  (270, 'MBBS/BDS - Open Merit Admission Fee', 50000, 1),
  (270, 'MBBS/BDS - Merit Seat Tuition (per semester)', 268000, 2),
  (270, 'MBBS/BDS - Self-Finance Tuition (per semester)', 1200000, 3),
  (270, 'MBBS/BDS - Self-Finance Admission Fee', 100000, 4),
  (270, 'BBA - Tuition (per credit hour)', 2500, 5),
  (270, 'BBA - Admission Fee', 25000, 6);

-- #269 BI — BRAINS Institute Peshawar
UPDATE institutions SET
  full_name = 'BRAINS Institute Peshawar',
  website = 'brains.edu.pk',
  established = 1993,
  fee = 'Rs. 39,000–60,000/sem',
  fee_num = 49500,
  fee_year = '2026',
  fee_note = 'Fee structure for BBA, BSCS, BSSE, and BS Accounting & Finance follows a tiered semester system: Semester 1: Rs. 60,000; Semesters 2,4,6,8: Rs. 39,000 each; Semesters 3,5,7: Rs. 42,000 each. Application processing fee is Rs. 1,000. Fee for other programs (BE Civil, B.Tech, BS English) is not publicly listed.',
  entry = 'Merit-based / Entry Test / Interview (if applicable)',
  merit = 'Admissions are granted strictly on merit. Undergraduate: Intermediate or equivalent qualification. Graduate: Bachelor''s degree from an HEC-recognized institution. Postgraduate: relevant undergraduate qualification.',
  programs = ARRAY['BS Computer Science','BS Software Engineering','BS Artificial Intelligence','BS Cyber Security','BE Civil Engineering','B.Tech (Civil / Electrical / Petroleum)','BBA - Bachelor of Business Administration','BS Accounting & Finance','BS Accounting & Finance (ICAP/CAF)','BS English','BSc Civil Engineering Technology','Post Graduate Diploma','Diploma of Associate Engineering (DAE)','ADP - Associate Degree Program']::text[],
  tags = ARRAY['private','kpk','cs','engineering','business','arts']::text[],
  scholarships = 'Merit-based scholarships, need-based assistance, and special concessions. Specific scholarships include: Rs. 10 million for Wafaq ul Madaris students, Rs. 5 million for Hafiz-e-Quran, and Rs. 5 million for position holders, along with the Ehsaas Undergraduate Scholarship Program.',
  hostel = 'Contact university',
  description = 'BRAINS Institute is a private Degree Awarding Institute (DAI) in Peshawar, Khyber Pakhtunkhwa. Chartered by the Government of KP and recognized by HEC. Established in 1993, it offers undergraduate, graduate, and diploma programs in Information Technology, Management Sciences, Engineering, and Humanities. Follows a transparent, merit-based admission process.',
  highlights = ARRAY['Chartered by Government of Khyber Pakhtunkhwa','HEC recognized degree-awarding institute','Established in 1993','Merit-based admissions','Merit and need-based scholarships available','Industry-aligned programs']::text[]
WHERE id = 269;
DELETE FROM fee_details WHERE institution_id = 269;
INSERT INTO fee_details (institution_id, label, value, sort_order) VALUES
  (269, 'BBA / BSCS / BSSE / BS Accounting & Finance - Semester 1', 60000, 0),
  (269, 'Even Semesters (2,4,6,8) - per semester', 39000, 1),
  (269, 'Odd Semesters (3,5,7) - per semester', 42000, 2),
  (269, 'Application Processing Fee', 1000, 3);

-- #267 HSA — Health Services Academy
UPDATE institutions SET
  full_name = 'Health Services Academy',
  website = 'hsa.edu.pk',
  established = 1988,
  fee = 'Rs. 48,000–305,408/sem',
  fee_num = NULL,
  fee_year = '2026',
  fee_note = 'Fee varies significantly by program level. Undergraduate (general): Rs. 68,000/sem; BS Environmental Health Sciences & Management: Rs. 48,000/sem; Postgraduate (general): Rs. 112,000/sem; One-year Diploma: Rs. 60,000/sem; MSPH/EMSPH: Rs. 91,000/sem tuition; MS/MPhil programs: Rs. 305,408/sem; PhD: Rs. 232,288/sem. Contact the university for program-specific fees.',
  entry = 'University Admission Test / Interview (for MS and PhD)',
  merit = 'Admission is merit-based, considering academic qualifications and relevant experience. For MS and PhD: 16 years of education (MBBS, BDS, Nursing, Allied Health, Pharmacy, Social Sciences, etc.) with a minimum CGPA of 2.5. For undergraduate programs: minimum 45% marks. Result-awaiting candidates may apply.',
  programs = ARRAY['BS Public Health','BS Environmental Health Sciences & Management','BS Paramedics','BS Physiotherapy / DPT','BS Social Sciences (Sociology, Psychology, Anthropology)','BS Environmental Sciences','BS Nutrition and Dietetics','BS Aesthetics and Cosmetology','BS Optometry','MS in Public Health (MSPH)','MSc in Health Economics & Management','MS in Environmental Management','MS in Epidemiology & Disease Control','FCPS','PhD in Public Health','Postgraduate Diploma in Hospital Management','Postgraduate Diploma in Public Health','Postgraduate Diploma in Paediatric Physical Therapy','Postgraduate Diploma in Medical Entomology and Disease Vector Control','Postgraduate Diploma in Speech and Language Therapy','Postgraduate Diploma in Vision Rehabilitation Therapy','Postgraduate Diploma in Sports Rehabilitation Sciences','Postgraduate Diploma in Global Health Security','Postgraduate Diploma in Global HRH Migration','Postgraduate Diploma in Global Health Diplomacy','PG Cert in Human Resource in Health']::text[],
  tags = ARRAY['public','islamabad','medical','sciences']::text[],
  scholarships = 'Merit-based and need-based scholarships are available. Students can also apply for HEC scholarships.',
  hostel = 'Contact university',
  description = 'Public sector degree-awarding institute established in 1988, chartered by the Government of Pakistan and recognized by HEC. HSA is the premier public health research and teaching institution in Pakistan and the only one offering a PhD in Public Health. It offers undergraduate, graduate, and doctoral programs in public health, allied health sciences, global health, and related fields.',
  highlights = ARRAY['Public sector degree-awarding institute chartered by Government of Pakistan','HEC recognized institution','Established in 1988','Only institution in Pakistan offering PhD in Public Health','Offers undergraduate, graduate, and doctoral programs','Merit and need-based scholarships available']::text[]
WHERE id = 267;
DELETE FROM fee_details WHERE institution_id = 267;
INSERT INTO fee_details (institution_id, label, value, sort_order) VALUES
  (267, 'BS Environmental Health Sciences & Management (per semester)', 48000, 0),
  (267, 'Undergraduate Programs (general - per semester)', 68000, 1),
  (267, 'One-year Diploma Programs (per semester)', 60000, 2),
  (267, 'Postgraduate (general - per semester)', 112000, 3),
  (267, 'MSPH/EMSPH Tuition (per semester)', 91000, 4),
  (267, 'MS / MPhil Programs (per semester)', 305408, 5),
  (267, 'PhD Programs (per semester)', 232288, 6);

-- After running: node build-university-pages.js && node generate-sitemap.js, then commit.
