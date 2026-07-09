# MyTrails — CLAUDE.md

Trail running event platform for Thailand. Two distinct sides: **Organizer** (event management portal) and **Runner** (public-facing discovery & registration).

## Working Style — IMPORTANT (read first)

**Joey is the UX/designer for this project.** Treat this codebase like a **Figma prototype**, not a production app: most data is **mock data** (`src/data/mockData.ts`) that exists only to demonstrate flows, layout, and look-and-feel. Don't worry about real backend correctness or data integrity unless explicitly asked — the priority is **UX, layout, and design fidelity**.

### Design System discipline (take this VERY seriously)

- Whenever Joey asks for **any** new design or UI change, follow the **existing Design System strictly** — colors, spacing, typography, `--mt-*` tokens, shadcn primitives, and existing component patterns. Match what already exists; **do not improvise, invent new styles, or introduce new colors/values.**
- **If you are unsure about ANYTHING** — a color, a token, spacing, which component to reuse, or any Design System decision — **STOP and ask Joey BEFORE implementing.** Never guess. Asking first is always preferred over building something off-system.

## Commands

```bash
npm run dev      # dev server → https://localhost:8080 (self-signed cert)
npm run build    # production build → dist/
npm run test     # vitest unit tests
npm run typecheck # type check only (tsc -p tsconfig.app.json --noEmit — plain `npx tsc --noEmit` checks NOTHING because root tsconfig has files:[])
npm run ladle    # dev hand-off catalog (Ladle) → http://localhost:61000
npm run ladle:deploy # static build → ladle-dist/ (base /journey/) for the live catalog
```

Caddy reverse-proxies `mytrails.theingress.co` → `https://localhost:8080`.

## Developer Hand-off Catalog (Ladle)

`mytrails.theingress.co/journey` serves a **Ladle** catalog: every user flow ("journey")
as a sidebar group of isolated, pinned-state screens — the hand-off artifact for developers.
Stories live in `src/stories/*.stories.tsx`; global providers in `.ladle/components.tsx`;
sidebar order (journey 1→8, Experiments last) in `.ladle/config.mjs` via `storyOrder`.

- It is a **separate static build**, not an app route. Caddy serves `ladle-dist/` under
  `/journey/` (`handle_path /journey/*` in the Caddyfile); normal app URLs are untouched.
- **After editing stories, rebuild**: `npm run ladle:deploy` (regenerates `ladle-dist/`, gitignored).
- Screens are pinned via **optional `initial*` props** on stateful views (e.g. RunnerLandingPage
  `initialView`, DashboardView `initialTab`, EventWizard `initialStep`/`initialScenario`); every
  such prop defaults to current behavior, so the app (which renders prop-less) is unchanged.
- **Ladle gotcha**: story `title`/`storyName` become JS identifiers — ASCII only, no emoji/·/—.

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
| `/organizer/admin` | Admin | `AdminDashboard` |
| `/login`, `/dashboard` etc. | — | Legacy redirects → `/organizer/*` |

## Src Layout

```
src/
├── hooks/data/             # data-layer seam: useEvents/useOrders/... return {data,isLoading,error}; swap mock → React Query here
├── views/
│   ├── organizer/
│   │   AuthView.tsx
│   │   DashboardView.tsx
│   │   EventWizard.tsx
│   │   EventManagerHub.tsx   # thin orchestrator (~300 lines); sections in event-manager/
│   │   PublicEventPage.tsx
│   │   event-manager/        # OrdersSection, ParticipantsSection, BibSection, PromotionsSection, Overview*Section, orderConstants
│   ├── admin/
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
├── contexts/AuthContext.tsx
├── data/mockData.ts        # replace with API calls here
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

`AuthContext` stores `role` in memory only — replace with real auth when backend is ready.

## Data

All data is mock — `src/data/mockData.ts`. Replace with API calls at the data layer; views don't need to change. Business logic in `src/lib/` is unit-tested and backend-ready.

## Adding a New Event Page

1. Create `src/views/runner/<event-slug>/` folder
2. Add `<EventName>Page.tsx` + CSS files (copy pyt-landing as template)
3. Add route in `src/App.tsx`: `<Route path="/events/<slug>" element={<EventNamePage />} />`
