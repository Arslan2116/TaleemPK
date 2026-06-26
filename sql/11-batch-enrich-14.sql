-- ============================================================================
-- 11-batch-enrich-14.sql — enrich 14 existing universities with full official data.
-- All target existing rows by id (verified); names/slugs unchanged. Run in Supabase.
-- ============================================================================

-- #33 VU — Virtual University of Pakistan
UPDATE institutions SET
  full_name = 'Virtual University of Pakistan',
  website = 'vu.edu.pk',
  established = 2002,
  fee = 'Rs. 1,000–2,950/credit hour',
  fee_num = 1975,
  fee_year = 'Spring 2026',
  fee_note = 'Fee is charged per credit hour with rates varying by program level (revised effective Spring 2026). Undergraduate (BS, Bachelors): Rs. 1,000/credit hour. Graduate (Masters): Rs. 1,530/credit hour. MS and PhD: Rs. 2,950/credit hour. A one-time admission fee, registration fee, and security deposit are also applicable.',
  entry = 'Merit-based / GRE/HAT (for MS/MPhil)',
  merit = 'Admission is merit-based, considering the previous academic record. For MS/MPhil programs, a valid GRE/HAT General test score is mandatory. Admissions are offered twice a year (Spring and Fall).',
  programs = ARRAY['BS Accounting & Finance','BS Bioinformatics','BS Business & Information Technology','BS Computer Science','BS Data Science','BS Economics','BS English (Applied Linguistics)','BS Information Technology','BS Islamic Studies','BS Mass Communication','BS Psychology','BS Sociology','BS Software Engineering','ADP Computer Science','ADP Data Science','ADP Education','ADP English','ADP Mass Communication','ADP Psychology','MBA','MS Computer Science','MS Business Administration','MPhil (various disciplines)','PhD']::text[],
  tags = ARRAY['public','islamabad','distance-learning','cs','business','education','arts','sciences']::text[],
  scholarships = 'Merit-based (CGPA 3.5+), need-based, special category (orphans, disabled students), and sports scholarships. The Chief Minister Punjab Honhaar Scholarship Program covers 100% tuition for eligible students.',
  hostel = 'As a primarily online university, VU does not offer on-campus hostel facilities. Private hostels are available near some campuses.',
  description = 'Pakistan''s first university based completely on modern Information and Communication Technologies (ICTs). Established in 2002 under the Federal Ministry of Information Technology & Telecom. HEC recognized, with 187,130+ active students across 210+ campuses nationwide. Offers affordable distance-learning programs from associate to doctoral level.',
  highlights = ARRAY['Pakistan''s first virtual university','HEC recognized federal university','Over 187,000 active students','210+ campuses across Pakistan','Affordable per-credit-hour fee model','Full online admission process','Merit and need-based scholarships available']::text[]
WHERE id = 33;
DELETE FROM fee_details WHERE institution_id = 33;
INSERT INTO fee_details (institution_id, label, value, sort_order) VALUES
  (33, 'BS / Bachelors / Associate Degree (per credit hour)', 1000, 0),
  (33, 'Masters (per credit hour)', 1530, 1),
  (33, 'MS / PhD (per credit hour)', 2950, 2),
  (33, 'Admission Fee (one-time) - BS', 3000, 3),
  (33, 'Admission Fee (one-time) - Masters', 5000, 4),
  (33, 'Admission Fee (one-time) - MS/PhD', 7000, 5),
  (33, 'Registration Fee (one-time)', 2500, 6),
  (33, 'Security Fee (refundable) - BS', 2000, 7),
  (33, 'Security Fee (refundable) - MS/PhD', 10000, 8),
  (33, 'Convocation Fee (one-time)', 2000, 9);

