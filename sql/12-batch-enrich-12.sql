-- ============================================================================
-- 12-batch-enrich-12.sql — enrich 12 existing universities with full official data.
-- All target existing rows by id (verified); names/slugs unchanged. Run in Supabase.
-- ============================================================================

-- #215 WUAJK — Women University of Azad Jammu and Kashmir Bagh
UPDATE institutions SET
  full_name = 'Women University of Azad Jammu and Kashmir Bagh',
  website = 'wuajk.edu.pk',
  established = 2014,
  fee = 'Contact University / ~Rs. 1,500–2,000 (application)',
  fee_num = NULL,
  fee_year = '2025-2026',
  fee_note = 'No comprehensive semester-wise fee structure is publicly available. Application/Processing fee for BS programs is Rs. 1,500 and for MS/M.Phil programs is Rs. 2,000. Scholarships are available for eligible students, including HEC Need-Based, PEEF, Merit-Based, and Honhaar Scholarships. For detailed program fees, contact the university''s Directorate of Student Affairs or Treasurer''s Office.',
  entry = 'Entry Test (mandatory for all BS programs) / U-GAT (for MS Management Sciences)',
  merit = 'DPT: Minimum 60% marks in HSSC. BS Computer Science, Data Science & Dental Technology: Minimum 50% marks in HSSC. All Other BS Programs: Minimum 45% marks in HSSC. Lateral Entry (5th Semester): ADP/BA/BSc or equivalent (14 years education). MS/M.Phil: 16 years of education with 2nd Division (Annual) or CGPA 2.5/4.0 or 3.0/5.0 (Semester). Admissions are offered once a year, primarily on a regional quota basis.',
  programs = ARRAY['BBA (Finance, HRM, Marketing)','BS Islamic Banking and Finance','BS Economics & Finance','BS Economics','BS Psychology','BS English','BS International Relations','BS Islamic Studies','B.Ed. (Hons) 4 Years','B.Ed. 2.5 Years','BS Sports Sciences & Physical Education','BS Biotechnology','BS Botany','BS Chemistry','BS Zoology','BS Microbiology','BS Bioinformatics','BS Physics','BS Mathematics with Data Science','BS Mathematics with Computer Sciences','BS Statistics','BS Computer Science','BS Data Science','BS Emergency Medical Technology','BS Clinical Laboratory Science','BS Diagnostic Radiology and Imaging Technology','BS Surgical & Operation Theater Sciences','BS Dental Technology','Doctor of Physical Therapy (DPT)','MS Management Sciences']::text[],
  tags = ARRAY['public','ajk','arts','sciences','engineering','medical']::text[],
  scholarships = 'HEC Need-Based Scholarship, PEEF Scholarship, Merit-Based Scholarships, Honhaar Scholarships, Ehsaas Undergraduate Scholarship. Students are encouraged to apply for the Prime Minister Laptop Scheme.',
  hostel = 'Available. Two hostels with a capacity of 400 students are under construction, expected to be completed by the end of 2026. Transport facilities are also available.',
  description = 'Women University of Azad Jammu and Kashmir Bagh is a public sector university established in 2014 under the Women University of AJ&K Bagh Act (VII) of 2014. It is the first women''s university in Azad Jammu & Kashmir, located at the base of Ganga Peak in the Pir Panjal Range of the lower Himalayas. Recognized by the Higher Education Commission (HEC) and affiliated with PEC. Committed to providing quality higher education and fostering intellectual growth among female students.',
  highlights = ARRAY['First women''s university in Azad Jammu & Kashmir','HEC recognized public sector university','Established in 2014','Pakistan''s First Women''s Software Technology Park (Launched 2024)','2,025 kanals of land with permanent campus under construction','Hostel and transport facilities available','Merit and need-based scholarships available','Campus-wide Wi-Fi (PERN facility)']::text[]
WHERE id = 215;
DELETE FROM fee_details WHERE institution_id = 215;
INSERT INTO fee_details (institution_id, label, value, sort_order) VALUES
  (215, 'BS Programs - Application/Processing Fee (non-refundable)', 1500, 0),
  (215, 'Additional BS Program (per program)', 300, 1),
  (215, 'MS/M.Phil Programs - Application/Processing Fee (non-refundable)', 2000, 2);

