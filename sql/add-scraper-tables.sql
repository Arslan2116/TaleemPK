-- Scraper infrastructure: staging queue + live announcements
-- Run in Supabase SQL Editor.

-- 1. Staging queue: scraper inserts here (service key), admin reviews in admin.html
CREATE TABLE IF NOT EXISTS uni_updates (
  id         BIGSERIAL PRIMARY KEY,
  uni_id     INTEGER REFERENCES institutions(id) ON DELETE CASCADE,
  uni_name   TEXT,
  kind       TEXT NOT NULL DEFAULT 'announcement',  -- announcement | deadline | fee | program
  title      TEXT NOT NULL,
  url        TEXT,
  found_at   TIMESTAMPTZ DEFAULT now(),
  status     TEXT NOT NULL DEFAULT 'pending',       -- pending | approved | dismissed
  content_hash TEXT UNIQUE                          -- dedupe across runs
);

-- 2. Live announcements: homepage ticker hydrates from this (approved items land here)
CREATE TABLE IF NOT EXISTS site_announcements (
  id         BIGSERIAL PRIMARY KEY,
  icon       TEXT DEFAULT '📢',
  text       TEXT NOT NULL,
  url        TEXT,
  active     BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE uni_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_announcements ENABLE ROW LEVEL SECURITY;

-- Admin (authenticated) can read/manage the review queue
CREATE POLICY uni_updates_auth_select ON uni_updates FOR SELECT TO authenticated USING (true);
CREATE POLICY uni_updates_auth_update ON uni_updates FOR UPDATE TO authenticated USING (true);
CREATE POLICY uni_updates_auth_delete ON uni_updates FOR DELETE TO authenticated USING (true);
-- (INSERT happens via service-role key in GitHub Actions — bypasses RLS)

-- Ticker is public; only admin can write
CREATE POLICY site_annc_public_read ON site_announcements FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY site_annc_auth_write  ON site_announcements FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY site_annc_auth_update ON site_announcements FOR UPDATE TO authenticated USING (true);
CREATE POLICY site_annc_auth_delete ON site_announcements FOR DELETE TO authenticated USING (true);