-- #32 AIOU — Allama Iqbal Open University
UPDATE institutions SET
  full_name = 'Allama Iqbal Open University',
  website = 'aiou.edu.pk',
  established = 1974,
  fee = 'Rs. 3,000–50,000/sem',
  fee_num = 15000,
  fee_year = 'Spring 2026',
  fee_note = 'Fee varies significantly by program level. Matric/FA: Rs. 3,000–3,240/sem; Bachelor''s (BA/BS): Rs. 4,000–47,300/sem; Master''s (MA/MSc): Rs. 6,000–36,000/sem; M.Phil/PhD: Rs. 21,000–50,000/sem. B.Ed programs: Rs. 23,980/sem. Payment via bank deposit, Jazz Cash, Easy Paisa, and Upaisa.',
  entry = 'Merit-based / Entry Test (for MS, MPhil, PhD)',
  merit = 'Admission is merit-based, considering the previous academic record. For MS, MPhil, and PhD programs, an entry test is mandatory, followed by an interview. Admissions are offered twice a year (Spring and Autumn).',
  programs = ARRAY['Matric (General / Darse Nizami)','FA / I.Com (General / Darse Nizami)','Associate Degree in Arts (BA)','Associate Degree in Commerce (B.Com)','B.Sc. (Hons) Agriculture','BS Accounting & Finance','BS Arabic','BS Artificial Intelligence','BS Biochemistry','BS Botany','BS Business Administration (BBA)','BS Chemistry','BS Computer Science','BS Economics','BS English (Applied Linguistics)','BS Environmental Sciences','BS International Relations','BS Mass Communication','BS Mathematics','BS Microbiology','BS Pakistan Studies','BS Physics','BS Political Science','BS Psychology','BS Statistics','B.Ed (1.5 / 2.5 / 4 Years)','MA Arabic','MA Islamic Studies','M.Com','MSc Physics','MBA','M.Ed','MS Management Sciences','MS / MPhil (various disciplines)','PhD (various disciplines)','Postgraduate Diplomas (PGD)']::text[],
  tags = ARRAY['public','islamabad','distance-learning','education','arts','sciences','business','cs','islamic','agriculture']::text[],
  scholarships = 'Merit-based and need-based scholarships. British Council offers special scholarships for AIOU female students covering tuition, hostel lodging, and transportation for up to two years. HEC scholarships are also available.',
  hostel = 'Available. Two hostels (one male, one female) at the main campus in Islamabad, and one female hostel at Regional Centre Multan.',
  description = 'Pakistan''s largest and first open university, established in 1974 under the Federal Ministry of Education. HEC recognized degree-awarding institute offering distance learning programs from Matriculation to PhD level. With over 1.3 million students, it provides flexible education through online and regional campus networks across Pakistan, AJK, and Gilgit-Baltistan.',
  highlights = ARRAY['Pakistan''s first and largest open university','HEC recognized degree-awarding institute','Established in 1974','Over 1.3 million students','Offers distance learning from Matric to PhD','Affordable fee structure','Merit and need-based scholarships available','Hostel facilities available']::text[]
WHERE id = 32;
DELETE FROM fee_details WHERE institution_id = 32;
INSERT INTO fee_details (institution_id, label, value, sort_order) VALUES
  (32, 'Matric General / Darse Nizami (per semester)', 3000, 0),
  (32, 'FA / I.Com (per semester)', 3240, 1),
  (32, 'BA / B.Com Associate Degree (per semester)', 6870, 2),
  (32, 'BS Agriculture / BBA / BS Arabic (per semester)', 16060, 3),
  (32, 'BS Biochemistry / Botany / Environmental Sciences (per semester)', 45100, 4),
  (32, 'BS Chemistry (per semester)', 43950, 5),
  (32, 'BS Artificial Intelligence (per semester)', 47300, 6),
  (32, 'B.Ed (1.5 / 2.5 Years) per semester', 23980, 7),
  (32, 'MSc Physics (per semester)', 36235, 8),
  (32, 'MA Islamic Studies (per semester)', 18630, 9),
  (32, 'MA Arabic (per semester)', 20470, 10),
  (32, 'Admission Processing Fee (one-time)', 500, 11);

-- #266 ISP — Institute of Southern Punjab
UPDATE institutions SET
  full_name = 'Institute of Southern Punjab',
  website = 'isp.edu.pk',
  established = 2010,
  fee = 'Contact university / See prospectus',
  fee_num = NULL,
  fee_year = '2026',
  fee_note = 'ISP fee structure is not published online due to university policy. Refer to the official prospectus or contact the admission office for program-specific fees. Scholarships up to 50% are available for eligible students.',
  entry = 'Entrance Examination + Interview',
  merit = 'Admission is selective based on entrance examinations and students'' past academic records. For MS/MPhil programs, NTS GAT test is required.',
  programs = ARRAY['BS Computer Science','BS Information Technology','BS Artificial Intelligence','BS Cyber Security','BS Fashion Design','BS Aviation Management','BS Accounting & Finance','BS Islamic Banking & Finance','BS Hospitality & Tourism Management','BS Chemistry','BS Physics','BS Mathematics','BS Economics','BS English','BS Education','BS Psychology','BS Mass Communication','BS Islamic Studies','BTech Electrical','BTech Mechanical','BTech Civil','BSc Electrical Engineering','BSc Civil Engineering Technology','BBA (4 / 2.5 / 2 Years)','BCom','Pharm D','Bachelor in Fine Arts','Bachelor in Interior Design','MS/MPhil Civil Engineering','MS/MPhil Electrical Engineering','MS/MPhil Mechanical Engineering','MS/MPhil Business Administration','MS/MPhil Computer Science','MS/MPhil Economics','MS/MPhil Education','MS/MPhil Islamic Studies','MS/MPhil English','PhD Computer Science','PhD (various disciplines)']::text[],
  tags = ARRAY['private','punjab','engineering','business','cs','arts']::text[],
  scholarships = 'Merit-based scholarships, need-based scholarships. Scholarships up to 50% available.',
  hostel = 'Available. Male and female hostels with modern facilities.',
  description = 'The Institute of Southern Punjab (ISP) is a private university in Multan, established in 2010 as the first private-sector degree-awarding institute in Southern Punjab. Recognized by HEC and accredited by PEC, NTC, PCATP, and permitted by PBC. The 100-acre campus offers modern facilities including library, computer center, sports complex, and hostels.',
  highlights = ARRAY['First private-sector degree-awarding institute in Southern Punjab','HEC recognized & PEC/NTC/PCATP accredited','Established in 2010','100-acre campus with modern facilities','Merit and need-based scholarships available','Male and female hostel facilities','PhD programs available','Open and Distance Learning (ODL) mode available']::text[]
