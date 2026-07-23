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
