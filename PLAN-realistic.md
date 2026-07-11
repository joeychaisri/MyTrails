# MyTrails — Production-Realism Roadmap (handoff doc)

> **For the session picking this up (cron or human-started):**
> 1. `cd ~/MyTrails && git status && git log --oneline -5` — confirm branch `handoff/storybook-flows`, clean tree.
> 2. Read the **Status board** below — resume the first unchecked phase.
> 3. Phase 0 has a detailed plan: `docs/superpowers/plans/2026-07-11-phase0-production-serving.md`.
>    For later phases: WRITE a detailed plan first (superpowers:writing-plans, save to
>    `docs/superpowers/plans/`), then execute it. Do not wing multi-task phases.
> 4. Update checkboxes here + commit after every completed task. Deploy + verify in a
>    REAL browser (playwright MCP, Chrome at /opt/google/chrome) before checking a box.
> 5. When the whole roadmap is done: summarize in the final commit, then `CronList` and
>    delete the recurring "mytrails-realism-continue" job.
> 6. **Rules that override everything:** Joey is the UX owner — follow the existing design
>    system strictly (see `CLAUDE.md`, Storybook → Design System). Never invent
>    colors/spacing/components. Business-logic changes beyond this plan → ask first.
>    All secrets go in `~/.env.secrets`, never in the repo.

**Goal:** evolve the MyTrails prototype into a production-like app: real serving, a real
Runner registration flow (Order **Direction 2** — decided by Joey), a mock-but-Stripe-shaped
payment layer, and a real Supabase backend — usable for a real pilot event (payments
excluded from "real" scope).