WHERE id = 266;
DELETE FROM fee_details WHERE institution_id = 266;

-- #264 SBU — Saifee Burhani University
UPDATE institutions SET
  full_name = 'Saifee Burhani University',
  website = 'sbu.edu.pk',
  established = 2023,
  fee = 'Contact university',
  fee_num = NULL,
  fee_year = '2026',
  fee_note = 'Specific semester/program fees are not publicly listed. The university offers merit-based scholarships for high-achieving undergraduate students. A tuition fee matrix may be available on the university website or by contacting the admissions office.',
  entry = 'University Admission Test + Panel Interview',
  merit = 'Minimum 50% marks in Intermediate (HSSC/A-Levels) or equivalent for BS programs; 55% for B.Ed (4-Year). Competitive scores in university admission test and panel interview required. Foreign qualifications require IBCC equivalency certificate.',
  programs = ARRAY['BS Computer Science (BSCS) - 4 Years','BBA - Bachelor of Business Administration - 4 Years','B.Ed. (4-Year) - ECCE / Educational Leadership & Management','B.Ed. (2.5-Year) - ECCE / Educational Leadership & Management','Associate Degree in Education (ADE) - 2 Years','Doctor of Physical Therapy (DPT) - 5 Years']::text[],
  tags = ARRAY['private','sindh','cs','business','education','medical']::text[],
  scholarships = 'Merit-based scholarships awarded to high-achieving undergraduate students.',
  hostel = 'Contact university',
  description = 'Private university established on 5 June 2023, chartered by the Government of Sindh and recognized by HEC. Located in North Nazimabad, Karachi. Inspired by the Fatimid dynasty''s emphasis on education and committed to fostering socioeconomic development and intellectual growth. Offers programs in Computer Science, Business Administration, Education, and Physical Therapy.',
  highlights = ARRAY['Chartered by Government of Sindh (2023)','HEC recognized university','Merit-based scholarships available','Integrated with Saifee Hospital for clinical training','State-of-the-art campus with modern facilities']::text[]
WHERE id = 264;
DELETE FROM fee_details WHERE institution_id = 264;

-- #263 ISU — Ibn-e-Sina University, Mirpurkhas
UPDATE institutions SET
  full_name = 'Ibn-e-Sina University, Mirpurkhas',
  website = 'isu.edu.pk',
  established = 2022,
  fee = 'Contact university',
  fee_num = NULL,
  fee_year = '2026',
  fee_note = 'Fee structure is not publicly listed. The prospectus and admission forms are available from the university by paying a challan of Rs. 1,000 at HBL Bank. Contact the admission office directly for program-specific fee details.',
  entry = 'Merit-based / University Admission Test',
  merit = 'Admission is selective based on entrance examinations and students'' past academic records. A 50% score in intermediate or equivalent is required for programs such as BBA and B.Ed. The university is coeducational.',
  programs = ARRAY['MBBS (Bachelor of Medicine, Bachelor of Surgery) - 4 Years','BDS (Bachelor of Dental Surgery)','DPT (Doctor of Physical Therapy)','BBA (Bachelor of Business Administration)','B.Ed (Bachelor of Education)','M.Ed (Master of Education) - 2 Years','Certifications in Medical Education - 1 Year','Postgraduate Diplomas - 1 Year']::text[],
  tags = ARRAY['private','sindh','medical','business','education']::text[],
  scholarships = 'Contact the university financial aid office for information on available scholarships and financial assistance.',
  hostel = 'Available. Hostels for boys and girls onsite and in the city. A new 3-story girls'' hostel has recently been established onsite.',
  description = 'Private university established on 22 July 2022, chartered by the Government of Sindh and recognized by the Higher Education Commission (HEC). It is the first university in the Mirpurkhas Division. Affiliated with Liaquat University of Medical & Health Sciences (LUMHS), Jamshoro. Part of the Muhammad Foundation Trust on a 40-acre campus. Recognized by PMDC and WHO.',
  highlights = ARRAY['Chartered by Government of Sindh (2022)','HEC recognized private university','PMDC and WHO recognized','First university in Mirpurkhas Division','40-acre campus with modern facilities','Hostel facilities for boys and girls','Affiliated with LUMHS, Jamshoro']::text[]
