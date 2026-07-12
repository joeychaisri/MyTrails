# Phase 2: Supabase Backend — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development or superpowers:executing-plans. Checkbox (`- [ ]`) tracking.

**Goal:** Real Postgres + Auth + Storage behind the existing data seam, switchable via `VITE_DATA_SOURCE=mock|supabase` (default **mock** until the supabase path is browser-verified end-to-end; Storybook stays on mock forever).

**Architecture:** New Supabase project `mytrails` (slot freed by pausing the empty ads-dashboard project). Schema mirrors the store's domain 1:1. A `dataSource` module gates whether `EventsProvider`/`AuthContext` hydrate from localStorage seeds (mock) or supabase-js (supabase). The store's public API (`useEventsStore()` shape) stays byte-identical so no view changes.

**Safety rule:** the live site keeps working on mock at every commit. The default flips to supabase only in the final task, after real-browser e2e passes.

## Tasks

- [x] **T1 Provision (MCP, orchestrator-run):** pause `fciosfgbrzgbemyitvik`; create project `mytrails` (org jlzvynuxtpnujwgglxta, ap-southeast-1, free/$0 via confirm_cost); record project ref/url/anon key → `~/MyTrails/.env.local` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`; gitignored) and password/secrets → `~/.env.secrets` (never in repo).
- [x] **T2 Schema migrations (MCP apply_migration):** tables (all `id text pk` to keep seed ids): tiers, platform_settings(singleton row), organizers(user_id uuid null ref auth.users), events(status enum text + publish fields + rejection_reason + commission_override + cover_image), categories(event_id fk), tickets(category_id fk, sales_start/sales_end), registrations(event/category/ticket fks, status, runner jsonb, code unique, slip_path), event_status_history(event_id, from, to, at, by). Indexes on fks + events.status. updated_at triggers.
- [x] **T3 RLS + roles:** enable RLS everywhere. anon: select events(status='live') + their categories/tickets; insert registrations (status='pending_payment' only) + select own by code+email (via rpc `lookup_registration(email,code)` security definer to avoid leaking). authenticated organizer: CRUD own events tree (organizers.user_id = auth.uid()), read own registrations; admin (jwt claim role=admin via app_metadata): everything. platform_settings/tiers: admin write, all read. Write as one migration; verify with `get_advisors(security)`.
- [ ] **T4 Storage:** buckets `covers` (public) + `slips` (private). Policies: organizer/admin write covers; anon upload slips to own registration path; organizer/admin read slips (signed URLs).
- [ ] **T5 Seed script:** `scripts/seed-supabase.mjs` (service_role key from env, run once by orchestrator with `node`): ports mockData+adminMockData seeds (17 events tree) + tiers + settings + admin user (admin@mytrails.com / password in ~/.env.secrets, app_metadata.role=admin) + demo organizer user somchai@trailevents.co.th → org1. Covers uploaded from public/covers/*.
- [ ] **T6 Client + adapters (subagent):** `npm i @supabase/supabase-js`; `src/lib/dataSource.ts` (`export const dataSource = import.meta.env.VITE_DATA_SOURCE === "supabase" ? "supabase" : "mock"`); `src/lib/supabaseClient.ts`. EventsContext: in supabase mode hydrate state from selects on mount (+ background refetch after mutations); every mutation calls the corresponding table update/rpc then updates local state optimistically (same reducer paths as mock). Registrations flow uses rpc `create_registration` (capacity+window+duplicate checks server-side, returns same union). AuthContext: supabase auth session ↔ existing {role, organizerId} API; login page unchanged UI. Storybook/vitest: force mock (set VITE_DATA_SOURCE in .storybook/main.ts env + vitest config env).
- [ ] **T7 E2E verify (orchestrator, real browser, `VITE_DATA_SOURCE=supabase npm run build`):** signup organizer → create event → admin approves (admin login) → live on landing → register with card mock → participant visible; slip path; lookup rpc. 0 console errors. Then flip default in `.env.local`(prod build) — mock remains default in code.
- [ ] **T8 Wrap:** CLAUDE.md (backend section), PLAN-realistic tick, push.

## Notes / risks for the morning summary
- Free-tier email confirmations: disable "confirm email" in auth settings via management API if possible, else use admin-created users only for demo.
- Egress/API keys: anon key in client bundle is by-design safe (RLS enforced).
