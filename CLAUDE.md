# MyTrails — CLAUDE.md

Trail running event platform for Thailand. Two distinct sides: **Organizer** (event management portal) and **Runner** (public-facing discovery & registration).

## Working Style — IMPORTANT (read first)

**Joey is the UX/designer for this project.** Treat this codebase like a **Figma prototype**, not a production app: data is **mock** (seeded into an in-browser store — see "Data & the shared store"), existing to demonstrate flows, layout, and look-and-feel. There's no backend; "payment/payout" are simulated. Don't worry about real backend correctness or data integrity unless explicitly asked — the priority is **UX, layout, and design fidelity**.

### Design System discipline (take this VERY seriously)

- Whenever Joey asks for **any** new design or UI change, follow the **existing Design System strictly** — colors, spacing, typography, `--mt-*` tokens, shadcn primitives, and existing component patterns. Match what already exists; **do not improvise, invent new styles, or introduce new colors/values.**
- **If you are unsure about ANYTHING** — a color, a token, spacing, which component to reuse, or any Design System decision — **STOP and ask Joey BEFORE implementing.** Never guess. Asking first is always preferred over building something off-system.

## Commands

```bash
npm run dev      # local dev server → https://localhost:8080 (NOT proxied to the domain anymore)
npm run build    # production build → dist/  ← THIS is what mytrails.theingress.co serves
# deploy = VITE_DATA_SOURCE=supabase npm run build  ← LIVE SITE RUNS SUPABASE since 2026-07-12 (plain build = mock mode)
npm run test     # vitest unit tests
npm run typecheck # type check only (tsc -p tsconfig.app.json --noEmit — plain `npx tsc --noEmit` checks NOTHING because root tsconfig has files:[])
npm run storybook        # dev hand-off catalog (Storybook) → http://localhost:6006
npm run storybook:deploy # static build → storybook-dist/ for the live catalog at /journey/
```

Caddy serves `mytrails.theingress.co` from `dist/` (static SPA, `try_files → /index.html`).

⚠️ **`npm run build` overwrites `dist/` in place — that's the live production site, not a scratch artifact.** Never run a plain build just to eyeball a change in a browser (it also silently drops to mock mode, wiping the "supabase" data source the live site needs). For local verification, build to a throwaway folder instead: `npx vite build --outDir /tmp/some-dir` (add `VITE_DATA_SOURCE=supabase` only if you specifically need to test against real data), serve that folder separately, and only run the real `VITE_DATA_SOURCE=supabase npm run build` into `dist/` when you actually intend to deploy.

## Developer Hand-off Catalog (Storybook)