WHERE id = 263;
DELETE FROM fee_details WHERE institution_id = 263;

-- #262 SBBDEWANUNIVERSITY — Shaheed Benazir Bhutto Dewan University
UPDATE institutions SET
  full_name = 'Shaheed Benazir Bhutto Dewan University',
  website = 'sbbdewanuniversity.edu.pk',
  established = 2013,
  fee = 'Varies by program (see breakdown)',
  fee_num = NULL,
  fee_year = '2025-2026',
  fee_note = 'Fee varies by program. BBA first year: PKR 224,000. DPT: PKR 85,000/sem. Pharm.D: PKR 65,000/sem. MBA/EMBA: PKR 7,000 per course. BSCS: PKR 146,000 first year. Foreign students have a different fee structure. Annual fee adjustments of 5-10% are typical. Application processing fee: PKR 1,000.',
  entry = 'University Admission Test (MCQ-based)',
  merit = 'Admission is based on a university entry test. For Pharmacy programs, candidates must meet PCP (Pharmacy Council of Pakistan) requirements. Result-awaited candidates can apply provisionally. Foreign applicants must follow HEC rules.',
  programs = ARRAY['Pharm.D (Doctor of Pharmacy) - 5 Years','DPT (Doctor of Physical Therapy) - 5 Years','OTD (Doctor of Occupational Therapy) - 4 Years','BBA (Bachelor of Business Administration) - 4 Years','ADP in Business Administration - 2 Years','BS Computer Science - 4 Years','BS Data Science - 4 Years','BS Software Engineering - 4 Years','BS Artificial Intelligence - 4 Years','BS Cyber Security - 4 Years','BS Accounting & Finance - 4 Years','BS Entrepreneurship - 4 Years','BS Business Analytics - 4 Years','BSIT - 4 Years','BS Economics and Finance - 4 Years','BS Commerce - 4 Years','Bachelor in Fashion Design - 4 Years','MBA - 2 Years','Executive MBA - 2 Years','M.Phil. in Pharmaceutics','M.Phil. in Pharmacognosy','M.Phil. in Pharmaceutical Chemistry','PhD in Management Sciences','PhD in Health Management','MSc in Computer Science']::text[],
  tags = ARRAY['private','sindh','medical','business','cs']::text[],
  scholarships = 'Merit-based and need-based scholarships available. The university offers one of the most generous scholarship and assistantship programs in Pakistan through the Dewan Trust. Students with financial constraints are not denied admission if they meet merit-based criteria.',
  hostel = 'Not specified',
  description = 'Private sector university established in 2013 under the Sindh Assembly Act. Recognized by HEC as a ''W'' Category university. Part of the Yousuf Dewan Companies. Located in Korangi Industrial Area, Karachi. Committed to providing quality education in Health Sciences, Business, and Technology with an economically accessible fee structure.',
  highlights = ARRAY['HEC recognized ''W'' Category university','Chartered by Government of Sindh (2013)','Part of Yousuf Dewan Companies','One of the most economical private universities in Pakistan','Generous scholarship and assistantship programs','HEC and PCP accredited programs']::text[]
WHERE id = 262;
DELETE FROM fee_details WHERE institution_id = 262;
INSERT INTO fee_details (institution_id, label, value, sort_order) VALUES
  (262, 'BBA (Bachelor of Business Administration) - 1st Year', 224000, 0),
  (262, 'DPT (Doctor of Physical Therapy) - per semester', 85000, 1),
  (262, 'Pharm.D (Doctor of Pharmacy) - per semester', 65000, 2),
  (262, 'BS Computer Science - 1st Year', 146000, 3),
  (262, 'BSIT - Admission Fee', 10000, 4),
  (262, 'BSIT - per credit hour', 4000, 5),
  (262, 'BS Economics and Finance - per semester', 45000, 6),
  (262, 'BS Commerce - per semester', 40000, 7),
  (262, 'MBA / Executive MBA - per course', 7000, 8),
  (262, 'Occupational Therapy (OTD) - per semester', 70000, 9);

