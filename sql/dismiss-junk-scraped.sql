-- Bulk-dismiss junk scraped items from the review queue.
-- Dismisses: nav-links & generic labels (Admission Office, Online Admissions,
--   Download Prospectus, Click here, Read more…), internal academic notices
--   (summer vacation, academic calendar, exam/date-sheet, roll slips), and very
--   short generic titles.
-- PRESERVES anything that looks like a real announcement (scholarship, merit list,
--   fee structure, admission-open, entry test, deadline, result announced).
-- Safe to re-run any time — it only touches status='pending'. (~91 items on first run.)

UPDATE uni_updates SET status = 'dismissed'
WHERE status = 'pending'
  -- keep real announcements no matter what
  AND title !~* '(scholarship|merit list|fee structure|admission.*open|admissions? (fall|spring|20[0-9]2)|entry test|last date|deadline|apply by|test date|test.*announc|result.*announc)'
  AND (
       char_length(trim(title)) < 12
    OR title ~* '^(read more|click here|apply (now|online|here)|view all|learn more|download|prospectus|online admission|admission (office|policy|criteria|contact|guide|process)|how to apply|why (choose|apply)|virtual tour|home|about|contact us|login|sign ?in|feedback|gallery|sitemap|privacy|faq|register)'
    OR title ~* '(summer vacation|winter vacation|academic calendar|teaching faculty|faculty member|semester exam|examination notification|date sheet|time table|syllabus|convocation|seminar|workshop|webinar|guest lecture|sports|society|club|roll slip|roll number slip|visiting faculty|list of graduates)'
  );

-- After running, check how many are left:
--   SELECT count(*) FROM uni_updates WHERE status = 'pending';