-- #249 EMAAN — Emaan Institute of Management and Sciences
UPDATE institutions SET
  full_name = 'Emaan Institute of Management and Sciences',
  website = 'emaan.edu.pk',
  established = 2018,
  fee = 'Rs. 72,000–84,000/sem (plus admission fee)',
  fee_num = 72000,
  fee_year = '2025-2026',
  fee_note = 'Fee varies by program. MBA: Rs. 84,000/sem + Rs. 20,000 admission fee. BBA, BSCS, BS Software Engineering, BS Civil/Mechanical Engineering Technology, and Associate Degree programs: Rs. 72,000/sem + Rs. 10,000 admission fee. Fee structures are subject to change. Scholarships are available for eligible students.',
  entry = 'Entry Test / Interview (if applicable)',
  merit = 'Merit-based evaluation considering academic performance. Some programs may require an entry test or interview.',
  programs = ARRAY['MBA - Master of Business Administration (2 Years)','BBA - Bachelor of Business Administration (4 Years)','BBA - Bachelor of Business Administration (2 Years)','BS Computer Science (4 Years)','BS Software Engineering (4 Years)','BS Civil Engineering Technology (4 Years)','BS Mechanical Engineering Technology (4 Years)','Associate Degree in Computing (2 Years)','Associate Degree in Business & Commerce (2 Years)','Associate Degree in Digital Marketing (2 Years)']::text[],
  tags = ARRAY['private','sindh','business','cs','engineering']::text[],
  scholarships = 'Merit-based scholarships available. Contact admissions office for eligibility and current opportunities.',
  description = 'Private degree-awarding institute established in 2018 through the Sindh Assembly Legislative Act No. XXXV and recognized by HEC in 2019. Located in Karachi, Sindh. Offers undergraduate and postgraduate programs in Business Administration, Computer Science, and Engineering Technology. Accredited by NCEAC and PEC.',
  highlights = ARRAY['Chartered by Government of Sindh (2018)','HEC recognized degree-awarding institute (2019)','NCEAC and PEC accredited programs','8+ programs across 4 departments','Merit-based scholarships available','Digital classrooms and modern facilities']::text[]
WHERE id = 249;
DELETE FROM fee_details WHERE institution_id = 249;
INSERT INTO fee_details (institution_id, label, value, sort_order) VALUES
  (249, 'MBA - Tuition (per semester)', 84000, 0),
  (249, 'MBA - Admission Fee (one-time)', 20000, 1),
  (249, 'BBA (4 Years) - Tuition (per semester)', 72000, 2),
  (249, 'BBA (4 Years) - Admission Fee (one-time)', 10000, 3),
  (249, 'BS Computer Science (4 Years) - Tuition (per semester)', 72000, 4),
  (249, 'BS Software Engineering (4 Years) - Tuition (per semester)', 72000, 5),
  (249, 'BS Civil Engineering Technology (4 Years) - Tuition (per semester)', 72000, 6),
  (249, 'BS Mechanical Engineering Technology (4 Years) - Tuition (per semester)', 72000, 7),
  (249, 'Associate Degree Programs (2 Years) - Tuition (per semester)', 72000, 8),
  (249, 'Admission Fee - Undergraduate (one-time)', 10000, 9);

-- #248 KITE — Karachi Institute of Technology and Entrepreneurship
UPDATE institutions SET
  full_name = 'Karachi Institute of Technology and Entrepreneurship',
  website = 'kite.edu.pk',
  established = 2016,
  fee = 'Rs. 100,000–218,000/sem',
  fee_num = 150000,
  fee_year = '2026',
  fee_note = 'Fee varies significantly by program. BBA: Rs. 100,000/semester. BS Computer Science/BA-LLB: Rs. 105,000/semester. BS Architecture/Design/Mechatronics: Rs. 125,000–218,000/semester. 20%-50% merit-based scholarships available based on admission test performance.',
  entry = 'KITE Admission Test / SAT / NAT',
  merit = 'Merit-based admission. SAT (1570/2400) or NAT (54/90) scores accepted. BA-LLB requires LAT with 50%+ score. Final selection based on admission test performance and previous academic record.',
  programs = ARRAY['BBA - Bachelor of Business Administration (4 Years)','BS Computer Science (4 Years)','BA-LLB (5 Years)','BS Architecture (4 Years)','BS Mechatronics (4 Years)','B.DES - Communication Design (4 Years)','B.DES - Industrial Design (4 Years)','B.DES - Interior Design (4 Years)']::text[],
  tags = ARRAY['private','sindh','business','cs','engineering','arts','law']::text[],
  scholarships = 'Merit-based scholarships: 60%-70% score = 20% concession, 71%-80% = 30%, 81%-90% = 40%, 91-100% = 50%. Need-based scholarships available.',
  description = 'Private degree-awarding institute established in 2016, chartered by the Government of Sindh and recognized by HEC. Flagship venture of the Education Enrichment (EduEnrich) Foundation, a non-profit organization. Located in Korangi Creek, Karachi. Mission is to cultivate entrepreneurs and change agents through interdisciplinary undergraduate programs.',
  highlights = ARRAY['Chartered by Government of Sindh (2016)','HEC recognized degree-awarding institute','Non-profit venture of EduEnrich Foundation','Merit-based scholarships up to 50%','Interdisciplinary programs in technology, business, design, and law','Located in Korangi Creek, Karachi']::text[]
