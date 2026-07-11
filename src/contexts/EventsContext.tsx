import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Event, Registration, RunnerInfo, mockEvents } from "@/data/mockData";
import { ticketWindowState } from "@/lib/eventPhase";
import {
  AdminOrganizer,
  PlatformSettings,
  Tier,
  mockAdminOrganizers,
  mockOtherEvents,
  mockPlatformSettings,
} from "@/data/adminMockData";

// ---------------------------------------------------------------------------
// Shared, writable store for the whole platform. Before this, the organizer,
// admin and runner surfaces each read a static mock array and mutated a private
// useState copy, so an action on one side was invisible to the others. Every
// side now reads and writes this single store, so an organizer submission shows
// up in the admin queue, an admin approval reflects on the organizer dashboard,
// and so on. Still mock (in-memory + localStorage) — no backend.
// ---------------------------------------------------------------------------

const STORAGE_KEY = "mt_store_v9";

interface StoreShape {
  events: Event[];
  organizers: AdminOrganizer[];
  settings: PlatformSettings;
  registrations: Registration[];
}

const seedStore = (): StoreShape => ({
  events: [...mockEvents, ...mockOtherEvents],
  organizers: mockAdminOrganizers,
  settings: mockPlatformSettings,
  registrations: [], // no seed data — runners create these through the flow
});

const loadStore = (): StoreShape => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as StoreShape;
  } catch {
    // Corrupt/absent — fall through to a fresh seed.
  }
  return seedStore();
};

// Event-portion commission by number of registrations (PO spec, tunable mock):
//   < 300 registrations → flat 1,000 THB
//   300–999            → 8% of net registration revenue
//   ≥ 1,000            → 6% (volume discount)
// An admin can override the resolved amount per event at review time.
export function eventCommissionAmount(regCount: number, netRevenue: number, overrideAmount?: number): number {
  if (overrideAmount !== undefined) return Math.max(0, Math.round(overrideAmount));
  if (regCount < 300) return 1000;
  if (regCount < 1000) return Math.round(netRevenue * 0.08);
  return Math.round(netRevenue * 0.06);
}

// The two-part commission the platform keeps and the net owed to the organizer.
// Event commission = registration-count scale (above); tier commission = the
// organizer account's tier rate. Payout uses ACTUAL registrations (sold).
export interface EventFinance {
  gross: number;
  refunded: number;
  eventCommission: number;
  tierCommission: number;
  tierRate: number;
  totalCommission: number;
  netPayout: number;
}

export function eventFinance(e: Event, organizers: AdminOrganizer[], settings: PlatformSettings): EventFinance {
  const gross = e.grossSales ?? e.revenue ?? 0;
  const refunded = e.refundedAmount ?? 0;
  const netAfterRefund = Math.max(0, gross - refunded);
  const eventCommission = eventCommissionAmount(e.sold, netAfterRefund, e.eventCommissionOverride);
  const org = organizers.find((o) => o.id === e.organizerId);
  const tier = settings.tiers.find((t) => t.id === org?.tierId);
  const tierRate = tier?.commissionRate ?? 0;
  const tierCommission = Math.round((netAfterRefund * tierRate) / 100);
  const totalCommission = eventCommission + tierCommission;
  const netPayout = netAfterRefund - totalCommission;
  return { gross, refunded, eventCommission, tierCommission, tierRate, totalCommission, netPayout };
}

const today = () => new Date().toISOString().split("T")[0];

// ---------------------------------------------------------------------------
// Registration domain helpers
// ---------------------------------------------------------------------------

const HOLD_MINUTES = 15; // a pending_payment registration holds its seat this long

const CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

