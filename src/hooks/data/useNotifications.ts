import { useMemo } from "react";
import { useEventsStore } from "@/contexts/EventsContext";

// In-app notifications for the ORGANIZER side, derived on the fly from the
// shared store (events + registrations) — nothing is persisted, so this works
// identically in mock and supabase modes and never needs a schema change.
// Each notification doubles as a mock email (see notificationEmail below),
// previewed on the /organizer/outbox page.

export type NotificationKind =
  | "event_submitted" // pending_review — waiting on the platform
  | "event_rejected" // changes requested (with the admin's reason)
  | "event_scheduled" // approved, goes live automatically at publishAt
  | "payout_payable" // event money ready to transfer
  | "payout_paid" // transfer done
  | "registration_confirmed" // a runner's seat is confirmed
  | "slip_pending"; // a PromptPay slip waits in the verification queue

export interface Notification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  eventId?: string;
  /** Best-available date string for when this happened; absent when unknown. */
  at?: string;
}

// The sender every mock email goes out as.
export const EMAIL_FROM = "MyTrails <noreply@mytrails.run>";

// Human date for titles ("15 Oct 2026") — mirrors the Intl usage elsewhere.
const fmtDate = (s: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(s));

// Keep long rejection reasons dropdown-friendly.
const snippet = (s: string, max = 90) => (s.length > max ? `${s.slice(0, max - 1)}…` : s);

export function useNotifications(organizerId: string | null): Notification[] {
  const { events, registrations } = useEventsStore();

  return useMemo(() => {
    if (!organizerId) return [];
    const mine = events.filter((e) => e.organizerId === organizerId);
    const mineById = new Map(mine.map((e) => [e.id, e]));
    const list: Notification[] = [];

    for (const e of mine) {
      if (e.status === "pending_review")
        list.push({
          id: `evt-${e.id}-submitted`,
          kind: "event_submitted",
          title: "Submitted for review",
          body: `"${e.title}" is with our review team — we'll let you know the outcome.`,
          eventId: e.id,
          at: e.submittedDate,
        });
      if (e.status === "rejected")
        list.push({
          id: `evt-${e.id}-rejected`,
          kind: "event_rejected",
          title: "Changes requested",
          body: `"${e.title}": ${snippet(e.rejectionReason ?? "Please review and resubmit.")}`,
          eventId: e.id,
          at: e.submittedDate,
        });
      if (e.status === "scheduled")
        list.push({
          id: `evt-${e.id}-scheduled`,
          kind: "event_scheduled",
          title: `Approved — goes live ${e.publishAt ? fmtDate(e.publishAt) : "soon"}`,
          body: `"${e.title}" is approved and will publish automatically.`,
          eventId: e.id,
          // Approval time isn't stored — the submission date is the best we have.
          at: e.submittedDate,
        });
      if (e.payoutStatus === "payable")
        list.push({
          id: `evt-${e.id}-payout-payable`,
          kind: "payout_payable",
          title: "Payout ready to transfer",
          body: `"${e.title}" — your net payout is ready on the platform side.`,
          eventId: e.id,
          // Money turns payable once the event (and hold window) is over.
          at: e.endDate,
        });
      if (e.payoutStatus === "paid")
        list.push({
          id: `evt-${e.id}-payout-paid`,
          kind: "payout_paid",
          title: "Payout paid",
          body: `"${e.title}" — the net payout was transferred${e.payoutDate ? ` on ${fmtDate(e.payoutDate)}` : ""}.`,
          eventId: e.id,
          at: e.payoutDate,
        });
    }

    for (const r of registrations) {
      const event = mineById.get(r.eventId);
      if (!event) continue; // someone else's event
      const runnerName = `${r.runner.firstName} ${r.runner.lastName}`;
      if (r.status === "confirmed")
        list.push({
          id: `reg-${r.id}-confirmed`,
          kind: "registration_confirmed",
          title: `New registration — ${runnerName} (${event.title})`,
          body: `Payment confirmed — confirmation code ${r.code}.`,
          eventId: event.id,
          at: r.createdAt,
        });
      if (r.status === "awaiting_verification")
        list.push({
          id: `reg-${r.id}-slip`,
          kind: "slip_pending",
          title: "Slip waiting for verification",
          body: `${runnerName} uploaded a PromptPay slip for ${event.title}.`,
          eventId: event.id,
          at: r.createdAt,
        });
    }

    // Newest-ish first: date strings compare lexicographically (ISO-shaped),
    // undated entries sink to the bottom.
    return list.sort((a, b) => {
      if (!a.at && !b.at) return 0;
      if (!a.at) return 1;
      if (!b.at) return -1;
      return b.at.localeCompare(a.at);
    });
  }, [events, registrations, organizerId]);
}

// The mock email behind a notification — what the outbox page previews.
// Tone matches the product copy: short, friendly, one clear next step.
export function notificationEmail(n: Notification): { subject: string; preheader: string; bodyLines: string[] } {
  const signoff = "— The MyTrails team";
  switch (n.kind) {
    case "event_submitted":
      return {
        subject: "Your event was submitted for review",
        preheader: n.body,
        bodyLines: [
          "Hi there,",
          n.body,
          "Nothing to do for now — we'll email you again as soon as it's reviewed.",
          signoff,
        ],
      };
    case "event_rejected":
      return {
        subject: "Changes requested on your event",
        preheader: n.body,
        bodyLines: [
          "Hi there,",
          n.body,
          "Open the event in the editor, make the changes, and resubmit — it goes straight back into the review queue.",
          signoff,
        ],
      };
    case "event_scheduled":
      return {
        subject: n.title,
        preheader: n.body,
        bodyLines: ["Great news!", n.body, "No action needed — it will go live automatically.", signoff],
      };
    case "payout_payable":
      return {
        subject: "Your payout is ready to transfer",
        preheader: n.body,
        bodyLines: ["Hi there,", n.body, "You'll get another email once the transfer is made.", signoff],
      };
    case "payout_paid":
      return {
        subject: "Your payout has been paid",
        preheader: n.body,
        bodyLines: ["Hi there,", n.body, "Check your payout account for the transfer.", signoff],
      };
    case "registration_confirmed":
      return {
        subject: n.title,
        preheader: n.body,
        bodyLines: ["Good news —", n.body, "See all runners in your event's Participants section.", signoff],
      };
    case "slip_pending":
      return {
        subject: "A payment slip needs your verification",
        preheader: n.body,
        bodyLines: ["Hi there,", n.body, "Head to Orders → Slip verification to approve or reject it.", signoff],
      };
  }
}