-- #261 NUP — National University of Pakistan
UPDATE institutions SET
  full_name = 'National University of Pakistan',
  website = 'nup.edu.pk',
  established = 2023,
  fee = 'Contact university',
  fee_num = NULL,
  fee_year = '2026',
  fee_note = 'No publicly available fee structure has been published yet, as the university was established in 2023. NUP is a public sector university that aims to provide equal opportunity to students from lower and lower-middle income groups. For accurate fee information, contact the university admission office directly.',
  entry = 'Contact university',
  merit = 'Contact university for admission criteria.',
  programs = ARRAY['BS Computer Science','BS Fine Arts','BS English','BS Urdu','BS Psychology','BS Political Sciences','BS Health and Physical Education','BS Mathematics','BS Physics','BS Economics']::text[],
  tags = ARRAY['public','islamabad','cs','arts','sciences']::text[],
  scholarships = 'Contact university for scholarship information.',
  description = 'National University of Pakistan (NUP) is a federally chartered public sector university in Islamabad. Established through the National University of Pakistan Bill, approved by the President on 20 April 2023 and passed by the National Assembly on 28 July 2023. Affiliated with 26 Federal Government Colleges across the country, it aims to provide access to higher education for students from diverse backgrounds. Offers a multi-disciplinary framework covering sciences, engineering, computing, management, social sciences, arts, and humanities.',
  highlights = ARRAY['Federally chartered public sector university','Established in 2023 by the Government of Pakistan','Affiliated with 26 Federal Government Colleges nationwide','Multi-disciplinary programs','Focused on equal access for lower and lower-middle income groups','HEC recognized university']::text[]
WHERE id = 261;
DELETE FROM fee_details WHERE institution_id = 261;

-- #260 HANDS-IDS — HANDS Institute of Development Studies
UPDATE institutions SET
  full_name = 'HANDS Institute of Development Studies',
  website = 'hands-ids.edu.pk',
  established = 2023,
  fee = 'Affordable / Contact university',
  fee_num = NULL,
  fee_year = '2026',
  fee_note = 'The institute is known for its affordable fee structure, ensuring quality education remains accessible. Scholarships are available up to 50-70%. For specific program fees, contact the admission office.',
  entry = 'Merit-based',
  merit = 'Minimum 45% or 2nd-division in HSSC or equivalent from a recognized institute or board. Result-awaited candidates may also apply.',
  programs = ARRAY['BS Business Administration (4 Years)','BS Development Studies (4 Years)','BS Accounting & Finance (4 Years)','BS Community Development & Leadership','BS Environmental Studies','Associate Degree in Business Administration (4 Years)','MBA (Master of Business Administration)','MS in Management Sciences','MS in Development Studies','PhD in Management Sciences','PhD in Development Studies','Generic BS Nursing','Post RN BS Nursing','Community Midwifery (CMW)','Online Diploma in NGO Management']::text[],
  tags = ARRAY['private','sindh','business','development-studies','sciences','medical']::text[],
  scholarships = 'Merit-based and need-based scholarships available up to 50-70%. Scholarships may cover up to 50% of tuition and are awarded at admission after evaluation by the Scholarship and Financial Aid Committee. Up to 100% for outstanding students.',
  hostel = 'Available',
  description = 'HANDS Institute of Development Studies (HANDS-IDS) is a degree-awarding institute based in Karachi, sponsored by HANDS Pakistan. Established on 4 September 2023, chartered by the Government of Sindh, and granted NoC by the Higher Education Commission (HEC) on 22 January 2024. A green institute with an open-air, eco-friendly learning environment.',
  highlights = ARRAY['Chartered by Government of Sindh (2023)','HEC recognized degree-awarding institute','Sponsored by HANDS Pakistan','Affordable fee structure','Scholarships up to 70%','Eco-friendly green campus','Hostel and transport facilities available']::text[]
WHERE id = 260;
DELETE FROM fee_details WHERE institution_id = 260;

