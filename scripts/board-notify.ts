/**
 * Support board → LINE notifier.
 *
 * Polls support_ticket_messages for rows newer than the stored checkpoint, pushes one
 * digest to Joey's LINE, then advances the checkpoint — in that order, so a failed
 * push is retried on the next tick instead of being lost.
 *
 * Run:  node --experimental-strip-types scripts/board-notify.ts
 * Prod: board-notify.timer → board-notify.service (every 15 min)
 *
 * Design: docs/superpowers/specs/2026-08-11-board-line-notify-design.md
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { formatDigest, nextCheckpoint } from "../src/lib/board/notify.ts";
import type { NotifyMessage } from "../src/lib/board/notify.ts";
import type { TicketRole, TicketStatus } from "../src/lib/board/boardTypes.ts";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const STATE_FILE = path.join(repoRoot, "data", "board-notify-state.json");
const HERMES_ENV = path.join(os.homedir(), ".hermes", ".env");

/** Stored checkpoint, or null when there is no usable state (first run / corrupt file). */
function readCheckpoint(): string | null {
  try {
    const parsed = JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
    return typeof parsed?.lastSeenAt === "string" ? parsed.lastSeenAt : null;
  } catch {
    return null;
  }
}

function writeCheckpoint(lastSeenAt: string): void {
  fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
  const tmp = `${STATE_FILE}.tmp`;
  fs.writeFileSync(tmp, `${JSON.stringify({ lastSeenAt }, null, 2)}\n`);
  fs.renameSync(tmp, STATE_FILE);
}

/** Same source life-dashboard/lib/line.ts uses — LINE creds live in ~/.hermes/.env. */
function readHermesEnv(): Record<string, string> {
  const out: Record<string, string> = {};
  let text: string;
  try {
    text = fs.readFileSync(HERMES_ENV, "utf8");
  } catch {
    return out;
  }
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx < 0) continue;
    let value = line.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    out[line.slice(0, idx).trim()] = value;
  }
  return out;
}

async function pushLine(text: string): Promise<void> {
  const env = readHermesEnv();
  const token = env.LINE_CHANNEL_ACCESS_TOKEN;
  const to = env.LINE_HOME_CHANNEL;
  if (!token || !to) throw new Error(`missing LINE_CHANNEL_ACCESS_TOKEN / LINE_HOME_CHANNEL in ${HERMES_ENV}`);

  const res = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ to, messages: [{ type: "text", text }] }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`LINE push ${res.status}: ${(await res.text()).slice(0, 200)}`);
}

/** PostgREST returns the embedded parent as an object, but types it as a possible array. */
function ticketOf(row: any): { title: string; status: TicketStatus } {
  const t = Array.isArray(row.support_tickets) ? row.support_tickets[0] : row.support_tickets;
  return { title: t?.title ?? "(ไม่มีชื่อเรื่อง)", status: (t?.status ?? "asked_ux") as TicketStatus };
}

async function main(): Promise<void> {
  const url = process.env.MYTRAILS_SUPABASE_URL;
  const key = process.env.MYTRAILS_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("missing MYTRAILS_SUPABASE_URL / MYTRAILS_SUPABASE_ANON_KEY (source ~/.env.secrets)");

  const checkpoint = readCheckpoint();
  if (checkpoint === null) {
    const now = new Date().toISOString();
    writeCheckpoint(now);
    console.log(`first run — checkpoint set to ${now}, nothing sent`);
    return;
  }

  // Plain PostgREST call rather than @supabase/supabase-js: one anonymous GET does not
  // justify loading the client (it cost ~0.5s of CPU and ~70MB per run).
  // encodeURIComponent matters — the checkpoint's "+00:00" would otherwise arrive as a space.
  const query =
    `${url}/rest/v1/support_ticket_messages` +
    `?select=id,ticket_id,author_name,author_role,body,created_at,support_tickets(title,status)` +
    `&created_at=gt.${encodeURIComponent(checkpoint)}` +
    `&order=created_at.asc`;
  const res = await fetch(query, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`supabase ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const rows: any[] = await res.json();

  const messages: NotifyMessage[] = rows.map((row: any) => {
    const ticket = ticketOf(row);
    return {
      id: row.id,
      ticketId: row.ticket_id,
      ticketTitle: ticket.title,
      ticketStatus: ticket.status,
      authorName: row.author_name,
      authorRole: row.author_role as TicketRole,
      body: row.body,
      createdAt: row.created_at,
    };
  });

  if (messages.length === 0) {
    console.log(`no new messages since ${checkpoint}`);
    return;
  }

  await pushLine(formatDigest(messages));

  const next = nextCheckpoint(messages);
  if (next) writeCheckpoint(next);
  console.log(`pushed ${messages.length} message(s), checkpoint → ${next}`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