`mytrails.theingress.co/journey` serves a **Storybook** catalog (migrated from Ladle):
every user journey as a sidebar group of isolated, pinned-state screens — the hand-off
artifact for developers and the PO. The structure is a **12-journey map** in 4 acts
(Runner 1-2 [3 reserved for Register & Pay], Organizer 4-8, Admin 9-11, plus
Design System / System / Experiments) — documented on the catalog's own **Journey Map**
docs page (`src/stories/JourneyMap.mdx`). The **Design System** group
(`src/stories/design-system/`) documents the real tokens from `src/index.css` (MDX
pages: Colors / Typography / Surfaces) and the core primitives as CSF3 stories with
`tags: ['autodocs']` + Controls — extend it there, never invent values in stories. Stories live in `src/stories/*.stories.tsx`;
global provider decorator (QueryClient → Tooltip → Auth → **Events** → Language →
MemoryRouter) + sidebar order in `.storybook/preview.tsx` (`decorators` +
`options.storySort` — update BOTH when adding a journey); framework config in
`.storybook/main.ts` (`@storybook/react-vite`, addons: a11y, docs, mcp — **no**
vitest/chromatic addons: the browser-test runner needs Chromium system libs the VPS
doesn't have).

- It is a **separate static build**, not an app route. Caddy serves `storybook-dist/` under
  `/journey/` (`handle_path /journey/*` in the Caddyfile, plus `redir /journey → /journey/`
  so the no-trailing-slash URL doesn't fall through to the SPA and 404); normal app URLs are untouched.
- **After editing stories, rebuild**: `npm run storybook:deploy` (regenerates `storybook-dist/`, gitignored). Caddy serves the `.html`/`.json` entry files with `Cache-Control: no-cache` (they are NOT content-hashed) so a redeploy shows up on refresh — else browsers cache a stale `index.json` and the sidebar/new pages won't appear.
- Screens are pinned via **optional `initial*` props** on stateful views (e.g. RunnerLandingPage
  `initialView`, DashboardView `initialTab`, EventWizard `initialStep`/`initialScenario`); every
  such prop defaults to current behavior, so the app (which renders prop-less) is unchanged.
  Pages that read the URL (EventManagerHub, AdminEventReview, PublicEventPage, wizard edit
  mode) are pinned with `<Routes location="...">` instead — never nest a second Router.
- Stories render-tested in jsdom via portable stories (`src/test/storybook-smoke.test.tsx`);
  portal-only stories (bare dialogs) must assert on `document.body`, not the container.
- **Build Status page** (`src/stories/BuildStatus.mdx`, first in the sidebar) is the
  dev-facing sign-off board: per-journey 🟢 Locked / 🟡 Tentative / 🔴 Draft + last-updated.
  Joey owns the status values — update this page whenever a UI gets confirmed/changed.
- MDX docs pages: use **HTML `<table>`**, not GFM markdown tables (Storybook MDX won't render pipe tables).

## Route Structure

| Path | Side | Component |
|------|------|-----------|
| `/` | Runner | `RunnerLandingPage` — platform home, browse events |
| `/events/pong-yaeng-trail-2026` | Runner | `PongYaengTrailPage` — PYT 2026 event landing |
| `/events/:id/preview` | Runner | `PublicEventPage` — generic event preview |
| `/events/:id/register` | Runner | `RegisterFlow` — Direction-2 registration (form → mock payment → `MT-XXXXXX` code) |
| `/registration/lookup` | Runner | `LookupPage` — guest lookup by email + code |
| `/pdpa` | Runner | `PdpaPage` — PDPA consent notice (TH+EN) |
| `/organizer/login` | Organizer | `AuthView` |
| `/organizer/dashboard` | Organizer | `DashboardView` |
| `/organizer/events/new` | Organizer | `EventWizard` |
| `/organizer/events/:id/edit` | Organizer | `EventWizard` |
| `/organizer/events/:id/:section` | Organizer | `EventManagerHub` |
| `/organizer/admin` | Admin | `AdminDashboard` (Overview / Approvals / Financials / Users / Settings) |
| `/organizer/admin/review/:id` | Admin | `AdminEventReview` — full-page event review before approve / request-changes |
| `/board`, `/board/:id` | Internal | `BoardListView` / `BoardThreadView` — dev↔UX support board (see below) |
| `/login`, `/dashboard` etc. | — | Legacy redirects → `/organizer/*` |

## Support board (`/board`) — internal dev↔UX tool ⭐

Public, **no auth**, English copy — devs raise UI/UX questions as threads and Joey
answers. Replaces scattered Discord chat; linked from the Storybook Build Status page.
Unlike the rest of the app it talks to **real Supabase in every mode** (own tables,
outside `EventsContext`): `support_tickets` + `support_ticket_messages`, anon
read/insert with status-only update. Code in `src/lib/board/` (types + `STATUS_META`,
localStorage identity, `boardApi`), `src/components/board/`, `src/views/board/`.
Statuses: asked_ux → in_progress → waiting_po → answered → closed. There is no edit or
delete — removing a message means going into the DB.

**LINE notifier** — `board-notify.timer` (systemd, every 15 min) runs
`scripts/board-notify.ts` under `node --experimental-strip-types`: it polls
`support_ticket_messages` for rows newer than the checkpoint in
`data/board-notify-state.json` (gitignored), pushes one grouped digest to Joey's LINE,
then advances the checkpoint — **in that order**, so a failed push is retried instead
of lost. Creating a topic also inserts its first message, so polling that one table
catches both new topics and replies. Formatting lives in `src/lib/board/notify.ts`
(pure, unit-tested); the script is only I/O. Creds: `MYTRAILS_SUPABASE_URL` +
`MYTRAILS_SUPABASE_ANON_KEY` from `~/.env.secrets`, LINE token from `~/.hermes/.env`.
Missing state file = first run: it sets the checkpoint to *now* and sends nothing.
Design: `docs/superpowers/specs/2026-08-11-board-line-notify-design.md`.

Gotcha: `notify.ts` and the script import with explicit **`.ts` extensions** and
`import type` — Node's type stripping resolves like Node, not like a bundler. Don't
"tidy" those extensions away or the timer breaks (tests and `tsc` keep passing).

## Src Layout

```
src/
├── hooks/data/             # data-layer seam: useEvents/useEvent/useAdminData return {data,isLoading,error} — now READ from the EventsProvider store (was static mock)
├── contexts/
│   ├── AuthContext.tsx     # role + organizerId (mock login)
│   └── EventsContext.tsx   # ⭐ shared writable store (events/organizers/settings) + eventFinance/eventCommissionAmount + all flow mutations
├── views/
│   ├── organizer/
│   │   AuthView.tsx
│   │   DashboardView.tsx
│   │   EventWizard.tsx      # 5 steps: Event Info → Race Config → Tickets → Publishing → Review & Commission
│   │   EventManagerHub.tsx   # thin orchestrator (~300 lines); sections in event-manager/
│   │   PublicEventPage.tsx
│   │   event-manager/        # OrdersSection, ParticipantsSection, BibSection, PromotionsSection, Overview*Section, orderConstants
│   ├── admin/               # AdminOverview, AdminEventApprovals, AdminEventReview, AdminFinancials, AdminUserManagement, AdminSettings
│   ├── OrderTwoView.tsx      # Direction-2 order-flow reference (ADOPTED — RegisterFlow was built from it; Direction 3 deleted)
│   └── runner/
│       ├── RunnerLandingPage.tsx     # platform home — reads the store via useRunnerEvents()
│       ├── RunnerComponents.tsx      # Button, Logo, I, IconDisc, ProgressBar
│       ├── runnerEvents.ts           # RunnerEvent adapter: store live events → landing/calendar cards
│       ├── register/                 # RegisterFlow + steps, LookupPage, PdpaPage (Journey 3)
│       └── pyt-landing/
│           ├── PongYaengTrailPage.tsx
│           ├── hero-styles.css
│           ├── landing-styles.css
│           └── design-system/colors_and_type.css
├── components/ui/          # shadcn/ui primitives
├── data/mockData.ts        # Event/Category/Ticket + Registration/RunnerInfo types + seed events (org1) + makeCategory factory
├── data/adminMockData.ts   # Tier/AdminOrganizer/PlatformSettings + seed organizers & other-org events
├── lib/                    # refundPolicy, distanceChangePolicy, eventPhase (all unit-tested)
├── lib/payments/           # PaymentProvider seam: stripeMock (test-card semantics: 4242… ok, …0002 declined, …9995 insufficient), promptpayMock (QR payload + slip). Real Stripe later = stripeReal.ts implementing the same interface
└── index.css               # Tailwind + --mt-* design token aliases
```

## Styling

- **Organizer side** — Tailwind CSS + shadcn/ui
- **Runner side** — inline styles + custom CSS (`--mt-*` tokens) to match the Claude Design prototype pixel-for-pixel. Tokens are aliased in `src/index.css`.
- CSS variables (`--mt-brand`, `--mt-fg`, etc.) mirror the existing shadcn `--primary`, `--foreground` etc. — same values, different names.

## i18n (TH/EN)

Runner side has a lightweight bilingual layer (mockup-grade, no external lib): `src/views/runner/i18n.tsx` — `LanguageProvider` + `useLang()` → `{ lang, locale, setLang, t }`, backed by `en`/`th` dictionaries. The "EN | ไทย" toggle lives in the landing TopNav; choice persists to localStorage. Any component calling `useLang()` must render inside `<LanguageProvider>` (the landing page wraps its tree).

**Best practice when adding/editing runner UI:**
- Never hardcode user-facing text — add the key to **both** `en` and `th`, render via `t('section.key')`.
- Interpolate: `t('key', { name })` ↔ `"…{name}…"`. For counts add `key_one`/`key_other` and call `t('key', { count })`.
- Don't translate proper nouns (event titles, provinces) — they come from data.
- Dates/months via `Intl.DateTimeFormat(locale, …)`, not hardcoded strings. Keep the year Gregorian (append the number yourself) so `th-TH` doesn't flip to the Buddhist era.

Scope today: landing page + Calendar. Same pattern extends to other pages, and is swappable for react-i18next later since everything already goes through `t()`.

## Auth (Mock)

| Email | Password | Role |
|-------|----------|------|
| any | any | Organizer |
| `admin@mytrails.com` | any | Admin |

`AuthContext` stores `role` + `organizerId` in `localStorage` (mock). Login is decided by the email only (see table). Any non-admin login maps to the demo organizer **org1** (Trail Events Co.).

## Backend (Supabase) — behind a flag ⭐

`VITE_DATA_SOURCE=mock|supabase` (src/lib/dataSource.ts, default mock for dev/tests/storybook; **the LIVE site is built with supabase since 2026-07-12** — deploy with `VITE_DATA_SOURCE=supabase npm run build`). Supabase project `mytrails` (dtmaoyuodcmnefdutipn,
ap-southeast-1): Postgres schema mirroring the store 1:1, registration flow enforced
server-side via RPCs (create/confirm/verify_slip/lookup — capacity, sale windows,
duplicates, 15-min holds), RLS (anon = live events only; organizer = own tree via
auth.uid(); admin = jwt app_metadata.role), Storage buckets covers/slips.
- Env: `.env.local` (gitignored) has VITE_SUPABASE_URL/_ANON_KEY; service_role +
  demo passwords (admin@mytrails.com, somchai@trailevents.co.th) in `~/.env.secrets`.
- Seed/reset DB: `set -a; source ~/.env.secrets; set +a; npx tsx scripts/seed-supabase.ts`
- Server-side time logic: pg_cron in the DB runs tick_scheduled_events (*/5 min, scheduled→live at publishAt) + tick_payouts (daily). VPS cron 02:40 UTC runs ~/scripts/mytrails-ops.sh (backups, keep 7). Storybook + vitest pinned to mock.
- Adapter internals: src/lib/supabaseAdapter.ts; EventsContext/AuthContext branch on
  dataSource at the edges only. `hydrated` flag on the store distinguishes loading vs
  not-found for deep links (async hydration).

## Data & the shared store ⭐

Data is still mock (this is a prototype), but it now lives in a **single writable store** — `src/contexts/EventsContext.tsx` (`EventsProvider`), backed by `localStorage` (key `mt_store_vN`). All three sides read/write the same store, so an organizer action reflects on the admin side and vice-versa.

- **Reads:** `hooks/data/*` (`useEvents`, `useEvent`, `useAdminData`) now read from the store; components can also call `useEventsStore()` directly for mutations.
- **Seed:** `mockData.ts` (org1 events) + `adminMockData.ts` (other organizers, platform settings incl. the service fee + commission brackets). The store seeds from these on first load.
- **Bump `STORAGE_KEY`** in EventsContext whenever you change the seed shape/values, or browsers keep stale data. There's also a **"Reset demo data"** button in Admin → Settings.
- Business logic in `src/lib/` (refund/distance policies) is unit-tested. Tests live in `src/test/` (store transitions, commission math, flow coverage, review page).

## Event lifecycle & flow (the approval flow)

`EventStatus` (in `mockData.ts`) — **5 states**:

```
draft → pending_review → (admin approves) ─┬→ live         (publishMode: 'asap')
                                           └→ scheduled → live (auto-promote at publishAt)
        pending_review → (reject) → rejected → organizer edits → pending_review
        scheduled/live → (organizer edits) → pending_review   (re-approval required)
```

- **Admin does NOT manually publish.** On approve, the organizer's publish choice decides go-live: ASAP → `live`; scheduled → `scheduled`, then the store auto-promotes to `live` at `publishAt` (checked on load + interval — no real cron).
- **No cancellation flow.** Organizers cannot cancel a published event. Admin's **Force Unpublish** (`live`/`scheduled` → `draft`) is the only takedown.
- **Rejection reason** is shown to the organizer only in the edit wizard (not on the dashboard card); an **Action Needed** dashboard tab surfaces rejected events.

## Runner registration (Journey 3)

`RegisterFlow` (`/events/:id/register`, built from the adopted OrderTwoView direction):
runner form (full RunnerInfo incl. PDPA consent; 18+ enforced for categories ≥50K) →
payment (Card via `stripeMock` — decline keeps the form retryable — or PromptPay QR +
slip upload) → confirmation code `MT-XXXXXX`. Store side (`EventsContext`):
`createRegistration` re-checks capacity + `ticketWindowState` and holds a seat for
15 min (`expireStaleRegistrations` releases it); card confirm increments `sold`
immediately; PromptPay lands in `awaiting_verification` until the organizer's
**Slip verification queue** (Orders section) approves/rejects (`verifySlip`).
Confirmed runners appear in Participants (CSV export available). Guest model — no
runner login; lookup by email + code at `/registration/lookup`.

## Platform charges (2 parts) ⭐

`eventFinance()` / `eventCommissionAmount()` / `eventServiceFee()` / `resolveBracket()` live in `EventsContext.tsx`. **Account Tiers were removed 2026-08-26** — an organizer's account no longer affects what it is charged.

1. **Service fee** — a flat THB amount every event pays regardless of size (`settings.serviceFee`, default ฿1,500). Same for an event with 1 runner as one with 5,000.
2. **Event commission** — by registration count, priced from a **bracket scale** (`settings.commissionBrackets`, CRUD in Admin → Settings). Seed scale: `≥0` → ฿1,000 flat · `≥300` → 8% · `≥1000` → 6%. The bracket the final count lands in prices the **whole event** — it is NOT progressive/tax-style. `deleteBracket` is a no-op on the last bracket (the scale must stay priceable).

Admin can override **both** per event in the review page (`serviceFeeOverride`, `eventCommissionOverride`); unset means follow the platform setting. Total = service fee + event commission, deducted at payout. The **wizard estimates** on planned capacity; the **payout** (Admin → Financials queue) computes on **actual `sold`**. Payout lifecycle: `held` → `payable` → `paid`.

Both settings live in the single `platform_settings` row (`service_fee`, `commission_brackets` jsonb), so every settings edit pushes the whole object.

## Adding a New Event Page

1. Create `src/views/runner/<event-slug>/` folder
2. Add `<EventName>Page.tsx` + CSS files (copy pyt-landing as template)
3. Add route in `src/App.tsx`: `<Route path="/events/<slug>" element={<EventNamePage />} />`
