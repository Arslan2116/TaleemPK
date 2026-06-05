-- ════════════════════════════════════════════════════════════════════
-- TaleemPK — Row Level Security Lockdown
-- Run this in Supabase SQL Editor BEFORE going to scale.
-- Fixes audit issues C-2 (anon writes) and C-3 (admin email impersonation).
-- ════════════════════════════════════════════════════════════════════

-- ─── 1. Admin allow-list table (replaces email-string comparison) ────
create table if not exists admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

-- Seed the initial admin (replace email if needed)
insert into admin_users (user_id)
  select id from auth.users where email = 'agondal121@gmail.com'
  on conflict do nothing;

-- Helper: server-side admin check (stable, indexable)
create or replace function is_admin() returns boolean
  language sql stable security definer
  set search_path = public, pg_temp
as $$
  select exists(select 1 from admin_users where user_id = auth.uid());
$$;
revoke all on function is_admin() from public;
grant execute on function is_admin() to authenticated, anon;

-- ─── 2. Enable RLS on every public-facing table ──────────────────────
alter table if exists institutions    enable row level security;
alter table if exists blog_posts      enable row level security;
alter table if exists notes           enable row level security;
alter table if exists results         enable row level security;
alter table if exists scholarships    enable row level security;
alter table if exists reviews         enable row level security;
alter table if exists questions       enable row level security;
alter table if exists answers         enable row level security;
alter table if exists fee_details     enable row level security;
alter table if exists user_shortlists enable row level security;

-- ─── 3. Public READ policies ────────────────────────────────────────
drop policy if exists "public read inst"   on institutions;
create policy "public read inst"   on institutions  for select using (true);

drop policy if exists "public read blog"   on blog_posts;
create policy "public read blog"   on blog_posts    for select using (published = true);

drop policy if exists "public read schol"  on scholarships;
create policy "public read schol"  on scholarships  for select using (true);

drop policy if exists "public read fee"    on fee_details;
create policy "public read fee"    on fee_details   for select using (true);

drop policy if exists "public read rev"    on reviews;
create policy "public read rev"    on reviews       for select using (true);

drop policy if exists "public read q"      on questions;
create policy "public read q"      on questions     for select using (true);

drop policy if exists "public read a"      on answers;
create policy "public read a"      on answers       for select using (true);

drop policy if exists "public read notes"  on notes;
create policy "public read notes"  on notes         for select using (true);

drop policy if exists "public read res"    on results;
create policy "public read res"    on results       for select using (true);

-- ─── 4. Admin-only WRITE policies on content tables ─────────────────
-- institutions
drop policy if exists "admin write inst" on institutions;
create policy "admin write inst" on institutions for all
  to authenticated using (is_admin()) with check (is_admin());

-- blog_posts
drop policy if exists "admin write blog" on blog_posts;
create policy "admin write blog" on blog_posts for all
  to authenticated using (is_admin()) with check (is_admin());

-- notes
drop policy if exists "admin write notes" on notes;
create policy "admin write notes" on notes for all
  to authenticated using (is_admin()) with check (is_admin());

-- results
drop policy if exists "admin write res" on results;
create policy "admin write res" on results for all
  to authenticated using (is_admin()) with check (is_admin());

-- scholarships
drop policy if exists "admin write schol" on scholarships;
create policy "admin write schol" on scholarships for all
  to authenticated using (is_admin()) with check (is_admin());

-- fee_details
drop policy if exists "admin write fee" on fee_details;
create policy "admin write fee" on fee_details for all
  to authenticated using (is_admin()) with check (is_admin());

-- ─── 5. User-generated content (reviews/Q&A) ────────────────────────
-- Authenticated users can INSERT; admins can DELETE; nobody else can mutate

drop policy if exists "auth insert rev" on reviews;
create policy "auth insert rev" on reviews for insert
  to authenticated with check (auth.uid() is not null);

drop policy if exists "admin del rev" on reviews;
create policy "admin del rev" on reviews for delete
  to authenticated using (is_admin());

drop policy if exists "auth insert q" on questions;
create policy "auth insert q" on questions for insert
  to authenticated with check (auth.uid() is not null);

drop policy if exists "admin del q" on questions;
create policy "admin del q" on questions for delete
  to authenticated using (is_admin());

drop policy if exists "auth insert a" on answers;
create policy "auth insert a" on answers for insert
  to authenticated with check (auth.uid() is not null);

drop policy if exists "admin del a" on answers;
create policy "admin del a" on answers for delete
  to authenticated using (is_admin());

-- ─── 6. user_shortlists: each user owns their rows ──────────────────
drop policy if exists "own select sl" on user_shortlists;
create policy "own select sl" on user_shortlists for select
  to authenticated using (auth.uid() = user_id);

drop policy if exists "own insert sl" on user_shortlists;
create policy "own insert sl" on user_shortlists for insert
  to authenticated with check (auth.uid() = user_id);

drop policy if exists "own delete sl" on user_shortlists;
create policy "own delete sl" on user_shortlists for delete
  to authenticated using (auth.uid() = user_id);

-- ─── 7. Content-length sanity (abuse mitigation) ────────────────────
-- Add a check constraint that limits review/question/answer body size
alter table reviews   drop constraint if exists reviews_body_len;
alter table reviews   add  constraint reviews_body_len   check (char_length(body) between 5 and 2000);

alter table questions drop constraint if exists questions_q_len;
alter table questions add  constraint questions_q_len   check (char_length(question) between 5 and 500);

alter table answers   drop constraint if exists answers_body_len;
alter table answers   add  constraint answers_body_len  check (char_length(body) between 2 and 2000);

-- ─── 8. Performance indexes ─────────────────────────────────────────
create index if not exists idx_reviews_inst   on reviews(institution_id);
create index if not exists idx_questions_inst on questions(institution_id);
create index if not exists idx_answers_qid    on answers(question_id);
create index if not exists idx_shortlists_user on user_shortlists(user_id);
create index if not exists idx_blog_published on blog_posts(published, created_at desc);
create index if not exists idx_inst_rank      on institutions(rank nulls last, id);

-- ─── 9. Verify (run this AFTER applying) ────────────────────────────
-- Expected: every table here has rowsecurity=true, and policies exist.
-- select tablename, rowsecurity from pg_tables where schemaname='public' order by tablename;
-- select tablename, policyname, cmd from pg_policies where schemaname='public' order by tablename, policyname;

-- ─── 10. Smoke test as anon (run from shell, NOT in SQL editor) ─────
-- curl -X POST 'https://vpioffkkzwbfnmpxpwgc.supabase.co/rest/v1/institutions' \
--   -H "apikey: <ANON_KEY>" -H "Authorization: Bearer <ANON_KEY>" \
--   -H "Content-Type: application/json" -d '{"name":"hack","full_name":"hack"}'
-- EXPECT: HTTP 401/403 "new row violates row-level security policy"