-- #259 UOAS — The University of Agriculture, Swat
UPDATE institutions SET
  full_name = 'The University of Agriculture, Swat',
  website = 'uoas.edu.pk',
  established = 2020,
  fee = 'Contact university',
  fee_num = NULL,
  fee_year = '2026',
  fee_note = 'Specific semester-wise tuition fees are not publicly listed. The university offers a wide range of fully funded scholarships covering semester fees and an annual stipend of Rs. 60,000. Application/test fee is Rs. 1,500 (non-refundable) for postgraduate programs.',
  entry = 'University Admission Test / GAT (General/Subject)',
  merit = 'Undergraduate: Minimum 45%-50% marks in HSSC depending on program. B.Sc (Hons) Agriculture & BS Human Nutrition: 45% in Pre-Medical/Pre-Engineering. BS Computer Science: 50%. Merit formula: 40% SSC + 60% HSSC. Postgraduate: GAT General (50%) for M.Sc (Hons); GAT Subject (60%) for PhD.',
  programs = ARRAY['B.Sc. (Hons) Agriculture - Entomology','B.Sc. (Hons) Agriculture - Food Science & Technology','B.Sc. (Hons) Agriculture - Horticulture','B.Sc. (Hons) Agriculture - Plant Breeding & Genetics','B.Sc. (Hons) Agriculture - Soil & Environmental Sciences','BS Artificial Intelligence','BS Climate Change Sciences','BS Computer Science','BS Human Nutrition & Dietetics','M.Sc. (Hons) Agriculture - Entomology','M.Sc. (Hons) Agriculture - Food Science & Technology','M.Sc. (Hons) Agriculture - Horticulture','M.Sc. (Hons) Agriculture - Plant Breeding & Genetics','M.Sc. (Hons) Agriculture - Soil & Environmental Sciences','Ph.D. Agriculture (Entomology / Horticulture / Plant Breeding & Genetics / Soil & Environmental Sciences)']::text[],
  tags = ARRAY['public','kpk','agriculture','cs','sciences','medical']::text[],
  scholarships = 'Diversity & Inclusion Scholarships (5 fully funded including Rs. 60,000 annual stipend for students from Punjab, Sindh, Balochistan, GB, AJK); Climate Change & Mountain Agriculture Scholarships (2 per district of KP, fully funded with stipend); Merit scholarships for board position holders and semester toppers; Need-based scholarships; External scholarships via HEC, Zakat, PEF, Bait-ul-Mal.',
  hostel = 'Contact university',
  description = 'Government-chartered and HEC-recognized public sector university established in December 2021 in Swat''s scenic valley. Started as a sub-campus in February 2020 before receiving regular university status. Focuses on agriculture, climate resilience, and technology education with a special emphasis on mountainous agriculture.',
  highlights = ARRAY['HEC recognized public sector university (chartered 2021)','Strong scholarship program with stipends','Focus on Climate Change and Mountain Agriculture','HEC accredited undergraduate and postgraduate programs','Heavily subsidized education through scholarships']::text[]
WHERE id = 259;
DELETE FROM fee_details WHERE institution_id = 259;
INSERT INTO fee_details (institution_id, label, value, sort_order) VALUES
  (259, 'Application / Test Fee (Postgraduate)', 1500, 0);

-- #258 AKII — Al-Karam International Institute, Bhera
UPDATE institutions SET
  full_name = 'Al-Karam International Institute, Bhera',
  website = 'akii.edu.pk',
  established = 2021,
  fee = 'Contact university',
  fee_num = NULL,
  fee_year = '2025',
  fee_note = 'Fee details for BS programs include a one-time admission fee of Rs. 2,000 and a refundable security deposit of Rs. 5,000. For a comprehensive fee structure including semester-wise tuition, contact the university or refer to the official website.',
  entry = 'University Admission Test',
  merit = 'Merit-based admission. Applicants are assessed on their academic records, aptitude, and commitment to learning. Foreign degree holders need an equivalence certificate from IBCC and HEC.',
  programs = ARRAY['BS English','BS Arabic','BS Islamic Studies','BS Economics','BS Computer Science','BBA - Bachelor of Business Administration','LLB - Bachelor of Laws','MCS - Master of Computer Science','MBA - Master of Business Administration','M.Phil Economics','M.Phil Islamic Studies']::text[],
  tags = ARRAY['private','punjab','islamic','arts','business','cs','law']::text[],
  scholarships = 'Merit-based and need-based scholarships are available for students demonstrating academic excellence, financial need, or a commitment to community service.',
  hostel = 'Available',
  description = 'Al-Karam International Institute (AKII) is a private degree-awarding institute located in Bhera, Sargodha, Punjab. Formally chartered by the Parliament of Pakistan under the Al-Karam International Institute Act, 2021. Recognized by the Higher Education Commission (HEC) and accredited by the Pakistan Bar Council (PBC). Offers undergraduate and postgraduate programs with a focus on blending modern and Islamic education.',
  highlights = ARRAY['Federally chartered by the Parliament of Pakistan (2021)','HEC recognized degree-awarding institute','Accredited by the Pakistan Bar Council (LLB)','International student body from over 15 countries','Scholarships for meritorious and needy students','Hostel and transport facilities available']::text[]
WHERE id = 258;
DELETE FROM fee_details WHERE institution_id = 258;
INSERT INTO fee_details (institution_id, label, value, sort_order) VALUES
  (258, 'Admission Fee (BS Programs - one-time)', 2000, 0),
  (258, 'Security Deposit (BS Programs - refundable)', 5000, 1);

