// Explicit .ts extensions + `import type`: scripts/board-notify.ts runs this module
// through node --experimental-strip-types, which resolves imports the same way Node does.
import { ROLE_META, STATUS_META } from "./boardTypes.ts";
import type { TicketRole, TicketStatus } from "./boardTypes.ts";

/** A new board message, joined with the topic it belongs to. */
export interface NotifyMessage {
  id: string;
  ticketId: string;
  ticketTitle: string;
  ticketStatus: TicketStatus;
  authorName: string;
  authorRole: TicketRole;
  body: string;
  createdAt: string;
}

const BOARD_URL = "https://mytrails.theingress.co/board";
const MAX_TOPICS = 5;
const BODY_LIMIT = 80;

// Timestamps all come from Postgres in the same ISO shape, so plain string
// comparison orders them correctly — no Date parsing needed.
const byString = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

/** Newest createdAt in the batch — what the caller stores once the push succeeds. */
export function nextCheckpoint(messages: NotifyMessage[]): string | null {
  if (messages.length === 0) return null;
  return messages.reduce((max, m) => (m.createdAt > max ? m.createdAt : max), messages[0].createdAt);
}

function preview(body: string): string {
  const flat = body.replace(/\s+/g, " ").trim();
  return flat.length > BODY_LIMIT ? `${flat.slice(0, BODY_LIMIT)}…` : flat;
}

/** One LINE message for the whole batch, grouped by topic. Empty batch → "". */
export function formatDigest(messages: NotifyMessage[]): string {
  if (messages.length === 0) return "";

  const byTicket = new Map<string, NotifyMessage[]>();
  for (const m of messages) {
    const existing = byTicket.get(m.ticketId);
    if (existing) existing.push(m);
    else byTicket.set(m.ticketId, [m]);
  }

  const topics = [...byTicket.values()]
    .map((list) => {
      const sorted = [...list].sort((a, b) => byString(a.createdAt, b.createdAt));
      return { latest: sorted[sorted.length - 1], count: sorted.length };
    })
    .sort((a, b) => byString(b.latest.createdAt, a.latest.createdAt));

  const blocks = topics.slice(0, MAX_TOPICS).map(({ latest, count }) => {
    const countSuffix = count > 1 ? ` · ${count} ข้อความ` : "";
    return [
      `▸ ${latest.ticketTitle} [${STATUS_META[latest.ticketStatus].label}]${countSuffix}`,
      `  ${latest.authorName} (${ROLE_META[latest.authorRole].label}): ${preview(latest.body)}`,
      `  ${BOARD_URL}/${latest.ticketId}`,
    ].join("\n");
  });

  const parts = [`🎫 MyTrails board — ${messages.length} ข้อความใหม่`, "", blocks.join("\n\n")];
  const hidden = topics.length - blocks.length;
  if (hidden > 0) parts.push("", `…และอีก ${hidden} เรื่อง`);
  return parts.join("\n");
}
