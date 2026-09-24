-- Remove junk items from the live homepage ticker (site_announcements).
-- These are nav-links, generic labels, and one badly stale (2017) item.
-- Run in Supabase SQL Editor. (You can also do this from Admin → Ticker tab.)

DELETE FROM site_announcements WHERE id IN (
  1,   -- GCWUF — "View All Notification"          (nav link, no content)
  9,   -- HU — "Admissions & Aids"                  (generic nav label)
  12,  -- Dow University — "Financial Aid / Scholarships" (generic nav label)
  15,  -- UAC — "Click here to download ... Advertisement" (nav link)
  17   -- JUW — "Admission 2017 ..."                 (nine years stale)
);

-- Optional: also hide the two generic "Admission Schedule" items (SAPSUT / PAAAS)
-- without deleting them — uncomment if you want them off the ticker:
-- UPDATE site_announcements SET active = false WHERE id IN (2, 8);
