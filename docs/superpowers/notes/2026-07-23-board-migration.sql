-- Support ticket board — support_tickets + support_ticket_messages (no auth, anon RLS).
-- NOTE: named support_* because public.tickets already exists (event ticket-types,
-- live data, FK'd from registrations/categories/events) — do NOT touch that table.
-- DELETE is intentionally omitted (no policy = denied under RLS). The app restricts
-- support_tickets UPDATE to the status/updated_at columns at the client layer
-- (Postgres RLS can't scope columns without a trigger, and no-auth means we accept
-- that convention here).
create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  status text not null default 'asked_ux'
    check (status in ('asked_ux','in_progress','waiting_po','answered','closed')),
  screen_ref_journey text,
  screen_ref_note text,
  created_by_name text not null,
  created_by_role text not null check (created_by_role in ('dev','ux','po')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.support_ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  author_name text not null,
  author_role text not null check (author_role in ('dev','ux','po')),
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists support_ticket_messages_ticket_id_idx on public.support_ticket_messages(ticket_id);
create index if not exists support_tickets_updated_at_idx on public.support_tickets(updated_at desc);

alter table public.support_tickets enable row level security;
alter table public.support_ticket_messages enable row level security;

-- support_tickets: anyone (anon) can read, create, and move status
create policy support_tickets_select on public.support_tickets for select to anon, authenticated using (true);
create policy support_tickets_insert on public.support_tickets for insert to anon, authenticated with check (true);
create policy support_tickets_update on public.support_tickets for update to anon, authenticated using (true) with check (true);

-- support_ticket_messages: append-only, readable by all
create policy support_messages_select on public.support_ticket_messages for select to anon, authenticated using (true);
create policy support_messages_insert on public.support_ticket_messages for insert to anon, authenticated with check (true);