WHERE id = 248;
DELETE FROM fee_details WHERE institution_id = 248;
INSERT INTO fee_details (institution_id, label, value, sort_order) VALUES
  (248, 'BBA - Business Administration (per semester)', 100000, 0),
  (248, 'BS Computer Science (per semester)', 105000, 1),
  (248, 'BA-LLB (per semester)', 105000, 2),
  (248, 'BS Architecture (per semester)', 125000, 3),
  (248, 'BS Design (per semester)', 125000, 4),
  (248, 'BS Mechatronics (per semester)', 125000, 5),
  (248, 'B.DES - Communication Design (per semester)', 218000, 6),
  (248, 'B.DES - Industrial Design (per semester)', 218000, 7),
  (248, 'B.DES - Interior Design (per semester)', 218000, 8);

-- #189 FATA — FATA University
UPDATE institutions SET
  full_name = 'FATA University',
  website = 'fu.edu.pk',
  established = 2016,
  fee = 'Rs. 17,500–22,000/sem',
  fee_num = 19750,
  fee_year = '2025-2026',
  fee_note = 'Affordable fee structure. Most BS programs charge Rs. 22,000/semester; reported as low as Rs. 17,500/semester. Lowest tuition fee in Khyber Pakhtunkhwa. Fees for overseas and international students may differ.',
  entry = 'Merit-based / Admission Test (where applicable)',
  merit = 'Admission based on academic merit. Closing merits (2023): BBA 53.38, Computer Science 75.35, Commerce 57.44, English 67.75, Peace & Conflict Studies 65.22.',
  programs = ARRAY['BBA (Hons) - 4 Years','BS Computer Science - 4 Years','BS Commerce - 4 Years','BS English - 4 Years','BS Geology - 4 Years','BS Electronics - 4 Years','BS Mathematics - 4 Years','BS Sociology - 4 Years','BS Political Science - 4 Years','BS Psychology - 4 Years','BS Microbiology - 4 Years','BS Chemistry - 4 Years','BS Environmental Sciences - 4 Years','BS Conflict & Peace Studies - 4 Years','BS Management Sciences - 4 Years','B.Ed (Hons) - 4 Years','B.Ed - 1.5 Years','B.Ed - 2.5 Years','MBA (Business) - 2 Years','MBA (Non-Business) - 2 Years']::text[],
  tags = ARRAY['public','kpk','business','cs','sciences','arts']::text[],
  scholarships = 'HEC Need-Based Scholarship, Benazir Undergraduate Scholarship, DAAD-HEC Scholarship Program, FATA & Balochistan Scholarship, Honhaar Scholarship.',
  hostel = 'Available. Affordable hostel accommodation for over 1000 students.',
  description = 'First-ever public sector university in the erstwhile FATA region. Established in 2016, temporarily located at Government Degree College Dara Adam Khel. New 58.25-acre campus under construction in Akhorwal. Run by the Higher Education Department, Government of Khyber Pakhtunkhwa.',
  highlights = ARRAY['First public sector university in erstwhile FATA','Lowest tuition fee in Khyber Pakhtunkhwa','Affordable hostel accommodation for 1000+ students','Solar-powered campus','Prime location: 30 minutes from Peshawar','Transport facilities available']::text[]
WHERE id = 189;
DELETE FROM fee_details WHERE institution_id = 189;
INSERT INTO fee_details (institution_id, label, value, sort_order) VALUES
  (189, 'BBA - Business Administration (per semester)', 22000, 0),
  (189, 'BS Commerce (per semester)', 22000, 1),
  (189, 'BS Computer Science (per semester)', 22000, 2),
  (189, 'BS Conflict & Peace Studies (per semester)', 22000, 3),
  (189, 'B.Ed (Hons) - per semester', 22000, 4),
  (189, 'Other BS Programs (per semester)', 22000, 5);

