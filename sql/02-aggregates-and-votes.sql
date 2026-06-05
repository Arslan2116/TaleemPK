-- ════════════════════════════════════════════════════════════════════
-- TaleemPK — Performance: review aggregates + persisted votes
-- Apply AFTER 01-rls-lockdown.sql.
--
-- Fixes audit issues:
--   M-26 — Homepage was selecting ALL review rows just to compute averages
--   M-27 — markHelpful was client-only state (lost on reload)
--   M-28 — voteAnswer was client-only state (lost on reload)
-- ════════════════════════════════════════════════════════════════════

-- ── 1. Materialised view for per-institution review aggregates ─────
-- Refreshed on a trigger so the homepage just reads tiny rows.
drop materialized view if exists review_aggregates;
create materialized view review_aggregates as
  select
    institution_id,
    count(*)::int                                  as review_count,
    round(avg(rating)::numeric, 2)::float          as avg_rating
  from reviews
  group by institution_id;

create unique index if not exists idx_review_aggregates_inst
  on review_aggregates(institution_id);

-- RLS off on the view (it's aggregate-only, no PII)
alter materialized view review_aggregates owner to postgres;

-- ── 2. Helper to refresh the view concurrently ─────────────────────
create or replace function refresh_review_aggregates() returns trigger
  language plpgsql
  security definer
  set search_path = public, pg_temp
as $$
begin
  -- CONCURRENTLY requires the unique index above
  refresh materialized view concurrently review_aggregates;
  return null;
end;
$$;

-- ── 3. Triggers on reviews insert/update/delete ────────────────────
drop trigger if exists trg_reviews_refresh_agg on reviews;
create trigger trg_reviews_refresh_agg
  after insert or update or delete on reviews
  for each statement
  execute function refresh_review_aggregates();

-- ── 4. Initial populate ────────────────────────────────────────────
refresh materialized view review_aggregates;

-- ── 5. Persisted votes on answers (replaces client-only votes) ─────
-- Columns may already exist; ALTER is idempotent.
alter table answers add column if not exists votes int default 0;
alter table reviews add column if not exists helpful int default 0;

-- ── 6. RPC: vote on an answer (1 vote per user per answer) ─────────
create table if not exists answer_votes (
  user_id   uuid not null references auth.users(id) on delete cascade,
  answer_id bigint not null references answers(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, answer_id)
);
alter table answer_votes enable row level security;

drop policy if exists "own select av" on answer_votes;
create policy "own select av" on answer_votes for select
  to authenticated using (auth.uid() = user_id);

drop policy if exists "own insert av" on answer_votes;
create policy "own insert av" on answer_votes for insert
  to authenticated with check (auth.uid() = user_id);

drop policy if exists "own delete av" on answer_votes;
create policy "own delete av" on answer_votes for delete
  to authenticated using (auth.uid() = user_id);

create or replace function vote_answer(ans_id bigint) returns int
  language plpgsql
  security definer
  set search_path = public, pg_temp
as $$
declare
  current_votes int;
begin
  if auth.uid() is null then
    raise exception 'auth required';
  end if;
  insert into answer_votes(user_id, answer_id)
    values (auth.uid(), ans_id)
    on conflict do nothing;
  update answers set votes = (select count(*) from answer_votes where answer_id = ans_id)
    where id = ans_id
    returning votes into current_votes;
  return coalesce(current_votes, 0);
end;
$$;
revoke all on function vote_answer(bigint) from public;
grant execute on function vote_answer(bigint) to authenticated;

-- ── 7. Helpful votes on reviews ────────────────────────────────────
create table if not exists review_helpfuls (
  user_id   uuid not null references auth.users(id) on delete cascade,
  review_id bigint not null references reviews(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, review_id)
);
alter table review_helpfuls enable row level security;

drop policy if exists "own select rh" on review_helpfuls;
create policy "own select rh" on review_helpfuls for select
  to authenticated using (auth.uid() = user_id);

drop policy if exists "own insert rh" on review_helpfuls;
create policy "own insert rh" on review_helpfuls for insert
  to authenticated with check (auth.uid() = user_id);

drop policy if exists "own delete rh" on review_helpfuls;
create policy "own delete rh" on review_helpfuls for delete
  to authenticated using (auth.uid() = user_id);

create or replace function mark_helpful(rv_id bigint) returns int
  language plpgsql
  security definer
  set search_path = public, pg_temp
as $$
declare
  current_helpful int;
begin
  if auth.uid() is null then
    raise exception 'auth required';
  end if;
  insert into review_helpfuls(user_id, review_id)
    values (auth.uid(), rv_id)
    on conflict do nothing;
  update reviews set helpful = (select count(*) from review_helpfuls where review_id = rv_id)
    where id = rv_id
    returning helpful into current_helpful;
  return coalesce(current_helpful, 0);
end;
$$;
revoke all on function mark_helpful(bigint) from public;
grant execute on function mark_helpful(bigint) to authenticated;

-- ── 8. Public read on aggregates view + vote-count columns ─────────
-- The materialised view inherits from base tables; ensure public read.
grant select on review_aggregates to anon, authenticated;

-- ── 9. Verify ──────────────────────────────────────────────────────
-- select * from review_aggregates limit 5;
-- select vote_answer(1);     -- should return new vote count
-- select mark_helpful(1);    -- should return new helpful count
