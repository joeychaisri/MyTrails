# MyTrails — CLAUDE.md

Trail running event platform for Thailand. Two distinct sides: **Organizer** (event management portal) and **Runner** (public-facing discovery & registration).

## Commands

```bash
npm run dev      # dev server → https://localhost:8080 (self-signed cert)
npm run build    # production build → dist/
npm run test     # vitest unit tests
npx tsc --noEmit # type check only
```

Caddy reverse-proxies `mytrails.theingress.co` → `https://localhost:8080`.

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
├── views/
│   ├── organizer/          # (files live at views/ root for now)
│   │   AuthView.tsx
│   │   DashboardView.tsx
│   │   EventWizard.tsx
│   │   EventManagerHub.tsx
│   │   PublicEventPage.tsx
│   │   admin/
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