-- #247 RLKU — Rashid Latif Khan University
UPDATE institutions SET
  full_name = 'Rashid Latif Khan University',
  website = 'rlku.edu.pk',
  established = 2021,
  fee = 'Contact University / ~Rs. 400,000/year (DPT)',
  fee_num = NULL,
  fee_year = '2026',
  fee_note = 'Comprehensive semester-wise fee structure is not publicly available. Doctor of Physical Therapy (DPT) is Rs. 400,000 per year. Fee structures for other programs may vary. Scholarships are available for eligible students. For detailed program fees, contact the university''s admissions office.',
  entry = 'Merit-based / Entry Test (where applicable)',
  merit = 'Admission is merit-based. Scholarships are available on merit and need basis for eligible candidates.',
  programs = ARRAY['Pharm-D (Doctor of Pharmacy)','Doctor of Physical Therapy (DPT)','BS Speech & Language Pathology','BS Human Nutrition & Dietetics','BS Operation Theatre Technology','BS Medical Imaging Technology','Bachelor of Science in Nursing','BS Clinical Psychology','BS Media & Communication Studies','BS Computer Science','Bachelor of Business Administration (BBA)','BS Accounting & Finance','Master of Business Administration (MBA - 1.5 Years)','Master of Business Administration (MBA - 2 Years)','Bachelor in Law (LLB)','BS Biotechnology','BS Biochemistry','MS Biochemistry','Bachelor of Studies in English','ADP in English','M.Phil in Religious Studies','Ph.D. in Religious Studies','M.Phil in Urdu','Ph.D. in Urdu']::text[],
  tags = ARRAY['private','punjab','medical','business','cs','law','arts']::text[],
  scholarships = 'Merit and need-based scholarships available. Up to 100% scholarships for eligible candidates.',
  hostel = 'Available. Male and female hostels for out-of-town students.',
  description = 'Private university located on Ferozepur Road, Lahore. Recognized by HEC and chartered by the Government of Punjab. Established in 2021, it offers a wide range of undergraduate and postgraduate programs across faculties including Allied Health Sciences, Medical & Dental Sciences, Pharmaceutical Sciences, Nursing, Social Sciences, Computer Sciences, Business, Law, and Arts & Humanities. Built upon more than 30 years of experience in quality healthcare and education.',
  highlights = ARRAY['HEC recognized private university','Chartered by Government of Punjab','Over 30 years of experience in healthcare and education','Male and female hostel facilities available','Merit and need-based scholarships available','Transport facilities throughout Lahore','Teaching hospital with 610-bed capacity','Multi-disciplinary programs across 10 faculties']::text[]
WHERE id = 247;
DELETE FROM fee_details WHERE institution_id = 247;
INSERT INTO fee_details (institution_id, label, value, sort_order) VALUES
  (247, 'Doctor of Physical Therapy (DPT) - Per Year', 400000, 0);

-- #246 IISAT — International Institute of Science, Arts and Technology
UPDATE institutions SET
  full_name = 'International Institute of Science, Arts and Technology',
  website = 'iisat.edu.pk',
  established = 2022,
  fee = 'Contact university / See fee structure',
  fee_num = NULL,
  fee_year = '2025-2026',
  fee_note = 'No specific semester-wise fee structure is publicly available. The university offers over 100 Million PKR in scholarships for eligible students. A dedicated Fee Structure page exists on the official website. For accurate program-specific fees, contact the admissions office directly.',
  entry = 'Merit-based / Admission Test (where applicable)',
  merit = 'Admission is merit-based. Specific eligibility criteria vary by program. For Allied Health Sciences, Computing, Humanities, Law, Art & Design, Science, and Management Sciences programs, applicants must meet the minimum academic requirements set by the university.',
  programs = ARRAY['Pharm-D (Doctor of Pharmacy)','Doctor of Physical Therapy (DPT)','BS Medical Imaging Technology','BS Medical Lab Technology','BS Human Nutrition and Dietetics','BS Biotechnology','BS Chemistry','BS Physics','BS Mathematics','BS Zoology','BS Computer Science','BS Information Technology','BS Software Engineering','BS Artificial Intelligence','BS Data Science','BBA (Bachelor of Business Administration)','BBIS (Bachelor of Business & Information System)','BS Accounting and Finance','BS Aviation Management','BS Psychology','BS Clinical Psychology','BS English','BS Media & Communication','BS Political Science','BS International Relations','BS Education','BS Graphic Design','BS Interior Design','BS Fashion Design','BS Textile Design','LLB (5 Years)','MBA (Master of Business Administration)','MBA Executive','MA English','M.Phil Education','MS Clinical Psychology','MS Biotechnology','PhD Education','ADP (Associate Degree Programs) in various disciplines']::text[],
  tags = ARRAY['private','punjab','medical','cs','business','arts','law','sciences']::text[],
  scholarships = 'Over 100 Million PKR in scholarships available for eligible students.',
  hostel = 'Available',
  description = 'Private degree-awarding institute established in 2022, chartered by the Government of Pakistan and recognized by the Higher Education Commission (HEC). Located on Lahore Road near Sialkot Bypass, Gujranwala, Punjab. Offers over 60 undergraduate and graduate programs across multiple disciplines including Allied Health Sciences, Computing, Humanities, Law, Art & Design, Science, and Management Sciences.',
  highlights = ARRAY['Chartered by Government of Pakistan (2022)','HEC recognized degree-awarding institute','Over 60 undergraduate and graduate programs','100 Million PKR scholarships available','Hostel and transport facilities available','Modern campus with state-of-the-art facilities']::text[]
WHERE id = 246;
DELETE FROM fee_details WHERE institution_id = 246;

