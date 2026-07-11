# Phase 0: Production Serving + Data Realism — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Serve MyTrails as a real production build (not a Vite dev server) and make the mock data realistic enough that the app reads as a live platform.

**Architecture:** Caddy serves `~/MyTrails/dist` as a static SPA (with `/journey/` untouched); the systemd Vite service is retired. A pure `eventPhase` helper derives time-based registration state from event dates. Seed data grows to ~18 events across 5 organizers with cover images in `public/covers/`.

**Tech Stack:** Vite build, Caddy file_server, vitest, existing EventsContext store.

## Global Constraints

- Branch: `handoff/storybook-flows`. Commit per task, push after the last task.
- Design system discipline: no new colors/spacing/components (CLAUDE.md rule).
- `npm run typecheck` and `npm run test` must be green before every commit.
- Verify in a real browser via playwright MCP (`/opt/google/chrome`) before ticking boxes in `PLAN-realistic.md`.
- Sudo is available for Caddy/systemd changes; reload Caddy with `sudo systemctl reload caddy`.

---

### Task 1: Serve production build via Caddy

**Files:**
- Modify: `/etc/caddy/Caddyfile` (mytrails.theingress.co block)
- Modify: `~/MyTrails/CLAUDE.md` (Commands section — deploy flow)
- No repo code changes.

**Interfaces:**
- Produces: `npm run build` output at `/home/joey/MyTrails/dist` served at https://mytrails.theingress.co with SPA fallback; `mytrails.service` stopped+disabled.

- [ ] **Step 1: Build production bundle**

Run: `cd ~/MyTrails && npm run build`
Expected: `dist/index.html` exists, build succeeds.

- [ ] **Step 2: Update Caddyfile**

In the `mytrails.theingress.co` block, keep the two `/journey` handles exactly as they are, and replace the fallback `handle { reverse_proxy https://localhost:8080 ... }` with:

```caddyfile
	handle {
		root * /home/joey/MyTrails/dist
		try_files {path} /index.html
		file_server
	}
```

Run: `sudo caddy validate --config /etc/caddy/Caddyfile && sudo systemctl reload caddy`
Expected: "Valid configuration".

- [ ] **Step 3: Verify site serves statically**

Run: `curl -s -o /dev/null -w '%{http_code}\n' https://mytrails.theingress.co/` → 200
Run: `curl -s -o /dev/null -w '%{http_code}\n' https://mytrails.theingress.co/organizer/login` → 200 (SPA fallback)
Run: `curl -s -o /dev/null -w '%{http_code}\n' https://mytrails.theingress.co/journey/` → 200
Then playwright MCP: open `https://mytrails.theingress.co/`, snapshot shows the runner landing, `browser_console_messages(level: error)` = 0.

- [ ] **Step 4: Retire the dev-server service**

Run: `sudo systemctl disable --now mytrails.service`
Re-run the three curls from Step 3 — all still 200 (nothing depended on :8080).

- [ ] **Step 5: Document the deploy flow in CLAUDE.md**

In `~/MyTrails/CLAUDE.md` Commands section, replace the `npm run dev` comment line with:

```bash
npm run dev      # local dev server → https://localhost:8080 (NOT proxied anymore)
npm run build    # production build → dist/  ← THIS is what mytrails.theingress.co serves
# deploy = npm run build (Caddy serves dist/ statically; mytrails.service is retired)
```

- [ ] **Step 6: Commit**

```bash
cd ~/MyTrails && git add CLAUDE.md && git commit -m "build(deploy): serve production dist via Caddy, retire Vite dev service"
```

---

### Task 2: Time-aware event phase helper

**Files:**
- Create: `src/lib/eventPhase.ts`
- Test: `src/test/eventPhase.test.ts`

**Interfaces:**
- Consumes: `Event` type from `@/data/mockData` (fields: `date`, `endDate?`, plus ticket sale windows on `Category.tickets` — check exact ticket window field names in `mockData.ts` before coding; the approval-flow commit added them).
- Produces: `eventPhase(event: Event, now?: Date): EventPhase` where `EventPhase = 'upcoming' | 'registration_open' | 'registration_closed' | 'ongoing' | 'finished'`, and `ticketWindowState(ticket: Ticket, now?: Date): 'not_yet' | 'on_sale' | 'ended'`. Pure functions, no store dependency. `now` defaults to `new Date()` at call sites, injected in tests.

- [ ] **Step 1: Read `src/data/mockData.ts` ticket/window field names, then write failing tests**