-- #257 MYPGI — Pakistan Global Institute, Rawat
UPDATE institutions SET
  full_name = 'Pakistan Global Institute, Rawat',
  website = 'mypgi.edu.pk',
  established = 2023,
  fee = 'Contact university',
  fee_num = NULL,
  fee_year = '2026',
  fee_note = 'No specific semester-wise fee structure is publicly available. The university offers merit-based and need-based scholarships. For accurate fee details, contact the admissions office directly.',
  entry = 'Merit-based / Admission Test',
  merit = 'BBA: Minimum 45% marks in Intermediate (HSSC) or equivalent. BSCS: Minimum 50% cumulative score AND 50% minimum score in Mathematics in HSSC (Science) or equivalent.',
  programs = ARRAY['BBA - Bachelor of Business Administration (4 Years)','BSCS - Bachelor of Science in Computer Science (4 Years)','BSBA - Bachelor of Science in Business Analytics (4 Years)']::text[],
  tags = ARRAY['private','punjab','business','cs']::text[],
  scholarships = 'Merit-Based Scholarship: 100% tuition fee waiver for top candidates (maintain CGPA 3.5+). Need-Based Scholarship: tuition support for low-income students, orphans, single mothers, underdeveloped areas, and minority students.',
  hostel = 'Contact university',
  description = 'Pakistan''s first South Korean higher education institution, established on 17 March 2023 under the Pakistan Global Institute Act, 2023. Recognized by the Higher Education Commission (HEC) and accredited by NBEAC and NCEAC. Offers undergraduate programs in business, computer science, and data analytics with a focus on character building, ethics, and modern liberal arts education.',
  highlights = ARRAY['Pakistan''s first South Korean higher education institution','Chartered by the Government of Pakistan (2023)','HEC recognized & NBEAC/NCEAC accredited','Merit-based (100% tuition waiver) and need-based scholarships','International faculty and South Korean academic partnerships','Programs in Business, Computer Science, and Data Analytics']::text[]
WHERE id = 257;
DELETE FROM fee_details WHERE institution_id = 257;

-- #256 DMIU — Dar-ul-Madina International University
UPDATE institutions SET
  full_name = 'Dar-ul-Madina International University',
  website = 'dmiu.edu.pk',
  established = 2013,
  fee = 'Contact university',
  fee_num = NULL,
  fee_year = '2026',
  fee_note = 'No specific semester-wise fee structure is publicly available. The university offers merit-based and need-based scholarships to support deserving students. For accurate fee details, contact the university directly.',
  entry = 'University Entrance Exam / Interview',
  merit = 'Minimum 45% marks in Intermediate (FA/FSc) or equivalent. Admission criteria include academic merit, entrance exams, and interviews. Maximum age limit: 22 years (age relaxation available).',
  programs = ARRAY['BS Islamic Studies (4 Years)','BS Arabic (4 Years)','BS Education (4 Years)','BS Islamic Banking and Finance (4 Years)']::text[],
  tags = ARRAY['private','islamabad','islamic','arabic','education','business']::text[],
  scholarships = 'Merit-based and need-based scholarships are available to support deserving students.',
  hostel = 'Contact university',
  description = 'Dar-ul-Madina International University (DMIU) is a private university in Islamabad, established in 2013 and chartered by the Government of Pakistan. Recognized by the Higher Education Commission (HEC) and accredited with NBEAC. A visionary initiative by Dawat-e-Islami, promoting research, learning, and innovation within Shariah principles. Located in G-11 Markaz, Islamabad.',
  highlights = ARRAY['Chartered by Government of Pakistan (2013)','HEC recognized & NBEAC accredited','Initiative of Dawat-e-Islami','Merit and need-based scholarships available','Well-equipped classrooms, libraries, and research centers']::text[]
WHERE id = 256;
DELETE FROM fee_details WHERE institution_id = 256;

-- #255 UAC — University of Art and Culture, Jamshoro
UPDATE institutions SET
  full_name = 'University of Art and Culture, Jamshoro',
  website = 'uac.edu.pk',
  established = 2018,
  fee = 'Contact University',
  fee_num = NULL,
  fee_year = '2025-2026',
  fee_note = 'As a not-for-profit university, fees are kept affordable and scholarships are available on a need basis. An older (2021) data point shows Rs. 108,000 as the fee for a BS program, but this figure may not be current. For accurate program-specific fees, contact the university directly.',
  entry = 'Merit-based / Admission Test',
  merit = 'Admission is merit-based, considering academic achievements, potential, and overall merits of each applicant. Applicants must meet the eligibility requirements for their chosen program.',
  programs = ARRAY['Bachelors in Fine Art (4 Years)','Bachelors in Media Art (4 Years)','Bachelors in Textile & Fashion Art (4 Years)','Bachelors in Architecture (4 Years)']::text[],
  tags = ARRAY['private','sindh','arts']::text[],
  scholarships = 'Talent-Based Scholarships, Merit-Based Scholarships, Need-Based Scholarships, and a Learn-Earn-Return (LER) Scholarship. As a not-for-profit venture, scholarships are awarded on a need basis.',
  hostel = 'Contact university',
  description = 'A private, non-profit university established in Sindh under the Sindh Act No. XVI of 2018. Dedicated to providing artistic and technical education in art, craft, design, architecture, theatre, film, research, and various trades. Recognized by the Higher Education Commission (HEC) and accredited by PCATP (for architecture) and NCEAC.',
  highlights = ARRAY['Chartered by the Government of Sindh (2018)','HEC recognized university','PCATP and NCEAC accredited programs','Non-profit university with need-based scholarships','Focus on art, design, architecture, theatre, and film']::text[]