-- #113 PUTR — University of Rasul, Mandi Bahauddin
UPDATE institutions SET
  full_name = 'University of Rasul, Mandi Bahauddin',
  website = 'putrasul.edu.pk',
  established = 2018,
  fee = 'Contact university',
  fee_num = NULL,
  fee_year = '2026',
  fee_note = 'A detailed fee structure for specific programs is not publicly available. The university offers heavily subsidized tuition for low-income families and full fee waivers for students with 70%+ marks under the Chief Minister''s Special Merit Scholarship for the pioneer batch.',
  entry = 'Merit-based / Entry Test (for specific programs)',
  merit = 'Admission is based on 2nd Year Intermediate (FSc/FA/ICom or equivalent) or 3rd Year Associate Diploma (DAE). An entry test is required for BSc Civil Engineering Technology only.',
  programs = ARRAY['BSc Civil Engineering Technology','BS Information Technology','BS Software Engineering','BS Electrical Engineering Technology','BS Mechanical Engineering Technology','BS Technology Management','BS Artificial Intelligence','BS Biochemistry','BS Biotechnology','BS Business Administration (BBA)','BS Chemistry','BS Commerce','BS Economics','BS English','BS Hospitality Management','BS International Relations','BS Mathematics','BS Microbiology','BS Physics','BS Political Science','BS Psychology','BS Public Policy & Governance','BS Zoology','LLB (4-Year Law Program)','B.Ed (4 Years)','DAE in Civil Technology','DAE in Electrical Technology','DAE in Computer Information Technology']::text[],
  tags = ARRAY['public','punjab','engineering','business','cs','sciences','arts','law']::text[],
  scholarships = 'Fully Funded Scholarships for Orphans, Physically Challenged Students, Minorities, and Transgenders; Merit Scholarships; Tuition Fee Concession for Low-Income Families; Hafiz-e-Quran Scholarships; 100% Fee Waiver for students with 70%+ marks (Chief Minister''s Special Merit Scholarship for Pioneer Batch); Chief Minister''s Honhaar Undergraduate Scholarship; HEC Need-based/Merit-based Scholarships; PEEF Scholarship; Bait-ul-Maal Scholarship.',
  hostel = 'Contact university',
  description = 'Public sector university located in Rasul, Mandi Bahauddin, Punjab. Established in 2018, upgraded from Government College of Technology (GCT) Rasul, which had a history dating back to 1873. Renamed as University of Rasul (UoR) in February 2025 following approval by the Punjab Assembly to broaden its academic scope beyond engineering and technology. Recognized by HEC and affiliated with PEC and NTC.',
  highlights = ARRAY['Public sector university chartered by Government of Punjab','HEC recognized & PEC/NTC affiliated','Renamed as University of Rasul (UoR) in 2025','Established in 2018, with roots tracing back to 1873','Over 25 undergraduate programs across multiple faculties','Generous scholarship programs including full fee waivers','Located in Rasul, Mandi Bahauddin']::text[]
WHERE id = 113;
DELETE FROM fee_details WHERE institution_id = 113;

-- #245 BBSUTSD — Benazir Bhutto Shaheed University of Technology and Skill Development
UPDATE institutions SET
  full_name = 'Benazir Bhutto Shaheed University of Technology and Skill Development',
  website = 'bbsutsd.edu.pk',
  established = 2016,
  fee = 'Rs. 23,250–41,750/sem (approx.)',
  fee_num = 23250,
  fee_year = '2022-23',
  fee_note = 'Fee varies by program. BS English total first semester: Rs. 41,750 (includes one-time admission fees Rs. 18,500 + semester fees Rs. 23,250). Tuition fee per semester: Rs. 12,000. Additional semester charges: Sports Rs. 500, Development Rs. 1,250, Transport Rs. 5,000, Library Rs. 1,000, Medical Rs. 500, Lab Equipment Maintenance Rs. 3,000. Fee structure may vary for other programs.',
  entry = 'BBSUTSD Entry Test',
  merit = 'Undergraduate: FSC Pre-Engineering, Pre-Medical, Computer Science or DAE holders with at least 50% marks. MS: BE/BS/B.Tech (Hons)/B.Tech (4 years) or BSc in relevant field with minimum CGPA 2.0/4.0.',
  programs = ARRAY['BSc Civil Engineering Technology','BSc Electrical Engineering Technology','BSc Electronics Engineering Technology','BSc Mechanical Engineering Technology','BSc Robotics & AI Engineering Technology','BS Computer Science','BS Artificial Intelligence','BS English','BS Physics','MS Engineering Technology Programs']::text[],
  tags = ARRAY['public','sindh','engineering','cs']::text[],
  scholarships = 'Ehsaas Undergraduate Scholarship Program, HEC Need Based Scholarship, Khairpur Need Cum Merit Scholarship, Punjab Educational Endowment Fund (PEEF) Scholarship, PPL Scholarships, OGDCL Scholarships. More than 50% of students receive scholarships.',
  hostel = 'Available. Separate hostels for boys and girls.',
  description = 'First technical university in Sindh, established in 2016. Accredited by the National Technology Council, Islamabad. Offers four-year undergraduate degree programs in Civil, Electrical, Electronics, and Mechanical Technology, along with BS programs in Computer Science, Artificial Intelligence, English, and Physics. Also offers DAE and MS Engineering Technology programs.',
  highlights = ARRAY['First technical university in Sindh','HEC recognized public university','Accredited by National Technology Council','Separate hostels for boys and girls','More than 50% students receive scholarships','Affordable fee structure']::text[]
