-- Stricter cleanup: also drops jobs/recruitment, internal exam notices, stale-year
-- and dept/committee items (which slipped past the first pass, some carrying
-- 'merit list'/'result' words). Run in Supabase SQL Editor. Safe: only touches non-dismissed.
UPDATE uni_updates SET status='dismissed' WHERE status <> 'dismissed' AND id IN (11,81,82,148,101,109,145,162,169,189,203,194,231,274,275,281,288,297,304,315,323,324,328,337,338,350,378,379,403,410,411,441,494,510,523,577,578,597,598,600,601,602,603,631,638,710);