WHERE id = 255;
DELETE FROM fee_details WHERE institution_id = 255;

-- #254 SIMAT — Sindh Institute of Management and Technology
UPDATE institutions SET
  full_name = 'Sindh Institute of Management and Technology',
  website = 'simat.edu.pk',
  established = 2015,
  fee = 'Rs. 163,750–646,519 (total package)',
  fee_num = NULL,
  fee_year = '2025',
  fee_note = 'SIMT offers discounted total fee packages with monthly installment plans. Programs include BBA, BSCS, BS Engineering Technology, AD.COM, ADCS, and MBA. Packages range from Rs. 163,750 (MBA-R SIMT) to Rs. 646,519 (BS Mechanical Engineering). Monthly installments start from Rs. 6,250. Admission/at-time fees range from Rs. 16,250 to Rs. 25,000.',
  entry = 'Aptitude Test / Entrance Exam',
  merit = 'Undergraduate: Intermediate or equivalent with minimum 45%-50% marks (depending on program). BBA: 45% in Inter/DAE. BSCS: 50% in Inter/DAE. BS Engineering: 50% in DAE/Inter Pre-Engineering. MBA: 16 years education with 2nd Division. Result-awaited candidates may apply provisionally. Maximum 40 students per batch.',
  seats = '40 students per batch',
  programs = ARRAY['BBA - Bachelor of Business Administration (4 Years)','BBA - Following (2 / 2.5 Years)','BSCS - Bachelor of Science in Computer Science (4 Years)','BSCS - Following (2 Years)','BS Electrical Engineering Technology','BS Mechanical Engineering Technology','BS Software Engineering (4 Years)','BS Information Technology','B.Com - Bachelor of Commerce','AD.COM - Associate Degree in Commerce (2 Years)','ADCS - Associate Degree in Computer Science (2 Years)','MBA - Master of Business Administration (Regular & Non-Regular)','B.Ed - Bachelor of Education']::text[],
  tags = ARRAY['private','sindh','business','cs','engineering','education']::text[],
  scholarships = 'Talent Hunt Scholarship Program for deserving students with high academic scores and needy students with poor financial income.',
  description = 'Private degree-awarding institute chartered by the Government of Sindh under Act XIV of March 2015 and recognized by the Higher Education Commission (HEC). Located in Korangi Industrial Area, Karachi. Accredited by NBEAC, NCEAC, and NTC. Offers programs in Business Administration, Computer Sciences, Information Technology, Education, and Engineering Technologies.',
  highlights = ARRAY['Chartered by Government of Sindh (Act XIV of 2015)','HEC recognized degree-awarding institute','NBEAC, NCEAC, and NTC accredited programs','Discounted fee packages with monthly installment plans','Regular and weekend class options','Talent Hunt Scholarship Program available']::text[]
WHERE id = 254;
DELETE FROM fee_details WHERE institution_id = 254;
INSERT INTO fee_details (institution_id, label, value, sort_order) VALUES
  (254, 'BBA (4 Years) - Discounted Package', 408721, 0),
  (254, 'BBA (4 Years) - At-Time Admission Fee', 17709, 1),
  (254, 'BBA (4 Years) - Monthly Installment', 7709, 2),
  (254, 'BSCS (4 Years) - Discounted Package', 430237, 3),
  (254, 'BSCS (4 Years) - At-Time Admission Fee', 18125, 4),
  (254, 'BSCS (4 Years) - Monthly Installment', 8125, 5),
  (254, 'MBA-R (SIMT) - Discounted Package', 163750, 6),
  (254, 'MBA-R (SIMT) - Monthly Installment', 6250, 7),
  (254, 'BS Mechanical Engineering Technology - Package', 646519, 8),
  (254, 'BS Electrical Engineering Technology - Package', 538783, 9),
  (254, 'AD.COM - Discounted Package', 204758, 10),
  (254, 'ADCS - Discounted Package', 204758, 11),
  (254, 'Course Exemption Fee (per course)', 2500, 12);

-- After running: node build-university-pages.js && node generate-sitemap.js, then commit.