WHERE id = 245;
DELETE FROM fee_details WHERE institution_id = 245;
INSERT INTO fee_details (institution_id, label, value, sort_order) VALUES
  (245, 'BS English - Tuition Fee (per semester)', 12000, 0),
  (245, 'BS English - Semester Charges (per semester)', 11250, 1),
  (245, 'BS English - Total Semester Fee', 23250, 2),
  (245, 'BS English - Admission Fee (per year)', 10000, 3),
  (245, 'BS English - PERN Fee (per year)', 2000, 4),
  (245, 'BS English - Enrolment Card Fee (one-time)', 1500, 5),
  (245, 'BS English - HSC Marks Certificate Verification Fee (one-time)', 2500, 6),
  (245, 'BS English - Caution Money Deposit (refundable)', 2000, 7),
  (245, 'BS English - Total First Semester', 41750, 8);

-- #111 PTUTT — Punjab Tianjin University of Technology
UPDATE institutions SET
  full_name = 'Punjab Tianjin University of Technology',
  website = 'ptut.edu.pk',
  established = 2018,
  fee = 'Rs. 28,050–29,050/sem + Rs. 16,950 admission',
  fee_num = 28500,
  fee_year = '2025-2026',
  fee_note = 'Tuition fee: Rs. 28,050 or Rs. 29,050 per semester depending on source. One-time admission fee: Rs. 16,950. Fee structure is for local students only; overseas and international students have different fee structures. Scholarships are available (merit-based and need-based).',
  entry = 'PTUT Entry Test / ECAT / HEC USAT',
  merit = 'For Bachelors: Minimum 50% marks in FSc Pre-Engineering/Pre-Medical (with additional Math course)/ICS/DAE/FA or equivalent. For Masters: 16 years education (BSc/BE/B.Tech Hons) in relevant field with 60% marks or CGPA 2.50/4.0. Provisional admission based on Intermediate Part-I / DAE Part-I results.',
  programs = ARRAY['BSc Architectural Engineering Technology','BSc Automotive Engineering Technology','BSc Civil Engineering Technology','BSc Electrical Engineering Technology','BSc Fashion Design Technology','BSc Garments Engineering Technology','BSc Mechanical Engineering Technology','BS Software Engineering Technology','BS Business Information Technology','MSc Mechanical Engineering Technology','MSc Electrical Engineering Technology','DAE in Civil Technology','DAE in Electrical Technology','DAE in Electronics Technology']::text[],
  tags = ARRAY['public','punjab','engineering','arts','cs']::text[],
  scholarships = 'Merit-based and need-based scholarships available.',
  description = 'Punjab''s first public sector technology university, established in 2018 under the PTUT Act (XI of 2018). Located in Lahore, it operates across two campuses (Township and Raiwind Road). Established through a collaboration between the Government of Punjab and a consortium of three Chinese universities (Tianjin University of Technology & Education, Tianjin Polytechnic University, Tianjin Chengjian University). All degree programs are recognized by HEC and accredited by the National Technology Council (NTC).',
  highlights = ARRAY['Punjab''s 1st Public Sector Technology University','HEC recognized & NTC accredited programs','Established in collaboration with Chinese universities','Affordable tuition fees','Merit and need-based scholarships available','1-year industrial training program','Chinese Language Course included','Outcome-Based Education System']::text[]
WHERE id = 111;
DELETE FROM fee_details WHERE institution_id = 111;
INSERT INTO fee_details (institution_id, label, value, sort_order) VALUES
  (111, 'Tuition Fee (per semester)', 28050, 0),
  (111, 'One-time Admission Fee', 16950, 1);

