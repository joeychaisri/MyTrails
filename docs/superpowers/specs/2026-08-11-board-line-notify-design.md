# Support Board → LINE Notify — Design Spec

**Date:** 2026-08-11
**Status:** Approved (design), ready for implementation
**Owner:** Joey (UX)
**Related:** [Support Ticket Board design](2026-07-23-support-ticket-board-design.md)

## Purpose

The support board at `/board` has no notifications — Joey only finds out about a new
question or reply by opening the page. Devs are blocked in the meantime. Push a LINE
message to Joey when new activity lands on the board.

## Scope

**In:** new messages (which covers both "new topic" and "reply", because creating a
topic always inserts its first message row).

**Out:** status changes, per-dev notifications, quiet hours, in-app unread badges.
Recipient is Joey only — no recipient mapping, no LINE group.

## Approach

A standalone **systemd oneshot + timer** on the VPS polls Supabase every 15 minutes
for message rows newer than a stored checkpoint, formats them into one digest, and
pushes it to Joey's LINE channel.

### Why polling and not a Supabase webhook

The board is a static SPA served from `dist/` by Caddy — there is no server to receive
a webhook. A `pg_net` trigger would require enabling the extension (not installed on
this project), a new service + port + Caddy route + shared secret, and it fires
without retry: a failed delivery is lost forever. Polling costs ~37 seconds of CPU per
day at 15-minute intervals (measured under systemd: 386 ms CPU per run) and survives
downtime, because the checkpoint only advances after a successful push.

An n8n workflow was also rejected: its logic would live outside the repo with no tests
— the same problem already noted for competitor-ads.

## Architecture

```
board-notify.timer  (OnUnitActiveSec=15min)
  └─ board-notify.service  (Type=oneshot)
       └─ node --experimental-strip-types scripts/board-notify.ts
            1. read checkpoint  ← data/board-notify-state.json
            2. GET support_ticket_messages?created_at=gt.<checkpoint>
                   &select=id,ticket_id,author_name,author_role,body,created_at,
                           support_tickets(title,status)
                   &order=created_at.asc
            3. no rows        → exit 0, checkpoint untouched
            4. rows           → formatDigest() → pushLine()
            5. push succeeded → write checkpoint = max(created_at)
```

**The checkpoint advances only after LINE returns 200.** Any failure (Supabase down,
LINE down, VPS rebooting) leaves it in place, so the next tick re-sends the whole
batch. Nothing is silently dropped.

### Units

| Unit | Responsibility | Depends on |
|---|---|---|
| `src/lib/board/notify.ts` | Pure: `formatDigest(messages)`, `nextCheckpoint(messages)`. No I/O, no imports beyond board types. | `boardTypes.ts` |
| `scripts/board-notify.ts` | I/O shell: read state, query Supabase, call the pure functions, push LINE, write state. | `notify.ts`, `~/.hermes/.env` |
| `board-notify.service/.timer` | Scheduling. | the script |

The split exists so the formatting rules are unit-testable without a network, a
database, or a LINE token — matching the existing `src/lib/` convention.

**Runtime:** the script runs under `node --experimental-strip-types` (Node 22.23 on
this VPS) rather than `tsx`, and queries PostgREST with plain `fetch` rather than
`@supabase/supabase-js`. Both choices are about per-run cost: tsx re-transpiles on
every start (1.43 s CPU) and the Supabase client adds another ~0.5 s and ~70 MB for
what is a single anonymous GET. The current shape costs 386 ms. The trade-off is that
relative imports in `notify.ts` and the script need explicit `.ts` extensions and
`import type` for type-only imports — `allowImportingTsExtensions` is already on, so
vite, vitest and `tsc` are unaffected.

## Data

No schema changes. Reads `support_ticket_messages` joined to `support_tickets` via the
existing `support_ticket_messages_ticket_id_fkey`. No index is added: the table holds
a handful of rows and a sequential scan is free at this size.

**State file** — `data/board-notify-state.json` (gitignored, atomic write via
tmp + rename):

```json
{ "lastSeenAt": "2026-08-11T07:52:41.183422+00:00" }
```

## Credentials

| What | Where | Note |
|---|---|---|
| Supabase URL | `MYTRAILS_SUPABASE_URL` in `~/.env.secrets` | already present |
| Supabase key | `MYTRAILS_SUPABASE_ANON_KEY` in `~/.env.secrets` | **to add** — anon is enough, RLS already grants anon select |
| LINE token + target | `LINE_CHANNEL_ACCESS_TOKEN`, `LINE_HOME_CHANNEL` in `~/.hermes/.env` | same source `life-dashboard/lib/line.ts` uses |

The service loads `~/.env.secrets` via `EnvironmentFile`; the script reads
`~/.hermes/.env` itself. No secret is passed on the command line.

## Message format

One LINE message per tick, grouped by topic:

```
🎫 MyTrails board — 3 ข้อความใหม่

▸ ปุ่ม Submit ใน EventWizard ควรอยู่ตรงไหน  [Asked UX]
  Nan (Dev): ตอนนี้ปุ่มอยู่ล่างสุด ต้องเลื่อนจอลงไปกดทุกครั้ง…
  https://mytrails.theingress.co/board/05f20104-82d7-44af-9bdb-ad8823de1974

▸ สีของ status chip  [Answered] · 2 ข้อความ
  Joey (UX): ใช้ --mt-brand ตามเดิมนะ
  https://mytrails.theingress.co/board/8a3c91b2-...
```

Rules:

- Header counts messages, not topics; singular/plural is not distinguished (Thai).
- Topics ordered by their newest message, newest first.
- Per topic: title, status label (the existing `STATUS_META` labels), and `· N ข้อความ`
  only when that topic has more than one new message.
- Body preview: the **newest** message of that topic, truncated to 80 characters with
  a trailing `…`; newlines collapsed to spaces.
- At most 5 topics, then a final line `…และอีก N เรื่อง`.
- Author rendered as `Name (Role)` using the existing role labels.

## Error handling

| Case | Behaviour |
|---|---|
| First run / missing / corrupt state file | Treat as first run: set checkpoint to *now*, send nothing. Prevents dumping history into LINE. |
| Supabase error | Log, exit non-zero, checkpoint untouched. |
| LINE non-2xx or timeout | Log, exit non-zero, checkpoint untouched → next tick retries the batch. |
| No new messages | Exit 0 silently. |
| Joey's own messages | Included — no author filtering, by decision. Doubles as a delivery receipt. |

The script never partially advances the checkpoint: it is written once, after a
successful push, to `max(created_at)` of the batch.

## Testing

**Unit (vitest, `src/test/board/notify.test.ts`)** — against the pure module only:

- `formatDigest`: single message; multiple messages in one topic (count suffix +
  newest body wins); multiple topics ordered by newest; body truncation at 80 chars;
  newline collapsing; more than 5 topics produces the `…และอีก N เรื่อง` line.
- `nextCheckpoint`: returns the max `created_at`; returns `null` for an empty array.

**Manual verification** — post a test message on the live board, run
`sudo systemctl start board-notify`, confirm the LINE push arrives and
`journalctl -u board-notify` is clean, then delete the test rows.

## Out of scope / possible follow-ups

Quiet hours, notifying on status change, per-dev recipients, in-app unread markers,
and message edit/delete. None are needed at the board's current traffic (1 topic).
