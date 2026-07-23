# Support Ticket Board Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship an in-app dev↔UX support-ticket board at `/board` (list + thread), Supabase-backed, no auth, reusing the existing shadcn design system.

**Architecture:** Two new Supabase tables (`tickets`, `ticket_messages`) with anon read/insert + status-only update RLS. A self-contained `src/lib/board/` module (types, metadata, identity, API) isolated from `EventsContext`/`supabaseAdapter`. Two React views (`BoardListView`, `BoardThreadView`) + a `NewTopicModal`, wired into `App.tsx` as public routes. Board always talks to Supabase directly via the existing `getSupabase()` singleton (the deployed site builds with `VITE_DATA_SOURCE=supabase`), so it does not depend on the mock/supabase data-source flag.

**Tech Stack:** Vite + React 18 + TypeScript, react-router-dom v6, @supabase/supabase-js, shadcn/ui + Tailwind, vitest + @testing-library/react.

## Global Constraints

- Supabase project: **mytrails** (`VITE_SUPABASE_URL=https://dtmaoyuodcmnefdutipn.supabase.co`). Apply migrations via the `mcp__supabase__apply_migration` tool against this project.
- Copy/UI language: **English** (matches the back-office; board is an internal dev tool).
- Reuse existing UI primitives under `@/components/ui/*` — do not add new dependencies.
- No auth: identify posters by name + role (`dev` | `ux` | `po`), persisted in `localStorage`.
- Board module lives under `src/lib/board/` and `src/views/board/` — do NOT modify `EventsContext.tsx`, `supabaseAdapter.ts`, or `AuthContext.tsx`.
- Board API functions take the Supabase client as their first argument (mirrors the `supabaseAdapter.ts` pattern) so they are unit-testable with a fake client.
- vitest runs with `VITE_DATA_SOURCE=mock` (per `vitest.config.ts`) — tests must never require live Supabase; test API functions with a hand-rolled fake client.
- Status keys (exact): `asked_ux`, `in_progress`, `waiting_po`, `answered`, `closed`. Role keys (exact): `dev`, `ux`, `po`.
- Commit after each task.

---

## File Structure

- `src/lib/board/boardTypes.ts` — TS types (`Ticket`, `TicketMessage`, `TicketStatus`, `TicketRole`), `STATUS_META`, `ROLE_META`, `JOURNEY_OPTIONS`.
- `src/lib/board/identity.ts` — `getIdentity()` / `setIdentity()` localStorage helpers.
- `src/lib/board/boardApi.ts` — row↔type mappers + Supabase query functions `(client, …)`.
- `src/components/board/StatusChip.tsx` — colored status badge.
- `src/components/board/RoleChip.tsx` — role badge.
- `src/components/board/NewTopicModal.tsx` — create-topic dialog.
- `src/views/board/BoardListView.tsx` — `/board` list + filters.
- `src/views/board/BoardThreadView.tsx` — `/board/:id` thread + reply + status dropdown.
- `src/App.tsx` — add two routes (modify).
- `src/stories/BuildStatus.mdx` — add board link (modify).
- Tests under `src/test/board/`: `boardTypes.test.ts`, `identity.test.ts`, `boardApi.test.ts`, `boardChips.test.tsx`.

---

### Task 1: Supabase tables + RLS

**Files:**
- Migration applied via `mcp__supabase__apply_migration` (name: `support_ticket_board`). No repo file; record the SQL in the commit message of a docs note.
- Create: `docs/superpowers/notes/2026-07-23-board-migration.sql` (the exact SQL, for the record).

**Interfaces:**
- Produces: tables `tickets` and `ticket_messages` with the columns named in the spec, RLS enabled, anon SELECT/INSERT, status-only UPDATE on `tickets`, no DELETE.

- [ ] **Step 1: Write the migration SQL file**

Create `docs/superpowers/notes/2026-07-23-board-migration.sql`:

```sql
-- Support ticket board — tickets + ticket_messages (no auth, anon RLS)
create table if not exists public.tickets (
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

create table if not exists public.ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  author_name text not null,
  author_role text not null check (author_role in ('dev','ux','po')),
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists ticket_messages_ticket_id_idx on public.ticket_messages(ticket_id);
create index if not exists tickets_updated_at_idx on public.tickets(updated_at desc);

alter table public.tickets enable row level security;
alter table public.ticket_messages enable row level security;

-- tickets: anyone (anon) can read, create, and move status
create policy tickets_select on public.tickets for select to anon, authenticated using (true);
create policy tickets_insert on public.tickets for insert to anon, authenticated with check (true);
create policy tickets_update on public.tickets for update to anon, authenticated using (true) with check (true);

-- ticket_messages: append-only, readable by all
create policy messages_select on public.ticket_messages for select to anon, authenticated using (true);
create policy messages_insert on public.ticket_messages for insert to anon, authenticated with check (true);
```