-- #244 ALKAWTHAR — Al-Kawthar University
UPDATE institutions SET
  full_name = 'Al-Kawthar University',
  website = 'alkawthar.edu.pk',
  established = 2023,
  fee = 'Varies by program (Rs. 75,000–175,000 first semester)',
  fee_num = 145000,
  fee_year = '2025-2026',
  fee_note = 'Fee structure varies by program. First semester total fee includes Admission Fee (one-time), Security Deposit (refundable), Registration Fee (per semester), and 1st Semester Tuition. Subsequent semesters follow a different tuition structure. All fees are in PKR and subject to change per university policy.',
  entry = 'Al-Kawthar University Placement Test (UPT) + Interview',
  merit = 'Admission Weightage: UPT (60%) + HSSC/Equivalent (25%) + SSC/Matric (15%). Minimum aggregate for admission: 50%. Eligibility: Minimum 45% marks in Intermediate (HSSC) or equivalent for most programs; BS Nursing requires FSc Pre-Medical with at least 50% marks. Admissions are offered twice a year (Spring and Fall semesters).',
  programs = ARRAY['BS Accounting & Finance','BS Computer Science (BSCS)','BS Education (B.Ed. Hons.)','BS English','BS Information Technology (BSIT)','BS Islamic Banking & Finance','BS Islamic Studies with IT','BS Media Studies','BS Medical Imaging Technology','BS Medical Laboratory Technology','BS Nursing','BS Psychology','BS Social Sciences','BBA - Bachelor of Business Administration (Majors: Finance, Marketing, HRM, Entrepreneurship, SCM)','Post RN BS Nursing (2 Years)','Community Midwifery (CMW) Diploma Program','Islamic Scholar Program']::text[],
  tags = ARRAY['private','sindh','business','cs','medical','islamic','arts','education']::text[],
  scholarships = 'Financial assistance options are available to ensure educational inclusivity. Contact the university''s financial aid office for specific scholarship programs and eligibility criteria.',
  description = 'Private university established on 17 July 2023, chartered by the Government of Sindh and recognized by HEC. Founded by the Education for You Foundation to promote education based on Islamic values. Located in Gulshan-e-Iqbal, Karachi. The university integrates contemporary academic excellence with Islamic principles, offering a diverse portfolio of rigorous academic programs.',
  highlights = ARRAY['HEC recognized private university','Chartered by Government of Sindh (2023)','Founded by Education for You Foundation','Located in Gulshan-e-Iqbal, Karachi','4 faculties, 14 programs, 1,000+ students','NCEAC accredited programs (Computer Science, IT)','Transparent and affordable fee structure','Merit-based admissions with UPT','Islamic values integrated with modern education']::text[]
WHERE id = 244;
DELETE FROM fee_details WHERE institution_id = 244;
INSERT INTO fee_details (institution_id, label, value, sort_order) VALUES
  (244, 'Admission Fee (one-time)', 15000, 0),
  (244, 'Security Deposit (refundable)', 15000, 1),
  (244, 'Registration Fee (per semester)', 5000, 2),
  (244, 'BS Computing / Business / Psychology / Media / Medical Tech - 1st Semester Tuition', 110000, 3),
  (244, 'BS Computing / Business / Psychology / Media / Medical Tech - Total 1st Semester Fee', 145000, 4),
  (244, 'BS Computing / Business / Media / Medical Tech - 2nd Semester Onward Tuition', 115000, 5),
  (244, 'BS Social Sciences - Total 1st Semester Fee', 160000, 6),
  (244, 'B.Ed. (Hons) / BS English - Total 1st Semester Fee', 105000, 7),
  (244, 'BS Nursing - Total 1st Semester Fee', 175000, 8),
  (244, 'BS Islamic Banking & Finance / Islamic Studies with IT - Total 1st Semester Fee', 75000, 9);

