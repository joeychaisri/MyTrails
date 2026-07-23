# Support Ticket Board — Design Spec

**Date:** 2026-07-23
**Status:** Approved (design), pending implementation plan
**Owner:** Joey (UX)

## Purpose

Replace scattered Discord chat with an in-app board where multiple devs can raise
per-topic UI/UX questions and Joey (UX owner) — plus PO when needed — can answer,
each topic as its own thread. Lives inside the MyTrails app as a public route so
no one needs an account.

## Approach

**Approach A** — a public route in the main MyTrails app (`/board`), backed by the
existing Supabase project and reusing the app's Supabase client + shadcn design
system. No new backend service, no auth. Linked prominently from the Build Status
page in the `/journey` Storybook catalog.

## Data model

Two new tables in the existing Supabase project. Independent of `events`/`organizers`
— no changes to existing policies. Named with a `support_` prefix because a `tickets`
table already exists (event ticket-types, live data) and must not be touched.

### `support_tickets`
| column | type | notes |
|---|---|---|
| `id` | uuid pk | `default gen_random_uuid()` |
| `title` | text not null | topic title |
| `status` | text not null | `default 'asked_ux'`; one of the status keys below |
| `screen_ref_journey` | text null | optional — key/label of a journey or screen picked from a dropdown |
| `screen_ref_note` | text null | optional — free-text reference typed by hand |
| `created_by_name` | text not null | poster's name |
| `created_by_role` | text not null | `dev` \| `ux` \| `po` |
| `created_at` | timestamptz not null | `default now()` |
| `updated_at` | timestamptz not null | `default now()`; bumped on new message or status change |

`screen_ref` is expressed as two optional fields — a dropdown selection
(`screen_ref_journey`) **and** a free-text note (`screen_ref_note`). Either, both,
or neither may be set.

### `support_ticket_messages`
| column | type | notes |
|---|---|---|
| `id` | uuid pk | `default gen_random_uuid()` |
| `ticket_id` | uuid not null | fk → `support_tickets(id)` on delete cascade |
| `author_name` | text not null | |
| `author_role` | text not null | `dev` \| `ux` \| `po` |
| `body` | text not null | message text |
| `created_at` | timestamptz not null | `default now()` |

One ticket = one topic with a thread of messages.

## Status workflow

Status is a colored chip. No auth means anyone can move it; roles are informational.

| key | label | color | meaning | who moves it (by convention) |
|---|---|---|---|---|
| `asked_ux` | Asked UX | 🔵 blue | new topic, waiting for UX | auto on create |
| `in_progress` | In progress | 🟡 yellow | UX picked it up, thinking/working | UX |
| `waiting_po` | Waiting on PO | 🟣 purple | needs PO to decide | UX |
| `answered` | Answered | 🟢 green | UX/PO answered, dev can proceed | UX/PO |
| `closed` | Closed | ⚫ gray | topic done, archived | anyone (optional) |

`closed` is optional — a way to archive a finished topic. `answered` can also be
left as the terminal state without closing.

## Screens

Reuse the existing shadcn + card design system.

### Board — `/board`
- Header with title + **"+ New topic"** button (top right).
- Filter chip row: All / Asked UX / In progress / Waiting PO / Answered / Closed.
- Ticket list as cards, sorted by `updated_at` descending (most recent on top). Each card shows:
  - status chip (colored) · title · role chip of the creator (Dev/UX/PO)
  - meta line: reply count · last-updated time · screen ref (journey and/or note, if set)
- Clicking a card opens its thread.

### Thread — `/board/:id`
- Header: title + status (with an inline dropdown to change status) + link/label of screen ref if set.
- Messages listed oldest → newest. Each shows: name · role chip · time · body.
- Reply composer at the bottom. Before the first post in a session, the user fills in
  **name + role**; these are remembered in `localStorage` so subsequent posts don't re-prompt.

### "+ New topic" modal
- Fields: `title` (required) · poster name + role · first message body · `screen_ref_journey`
  dropdown (optional, list of the 12 journeys/screens) · `screen_ref_note` free text (optional).
- On submit: creates a ticket with status `asked_ux` and its first `support_ticket_messages` row.

## Identity (no auth)

- No login/password. On first post/reply the user enters name + selects role
  (Dev/UX/PO); stored in `localStorage` and pre-filled (editable) next time.
- Anyone with the URL can read and post. Internal team tool — not linked from any
  public-facing page.

## RLS

On both new tables, with RLS enabled:
- `anon`: **SELECT** and **INSERT** allowed (read, create topics, reply).
- **UPDATE** on `support_tickets` allowed but restricted to `status` + `updated_at`
  (so status can be moved); no other column updates.
- **No DELETE** policy (prevents accidental loss — use `closed` to archive).
- `support_ticket_messages`: SELECT + INSERT only (messages are append-only; no edit/delete).
- These tables are separate from `events`/`organizers`/`tickets`; existing policies are untouched.

## Out of scope (v1)

- **Discord bridge** — deliberately dropped from v1. Board is the single source of
  truth. A webhook ping on new/answered topics can be added later without schema change.
- Auth, email notifications, attachments, edit/delete of messages, real-time
  subscriptions (plain fetch/refresh is fine for team size).

## Entry point

A prominent link/button on the **Build Status** page in `/journey` (Storybook)
pointing to `mytrails.theingress.co/board`.
