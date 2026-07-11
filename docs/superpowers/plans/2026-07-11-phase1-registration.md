# Phase 1: Runner Registration (Direction 2) on the Mock Store — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A runner can discover a live event, register (Direction-2 UX), pay via a Stripe-shaped mock or PromptPay-slip mock, get a `MT-XXXXXX` code, and appear instantly in the organizer's Participants/Orders — all on the localStorage store.

**Architecture:** Store gains `registrations` (order+participant in one record) with capacity holds and expiry. A `PaymentProvider` interface in `src/lib/payments/` isolates payment UX from flow logic. New public routes `/events/:id/register` and `/registration/lookup`. Landing reads the store via a `RunnerEvent` adapter (visual design unchanged).

**Tech Stack:** existing EventsContext + hooks/data seam, react-router, shadcn/ui (organizer-side screens), runner-side design tokens for public screens, vitest.

## Global Constraints
- Branch `handoff/storybook-flows`; commit per task; push after each task.
- Design system: reuse `OrderTwoView.tsx` visual language for the registration flow (it IS the approved Direction 2); shadcn primitives for organizer screens; no invented styles.
- Every task: `npm run typecheck` + `npm run test` green before commit. UI tasks: real-browser verify (playwright MCP), 0 console errors, then `npm run build` (site serves dist/).
- Status flags: tick boxes here AND in `PLAN-realistic.md` per task.

---

### Task 1: Registration domain in the store

**Files:** Modify `src/data/mockData.ts` (types), `src/contexts/EventsContext.tsx` (state+mutations, STORAGE_KEY bump v9). Test: `src/test/registration.test.tsx`.

**Produces (exact API):**
```ts
export type RegistrationStatus = "pending_payment" | "awaiting_verification" | "confirmed" | "payment_failed" | "expired" | "cancelled" | "refunded";
export interface RunnerInfo { firstName: string; lastName: string; firstNameTh?: string; lastNameTh?: string; dob: string; gender: "male" | "female" | "other"; nationality: string; idNumber: string; phone: string; email: string; emergencyName: string; emergencyPhone: string; bloodGroup: "A" | "B" | "AB" | "O" | "unknown"; medicalConditions?: string; shirtSize: "XS" | "S" | "M" | "L" | "XL" | "2XL"; pdpaConsentAt: string; }
export interface Registration { id: string; code: string; /* MT-XXXXXX */ eventId: string; categoryId: string; ticketId: string; amount: number; status: RegistrationStatus; createdAt: string; expiresAt?: string; paymentMethod?: "card" | "promptpay"; slipDataUrl?: string; runner: RunnerInfo; }
// store additions:
registrations: Registration[];
createRegistration(input: { eventId; categoryId; ticketId; runner: RunnerInfo }): { ok: true; registration: Registration } | { ok: false; reason: "sold_out" | "window_closed" | "duplicate" };
confirmRegistration(id: string, method: "card" | "promptpay", slipDataUrl?: string): void; // card → confirmed; promptpay → awaiting_verification
failRegistration(id: string): void;
verifySlip(id: string, approve: boolean): void;      // organizer action
cancelRegistration(id: string, refundPct: number): void;
expireStaleRegistrations(now?: Date): void;           // pending_payment past expiresAt → expired (called on provider mount + 60s interval, same pattern as publishAt auto-promote)
```
Rules: `createRegistration` re-checks `ticketWindowState` + remaining capacity counting non-expired/non-failed registrations for that ticket, sets `expiresAt = now+15min`, generates unique code `MT-` + 6 alphanum; duplicate = same email+eventId with status not in (expired, payment_failed, cancelled) → reason "duplicate". `confirmRegistration`/`verifySlip(approve)` increment `ticket.sold`+`event.sold` exactly once (on confirmed). Refund decrements sold and sets refundedAmount on the event.

- [ ] Write failing tests covering: happy card path (sold +1), promptpay path (awaiting → verify → confirmed sold +1; reject → cancelled sold +0), sold-out rejection, window_closed rejection, duplicate rejection, expiry releases the hold, cancel with refundPct updates event.refundedAmount.
- [ ] Implement; all tests green; STORAGE_KEY → v9; commit `feat(store): registration domain with capacity holds and slip verification`.

### Task 2: Payment providers

**Files:** Create `src/lib/payments/types.ts`, `stripeMock.ts`, `promptpayMock.ts`, `index.ts`. Test `src/test/payments.test.ts`.

**Produces:**
```ts
export interface CardInput { number: string; exp: string; cvc: string; name: string }
export type PaymentOutcome = { status: "succeeded" } | { status: "failed"; message: string };
export interface PaymentProvider { id: "card" | "promptpay"; confirmCard?(input: CardInput): Promise<PaymentOutcome>; }
```
stripeMock.confirmCard: strip spaces; `4242424242424242` → succeeded (after 1.5-2s delay); `4000000000000002` → failed "Your card was declined."; `4000000000009995` → failed "Insufficient funds."; luhn-invalid/short → failed "Invalid card number."; other valid-luhn → succeeded. promptpayMock: exports a deterministic fake QR payload string builder `promptpayQR(amount, code)`.

