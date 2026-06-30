-- Adds admission deadline fields to institutions table
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS admission_deadline DATE;
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS admission_deadline_note TEXT;
