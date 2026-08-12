import { Event, Ticket } from "@/data/mockData";

// Time-derived lifecycle of a public event, computed purely from dates so the
// prototype behaves like a live platform as real time passes. Distinct from
// EventStatus (the approval workflow): phases only make sense for live events.
export type EventPhase =
  | "upcoming" // before any ticket window opens
  | "registration_open" // at least one ticket window on sale, event not started
  | "registration_closed" // all windows ended (or none defined), event not started
  | "ongoing" // between event start and end (inclusive days)
  | "finished"; // after the event's last day

export type TicketWindowState = "not_yet" | "on_sale" | "ended";

const startOfDay = (d: string) => new Date(`${d}T00:00:00`);
const endOfDay = (d: string) => new Date(`${d}T23:59:59`);

export function ticketWindowState(ticket: Ticket, now: Date = new Date()): TicketWindowState {
  if (ticket.salesStart && now < new Date(ticket.salesStart)) return "not_yet";
  if (ticket.salesEnd && now > new Date(ticket.salesEnd)) return "ended";
  return "on_sale";
}

/** Earliest salesStart among the event's not-yet-open tickets, or null if none are upcoming. */
export function nextSalesOpenDate(event: Event, now: Date = new Date()): Date | null {
  const opensAt = event.categories
    .flatMap((c) => c.tickets)
    .filter((t) => ticketWindowState(t, now) === "not_yet")
    .map((t) => new Date(t.salesStart!));
  if (opensAt.length === 0) return null;
  return opensAt.reduce((earliest, d) => (d < earliest ? d : earliest));
}

export function eventPhase(event: Event, now: Date = new Date()): EventPhase {
  if (!event.date) return "upcoming"; // drafts without a date aren't public anyway

  const start = startOfDay(event.date);
  const end = endOfDay(event.endDate || event.date);
  if (now > end) return "finished";
  if (now >= start) return "ongoing";

  const states = event.categories
    .flatMap((c) => c.tickets)
    .map((t) => ticketWindowState(t, now));
  if (states.some((s) => s === "on_sale")) return "registration_open";
  if (states.some((s) => s === "not_yet")) return "upcoming";
  return "registration_closed"; // every window ended, or no tickets to sell
}