Note in the file header: DELETE is intentionally omitted (no policy = denied under RLS); the app restricts `tickets` UPDATE to the `status`/`updated_at` columns at the client layer (Postgres RLS can't scope columns without a trigger, and no-auth means we accept convention here).

- [ ] **Step 2: Apply the migration**

Use `mcp__supabase__apply_migration` with `name: "support_ticket_board"` and the SQL above (mytrails project).

- [ ] **Step 3: Verify tables exist**

Use `mcp__supabase__list_tables` (schema `public`). Expected: `tickets` and `ticket_messages` present with the columns above and `rowsecurity = true`.

- [ ] **Step 4: Verify RLS insert/select works as anon**

Use `mcp__supabase__execute_sql`:
```sql
insert into public.tickets (title, created_by_name, created_by_role)
values ('__smoke__', 'seed', 'dev') returning id, status;
```
Expected: one row, `status = 'asked_ux'`. Then clean up:
```sql
delete from public.tickets where title = '__smoke__';
```
(Executed via service role in MCP; confirms schema/defaults. Client-side anon path is verified in Task 10.)

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/notes/2026-07-23-board-migration.sql
git commit -m "feat(board): add tickets + ticket_messages tables and RLS"
```

---

### Task 2: Board types + metadata

**Files:**
- Create: `src/lib/board/boardTypes.ts`
- Test: `src/test/board/boardTypes.test.ts`

**Interfaces:**
- Produces:
  - `type TicketStatus = 'asked_ux' | 'in_progress' | 'waiting_po' | 'answered' | 'closed'`
  - `type TicketRole = 'dev' | 'ux' | 'po'`
  - `interface Ticket { id: string; title: string; status: TicketStatus; screenRefJourney: string | null; screenRefNote: string | null; createdByName: string; createdByRole: TicketRole; createdAt: string; updatedAt: string; replyCount?: number }`
  - `interface TicketMessage { id: string; ticketId: string; authorName: string; authorRole: TicketRole; body: string; createdAt: string }`
  - `const STATUS_META: Record<TicketStatus, { label: string; className: string }>` (label + Tailwind color classes)
  - `const STATUS_ORDER: TicketStatus[]` (workflow order for the filter row + dropdown)
  - `const ROLE_META: Record<TicketRole, { label: string; className: string }>`
  - `const JOURNEY_OPTIONS: string[]` (12-journey labels for the dropdown)

- [ ] **Step 1: Write the failing test**

`src/test/board/boardTypes.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { STATUS_META, STATUS_ORDER, ROLE_META, JOURNEY_OPTIONS } from "@/lib/board/boardTypes";

describe("board metadata", () => {
  it("has meta + ordering for all five statuses", () => {
    const keys = ["asked_ux", "in_progress", "waiting_po", "answered", "closed"] as const;
    for (const k of keys) {
      expect(STATUS_META[k].label).toBeTruthy();
      expect(STATUS_META[k].className).toContain("bg-");
    }
    expect(STATUS_ORDER).toEqual([...keys]);
  });

  it("has meta for all three roles", () => {
    for (const k of ["dev", "ux", "po"] as const) {
      expect(ROLE_META[k].label).toBeTruthy();
    }
  });

  it("offers journey options for the screen-ref dropdown", () => {
    expect(JOURNEY_OPTIONS.length).toBeGreaterThan(5);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/board/boardTypes.test.ts`
Expected: FAIL — cannot resolve `@/lib/board/boardTypes`.

- [ ] **Step 3: Write minimal implementation**

`src/lib/board/boardTypes.ts`:
```ts
export type TicketStatus = "asked_ux" | "in_progress" | "waiting_po" | "answered" | "closed";
export type TicketRole = "dev" | "ux" | "po";

export interface Ticket {
  id: string;
  title: string;
  status: TicketStatus;
  screenRefJourney: string | null;
  screenRefNote: string | null;
  createdByName: string;
  createdByRole: TicketRole;
  createdAt: string;
  updatedAt: string;
  replyCount?: number;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  authorName: string;
  authorRole: TicketRole;
  body: string;
  createdAt: string;
}

// Workflow order — drives the filter row and the status dropdown.
export const STATUS_ORDER: TicketStatus[] = [
  "asked_ux",
  "in_progress",
  "waiting_po",
  "answered",
  "closed",
];

export const STATUS_META: Record<TicketStatus, { label: string; className: string }> = {
  asked_ux: { label: "Asked UX", className: "bg-blue-100 text-blue-800 border-blue-200" },
  in_progress: { label: "In progress", className: "bg-amber-100 text-amber-800 border-amber-200" },
  waiting_po: { label: "Waiting on PO", className: "bg-purple-100 text-purple-800 border-purple-200" },
  answered: { label: "Answered", className: "bg-green-100 text-green-800 border-green-200" },
  closed: { label: "Closed", className: "bg-gray-100 text-gray-700 border-gray-200" },
};

export const ROLE_META: Record<TicketRole, { label: string; className: string }> = {
  dev: { label: "Dev", className: "bg-slate-100 text-slate-700 border-slate-200" },
  ux: { label: "UX", className: "bg-pink-100 text-pink-800 border-pink-200" },
  po: { label: "PO", className: "bg-indigo-100 text-indigo-800 border-indigo-200" },
};

// Labels for the optional screen-ref dropdown (the 12-journey hand-off map).
export const JOURNEY_OPTIONS: string[] = [
  "Runner · Discover Events",
  "Runner · Explore an Event",
  "Runner · Register & Pay",
  "Organizer · Get Started",
  "Organizer · Create & Submit Event",
  "Organizer · Approval Outcomes",
  "Organizer · Manage Live Event",
  "Organizer · Get Paid",
  "Organizer · Notifications & Outbox",
  "Admin · Approve Events",
  "Admin · Platform Finance",
  "Admin · Platform Settings",
  "Design System",
];
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/test/board/boardTypes.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/board/boardTypes.ts src/test/board/boardTypes.test.ts
git commit -m "feat(board): ticket types + status/role/journey metadata"
```

---

### Task 3: Identity helper (localStorage)

**Files:**
- Create: `src/lib/board/identity.ts`
- Test: `src/test/board/identity.test.ts`

**Interfaces:**
- Consumes: `TicketRole` from `boardTypes.ts`.
- Produces:
  - `interface Identity { name: string; role: TicketRole }`
  - `getIdentity(): Identity | null`
  - `setIdentity(identity: Identity): void`

- [ ] **Step 1: Write the failing test**

`src/test/board/identity.test.ts`:
```ts
import { describe, it, expect, beforeEach } from "vitest";
import { getIdentity, setIdentity } from "@/lib/board/identity";

describe("board identity", () => {
  beforeEach(() => localStorage.clear());

  it("returns null before anything is stored", () => {
    expect(getIdentity()).toBeNull();
  });

  it("round-trips name + role", () => {
    setIdentity({ name: "Dao", role: "dev" });
    expect(getIdentity()).toEqual({ name: "Dao", role: "dev" });
  });

  it("returns null for a corrupt payload", () => {
    localStorage.setItem("mytrails.board.identity", "not json");
    expect(getIdentity()).toBeNull();
  });

  it("returns null when the stored role is invalid", () => {
    localStorage.setItem("mytrails.board.identity", JSON.stringify({ name: "X", role: "boss" }));
    expect(getIdentity()).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/board/identity.test.ts`
Expected: FAIL — cannot resolve `@/lib/board/identity`.

- [ ] **Step 3: Write minimal implementation**

`src/lib/board/identity.ts`:
```ts
import type { TicketRole } from "./boardTypes";

export interface Identity {
  name: string;
  role: TicketRole;
}

const KEY = "mytrails.board.identity";
const ROLES: TicketRole[] = ["dev", "ux", "po"];

export function getIdentity(): Identity | null {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<Identity>;
    if (typeof parsed.name === "string" && parsed.name.trim() && ROLES.includes(parsed.role as TicketRole)) {
      return { name: parsed.name, role: parsed.role as TicketRole };
    }
    return null;
  } catch {
    return null;
  }
}

export function setIdentity(identity: Identity): void {
  localStorage.setItem(KEY, JSON.stringify(identity));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/test/board/identity.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/board/identity.ts src/test/board/identity.test.ts
git commit -m "feat(board): localStorage identity helper"
```

---

### Task 4: Board API — mappers + Supabase queries

**Files:**
- Create: `src/lib/board/boardApi.ts`
- Test: `src/test/board/boardApi.test.ts`

**Interfaces:**
- Consumes: `Ticket`, `TicketMessage`, `TicketStatus`, `TicketRole` from `boardTypes.ts`; `SupabaseClient` type from `@supabase/supabase-js`.
- Produces:
  - `rowToTicket(row): Ticket` and `rowToMessage(row): TicketMessage` (exported for tests)
  - `fetchTickets(client): Promise<Ticket[]>` — tickets ordered by `updated_at desc`, each with `replyCount`
  - `fetchThread(client, ticketId): Promise<{ ticket: Ticket; messages: TicketMessage[] }>`
  - `createTicket(client, input): Promise<string>` where `input = { title; createdByName; createdByRole: TicketRole; screenRefJourney: string | null; screenRefNote: string | null; firstMessage: string }` → returns new ticket id
  - `postMessage(client, input): Promise<void>` where `input = { ticketId; authorName; authorRole: TicketRole; body }` (also bumps the ticket's `updated_at`)
  - `updateStatus(client, ticketId, status: TicketStatus): Promise<void>` (sets `status` + `updated_at`)
  - `getBoardClient(): SupabaseClient` — thin wrapper over `getSupabase()` (board always uses Supabase)

- [ ] **Step 1: Write the failing test**

`src/test/board/boardApi.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { rowToTicket, rowToMessage } from "@/lib/board/boardApi";

describe("board mappers", () => {
  it("maps a ticket row (snake_case → camelCase, null-safe refs)", () => {
    const t = rowToTicket({
      id: "t1",
      title: "Button spacing",
      status: "asked_ux",
      screen_ref_journey: "Design System",
      screen_ref_note: null,
      created_by_name: "Dao",
      created_by_role: "dev",
      created_at: "2026-07-23T00:00:00Z",
      updated_at: "2026-07-23T01:00:00Z",
      ticket_messages: [{ count: 3 }],
    });
    expect(t).toMatchObject({
      id: "t1",
      title: "Button spacing",
      status: "asked_ux",
      screenRefJourney: "Design System",
      screenRefNote: null,
      createdByName: "Dao",
      createdByRole: "dev",
      replyCount: 3,
    });
  });

  it("defaults replyCount to 0 when no aggregate is present", () => {
    const t = rowToTicket({
      id: "t2", title: "x", status: "closed",
      screen_ref_journey: null, screen_ref_note: "somewhere",
      created_by_name: "A", created_by_role: "ux",
      created_at: "2026-07-23T00:00:00Z", updated_at: "2026-07-23T00:00:00Z",
    });
    expect(t.replyCount).toBe(0);
    expect(t.screenRefNote).toBe("somewhere");
  });

  it("maps a message row", () => {
    const m = rowToMessage({
      id: "m1", ticket_id: "t1", author_name: "Joey",
      author_role: "ux", body: "Use 8px", created_at: "2026-07-23T02:00:00Z",
    });
    expect(m).toEqual({
      id: "m1", ticketId: "t1", authorName: "Joey",
      authorRole: "ux", body: "Use 8px", createdAt: "2026-07-23T02:00:00Z",
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/board/boardApi.test.ts`
Expected: FAIL — cannot resolve `@/lib/board/boardApi`.

- [ ] **Step 3: Write minimal implementation**

`src/lib/board/boardApi.ts`:
```ts
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabaseClient";
import type { Ticket, TicketMessage, TicketRole, TicketStatus } from "./boardTypes";

// Board always talks to Supabase directly (the deployed site builds with
// VITE_DATA_SOURCE=supabase), independent of the app-wide mock/supabase flag.
export function getBoardClient(): SupabaseClient {
  return getSupabase();
}

// --- row → client-type mappers (exported for tests) ---

export function rowToTicket(row: any): Ticket {
  const agg = Array.isArray(row.ticket_messages) ? row.ticket_messages[0] : undefined;
  return {
    id: row.id,
    title: row.title,
    status: row.status,
    screenRefJourney: row.screen_ref_journey ?? null,
    screenRefNote: row.screen_ref_note ?? null,
    createdByName: row.created_by_name,
    createdByRole: row.created_by_role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    replyCount: agg?.count ?? 0,
  };
}

export function rowToMessage(row: any): TicketMessage {
  return {
    id: row.id,
    ticketId: row.ticket_id,
    authorName: row.author_name,
    authorRole: row.author_role,
    body: row.body,
    createdAt: row.created_at,
  };
}

// --- queries ---

export async function fetchTickets(client: SupabaseClient): Promise<Ticket[]> {
  const { data, error } = await client
    .from("tickets")
    .select("*, ticket_messages(count)")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToTicket);
}

export async function fetchThread(
  client: SupabaseClient,
  ticketId: string
): Promise<{ ticket: Ticket; messages: TicketMessage[] }> {
  const { data: ticketRow, error: tErr } = await client
    .from("tickets")
    .select("*")
    .eq("id", ticketId)
    .single();
  if (tErr) throw tErr;
  const { data: msgRows, error: mErr } = await client
    .from("ticket_messages")
    .select("*")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });
  if (mErr) throw mErr;
  return { ticket: rowToTicket(ticketRow), messages: (msgRows ?? []).map(rowToMessage) };
}

export interface CreateTicketInput {
  title: string;
  createdByName: string;
  createdByRole: TicketRole;
  screenRefJourney: string | null;
  screenRefNote: string | null;
  firstMessage: string;
}

export async function createTicket(client: SupabaseClient, input: CreateTicketInput): Promise<string> {
  const { data, error } = await client
    .from("tickets")
    .insert({
      title: input.title,
      created_by_name: input.createdByName,
      created_by_role: input.createdByRole,
      screen_ref_journey: input.screenRefJourney,
      screen_ref_note: input.screenRefNote,
    })
    .select("id")
    .single();
  if (error) throw error;
  const ticketId = data.id as string;
  await postMessage(client, {
    ticketId,
    authorName: input.createdByName,
    authorRole: input.createdByRole,
    body: input.firstMessage,
  });
  return ticketId;
}

export interface PostMessageInput {
  ticketId: string;
  authorName: string;
  authorRole: TicketRole;
  body: string;
}

export async function postMessage(client: SupabaseClient, input: PostMessageInput): Promise<void> {
  const { error } = await client.from("ticket_messages").insert({
    ticket_id: input.ticketId,
    author_name: input.authorName,
    author_role: input.authorRole,
    body: input.body,
  });
  if (error) throw error;
  const { error: bumpErr } = await client
    .from("tickets")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", input.ticketId);
  if (bumpErr) throw bumpErr;
}

export async function updateStatus(
  client: SupabaseClient,
  ticketId: string,
  status: TicketStatus
): Promise<void> {
  const { error } = await client
    .from("tickets")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", ticketId);
  if (error) throw error;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/test/board/boardApi.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/board/boardApi.ts src/test/board/boardApi.test.ts
git commit -m "feat(board): supabase API + row mappers for tickets"
```

---

### Task 5: Status + Role chips

**Files:**
- Create: `src/components/board/StatusChip.tsx`
- Create: `src/components/board/RoleChip.tsx`
- Test: `src/test/board/boardChips.test.tsx`

**Interfaces:**
- Consumes: `STATUS_META`, `ROLE_META`, `TicketStatus`, `TicketRole` from `boardTypes.ts`; `Badge` from `@/components/ui/badge`.
- Produces: `<StatusChip status={TicketStatus} />` and `<RoleChip role={TicketRole} />` (default exports).

- [ ] **Step 1: Write the failing test**

`src/test/board/boardChips.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StatusChip from "@/components/board/StatusChip";
import RoleChip from "@/components/board/RoleChip";

describe("board chips", () => {
  it("renders the status label", () => {
    render(<StatusChip status="waiting_po" />);
    expect(screen.getByText("Waiting on PO")).toBeInTheDocument();
  });

  it("renders the role label", () => {
    render(<RoleChip role="ux" />);
    expect(screen.getByText("UX")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/board/boardChips.test.tsx`
Expected: FAIL — cannot resolve the chip modules.

- [ ] **Step 3: Write minimal implementation**

`src/components/board/StatusChip.tsx`:
```tsx
import { Badge } from "@/components/ui/badge";
import { STATUS_META, TicketStatus } from "@/lib/board/boardTypes";

const StatusChip = ({ status }: { status: TicketStatus }) => {
  const meta = STATUS_META[status];
  return (
    <Badge variant="outline" className={meta.className}>
      {meta.label}
    </Badge>
  );
};

export default StatusChip;
```

`src/components/board/RoleChip.tsx`:
```tsx
import { Badge } from "@/components/ui/badge";
import { ROLE_META, TicketRole } from "@/lib/board/boardTypes";

const RoleChip = ({ role }: { role: TicketRole }) => {
  const meta = ROLE_META[role];
  return (
    <Badge variant="outline" className={meta.className}>
      {meta.label}
    </Badge>
  );
};

export default RoleChip;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/test/board/boardChips.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/board/StatusChip.tsx src/components/board/RoleChip.tsx src/test/board/boardChips.test.tsx
git commit -m "feat(board): status + role chips"
```

---

### Task 6: New-topic modal

**Files:**
- Create: `src/components/board/NewTopicModal.tsx`

**Interfaces:**
- Consumes: `Dialog*`, `Input`, `Label`, `Textarea`, `Button`, `Select*` from `@/components/ui/*`; `getIdentity`/`setIdentity` from `identity.ts`; `JOURNEY_OPTIONS`, `ROLE_META`, `TicketRole` from `boardTypes.ts`.
- Produces: `<NewTopicModal open onOpenChange onCreate />` where
  `onCreate: (input: { title; createdByName; createdByRole; screenRefJourney; screenRefNote; firstMessage }) => Promise<void>`.
  The modal pre-fills name/role from `getIdentity()`, calls `setIdentity()` on submit, validates that title + name + first message are non-empty, and closes on success.

- [ ] **Step 1: Implement the component**

`src/components/board/NewTopicModal.tsx`:
```tsx
import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { JOURNEY_OPTIONS, ROLE_META, TicketRole } from "@/lib/board/boardTypes";
import { getIdentity, setIdentity } from "@/lib/board/identity";
import type { CreateTicketInput } from "@/lib/board/boardApi";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (input: CreateTicketInput) => Promise<void>;
}

const NONE = "__none__";

const NewTopicModal = ({ open, onOpenChange, onCreate }: Props) => {
  const [name, setName] = useState("");
  const [role, setRole] = useState<TicketRole>("dev");
  const [title, setTitle] = useState("");
  const [firstMessage, setFirstMessage] = useState("");
  const [journey, setJourney] = useState<string>(NONE);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Pre-fill identity from localStorage whenever the modal opens.
  useEffect(() => {
    if (!open) return;
    const id = getIdentity();
    if (id) {
      setName(id.name);
      setRole(id.role);
    }
  }, [open]);

  const canSubmit = title.trim() && name.trim() && firstMessage.trim() && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      setIdentity({ name: name.trim(), role });
      await onCreate({
        title: title.trim(),
        createdByName: name.trim(),
        createdByRole: role,
        screenRefJourney: journey === NONE ? null : journey,
        screenRefNote: note.trim() || null,
        firstMessage: firstMessage.trim(),
      });
      // reset topic fields (keep identity)
      setTitle("");
      setFirstMessage("");
      setJourney(NONE);
      setNote("");
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New topic</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topic-title">Title</Label>
            <Input id="topic-title" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="What do you want to discuss?" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="topic-name">Your name</Label>
              <Input id="topic-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="topic-role">Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as TicketRole)}>
                <SelectTrigger id="topic-role" className="bg-background"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover">
                  {(Object.keys(ROLE_META) as TicketRole[]).map((r) => (
                    <SelectItem key={r} value={r}>{ROLE_META[r].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="topic-message">Message</Label>
            <Textarea id="topic-message" value={firstMessage} rows={4}
              onChange={(e) => setFirstMessage(e.target.value)} placeholder="Describe the question or issue" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="topic-journey">Screen (optional)</Label>
              <Select value={journey} onValueChange={setJourney}>
                <SelectTrigger id="topic-journey" className="bg-background">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value={NONE}>None</SelectItem>
                  {JOURNEY_OPTIONS.map((j) => (
                    <SelectItem key={j} value={j}>{j}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="topic-note">Ref note (optional)</Label>
              <Input id="topic-note" value={note} onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. specific button / free text" />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={!canSubmit}>Create topic</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewTopicModal;
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/board/NewTopicModal.tsx
git commit -m "feat(board): new-topic modal with identity pre-fill"
```

---

### Task 7: Board list view + route

**Files:**
- Create: `src/views/board/BoardListView.tsx`
- Modify: `src/App.tsx` (add `import BoardListView` and `<Route path="/board" element={<BoardListView />} />` in the public routes block, near line 64)

**Interfaces:**
- Consumes: `fetchTickets`, `createTicket`, `getBoardClient` from `boardApi.ts`; `STATUS_ORDER`, `STATUS_META`, `TicketStatus`, `Ticket` from `boardTypes.ts`; `StatusChip`, `RoleChip`, `NewTopicModal`; `Card`, `Button` from ui; `useNavigate` from react-router-dom; `useToast` from `@/hooks/use-toast`.
- Produces: default-exported `BoardListView` rendering the header + filter chips + card list; clicking a card navigates to `/board/:id`.

- [ ] **Step 1: Implement the view**

`src/views/board/BoardListView.tsx`:
```tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Logo from "@/components/Logo";
import StatusChip from "@/components/board/StatusChip";
import RoleChip from "@/components/board/RoleChip";
import NewTopicModal from "@/components/board/NewTopicModal";
import { fetchTickets, createTicket, getBoardClient, CreateTicketInput } from "@/lib/board/boardApi";
import { STATUS_META, STATUS_ORDER, Ticket, TicketStatus } from "@/lib/board/boardTypes";
import { useToast } from "@/hooks/use-toast";

const fmt = (s: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(s));

const BoardListView = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TicketStatus | "all">("all");
  const [modalOpen, setModalOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setTickets(await fetchTickets(getBoardClient()));
    } catch (e) {
      toast({ title: "Could not load the board", description: String(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (input: CreateTicketInput) => {
    const id = await createTicket(getBoardClient(), input);
    navigate(`/board/${id}`);
  };

  const shown = filter === "all" ? tickets : tickets.filter((t) => t.status === filter);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Logo size="sm" />
            <div className="hidden h-6 w-px bg-border sm:block" />
            <h1 className="text-lg font-semibold text-foreground">Support board</h1>
          </div>
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New topic
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 flex flex-wrap gap-2">
          <FilterChip label="All" active={filter === "all"} onClick={() => setFilter("all")} />
          {STATUS_ORDER.map((s) => (
            <FilterChip key={s} label={STATUS_META[s].label} active={filter === s} onClick={() => setFilter(s)} />
          ))}
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : shown.length === 0 ? (
          <p className="text-sm text-muted-foreground">No topics yet. Start one with “New topic”.</p>
        ) : (
          <div className="space-y-3">
            {shown.map((t) => (
              <Card key={t.id} className="cursor-pointer p-4 transition-colors hover:bg-accent"
                onClick={() => navigate(`/board/${t.id}`)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="mb-1 flex items-center gap-2">
                      <StatusChip status={t.status} />
                      <RoleChip role={t.createdByRole} />
                    </div>
                    <p className="truncate font-medium text-foreground">{t.title}</p>
                    <p className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" /> {t.replyCount ?? 0}
                      </span>
                      <span>Updated {fmt(t.updatedAt)}</span>
                      {(t.screenRefJourney || t.screenRefNote) && (
                        <span className="truncate">· {t.screenRefJourney ?? t.screenRefNote}</span>
                      )}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <NewTopicModal open={modalOpen} onOpenChange={setModalOpen} onCreate={handleCreate} />
    </div>
  );
};

const FilterChip = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
  <button type="button" onClick={onClick}
    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
      active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground hover:bg-accent"
    }`}>
    {label}
  </button>
);

export default BoardListView;
```

- [ ] **Step 2: Add the route in `src/App.tsx`**

Add with the other imports (after line 22):
```tsx
import BoardListView from "./views/board/BoardListView";
```
Add inside `<Routes>`, in the public block (after the `/pdpa` route, ~line 64):
```tsx
<Route path="/board" element={<BoardListView />} />
```

- [ ] **Step 3: Typecheck + build**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/views/board/BoardListView.tsx src/App.tsx
git commit -m "feat(board): board list view + /board route"
```

---

### Task 8: Thread view + route

**Files:**
- Create: `src/views/board/BoardThreadView.tsx`
- Modify: `src/App.tsx` (add `import BoardThreadView` and `<Route path="/board/:id" element={<BoardThreadView />} />`)

**Interfaces:**
- Consumes: `fetchThread`, `postMessage`, `updateStatus`, `getBoardClient` from `boardApi.ts`; `STATUS_ORDER`, `STATUS_META`, `Ticket`, `TicketMessage`, `TicketStatus` from `boardTypes.ts`; `getIdentity`, `setIdentity` from `identity.ts`; `StatusChip`, `RoleChip`; `Select*`, `Textarea`, `Input`, `Button`, `Card` from ui; `useParams`, `useNavigate` from react-router-dom; `useToast`.
- Produces: default-exported `BoardThreadView`. Loads the ticket + messages by `:id`, shows a status dropdown (calls `updateStatus`), lists messages oldest→newest, and a reply composer that requires name+role (pre-filled from identity) before posting.

- [ ] **Step 1: Implement the view**

`src/views/board/BoardThreadView.tsx`:
```tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import Logo from "@/components/Logo";
import RoleChip from "@/components/board/RoleChip";
import { fetchThread, postMessage, updateStatus, getBoardClient } from "@/lib/board/boardApi";
import {
  ROLE_META, STATUS_META, STATUS_ORDER, Ticket, TicketMessage, TicketRole, TicketStatus,
} from "@/lib/board/boardTypes";
import { getIdentity, setIdentity } from "@/lib/board/identity";
import { useToast } from "@/hooks/use-toast";

const fmt = (s: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(s));

const BoardThreadView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [role, setRole] = useState<TicketRole>("dev");
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { ticket, messages } = await fetchThread(getBoardClient(), id);
      setTicket(ticket);
      setMessages(messages);
    } catch (e) {
      toast({ title: "Could not load this topic", description: String(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  useEffect(() => {
    const stored = getIdentity();
    if (stored) { setName(stored.name); setRole(stored.role); }
  }, []);

  const handleStatus = async (next: TicketStatus) => {
    if (!ticket) return;
    const prev = ticket.status;
    setTicket({ ...ticket, status: next });
    try {
      await updateStatus(getBoardClient(), ticket.id, next);
    } catch (e) {
      setTicket({ ...ticket, status: prev });
      toast({ title: "Could not change status", description: String(e), variant: "destructive" });
    }
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !name.trim() || !body.trim() || posting) return;
    setPosting(true);
    try {
      setIdentity({ name: name.trim(), role });
      await postMessage(getBoardClient(), { ticketId: id, authorName: name.trim(), authorRole: role, body: body.trim() });
      setBody("");
      await load();
    } catch (err) {
      toast({ title: "Could not post", description: String(err), variant: "destructive" });
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/board")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Board
            </Button>
            <div className="hidden h-6 w-px bg-border sm:block" />
            <div className="hidden sm:block"><Logo size="sm" /></div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : !ticket ? (
          <p className="text-sm text-muted-foreground">Topic not found.</p>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="mb-2 text-xl font-semibold text-foreground">{ticket.title}</h1>
              <div className="flex flex-wrap items-center gap-3">
                <Select value={ticket.status} onValueChange={(v) => handleStatus(v as TicketStatus)}>
                  <SelectTrigger className="h-8 w-44 bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-popover">
                    {STATUS_ORDER.map((s) => (
                      <SelectItem key={s} value={s}>{STATUS_META[s].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(ticket.screenRefJourney || ticket.screenRefNote) && (
                  <span className="text-xs text-muted-foreground">
                    {ticket.screenRefJourney}{ticket.screenRefJourney && ticket.screenRefNote ? " · " : ""}{ticket.screenRefNote}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {messages.map((m) => (
                <Card key={m.id} className="p-4">
                  <div className="mb-1 flex items-center gap-2 text-sm">
                    <span className="font-medium text-foreground">{m.authorName}</span>
                    <RoleChip role={m.authorRole} />
                    <span className="text-xs text-muted-foreground">{fmt(m.createdAt)}</span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-foreground">{m.body}</p>
                </Card>
              ))}
            </div>

            <form onSubmit={handlePost} className="mt-6 space-y-3 border-t border-border pt-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="reply-name">Your name</Label>
                  <Input id="reply-name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reply-role">Role</Label>
                  <Select value={role} onValueChange={(v) => setRole(v as TicketRole)}>
                    <SelectTrigger id="reply-role" className="bg-background"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-popover">
                      {(Object.keys(ROLE_META) as TicketRole[]).map((r) => (
                        <SelectItem key={r} value={r}>{ROLE_META[r].label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Textarea value={body} rows={3} onChange={(e) => setBody(e.target.value)} placeholder="Write a reply…" />
              <div className="flex justify-end">
                <Button type="submit" disabled={!name.trim() || !body.trim() || posting}>Post reply</Button>
              </div>
            </form>
          </>
        )}
      </main>
    </div>
  );
};

export default BoardThreadView;
```

- [ ] **Step 2: Add the route in `src/App.tsx`**

Add with the imports:
```tsx
import BoardThreadView from "./views/board/BoardThreadView";
```
Add inside `<Routes>`, right after the `/board` route:
```tsx
<Route path="/board/:id" element={<BoardThreadView />} />
```

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/views/board/BoardThreadView.tsx src/App.tsx
git commit -m "feat(board): thread view with reply + status dropdown"
```

---

### Task 9: Link from Build Status page

**Files:**
- Modify: `src/stories/BuildStatus.mdx` (add a link block near the top, after line 11)

**Interfaces:**
- Consumes: nothing (static MDX).
- Produces: a visible link to `https://mytrails.theingress.co/board`.

- [ ] **Step 1: Add the link block**

In `src/stories/BuildStatus.mdx`, after the intro paragraph (the `**"UX verified"** = …` block ending around line 11), insert:

```mdx
---

> 💬 **มีคำถาม UI/UX ถาม UX?** เปิดเรื่องที่ [**Support board → mytrails.theingress.co/board**](https://mytrails.theingress.co/board)
> — ตั้งหัวข้อได้เอง คุยเป็นเรื่องๆ (แทน Discord ที่กระจัดกระจาย)
```

- [ ] **Step 2: Verify Storybook builds**

Run: `npm run build-storybook` (or `npm run storybook:deploy` if that is the build script)
Expected: build completes without MDX errors.

- [ ] **Step 3: Commit**

```bash
git add src/stories/BuildStatus.mdx
git commit -m "docs(board): link the support board from Build Status"
```

---

### Task 10: Full-suite check + live verification

**Files:** none (verification only).

- [ ] **Step 1: Run the whole test suite**

Run: `npm run test`
Expected: all tests pass (existing 87 + the new board tests).

- [ ] **Step 2: Typecheck + production build (supabase mode)**

Run: `npm run typecheck && VITE_DATA_SOURCE=supabase npm run build`
Expected: no type errors; build succeeds. (Deploy build MUST use `VITE_DATA_SOURCE=supabase` per project convention.)

- [ ] **Step 3: Verify live with Playwright MCP**

After deploying/serving the supabase build behind Caddy, use the Playwright MCP tools against `https://mytrails.theingress.co/board`:
1. `browser_navigate` to `/board` → snapshot shows the board shell + "New topic".
2. Create a topic via the modal (fill name=`QA`, role=Dev, title=`__smoke__`, message=`test`) → lands on `/board/:id`.
3. Change status to "Answered" via the dropdown → chip updates.
4. Post a reply → appears in the thread.
5. `browser_console_messages` → no errors.
6. Navigate back to `/board` → the topic shows status Answered + reply count 1.

- [ ] **Step 4: Clean up the smoke topic**

Use `mcp__supabase__execute_sql`:
```sql
delete from public.tickets where title = '__smoke__';
```
(Cascade removes its messages.)

- [ ] **Step 5: Update Build Status timestamp (optional, ask Joey)**

The board itself is a dev tool, not a user-facing MyTrails flow, so it does not need a Build Status row. Mention to Joey that the board is live; let him decide whether to note it.
```
```
```

---

## Self-Review

**Spec coverage:**
- Data model (2 tables, exact columns, dual screen_ref) → Task 1 (SQL) + Task 2 (types) + Task 4 (mappers). ✓
- 5-status workflow → Task 2 (`STATUS_META`/`STATUS_ORDER`), Task 5 (chip), Task 8 (dropdown). ✓
- Board screen (`/board`, filter chips, cards sorted by updated_at, reply count) → Task 7 + Task 4 (`fetchTickets` orders desc, reply count aggregate). ✓
- Thread screen (`/board/:id`, oldest→newest, status dropdown, composer) → Task 8. ✓
- New-topic modal (title required, name+role, dropdown + free-text ref) → Task 6. ✓
- No-auth identity (localStorage, pre-fill) → Task 3 + Tasks 6/8. ✓
- RLS (anon select/insert, status update, no delete) → Task 1. ✓
- Build Status link → Task 9. ✓
- Discord/out-of-scope → correctly omitted. ✓

**Placeholder scan:** No TBD/TODO; every code step shows complete code. ✓

**Type consistency:** `CreateTicketInput`/`PostMessageInput` defined in Task 4 and consumed by name in Tasks 6/7/8; `Ticket`/`TicketMessage`/`TicketStatus`/`TicketRole` from Task 2 used consistently; `getBoardClient` defined in Task 4 and used in Tasks 7/8; field names (`screenRefJourney`, `screenRefNote`, `createdByRole`, `replyCount`) consistent across mapper, views, and modal. ✓