- [ ] Failing tests for each card outcome (use vi.useFakeTimers or await with real short delay ≤50ms in test mode via injectable delay); implement; green; commit `feat(payments): Stripe-shaped mock provider + PromptPay mock`.

### Task 3: Landing + runner data from the store

**Files:** Modify `src/views/runner/runnerEvents.ts` (adapter), check `RunnerLandingPage.tsx` + `CalendarView.tsx` imports still work. 

Replace `MOCK_EVENTS` export with `useRunnerEvents(): RunnerEvent[]` hook reading `useEventsStore()` — map live events only: image = `coverImage || heroImage fallback`, region from a province→region map (Chiang Mai/Chiang Rai/Mae Hong Son/Loei→north, Kanchanaburi/Nakhon Ratchasima/Bangkok→central, Krabi/Surat Thani/Phuket→south…), distances from categories (`${distance}K`), price = min ticket price, tag: phase registration_open→"Open", upcoming→"Coming Soon", sold out→"Sold Out", closed/ongoing/finished→"Closed". Keep the `RunnerEvent` interface EXACTLY — the landing/calendar components must not change visually. Card click / Register → navigate `/events/{id}/preview` (PYT keeps its bespoke route via slug match if id === "pyt" seed... check how the PYT card links today and preserve it).
- [ ] Implement; typecheck+tests; browser-verify landing shows store events with covers, EN/TH toggle still fine; build; commit `feat(runner): landing + calendar read the shared store`.

### Task 4: Registration flow UI (Direction 2)

**Files:** Create `src/views/runner/register/RegisterFlow.tsx` (+ small step components in same folder), route `/events/:id/register` in `App.tsx`; wire PublicEventPage "Register" button → navigate with selected category/ticket (router state). Reference design: `src/views/OrderTwoView.tsx` — reuse its layout patterns/components; shadcn primitives ok.

Steps: (1) Runner form — all RunnerInfo fields, validation inline (email confirm match, DOB age ≥18 for distances ≥50K else block with message, required PDPA checkbox linking to `/pdpa` static text page (create simple page, same typographic style as PublicEventPage sections)); (2) Payment — method toggle Card | PromptPay: Card = Stripe-checkout-styled form (test-card hint text visible: "demo: 4242 4242 4242 4242"), decline keeps data + shows provider message; PromptPay = QR + slip file upload (accept image, store dataURL); (3) Confirmation — big `MT-XXXXXX` code, status confirmed (card) or awaiting_verification (promptpay), link to lookup page. Countdown chip showing hold expiry (15 min) during steps 1-2.
- [ ] Implement; typecheck+tests; **browser e2e**: full card path on a live event → code shown; decline path; promptpay path leaves awaiting_verification; sold-out event blocks with message; build; commit `feat(runner): Direction-2 registration flow with mock payments`.

### Task 5: Lookup page

**Files:** Create `src/views/runner/register/LookupPage.tsx`, route `/registration/lookup`. Form: email + code → show registration status card (status badge text per RegistrationStatus, event title, category, amount); not found → muted error. Link from confirmation page + PublicEventPage footer line.
- [ ] Implement; browser-verify found + not-found; commit `feat(runner): registration lookup by email + code`.

### Task 6: Organizer sees real registrations

**Files:** Modify `src/hooks/data/useParticipants.ts` + `useOrders.ts` (source from store registrations for the event, falling back to legacy mock rows so existing stories/tests stay alive), `src/views/organizer/event-manager/OrdersSection.tsx` (add "Slip verification" queue: registrations awaiting_verification with slip preview + Approve/Reject via verifySlip), `ParticipantsSection.tsx` (real registrations rows + CSV export button — build CSV from RunnerInfo fields, download via blob).
- [ ] Implement; tests (extend registration.test with a hooks-level read if cheap); browser-verify: register in one tab → appears in organizer Participants + slip queue approve flips status; commit `feat(organizer): live registrations, slip queue, CSV export`.

### Task 7: Storybook + catalog updates

**Files:** Create `src/stories/runner-register.stories.tsx` — title `Runner/3 · Register & Pay`: form step (seeded), payment card, payment promptpay, confirmation, lookup found. Add slip-queue story into `organizer-get-paid.stories.tsx`. DELETE `src/views/OrderThreeView.tsx` + remove Direction stories from `experiments-order-flows.stories.tsx` (keep Direction 2 reference story until RegisterFlow fully supersedes it — then delete file + OrderTwoView… decision: keep OrderTwoView.tsx as reference this phase, delete OrderThreeView). Update `.storybook/preview.tsx` storySort (insert '3 · Register & Pay') and `JourneyMap.mdx` (J3 no longer reserved).
- [ ] Implement; `npm run storybook:deploy`; browser-verify /journey/ new journey renders; commit `feat(handoff): Journey 3 stories — register & pay`.

### Task 8: Phase wrap
- [ ] Full suite + build + deploy both artifacts; tick Phase 1 in `PLAN-realistic.md`; push; update project CLAUDE.md (routes table + registration section, payment lib note).