**Decisions already made by Joey (do not re-litigate):**
- Registration UX = **Order Direction 2** (`src/views/OrderTwoView.tsx` is the reference; Direction 3 is dead).
- Backend = **Supabase**: pause project `ads-dashboard` (`fciosfgbrzgbemyitvik` — verified empty: 3 tables, 0 rows), create new project `mytrails` in the freed slot. Org has PAT in `~/.env.secrets`; MCP `mcp__supabase__*` is connected.
- Payment = **Stripe-shaped mock** (Joey has no Stripe account yet and doesn't want to sign up).
  Build a `PaymentProvider` interface so real Stripe test-mode is a drop-in later.
- Work happens on branch `handoff/storybook-flows` (pushed to origin). Merge to main only when Joey says so.

## Status board

- [x] **Phase 0 — Production serving + data realism** — COMPLETE 2026-07-11
  - [x] 0.1 Serve `dist/` static via Caddy (replace Vite dev service) — done 2026-07-11, verified live + 0 console errors
  - [x] 0.2 Time-aware event phases (`src/lib/eventPhase.ts`, 10 tests) — wired into PublicEventPage panel + ticket rows. NOTE for Joey: landing-page cards intentionally untouched (visual design of a closed-event card is a UX call — ask Joey in Phase 1)
  - [x] 0.3 Rich seed data — 17 events / 5 organizers, 16 local cover photos (LoremFlickr, public/covers/), sale windows on new events, STORAGE_KEY→v8. Verified live: covers render, Early Bird "Sales ended" vs Regular open on ae6, finished state on ae5, 0 console errors
- [ ] **Phase 1 — Runner registration (Direction 2) on the mock store**
- [ ] **Phase 2 — Supabase backend**
- [ ] **Phase 3 — Ops realism**

## Phase specs (write detailed plan per phase before executing)

### Phase 1 — Runner registration (Direction 2), mock store
**Discovery from Phase 0 (important):** the runner landing does NOT read the store — it has
its own hardcoded list in `src/views/runner/runnerEvents.ts` (6 curated events, Unsplash
images), with a comment marking it as the intended swap point. Phase 1 task #1 must rewire
`MOCK_EVENTS` → store-backed adapter (map `Event` → `RunnerEvent`, image from `coverImage`)
so landing → event page → checkout all use the same data. NOTE: this changes which events
the landing displays — confirm with Joey before doing it (UX-content change).

Everything runs on `EventsContext` (localStorage) — no backend yet. Follow OrderTwoView's
UX direction; reuse existing policies in `src/lib/` (refundPolicy, distanceChangePolicy).

Flow: event page → pick category → ticket (window enforced by eventPhase) → runner form →
payment → confirmation (registration code `MT-XXXXXX`) → participant appears in the
organizer's Participants section live.

Runner form fields (standard Thai trail-event set): full name (EN + TH optional), DOB
(min age per category — block under 18 for ≥50K, warn otherwise), gender, nationality,
ID/passport no., phone, email (confirm field), emergency contact name+phone, blood group,
medical conditions (free text, optional), shirt size, **PDPA consent checkbox (required,
link to a real consent text page)**.

Payment layer — `src/lib/payments/`:
- `types.ts`: `PaymentProvider { createIntent(order): PaymentIntent; confirm(intentId, input): PaymentResult }`,
  statuses `pending | processing | succeeded | failed | expired | refunded`.
- `stripeMock.ts`: card form styled like Stripe Checkout (design-system tokens only).
  Test-card semantics: `4242 4242 4242 4242` → succeeded; `4000 0000 0000 0002` → declined;
  `4000 0000 0000 9995` → insufficient funds; anything else → validation error. Fake 2s processing delay.
- `promptpayMock.ts`: QR image + "upload slip" (file → base64 in store) → order state
  `awaiting_verification` → organizer Slip Queue approves/rejects.
- Real Stripe later = new `stripeReal.ts` implementing the same interface (needs Joey to
  create a free Stripe account for test keys — flagged TODO, not now).

Cases that MUST work (test each): sold-out category blocks checkout; capacity reserved on
order create with 15-min expiry (expired orders release seats); duplicate registration
(same email + same event) warns; decline → retry keeps form data; refund flow per
refundPolicy; distance change per distanceChangePolicy; registration lookup page by
email + registration code (guest model — no runner login in this phase).

Organizer additions: Slip verification queue (in Orders section), participant export CSV,
refunds honoring policy. Storybook: new stories under `Runner/3 · Register & Pay` +
organizer slip-queue story; move Order Flows out of Experiments; delete Direction 3
(`OrderThreeView.tsx`) and its story.

### Phase 2 — Supabase backend
1. MCP: `pause_project(fciosfgbrzgbemyitvik)` → `create_project(name: "mytrails", region: ap-southeast-1)` (confirm_cost = $0 free tier).
2. Schema via `apply_migration` (one migration per table group): organizers, tiers,
   platform_settings, events (+status enum, publish fields, rejection_reason,
   commission_override), categories, tickets (+sale windows), orders, participants,
   payments, payouts. `event_status_history` for the approval audit trail.
3. RLS: public reads `status = 'live'` events only; organizer full CRUD on own rows
   (auth.uid() → organizers.user_id); admin role via JWT claim `role = 'admin'`; participants
   readable only by owning organizer/admin.
4. Auth: Supabase email+password. Organizer signup creates `organizers` row (trigger).
   Admin = seeded user with claim. Wire `AuthContext` to Supabase session (keep the same
   context API so views don't change). Password reset flow.
5. Storage buckets: `covers` (public read), `slips` (private, signed URLs).
6. Data adapters: swap internals of `hooks/data/*` + `EventsContext` mutations to
   supabase-js (`@supabase/supabase-js`), keeping every exported signature identical —
   views and stories must not change. Seed script `scripts/seed.ts` ports the Phase-0 mock
   data. Anon key + URL via `.env` (`VITE_SUPABASE_URL/ANON_KEY` — anon key is safe client-side;
   never commit service_role).
7. Storybook keeps running on mocks: add a `VITE_DATA_SOURCE=mock|supabase` switch defaulting
   Storybook to mock so the catalog stays deterministic.
8. Verify end-to-end in real browser: signup → create event → admin approve → live on `/` →
   register → participant visible. Then `npm run build` + redeploy.

### Phase 3 — Ops realism
- In-app notification center + "email outbox" page (mock emails rendered for: submission
  received, approved, rejected, registration confirmed, payout paid). Seam ready for Resend.
- Payouts driven by real time (event end date → held → payable) via a small
  `scripts/payout-tick.ts` run by system cron daily.
- Nightly `pg_dump` backup of the mytrails project to `~/backups/mytrails/` (7 kept), system cron.
- Add mytrails prod URL to vps-stats health checks if not already green.
- Polish pass: loading skeletons on all data reads, mobile audit of the registration flow,
  error boundary page (styled per design system).

## Verification bar (every phase)
`npm run typecheck` + `npm run test` green → `npm run build` + `npm run storybook:deploy` →
open the real site AND /journey/ via playwright MCP → `browser_console_messages(level: error)`
must be 0 → commit + push → tick the box here.