// Runner-facing confirmation code: MT- + 6 alphanumerics, retried on collision.
const generateCode = (taken: Set<string>): string => {
  let code: string;
  do {
    code =
      "MT-" +
      Array.from({ length: 6 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join("");
  } while (taken.has(code));
  return code;
};

// Seats a ticket has left. ticket.sold covers seeded sales + confirmed
// registrations (confirm/verify increment it), so on top of that we only count
// live holds: pending_payment not yet past expiresAt, and awaiting_verification.
const seatsLeft = (s: StoreShape, ticketId: string, ticketQuantity: number, ticketSold: number, now: Date): number => {
  const holds = s.registrations.filter(
    (r) =>
      r.ticketId === ticketId &&
      (r.status === "awaiting_verification" ||
        (r.status === "pending_payment" && (!r.expiresAt || new Date(r.expiresAt) > now)))
  ).length;
  return ticketQuantity - ticketSold - holds;
};

// Adjust the sold counters (ticket + event) for a registration's seat.
const applySold = (s: StoreShape, reg: Registration, delta: number): StoreShape => ({
  ...s,
  events: s.events.map((e) =>
    e.id !== reg.eventId
      ? e
      : {
          ...e,
          sold: e.sold + delta,
          categories: e.categories.map((c) =>
            c.id !== reg.categoryId
              ? c
              : { ...c, tickets: c.tickets.map((t) => (t.id !== reg.ticketId ? t : { ...t, sold: t.sold + delta })) }
          ),
        }
  ),
});

interface EventsContextType {
  events: Event[];
  organizers: AdminOrganizer[];
  settings: PlatformSettings;
  getEvent: (id: string | undefined) => Event | undefined;
  // Organizer actions
  submitEvent: (draft: Omit<Event, "id" | "status">) => Event;
  saveDraftEvent: (draft: Omit<Event, "id" | "status">) => Event;
  updateEvent: (id: string, patch: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  // Admin actions
  approveEvent: (id: string) => void;
  rejectEvent: (id: string, reason: string) => void;
  forceUnpublish: (id: string) => void;
  markPayoutPaid: (id: string) => void;
  createOrganizer: (org: Omit<AdminOrganizer, "id" | "createdAt" | "eventsCount">) => void;
  suspendOrganizer: (id: string) => void;
  saveSettings: (settings: PlatformSettings) => void;
  // Tier management (commission per tier). deleteTier is a no-op if the tier is in use.
  addTier: (name: string, commissionRate: number) => void;
  updateTier: (id: string, patch: Partial<Tier>) => void;
  deleteTier: (id: string) => void;
  // Runner registrations (order + participant in one record, with capacity holds)
  registrations: Registration[];
  createRegistration: (input: {
    eventId: string;
    categoryId: string;
    ticketId: string;
    runner: RunnerInfo;
  }) => { ok: true; registration: Registration } | { ok: false; reason: "sold_out" | "window_closed" | "duplicate" };
  confirmRegistration: (id: string, method: "card" | "promptpay", slipDataUrl?: string) => void; // card → confirmed; promptpay → awaiting_verification
  failRegistration: (id: string) => void;
  verifySlip: (id: string, approve: boolean) => void; // organizer action on a promptpay slip
  cancelRegistration: (id: string, refundPct: number) => void;
  expireStaleRegistrations: (now?: Date) => void; // pending_payment past expiresAt → expired
  // Wipe any locally-persisted state and reseed from the mock data.
  resetStore: () => void;
}

const EventsContext = createContext<EventsContextType | null>(null);

export const EventsProvider = ({ children }: { children: ReactNode }) => {
  const [store, setStore] = useState<StoreShape>(loadStore);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch {
      // Storage full/unavailable — the in-memory store still works this session.
    }
  }, [store]);

  // No backend/cron in this prototype: promote scheduled events to live once their
  // publishAt time passes. Runs on mount and on an interval.
  useEffect(() => {
    const promoteDue = () =>
      setStore((s) => {
        const now = new Date();
        let changed = false;
        const events = s.events.map((e) => {
          if (e.status === "scheduled" && e.publishAt && new Date(e.publishAt) <= now) {
            changed = true;
            return { ...e, status: "live" as const };
          }
          return e;
        });
        return changed ? { ...s, events } : s;
      });
    promoteDue();
    const timer = setInterval(promoteDue, 30_000);
    return () => clearInterval(timer);
  }, []);

  // Same no-cron trick for registration holds: a pending_payment registration
  // past its expiresAt flips to expired (releasing the seat). Mount + interval.
  const expireStaleRegistrations = (now: Date = new Date()) =>
    setStore((s) => {
      let changed = false;
      const registrations = s.registrations.map((r) => {
        if (r.status === "pending_payment" && r.expiresAt && new Date(r.expiresAt) <= now) {
          changed = true;
          return { ...r, status: "expired" as const };
        }
        return r;
      });
      return changed ? { ...s, registrations } : s;
    });

  useEffect(() => {
    expireStaleRegistrations();
    const timer = setInterval(() => expireStaleRegistrations(), 60_000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setEvents = (fn: (prev: Event[]) => Event[]) =>
    setStore((s) => ({ ...s, events: fn(s.events) }));

  const patchEvent = (id: string, patch: Partial<Event>) =>
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));

  const createEvent = (draft: Omit<Event, "id" | "status">, status: Event["status"]): Event => {
    const newEvent: Event = {
      ...draft,
      id: `evt-${Date.now()}`,
      status,
      payoutStatus: "held",
      submittedDate: status === "pending_review" ? today() : draft.submittedDate,
    };
    setEvents((prev) => [newEvent, ...prev]);
    return newEvent;
  };

  const value: EventsContextType = {
    events: store.events,
    organizers: store.organizers,
    settings: store.settings,
    getEvent: (id) => (id ? store.events.find((e) => e.id === id) : undefined),

    submitEvent: (draft) => createEvent(draft, "pending_review"),
    saveDraftEvent: (draft) => createEvent(draft, "draft"),
    updateEvent: patchEvent,
    deleteEvent: (id) => setEvents((prev) => prev.filter((e) => e.id !== id)),

    // On approval the organizer's chosen publish timing decides go-live:
    // ASAP (or a publishAt already in the past) → live now; else → scheduled.
    approveEvent: (id) =>
      setEvents((prev) =>
        prev.map((e) => {
          if (e.id !== id) return e;
          const goLiveNow =
            e.publishMode !== "scheduled" || !e.publishAt || new Date(e.publishAt) <= new Date();
          return { ...e, status: goLiveNow ? "live" : "scheduled", rejectionReason: undefined };
        })
      ),
    rejectEvent: (id, reason) => patchEvent(id, { status: "rejected", rejectionReason: reason }),
    forceUnpublish: (id) => patchEvent(id, { status: "draft" }),
    markPayoutPaid: (id) => patchEvent(id, { payoutStatus: "paid", payoutDate: today() }),

    createOrganizer: (org) =>
      setStore((s) => ({
        ...s,
        organizers: [
          { ...org, id: `org${Date.now()}`, createdAt: today(), eventsCount: 0 },
          ...s.organizers,
        ],
      })),
    suspendOrganizer: (id) =>
      setStore((s) => ({
        ...s,
        organizers: s.organizers.map((o) =>
          o.id === id ? { ...o, status: o.status === "active" ? "suspended" : "active" } : o
        ),
      })),
    saveSettings: (settings) => setStore((s) => ({ ...s, settings })),
    addTier: (name, commissionRate) =>
      setStore((s) => ({
        ...s,
        settings: { ...s.settings, tiers: [...s.settings.tiers, { id: `tier-${Date.now()}`, name, commissionRate }] },
      })),
    updateTier: (id, patch) =>
      setStore((s) => ({
        ...s,
        settings: { ...s.settings, tiers: s.settings.tiers.map((t) => (t.id === id ? { ...t, ...patch } : t)) },
      })),
    deleteTier: (id) =>
      setStore((s) => {
        if (s.organizers.some((o) => o.tierId === id)) return s; // in use — block
        return { ...s, settings: { ...s.settings, tiers: s.settings.tiers.filter((t) => t.id !== id) } };
      }),
    registrations: store.registrations,
    createRegistration: (input) => {
      const event = store.events.find((e) => e.id === input.eventId);
      const category = event?.categories.find((c) => c.id === input.categoryId);
      const ticket = category?.tickets.find((t) => t.id === input.ticketId);
      // Unknown event/category/ticket ≈ nothing on sale here.
      if (!event || !category || !ticket) return { ok: false, reason: "window_closed" };

      const now = new Date();
      if (ticketWindowState(ticket, now) !== "on_sale") return { ok: false, reason: "window_closed" };

      const isDuplicate = store.registrations.some(
        (r) =>
          r.eventId === input.eventId &&
          r.runner.email === input.runner.email &&
          !["expired", "payment_failed", "cancelled"].includes(r.status)
      );
      if (isDuplicate) return { ok: false, reason: "duplicate" };

      if (seatsLeft(store, ticket.id, ticket.quantity, ticket.sold, now) <= 0)
        return { ok: false, reason: "sold_out" };

      const code = generateCode(new Set(store.registrations.map((r) => r.code)));
      const registration: Registration = {
        id: `reg-${Date.now()}-${code.slice(3)}`,
        code,
        eventId: input.eventId,
        categoryId: input.categoryId,
        ticketId: input.ticketId,
        amount: ticket.price,
        status: "pending_payment",
        createdAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + HOLD_MINUTES * 60 * 1000).toISOString(),
        runner: input.runner,
      };
      setStore((s) => ({ ...s, registrations: [registration, ...s.registrations] }));
      return { ok: true, registration };
    },
    // Card settles instantly → confirmed (sold +1). PromptPay stores the slip and
    // waits for the organizer → awaiting_verification (seat stays a hold).
    confirmRegistration: (id, method, slipDataUrl) =>
      setStore((s) => {
        const reg = s.registrations.find((r) => r.id === id);
        if (!reg || reg.status !== "pending_payment") return s;
        const status = method === "card" ? ("confirmed" as const) : ("awaiting_verification" as const);
        const next: StoreShape = {
          ...s,
          registrations: s.registrations.map((r) =>
            r.id === id ? { ...r, status, paymentMethod: method, slipDataUrl } : r
          ),
        };
        return method === "card" ? applySold(next, reg, +1) : next;
      }),
    failRegistration: (id) =>
      setStore((s) => ({
        ...s,
        registrations: s.registrations.map((r) =>
          r.id === id && r.status === "pending_payment" ? { ...r, status: "payment_failed" } : r
        ),
      })),
    // Organizer verdict on an uploaded slip. Approve is the single point where a
    // promptpay registration increments sold; reject cancels without selling.
    verifySlip: (id, approve) =>
      setStore((s) => {
        const reg = s.registrations.find((r) => r.id === id);
        if (!reg || reg.status !== "awaiting_verification") return s;
        const next: StoreShape = {
          ...s,
          registrations: s.registrations.map((r) =>
            r.id === id ? { ...r, status: approve ? "confirmed" : "cancelled" } : r
          ),
        };
        return approve ? applySold(next, reg, +1) : next;
      }),
    // Cancel a confirmed registration: seat released, refundPct% of the amount
    // accrues to the event's refundedAmount (feeds eventFinance).
    cancelRegistration: (id, refundPct) =>
      setStore((s) => {
        const reg = s.registrations.find((r) => r.id === id);
        if (!reg || reg.status !== "confirmed") return s;
        const refund = Math.round((reg.amount * refundPct) / 100);
        let next: StoreShape = {
          ...s,
          registrations: s.registrations.map((r) => (r.id === id ? { ...r, status: "refunded" } : r)),
        };
        next = applySold(next, reg, -1);
        return {
          ...next,
          events: next.events.map((e) =>
            e.id === reg.eventId ? { ...e, refundedAmount: (e.refundedAmount ?? 0) + refund } : e
          ),
        };
      }),
    expireStaleRegistrations,

    resetStore: () => setStore(seedStore()),
  };

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
};

export const useEventsStore = () => {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error("useEventsStore must be used within EventsProvider");
  return ctx;
};