```ts
// src/test/eventPhase.test.ts
import { describe, it, expect } from "vitest";
import { eventPhase, ticketWindowState } from "@/lib/eventPhase";
import { mockEvents } from "@/data/mockData";

const at = (s: string) => new Date(s);

describe("eventPhase", () => {
  const ev = { ...mockEvents[0], date: "2026-09-15", endDate: "2026-09-16" };
  it("is finished after endDate", () => {
    expect(eventPhase(ev, at("2026-09-17T00:00:00Z"))).toBe("finished");
  });
  it("is ongoing between date and endDate", () => {
    expect(eventPhase(ev, at("2026-09-15T12:00:00Z"))).toBe("ongoing");
  });
  it("is registration_open before the event when a ticket is on sale", () => {
    expect(eventPhase(ev, at("2026-07-15T00:00:00Z"))).toBe("registration_open");
  });
});
```

(Adjust the third test's seeding to whatever sale-window fields actually exist — the test must construct a ticket explicitly on sale and one explicitly ended, plus a `registration_closed` case where all windows ended but the event hasn't started.)

- [ ] **Step 2: Run tests, verify FAIL** — `npx vitest run src/test/eventPhase.test.ts` → module not found.

- [ ] **Step 3: Implement `src/lib/eventPhase.ts`** — pure date comparisons; treat missing `endDate` as same-day event ending 23:59 local; registration_open iff any ticket window is on sale now and event not started; upcoming = before any window opens.

- [ ] **Step 4: Run tests, verify PASS** — full suite: `npm run test` all green.

- [ ] **Step 5: Surface the phase in the UI (minimal, on-system)** — In `PublicEventPage` and the runner landing event cards, where a status/CTA already renders, disable/replace the register CTA text when phase is `registration_closed`/`finished` using existing muted styles only. No new visual elements. If unsure how it should look → STOP and ask Joey (design rule).

- [ ] **Step 6: Commit**

```bash
git add src/lib/eventPhase.ts src/test/eventPhase.test.ts src/views
git commit -m "feat(realism): time-aware event phases drive registration CTAs"
```

---

### Task 3: Rich seed data

**Files:**
- Modify: `src/data/mockData.ts` (org1 events stay; adjust dates so statuses make sense against today)
- Modify: `src/data/adminMockData.ts` (grow to ~12 other-org events across org2/org3/org5/org6)
- Create: `public/covers/*.jpg` (12-18 trail/mountain photos, ≤200KB each)
- Modify: `src/contexts/EventsContext.tsx` (bump `STORAGE_KEY` version — REQUIRED or browsers keep stale seeds)

**Interfaces:**
- Consumes: `makeCategory` factory + `seedToEvent` helpers already in the data files (read them first; follow their shape exactly).
- Produces: store seeds with ~18 events total covering: every status ≥2×, dates spread past/near-future/far-future (so eventPhase shows finished/ongoing/open variety), sold counts from 0% to 100% (≥1 sold-out category), every organizer tier represented, `coverImage` field populated with `/covers/<slug>.jpg` on ≥12 events. If `Event` has no cover-image field, check what `EventCard`/`AdminEventReview` read (`AdminEventReview` shows "No cover photo uploaded" — find that field name) and use exactly that field.

- [ ] **Step 1: Download cover photos** — 12-18 royalty-free trail-running/mountain photos (Unsplash source URLs, e.g. `curl -L "https://images.unsplash.com/photo-<id>?w=1200&q=70" -o public/covers/<slug>.jpg`); verify each file is a real JPEG >20KB (`file public/covers/*.jpg`). If downloads fail (network), generate 1200×600 gradient JPEGs with ImageMagick using ONLY design-system colors (`hsl(24,95%,46%)` → `hsl(16,90%,40%)`) and note it in the commit message.

- [ ] **Step 2: Extend seeds** — follow existing factories; keep ids stable for events 1-6 (tests reference "1","2","5"). Add events 7+ only. Run `npm run test` — the existing store/flow tests must stay green.

- [ ] **Step 3: Bump STORAGE_KEY** in EventsContext (e.g. `mt_store_v4` → next number).

- [ ] **Step 4: Rebuild + verify visually** — `npm run build`, then playwright MCP on the live site: landing grid shows covers and many events; organizer dashboard tabs all populated; admin queue has multiple pending. Screenshot for the record. Console errors = 0.

- [ ] **Step 5: Redeploy Storybook** — `npm run storybook:deploy` (stories read the same seeds); spot-check `/journey/` EventCard "every status" story shows covers.

- [ ] **Step 6: Commit + push + tick Phase 0 boxes in PLAN-realistic.md**

```bash
git add -A && git commit -m "feat(realism): rich seeds — 18 events, 5 organizers, cover photos"
git push && sed/edit PLAN-realistic.md checkboxes, commit that too
```

## Self-review notes
- Task 2 Step 5 touches UX copy/state → it stays inside existing components' existing states; anything beyond that violates the ask-first rule.
- Task 3 keeps event ids 1-6 stable because `adminReview.test.tsx` and stories pin them.
- No task introduces new dependencies.
