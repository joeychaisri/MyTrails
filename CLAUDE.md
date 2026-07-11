# MyTrails — CLAUDE.md

Trail running event platform for Thailand. Two distinct sides: **Organizer** (event management portal) and **Runner** (public-facing discovery & registration).

## Working Style — IMPORTANT (read first)

**Joey is the UX/designer for this project.** Treat this codebase like a **Figma prototype**, not a production app: data is **mock** (seeded into an in-browser store — see "Data & the shared store"), existing to demonstrate flows, layout, and look-and-feel. There's no backend; "payment/payout" are simulated. Don't worry about real backend correctness or data integrity unless explicitly asked — the priority is **UX, layout, and design fidelity**.

### Design System discipline (take this VERY seriously)

- Whenever Joey asks for **any** new design or UI change, follow the **existing Design System strictly** — colors, spacing, typography, `--mt-*` tokens, shadcn primitives, and existing component patterns. Match what already exists; **do not improvise, invent new styles, or introduce new colors/values.**
- **If you are unsure about ANYTHING** — a color, a token, spacing, which component to reuse, or any Design System decision — **STOP and ask Joey BEFORE implementing.** Never guess. Asking first is always preferred over building something off-system.

## Commands

```bash
npm run dev      # dev server → https://localhost:8080 (self-signed cert)
npm run build    # production build → dist/
npm run test     # vitest unit tests
npm run typecheck # type check only (tsc -p tsconfig.app.json --noEmit — plain `npx tsc --noEmit` checks NOTHING because root tsconfig has files:[])
npm run storybook        # dev hand-off catalog (Storybook) → http://localhost:6006
npm run storybook:deploy # static build → storybook-dist/ for the live catalog at /journey/
```

Caddy reverse-proxies `mytrails.theingress.co` → `https://localhost:8080`.

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
- **After editing stories, rebuild**: `npm run storybook:deploy` (regenerates `storybook-dist/`, gitignored).
- Screens are pinned via **optional `initial*` props** on stateful views (e.g. RunnerLandingPage
  `initialView`, DashboardView `initialTab`, EventWizard `initialStep`/`initialScenario`); every
  such prop defaults to current behavior, so the app (which renders prop-less) is unchanged.
  Pages that read the URL (EventManagerHub, AdminEventReview, PublicEventPage, wizard edit
  mode) are pinned with `<Routes location="...">` instead — never nest a second Router.
- Stories render-tested in jsdom via portable stories (`src/test/storybook-smoke.test.tsx`);
  portal-only stories (bare dialogs) must assert on `document.body`, not the container.

## Route Structure

| Path | Side | Component |
|------|------|-----------|
| `/` | Runner | `RunnerLandingPage` — platform home, browse events |
| `/events/pong-yaeng-trail-2026` | Runner | `PongYaengTrailPage` — PYT 2026 event landing |
| `/events/:id/preview` | Runner | `PublicEventPage` — generic event preview |
| `/organizer/login` | Organizer | `AuthView` |
| `/organizer/dashboard` | Organizer | `DashboardView` |
| `/organizer/events/new` | Organizer | `EventWizard` |
| `/organizer/events/:id/edit` | Organizer | `EventWizard` |
| `/organizer/events/:id/:section` | Organizer | `EventManagerHub` |
| `/organizer/admin` | Admin | `AdminDashboard` (Overview / Approvals / Financials / Users / Settings) |
| `/organizer/admin/review/:id` | Admin | `AdminEventReview` — full-page event review before approve / request-changes |
| `/login`, `/dashboard` etc. | — | Legacy redirects → `/organizer/*` |

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
│   ├── OrderTwoView.tsx      # order-flow UX experiments (Direction 2/3) — pending decision, do not invest
│   ├── OrderThreeView.tsx
│   └── runner/
│       ├── RunnerLandingPage.tsx     # platform home
│       ├── RunnerComponents.tsx      # Button, Logo, I, IconDisc, ProgressBar
│       └── pyt-landing/
│           ├── PongYaengTrailPage.tsx
│           ├── hero-styles.css
│           ├── landing-styles.css
│           └── design-system/colors_and_type.css
├── components/ui/          # shadcn/ui primitives
├── data/mockData.ts        # Event/Category/Ticket types + seed events (org1) + makeCategory factory
├── data/adminMockData.ts   # Tier/AdminOrganizer/PlatformSettings + seed organizers & other-org events
├── lib/                    # refundPolicy, distanceChangePolicy (unit-tested)
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

## Data & the shared store ⭐

Data is still mock (this is a prototype), but it now lives in a **single writable store** — `src/contexts/EventsContext.tsx` (`EventsProvider`), backed by `localStorage` (key `mt_store_vN`). All three sides read/write the same store, so an organizer action reflects on the admin side and vice-versa.

- **Reads:** `hooks/data/*` (`useEvents`, `useEvent`, `useAdminData`) now read from the store; components can also call `useEventsStore()` directly for mutations.
- **Seed:** `mockData.ts` (org1 events) + `adminMockData.ts` (other organizers, tiers, settings). The store seeds from these on first load.
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

## Commission model (2 parts)

`eventFinance()` / `eventCommissionAmount()` live in `EventsContext.tsx`.

1. **Event commission** — by registration count: `<300` → ฿1,000 flat · `300–999` → 8% · `≥1000` → 6%. Admin can override per event (`eventCommissionOverride`) in the review page.
2. **Tier commission** — the organizer account's tier rate. Tiers are **dynamic** (`settings.tiers`, CRUD in Admin → Settings; a tier in use can't be deleted); each `AdminOrganizer` has a `tierId`.

Total = event + tier, deducted at payout. The **wizard estimates** on planned capacity; the **payout** (Admin → Financials queue) computes on **actual `sold`**. Payout lifecycle: `held` → `payable` → `paid`.

## Adding a New Event Page

1. Create `src/views/runner/<event-slug>/` folder
2. Add `<EventName>Page.tsx` + CSS files (copy pyt-landing as template)
3. Add route in `src/App.tsx`: `<Route path="/events/<slug>" element={<EventNamePage />} />`
