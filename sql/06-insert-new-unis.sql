-- ============================================================================
-- 06-insert-new-unis.sql  —  add 54 universities from the Kaggle dataset
-- not previously in TaleemPK (de-duped against all 218 existing institutions).
-- id is auto-assigned. fee/rank/established left NULL for the nightly data agent.
-- Run in Supabase SQL Editor (admin). Idempotent: skips a row whose name+city
-- already exists, so re-running is safe.
-- ============================================================================

INSERT INTO institutions (name, full_name, type, sector, city, province, website, icon, programs, tags, description)
SELECT 'UBAS', 'Lahore University of Biological and Applied Sciences', 'university', 'public', 'Lahore', 'Punjab', 'https://ubas.edu.pk/', '🏛️', ARRAY['Zoology','Botany','Chemistry','Physics','Mathematics']::text[], ARRAY['public']::text[], 'Lahore University of Biological and Applied Sciences is a public university located in Lahore, Punjab, Pakistan.'
WHERE NOT EXISTS (SELECT 1 FROM institutions WHERE lower(name)=lower('UBAS') AND lower(city)=lower('Lahore'));
INSERT INTO institutions (name, full_name, type, sector, city, province, website, icon, programs, tags, description)
SELECT 'SIMS', 'Sindh Institute of Medical Sciences', 'university', 'private', 'Karachi', 'Sindh', 'https://sims.siut.edu.pk/', '🏛️', ARRAY['Medicine (MBBS)','Nursing','Medical Lab Technology']::text[], ARRAY['private','medical']::text[], 'Sindh Institute of Medical Sciences is a private institution located in Karachi, Sindh, Pakistan.'
WHERE NOT EXISTS (SELECT 1 FROM institutions WHERE lower(name)=lower('SIMS') AND lower(city)=lower('Karachi'));
INSERT INTO institutions (name, full_name, type, sector, city, province, website, icon, programs, tags, description)
SELECT 'KASBIT', 'KASB Institute of Technology', 'university', 'private', 'Karachi', 'Sindh', 'https://kasbit.edu.pk', '🏛️', ARRAY['Computer Science','Business Administration','Media Sciences','Commerce']::text[], ARRAY['private','business','cs','arts']::text[], 'KASB Institute of Technology is a private institution located in Karachi, Sindh, Pakistan.'
WHERE NOT EXISTS (SELECT 1 FROM institutions WHERE lower(name)=lower('KASBIT') AND lower(city)=lower('Karachi'));
INSERT INTO institutions (name, full_name, type, sector, city, province, website, icon, programs, tags, description)
SELECT 'TIP', 'Textile Institute of Pakistan', 'university', 'private', 'Karachi', 'Sindh', 'https://www.tip.edu.pk', '🏛️', ARRAY['Textile Engineering','Fashion Design','Textile Design','Business Administration']::text[], ARRAY['private','engineering','business','arts']::text[], 'Textile Institute of Pakistan is a private institution located in Karachi, Sindh, Pakistan.'
WHERE NOT EXISTS (SELECT 1 FROM institutions WHERE lower(name)=lower('TIP') AND lower(city)=lower('Karachi'));
INSERT INTO institutions (name, full_name, type, sector, city, province, website, icon, programs, tags, description)
SELECT 'PRESTON', 'Preston University', 'university', 'private', 'Kohat', 'Khyber Pakhtunkhwa', 'https://preston.edu.pk', '🏛️', ARRAY['Business Administration','Computer Science','Electrical Engineering','English','Education','Law']::text[], ARRAY['private','engineering','business','cs','law']::text[], 'Preston University is a private university located in Kohat, Khyber Pakhtunkhwa, Pakistan.'
WHERE NOT EXISTS (SELECT 1 FROM institutions WHERE lower(name)=lower('PRESTON') AND lower(city)=lower('Kohat'));
INSERT INTO institutions (name, full_name, type, sector, city, province, website, icon, programs, tags, description)
SELECT 'GIU', 'The Green International University', 'university', 'private', 'Lahore', 'Punjab', 'https://giu.edu.pk/', '🏛️', ARRAY['Computer Science','Business Administration','Education','English']::text[], ARRAY['private','business','cs']::text[], 'The Green International University is a private university located in Lahore, Punjab, Pakistan.'
WHERE NOT EXISTS (SELECT 1 FROM institutions WHERE lower(name)=lower('GIU') AND lower(city)=lower('Lahore'));
INSERT INTO institutions (name, full_name, type, sector, city, province, website, icon, programs, tags, description)
SELECT 'UEAS', 'University of Engineering and Applied Sciences Swat', 'university', 'public', 'Kanju', 'Khyber Pakhtunkhwa', 'https://www.ueas.edu.pk/', '🏛️', ARRAY['Computer Science','Electrical Engineering','Civil Engineering','Mechanical Engineering','Software Engineering','Business Administration']::text[], ARRAY['public','engineering','business','cs']::text[], 'University of Engineering and Applied Sciences Swat is a public university located in Kanju, Khyber Pakhtunkhwa, Pakistan.'
WHERE NOT EXISTS (SELECT 1 FROM institutions WHERE lower(name)=lower('UEAS') AND lower(city)=lower('Kanju'));
INSERT INTO institutions (name, full_name, type, sector, city, province, website, icon, programs, tags, description)
SELECT 'IMPERIAL', 'Imperial College of Business Studies', 'university', 'private', 'Lahore', 'Punjab', 'https://www.imperial.edu.pk', '🏛️', ARRAY['Business Administration','Computer Science','Commerce']::text[], ARRAY['private','business','cs']::text[], 'Imperial College of Business Studies is a private institution located in Lahore, Punjab, Pakistan.'
WHERE NOT EXISTS (SELECT 1 FROM institutions WHERE lower(name)=lower('IMPERIAL') AND lower(city)=lower('Lahore'));
INSERT INTO institutions (name, full_name, type, sector, city, province, website, icon, programs, tags, description)
SELECT 'UCHS', 'University of Child Health Sciences', 'university', 'public', 'Lahore', 'Punjab', 'https://uchs.edu.pk/', '🏛️', ARRAY['Pediatric Medicine','Pediatric Surgery','Nursing','Medical Lab Technology','Anatomy','Physiology']::text[], ARRAY['public','medical']::text[], 'University of Child Health Sciences is a public university located in Lahore, Punjab, Pakistan.'
WHERE NOT EXISTS (SELECT 1 FROM institutions WHERE lower(name)=lower('UCHS') AND lower(city)=lower('Lahore'));
INSERT INTO institutions (name, full_name, type, sector, city, province, website, icon, programs, tags, description)
SELECT 'TAG-GU', 'The Grand Asian University', 'university', 'private', 'Sialkot', 'Punjab', 'https://www.tag-gu.global/', '🏛️', ARRAY['Computer Science','Business Administration','Education','English']::text[], ARRAY['private','business','cs']::text[], 'The Grand Asian University is a private university located in Sialkot, Punjab, Pakistan.'
WHERE NOT EXISTS (SELECT 1 FROM institutions WHERE lower(name)=lower('TAG-GU') AND lower(city)=lower('Sialkot'));
INSERT INTO institutions (name, full_name, type, sector, city, province, website, icon, programs, tags, description)
SELECT 'GIMS', 'Gambat Institute of Medical Sciences', 'university', 'public', 'Khairpur', 'Sindh', 'https://gims.edu.pk', '🏛️', ARRAY['Medicine (MBBS)','Nursing','Medical Lab Technology']::text[], ARRAY['public','medical']::text[], 'Gambat Institute of Medical Sciences is a public institution located in Khairpur, Sindh, Pakistan.'
WHERE NOT EXISTS (SELECT 1 FROM institutions WHERE lower(name)=lower('GIMS') AND lower(city)=lower('Khairpur'));
INSERT INTO institutions (name, full_name, type, sector, city, province, website, icon, programs, tags, description)
SELECT 'SBBU-SBA', 'Shaheed Benazir Bhutto University Shaheed Benazirabad', 'university', 'public', 'Nawabshah', 'Sindh', 'https://sbbusba.edu.pk', '🏛️', ARRAY['English','Sindhi','Computer Science','Chemistry','Physics','Mathematics','Education','Business Administration','Law','Pharmacy']::text[], ARRAY['public','medical','business','cs','law']::text[], 'Shaheed Benazir Bhutto University Shaheed Benazirabad is a public university located in Nawabshah, Sindh, Pakistan.'
WHERE NOT EXISTS (SELECT 1 FROM institutions WHERE lower(name)=lower('SBBU-SBA') AND lower(city)=lower('Nawabshah'));
INSERT INTO institutions (name, full_name, type, sector, city, province, website, icon, programs, tags, description)
SELECT 'UCHENAB', 'University of Chenab', 'university', 'private', 'Gujrat', 'Punjab', 'https://uchenab.edu.pk', '🏛️', ARRAY['Computer Science','Business Administration','Education','English']::text[], ARRAY['private','business','cs']::text[], 'University of Chenab is a private university located in Gujrat, Punjab, Pakistan.'
WHERE NOT EXISTS (SELECT 1 FROM institutions WHERE lower(name)=lower('UCHENAB') AND lower(city)=lower('Gujrat'));
INSERT INTO institutions (name, full_name, type, sector, city, province, website, icon, programs, tags, description)
SELECT 'UIT', 'UIT University, Karachi', 'university', 'public', 'Karachi', 'Sindh', 'https://uit.edu.pk', '🏛️', ARRAY['Computer Science','Electrical Engineering','Business Administration','Software Engineering']::text[], ARRAY['public','engineering','business','cs']::text[], 'UIT University, Karachi is a public university located in Karachi, Sindh, Pakistan.'
WHERE NOT EXISTS (SELECT 1 FROM institutions WHERE lower(name)=lower('UIT') AND lower(city)=lower('Karachi'));
INSERT INTO institutions (name, full_name, type, sector, city, province, website, icon, programs, tags, description)
SELECT 'AIE', 'Ali Institute of Education', 'university', 'private', 'Lahore', 'Punjab', 'https://aie.edu.pk', '🏛️', ARRAY['Education','Special Education','Educational Leadership']::text[], ARRAY['private']::text[], 'Ali Institute of Education is a private institution located in Lahore, Punjab, Pakistan.'
WHERE NOT EXISTS (SELECT 1 FROM institutions WHERE lower(name)=lower('AIE') AND lower(city)=lower('Lahore'));
INSERT INTO institutions (name, full_name, type, sector, city, province, website, icon, programs, tags, description)
SELECT 'CIBES', 'Commecs Institute of Business and Emerging Sciences', 'university', 'private', 'Karachi', 'Sindh', 'https://cibes.edu.pk', '🏛️', ARRAY['Business Administration','Commerce','Computer Science']::text[], ARRAY['private','business','cs']::text[], 'Commecs Institute of Business and Emerging Sciences is a private institution located in Karachi, Sindh, Pakistan.'
WHERE NOT EXISTS (SELECT 1 FROM institutions WHERE lower(name)=lower('CIBES') AND lower(city)=lower('Karachi'));
INSERT INTO institutions (name, full_name, type, sector, city, province, website, icon, programs, tags, description)
SELECT 'MITE', 'Millennium Institute of Technology and Entrepreneurship', 'university', 'private', 'Karachi', 'Sindh', 'https://mite.edu.pk', '🏛️', ARRAY['Computer Science','Business Administration','Electrical Engineering']::text[], ARRAY['private','engineering','business','cs']::text[], 'Millennium Institute of Technology and Entrepreneurship is a private institution located in Karachi, Sindh, Pakistan.'
WHERE NOT EXISTS (SELECT 1 FROM institutions WHERE lower(name)=lower('MITE') AND lower(city)=lower('Karachi'));
INSERT INTO institutions (name, full_name, type, sector, city, province, website, icon, programs, tags, description)
SELECT 'NHU', 'Nazeer Hussain University', 'university', 'private', 'Karachi', 'Sindh', 'https://nhu.edu.pk', '🏛️', ARRAY['Computer Science','Business Administration','Commerce','Electrical Engineering','Education']::text[], ARRAY['private','engineering','business','cs']::text[], 'Nazeer Hussain University is a private university located in Karachi, Sindh, Pakistan.'
WHERE NOT EXISTS (SELECT 1 FROM institutions WHERE lower(name)=lower('NHU') AND lower(city)=lower('Karachi'));
INSERT INTO institutions (name, full_name, type, sector, city, province, website, icon, programs, tags, description)
SELECT 'SZABUL', 'Shaheed Zulfiqar Ali Bhutto University of Law', 'university', 'public', 'Karachi', 'Sindh', 'https://szabul.edu.pk', '🏛️', ARRAY['Law','Criminology','Governance & Public Policy']::text[], ARRAY['public','law']::text[], 'Shaheed Zulfiqar Ali Bhutto University of Law is a public university located in Karachi, Sindh, Pakistan.'
WHERE NOT EXISTS (SELECT 1 FROM institutions WHERE lower(name)=lower('SZABUL') AND lower(city)=lower('Karachi'));
INSERT INTO institutions (name, full_name, type, sector, city, province, website, icon, programs, tags, description)
SELECT 'SOHAIL', 'Sohail University', 'university', 'private', 'Karachi', 'Sindh', 'https://sohail.edu.pk', '🏛️', ARRAY['Computer Science','Business Administration','Commerce','English']::text[], ARRAY['private','business','cs']::text[], 'Sohail University is a private university located in Karachi, Sindh, Pakistan.'
WHERE NOT EXISTS (SELECT 1 FROM institutions WHERE lower(name)=lower('SOHAIL') AND lower(city)=lower('Karachi'));
INSERT INTO institutions (name, full_name, type, sector, city, province, website, icon, programs, tags, description)
SELECT 'AGU', 'Al-Ghazali University', 'university', 'private', 'Karachi', 'Sindh', 'https://agu.edu.pk', '🏛️', ARRAY['Islamic Studies','Computer Science','Business Administration','Education']::text[], ARRAY['private','business','cs']::text[], 'Al-Ghazali University is a private university located in Karachi, Sindh, Pakistan.'
WHERE NOT EXISTS (SELECT 1 FROM institutions WHERE lower(name)=lower('AGU') AND lower(city)=lower('Karachi'));
INSERT INTO institutions (name, full_name, type, sector, city, province, website, icon, programs, tags, description)
SELECT 'MUST-MLT', 'Multan University of Science and Technology', 'university', 'public', 'Multan', 'Punjab', 'https://www.multanust.edu.pk', '🏛️', ARRAY['Computer Science','Electrical Engineering','Business Administration','English']::text[], ARRAY['public','engineering','business','cs']::text[], 'Multan University of Science and Technology is a public university located in Multan, Punjab, Pakistan.'
WHERE NOT EXISTS (SELECT 1 FROM institutions WHERE lower(name)=lower('MUST-MLT') AND lower(city)=lower('Multan'));
INSERT INTO institutions (name, full_name, type, sector, city, province, website, icon, programs, tags, description)
SELECT 'ALKAWTHAR', 'Al-Kawthar University', 'university', 'private', 'Karachi', 'Sindh', 'https://alkawthar.edu.pk/', '🏛️', ARRAY['Islamic Studies','Arabic','Education']::text[], ARRAY['private']::text[], 'Al-Kawthar University is a private university located in Karachi, Sindh, Pakistan.'
WHERE NOT EXISTS (SELECT 1 FROM institutions WHERE lower(name)=lower('ALKAWTHAR') AND lower(city)=lower('Karachi'));
INSERT INTO institutions (name, full_name, type, sector, city, province, website, icon, programs, tags, description)
SELECT 'BBSUTSD', 'Benazir Bhutto Shaheed University of Technology and Skill Development', 'university', 'public', 'Khairpur', 'Sindh', 'https://bbsutsd.edu.pk', '🏛️', ARRAY['Computer Science','Electrical Technology','Civil Technology','Business Administration']::text[], ARRAY['public','business','cs']::text[], 'Benazir Bhutto Shaheed University of Technology and Skill Development is a public university located in Khairpur, Sindh, Pakistan.'
WHERE NOT EXISTS (SELECT 1 FROM institutions WHERE lower(name)=lower('BBSUTSD') AND lower(city)=lower('Khairpur'));
INSERT INTO institutions (name, full_name, type, sector, city, province, website, icon, programs, tags, description)
SELECT 'IISAT', 'International Institute of Science, Arts and Technology', 'university', 'private', 'Gujranwala', 'Punjab', 'https://iisat.edu.pk', '🏛️', ARRAY['Computer Science','Business Administration']::text[], ARRAY['private','business','cs']::text[], 'International Institute of Science, Arts and Technology is a private institution located in Gujranwala, Punjab, Pakistan.'
WHERE NOT EXISTS (SELECT 1 FROM institutions WHERE lower(name)=lower('IISAT') AND lower(city)=lower('Gujranwala'));
INSERT INTO institutions (name, full_name, type, sector, city, province, website, icon, programs, tags, description)
SELECT 'RLKU', 'Rashid Latif Khan University', 'university', 'private', 'Lahore', 'Punjab', 'https://rlku.edu.pk', '🏛️', ARRAY['Computer Science','Pharmacy','Business Administration','Medicine (MBBS)','Dentistry (BDS)','Physical Therapy','Nursing','Electrical Engineering']::text[], ARRAY['private','engineering','medical','business','cs']::text[], 'Rashid Latif Khan University is a private university located in Lahore, Punjab, Pakistan.'
WHERE NOT EXISTS (SELECT 1 FROM institutions WHERE lower(name)=lower('RLKU') AND lower(city)=lower('Lahore'));
INSERT INTO institutions (name, full_name, type, sector, city, province, website, icon, programs, tags, description)
SELECT 'KITE', 'Karachi Institute of Technology and Entrepreneurship', 'university', 'private', 'Karachi', 'Sindh', 'https://kite.edu.pk', '🏛️', ARRAY['Computer Science','Business Administration','Electrical Engineering']::text[], ARRAY['private','engineering','business','cs']::text[], 'Karachi Institute of Technology and Entrepreneurship is a private institution located in Karachi, Sindh, Pakistan.'
WHERE NOT EXISTS (SELECT 1 FROM institutions WHERE lower(name)=lower('KITE') AND lower(city)=lower('Karachi'));
INSERT INTO institutions (name, full_name, type, sector, city, province, website, icon, programs, tags, description)
SELECT 'EMAAN', 'Emaan Institute of Management and Sciences', 'university', 'private', 'Karachi', 'Sindh', 'https://www.emaan.edu.pk/', '🏛️', ARRAY['Computer Science','Business Administration','Education']::text[], ARRAY['private','business','cs']::text[], 'Emaan Institute of Management and Sciences is a private institution located in Karachi, Sindh, Pakistan.'
WHERE NOT EXISTS (SELECT 1 FROM institutions WHERE lower(name)=lower('EMAAN') AND lower(city)=lower('Karachi'));
INSERT INTO institutions (name, full_name, type, sector, city, province, website, icon, programs, tags, description)
SELECT 'MUK', 'Metropolitan University Karachi', 'university', 'private', 'Karachi', 'Sindh', 'https://muk.edu.pk/', '🏛️', ARRAY['Computer Science','Business Administration','Commerce','Education']::text[], ARRAY['private','business','cs']::text[], 'Metropolitan University Karachi is a private university located in Karachi, Sindh, Pakistan.'
WHERE NOT EXISTS (SELECT 1 FROM institutions WHERE lower(name)=lower('MUK') AND lower(city)=lower('Karachi'));
INSERT INTO institutions (name, full_name, type, sector, city, province, website, icon, programs, tags, description)
SELECT 'LIST', 'Lahore Institute of Science and Technology', 'university', 'private', 'Lahore', 'Punjab', 'https://list.edu.pk', '🏛️', ARRAY['Computer Science','Business Administration','Electrical Engineering']::text[], ARRAY['private','engineering','business','cs']::text[], 'Lahore Institute of Science and Technology is a private institution located in Lahore, Punjab, Pakistan.'
WHERE NOT EXISTS (SELECT 1 FROM institutions WHERE lower(name)=lower('LIST') AND lower(city)=lower('Lahore'));
INSERT INTO institutions (name, full_name, type, sector, city, province, website, icon, programs, tags, description)
SELECT 'GNIES', 'Ghazi National Institute of Engineering and Sciences', 'university', 'private', 'Dera Ghazi Khan', 'Punjab', 'https://gnies.edu.pk', '🏛️', ARRAY['Computer Science','Electrical Engineering','Business Administration']::text[], ARRAY['private','engineering','business','cs']::text[], 'Ghazi National Institute of Engineering and Sciences is a private institution located in Dera Ghazi Khan, Punjab, Pakistan.'
WHERE NOT EXISTS (SELECT 1 FROM institutions WHERE lower(name)=lower('GNIES') AND lower(city)=lower('Dera Ghazi Khan'));
INSERT INTO institutions (name, full_name, type, sector, city, province, website, icon, programs, tags, description)
SELECT 'UMS', 'The University of Modern Sciences', 'university', 'private', 'Tando Muhammad Khan', 'Sindh', 'https://ums.edu.pk/', '🏛️', ARRAY['Computer Science','Business Administration','English']::text[], ARRAY['private','business','cs']::text[], 'The University of Modern Sciences is a private university located in Tando Muhammad Khan, Sindh, Pakistan.'
WHERE NOT EXISTS (SELECT 1 FROM institutions WHERE lower(name)=lower('UMS') AND lower(city)=lower('Tando Muhammad Khan'));
INSERT INTO institutions (name, full_name, type, sector, city, province, website, icon, programs, tags, description)
SELECT 'SIMAT', 'Sindh Institute of Management and Technology', 'university', 'private', 'Karachi', 'Sindh', 'https://simat.edu.pk/', '🏛️', ARRAY['Computer Science','Business Administration','Electrical Engineering']::text[], ARRAY['private','engineering','business','cs']::text[], 'Sindh Institute of Management and Technology is a private institution located in Karachi, Sindh, Pakistan.'
WHERE NOT EXISTS (SELECT 1 FROM institutions WHERE lower(name)=lower('SIMAT') AND lower(city)=lower('Karachi'));
INSERT INTO institutions (name, full_name, type, sector, city, province, website, icon, programs, tags, description)
SELECT 'UAC', 'University of Art and Culture, Jamshoro', 'university', 'public', 'Jamshoro', 'Sindh', 'https://uac.edu.pk', '🏛️', ARRAY['Fine Arts','Music','Architecture','Design']::text[], ARRAY['public','arts']::text[], 'University of Art and Culture, Jamshoro is a public university located in Jamshoro, Sindh, Pakistan.'
WHERE NOT EXISTS (SELECT 1 FROM institutions WHERE lower(name)=lower('UAC') AND lower(city)=lower('Jamshoro'));
INSERT INTO institutions (name, full_name, type, sector, city, province, website, icon, programs, tags, description)
SELECT 'DMIU', 'Dar-ul-Madina International University', 'university', 'private', 'Islamabad', 'Islamabad Capital Territory', 'https://dmiu.edu.pk', '🏛️', ARRAY['Islamic Studies','Computer Science','Business Administration','Education']::text[], ARRAY['private','business','cs']::text[], 'Dar-ul-Madina International University is a private university located in Islamabad, Islamabad Capital Territory, Pakistan.'
WHERE NOT EXISTS (SELECT 1 FROM institutions WHERE lower(name)=lower('DMIU') AND lower(city)=lower('Islamabad'));
INSERT INTO institutions (name, full_name, type, sector, city, province, website, icon, programs, tags, description)
SELECT 'MYPGI', 'Pakistan Global Institute', 'university', 'private', 'Rawalpindi', 'Punjab', 'https://mypgi.edu.pk/', '🏛️', ARRAY['Computer Science','Business Administration']::text[], ARRAY['private','business','cs']::text[], 'Pakistan Global Institute is a private institution located in Rawalpindi, Punjab, Pakistan.'
WHERE NOT EXISTS (SELECT 1 FROM institutions WHERE lower(name)=lower('MYPGI') AND lower(city)=lower('Rawalpindi'));
INSERT INTO institutions (name, full_name, type, sector, city, province, website, icon, programs, tags, description)
SELECT 'AKII', 'Al-Karam International Institute', 'university', 'private', 'Bhera', 'Punjab', 'https://akii.edu.pk', '🏛️', ARRAY['Islamic Studies','Arabic','Education']::text[], ARRAY['private']::text[], 'Al-Karam International Institute is a private institution located in Bhera, Punjab, Pakistan.'
WHERE NOT EXISTS (SELECT 1 FROM institutions WHERE lower(name)=lower('AKII') AND lower(city)=lower('Bhera'));
INSERT INTO institutions (name, full_name, type, sector, city, province, website, icon, programs, tags, description)
SELECT 'UOAS', 'The University of Agriculture, Swat', 'university', 'public', 'Mingora', 'Khyber Pakhtunkhwa', 'https://uoas.edu.pk/', '🏛️', ARRAY['Agriculture','Food Science & Technology','Forestry','Horticulture']::text[], ARRAY['public','agriculture']::text[], 'The University of Agriculture, Swat is a public university located in Mingora, Khyber Pakhtunkhwa, Pakistan.'
WHERE NOT EXISTS (SELECT 1 FROM institutions WHERE lower(name)=lower('UOAS') AND lower(city)=lower('Mingora'));
INSERT INTO institutions (name, full_name, type, sector, city, province, website, icon, programs, tags, description)
SELECT 'HANDS-IDS', 'Hands-Institute of Development Studies', 'university', 'private', 'Karachi', 'Sindh', 'https://hands-ids.edu.pk/', '🏛️', ARRAY['Development Studies','Public Health','Education']::text[], ARRAY['private','medical']::text[], 'Hands-Institute of Development Studies is a private institution located in Karachi, Sindh, Pakistan.'
WHERE NOT EXISTS (SELECT 1 FROM institutions WHERE lower(name)=lower('HANDS-IDS') AND lower(city)=lower('Karachi'));
INSERT INTO institutions (name, full_name, type, sector, city, province, website, icon, programs, tags, description)
SELECT 'NUP', 'National University of Pakistan', 'university', 'public', 'Rawalpindi', 'Punjab', 'https://nup.edu.pk', '🏛️', ARRAY['Computer Science','Electrical Engineering','Business Administration']::text[], ARRAY['public','engineering','business','cs']::text[], 'National University of Pakistan is a public university located in Rawalpindi, Punjab, Pakistan.'
WHERE NOT EXISTS (SELECT 1 FROM institutions WHERE lower(name)=lower('NUP') AND lower(city)=lower('Rawalpindi'));
INSERT INTO institutions (name, full_name, type, sector, city, province, website, icon, programs, tags, description)
SELECT 'SBBDEWANUNIVERSITY', 'Shaheed Benazir Bhutto Dewan University', 'university', 'private', 'Karachi', 'Sindh', 'https://sbbdewanuniversity.edu.pk/', '🏛️', ARRAY['Computer Science','Business Administration','Education']::text[], ARRAY['private','business','cs']::text[], 'Shaheed Benazir Bhutto Dewan University is a private university located in Karachi, Sindh, Pakistan.'
WHERE NOT EXISTS (SELECT 1 FROM institutions WHERE lower(name)=lower('SBBDEWANUNIVERSITY') AND lower(city)=lower('Karachi'));
INSERT INTO institutions (name, full_name, type, sector, city, province, website, icon, programs, tags, description)
SELECT 'ISU', 'Ibn-e-Sina University', 'university', 'private', 'Mirpur Khas', 'Sindh', 'https://isu.edu.pk', '🏛️', ARRAY['Eastern Medicine & Surgery','Pharmacy','Physical Therapy']::text[], ARRAY['private','medical']::text[], 'Ibn-e-Sina University is a private university located in Mirpur Khas, Sindh, Pakistan.'
WHERE NOT EXISTS (SELECT 1 FROM institutions WHERE lower(name)=lower('ISU') AND lower(city)=lower('Mirpur Khas'));
INSERT INTO institutions (name, full_name, type, sector, city, province, website, icon, programs, tags, description)
SELECT 'SBU', 'Saifee Burhani University', 'university', 'public', 'Karachi', 'Sindh', 'https://sbu.edu.pk', '🏛️', ARRAY['Architecture','Computer Science','Business Administration']::text[], ARRAY['public','business','cs','arts']::text[], 'Saifee Burhani University is a public university located in Karachi, Sindh, Pakistan.'
WHERE NOT EXISTS (SELECT 1 FROM institutions WHERE lower(name)=lower('SBU') AND lower(city)=lower('Karachi'));
INSERT INTO institutions (name, full_name, type, sector, city, province, website, icon, programs, tags, description)
SELECT 'IBITPU', 'Institute of Business & Technology', 'university', 'private', 'Karachi', 'Sindh', 'https://www.ibitpu.edu.pk/', '🏛️', ARRAY['Computer Science','Business Administration','Commerce']::text[], ARRAY['private','business','cs']::text[], 'Institute of Business & Technology is a private institution located in Karachi, Sindh, Pakistan.'
WHERE NOT EXISTS (SELECT 1 FROM institutions WHERE lower(name)=lower('IBITPU') AND lower(city)=lower('Karachi'));
INSERT INTO institutions (name, full_name, type, sector, city, province, website, icon, programs, tags, description)
SELECT 'ISP', 'Institute of Southern Punjab', 'university', 'private', 'Multan', 'Punjab', 'http://isp.edu.pk/', '🏛️', ARRAY['Computer Science','Business Administration','Education','English']::text[], ARRAY['private','business','cs']::text[], 'Institute of Southern Punjab is a private institution located in Multan, Punjab, Pakistan.'
WHERE NOT EXISTS (SELECT 1 FROM institutions WHERE lower(name)=lower('ISP') AND lower(city)=lower('Multan'));
INSERT INTO institutions (name, full_name, type, sector, city, province, website, icon, programs, tags, description)
SELECT 'HSA', 'Health Services Academy', 'university', 'public', 'Islamabad', 'Islamabad Capital Territory', 'https://hsa.edu.pk', '🏛️', ARRAY['Public Health','Health Policy & Management','Nutrition','Epidemiology & Biostatistics']::text[], ARRAY['public','medical','business']::text[], 'Health Services Academy is a public institution located in Islamabad, Islamabad Capital Territory, Pakistan.'
WHERE NOT EXISTS (SELECT 1 FROM institutions WHERE lower(name)=lower('HSA') AND lower(city)=lower('Islamabad'));
INSERT INTO institutions (name, full_name, type, sector, city, province, website, icon, programs, tags, description)
SELECT 'PMA', 'Pakistan Military Academy', 'university', 'public', 'Kakul', 'Khyber Pakhtunkhwa', 'https://www.joinpakarmy.gov.pk/', '🏛️', ARRAY['Military Sciences','War Studies','Computer Science']::text[], ARRAY['public','cs']::text[], 'Pakistan Military Academy is a public institution located in Kakul, Khyber Pakhtunkhwa, Pakistan.'
WHERE NOT EXISTS (SELECT 1 FROM institutions WHERE lower(name)=lower('PMA') AND lower(city)=lower('Kakul'));
INSERT INTO institutions (name, full_name, type, sector, city, province, website, icon, programs, tags, description)
SELECT 'BI', 'Brains Institute', 'university', 'private', 'Peshawar', 'Khyber Pakhtunkhwa', 'https://brains.edu.pk', '🏛️', ARRAY['Computer Science','Business Administration']::text[], ARRAY['private','business','cs']::text[], 'Brains Institute is a private institution located in Peshawar, Khyber Pakhtunkhwa, Pakistan.'
WHERE NOT EXISTS (SELECT 1 FROM institutions WHERE lower(name)=lower('BI') AND lower(city)=lower('Peshawar'));
INSERT INTO institutions (name, full_name, type, sector, city, province, website, icon, programs, tags, description)
SELECT 'KMU-KHI', 'Karachi Metropolitan University', 'university', 'public', 'Karachi', 'Sindh', 'https://thekmu.edu.pk', '🏛️', ARRAY['Computer Science','Business Administration','Media Sciences']::text[], ARRAY['public','business','cs','arts']::text[], 'Karachi Metropolitan University is a public university located in Karachi, Sindh, Pakistan.'
WHERE NOT EXISTS (SELECT 1 FROM institutions WHERE lower(name)=lower('KMU-KHI') AND lower(city)=lower('Karachi'));
INSERT INTO institutions (name, full_name, type, sector, city, province, website, icon, programs, tags, description)
SELECT 'MCKRUT', 'Mir Chakar Khan Rind University of Technology', 'university', 'public', 'Dera Ghazi Khan', 'Punjab', 'https://mcut.edu.pk', '🏛️', ARRAY['Computer Science','Electrical Engineering','Civil Engineering']::text[], ARRAY['public','engineering','cs']::text[], 'Mir Chakar Khan Rind University of Technology is a public university located in Dera Ghazi Khan, Punjab, Pakistan.'
WHERE NOT EXISTS (SELECT 1 FROM institutions WHERE lower(name)=lower('MCKRUT') AND lower(city)=lower('Dera Ghazi Khan'));
INSERT INTO institutions (name, full_name, type, sector, city, province, website, icon, programs, tags, description)
SELECT 'UOLRK', 'University of Larkano', 'university', 'public', 'Larkano', 'Sindh', 'https://uolrk.edu.pk', '🏛️', ARRAY['Computer Science','English','Education','Business Administration']::text[], ARRAY['public','business','cs']::text[], 'University of Larkano is a public university located in Larkano, Sindh, Pakistan.'
WHERE NOT EXISTS (SELECT 1 FROM institutions WHERE lower(name)=lower('UOLRK') AND lower(city)=lower('Larkano'));
INSERT INTO institutions (name, full_name, type, sector, city, province, website, icon, programs, tags, description)
SELECT 'PAFAWCI', 'PAF Air War College Institute', 'university', 'public', 'Karachi', 'Sindh', 'https://awci.edu.pk/', '🏛️', ARRAY['Strategic Studies','Leadership & Management']::text[], ARRAY['public','business']::text[], 'PAF Air War College Institute is a public institution located in Karachi, Sindh, Pakistan.'
WHERE NOT EXISTS (SELECT 1 FROM institutions WHERE lower(name)=lower('PAFAWCI') AND lower(city)=lower('Karachi'));
INSERT INTO institutions (name, full_name, type, sector, city, province, website, icon, programs, tags, description)
SELECT 'PRESTON-KHI', 'Preston University Karachi', 'university', 'private', 'Karachi', 'Sindh', 'https://prestonkhi.edu.pk', '🏛️', ARRAY['Computer Science','Business Administration','English']::text[], ARRAY['private','business','cs']::text[], 'Preston University Karachi is a private university located in Karachi, Sindh, Pakistan.'
WHERE NOT EXISTS (SELECT 1 FROM institutions WHERE lower(name)=lower('PRESTON-KHI') AND lower(city)=lower('Karachi'));
INSERT INTO institutions (name, full_name, type, sector, city, province, website, icon, programs, tags, description)
SELECT 'SAPSUT', 'Shuhada-e-Army Public School University of Technology', 'university', 'public', 'Nowshera', 'Khyber Pakhtunkhwa', 'https://uotnowshera.edu.pk/', '🏛️', ARRAY['Computer Science','Electrical Engineering','Business Administration']::text[], ARRAY['public','engineering','business','cs']::text[], 'Shuhada-e-Army Public School University of Technology is a public university located in Nowshera, Khyber Pakhtunkhwa, Pakistan.'
WHERE NOT EXISTS (SELECT 1 FROM institutions WHERE lower(name)=lower('SAPSUT') AND lower(city)=lower('Nowshera'));

-- After running: re-run build-match-map.js → build-merit-data.js → build-gpa-data.js
-- → build-university-pages.js → build-seo-pages.js → generate-sitemap.js, then commit.