-- #157 BNBWU — Begum Nusrat Bhutto Women University, Sukkur
UPDATE institutions SET
  full_name = 'Begum Nusrat Bhutto Women University, Sukkur',
  website = 'bnbwu.edu.pk',
  established = 2018,
  fee = 'Rs. 32,000–43,000/sem',
  fee_num = 37500,
  fee_year = '2026',
  fee_note = 'Fee varies by program. Most BS programs (AI, Biotechnology, BBA, Chemistry, Computer Science) charge Rs. 43,000 per semester. BS Education and BS English charge Rs. 32,000 per semester. Fee structure is for local students only; overseas and international students have different fee structures.',
  entry = 'Merit-based admission',
  merit = 'Merit-based admission. Minimum eligibility: Intermediate (HSSC) or equivalent with at least 45% marks for most programs. Closing merit for 2026: BS AI: 51.95, BS Biotechnology: 52.28, BBA: 50.09, BS Chemistry: 50.59, BS Computer Science: 70.33, BS Education: 50.10, BS English: 50.14.',
  programs = ARRAY['BS Artificial Intelligence (4 Years)','BS Biotechnology (4 Years)','BBA Business Administration (4 Years)','BS Business Intelligence & Analytics (4 Years)','BS Chemistry (4 Years)','BS Computer Science (4 Years)','BS Education (4 Years)','BS English (4 Years)','BS Environmental Science (4 Years)','BS Mathematics (4 Years)','BS Physics (4 Years)','BS Statistics (4 Years)','BS Women Entrepreneurship & Leadership (4 Years)','Doctor of Physical Therapy DPT (5 Years)','B.Ed (2.5 Years)','B.Ed (4 Years)','M.Sc. Education (2 Years)','M.Phil Islamic Studies (2 Years)','MS Education (2 Years)','MS Physics (2 Years)']::text[],
  tags = ARRAY['public','sindh','cs','business','education','sciences','medical']::text[],
  scholarships = 'Balochistan Education Endowment Scholarship (BEEF): 60% marks or 3.00 CGPA with Balochistan domicile; Khairpur Need-Cum-Merit Scholarship: 80% marks or CGPA 3.50; Punjab Education Endowment Fund (PEEF): 60% marks; Pakistan Minorities Welfare Program.',
  hostel = 'Contact university',
  description = 'Public sector women''s university established on 6 July 2018, chartered by the Government of Sindh and recognized by HEC. Located on Rohri Bypass, Sukkur. It is the first-ever public women university in Sindh. Committed to empowering women, particularly from underprivileged rural areas, through quality higher education, capacity building, and meaningful linkages. Accredited by NCEAC and NACTE.',
  highlights = ARRAY['First-ever public women university in Sindh','HEC recognized public sector university','Chartered by Government of Sindh (2018)','NCEAC and NACTE accredited programs','Affordable fee structure (Rs. 32,000–43,000/semester)','Multiple scholarship programs available','Women-only campus focusing on socio-economic empowerment']::text[]
WHERE id = 157;
DELETE FROM fee_details WHERE institution_id = 157;
INSERT INTO fee_details (institution_id, label, value, sort_order) VALUES
  (157, 'BS Artificial Intelligence (per semester)', 43000, 0),
  (157, 'BS Biotechnology (per semester)', 43000, 1),
  (157, 'BBA Business Administration (per semester)', 43000, 2),
  (157, 'BS Chemistry (per semester)', 43000, 3),
  (157, 'BS Computer Science (per semester)', 43000, 4),
  (157, 'BS Education (per semester)', 32000, 5),
  (157, 'BS English (per semester)', 32000, 6);

-- #243 MUST-MLT — Multan University of Science and Technology
UPDATE institutions SET
  full_name = 'Multan University of Science and Technology',
  website = 'multanust.edu.pk',
  established = 2022,
  fee = 'Rs. 120,000/sem (approx.)',
  fee_num = 120000,
  fee_year = '2025-2026',
  fee_note = 'The per-semester tuition fee is reported at approximately Rs. 120,000 for the 2025-26 admission batch. A detailed fee structure is not publicly available. Contact the university directly for program-specific fees.',
  entry = 'Merit-based',
  merit = 'Admissions are granted on merit according to the university''s policies and the requirements of respective programs.',
  programs = ARRAY['BS Computer Science','BS Software Engineering','BS Artificial Intelligence','BS Cyber Security','BS Information Technology','Doctor of Veterinary Medicine (DVM)','Doctor of Pharmacy (Pharm.D)','Doctor of Physical Therapy (DPT)','Bachelor in Eastern Medicine & Surgery (BEMS)','BS Medical Lab Technology','BS Medical Imaging Technology','BS Optometry','BS Nursing','Lady Health Visitor (LHV)','BBA','BA-LLB','MS Computer Science','MS Nursing','MS Management Science','M.Phil Pharmacology','M.Phil Pharmaceutics']::text[],
  tags = ARRAY['private','punjab','cs','medical','business','law']::text[],
  scholarships = 'Merit-based and need-based scholarships available. Includes CM Honhaar Scholarship (fully-funded), Merit-Based Scholarships, Talent-Based Scholarships, Need-Based Financial Support, and Kinship Concession.',
  hostel = 'Available. Separate hostels for male and female students.',
  description = 'Private university established in 2022, recognized by the Higher Education Commission (HEC) of Pakistan. Located in Multan, Punjab. Offers a diverse range of undergraduate and postgraduate programs in computer science, veterinary sciences, pharmacy, allied health sciences, nursing, business management, and law. Features a purpose-built campus with modern facilities including IT labs, a library, sports grounds, a horse riding club, and hostel accommodation.',
  highlights = ARRAY['HEC recognized private university','Established in 2022','Purpose-built campus with state-of-the-art facilities','Separate hostels for male and female students','Merit and need-based scholarships available','Diverse range of programs in science, technology, healthcare, and law']::text[]
WHERE id = 243;
DELETE FROM fee_details WHERE institution_id = 243;
INSERT INTO fee_details (institution_id, label, value, sort_order) VALUES
  (243, 'Tuition Fee (per semester - approx.)', 120000, 0);

-- After running: node build-university-pages.js && node generate-sitemap.js, then commit.
