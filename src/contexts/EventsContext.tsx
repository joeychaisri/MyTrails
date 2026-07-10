import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Event, mockEvents } from "@/data/mockData";
import {
  AdminOrganizer,
  PlatformSettings,
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

const STORAGE_KEY = "mt_store_v6";

interface StoreShape {
  events: Event[];
  organizers: AdminOrganizer[];
  settings: PlatformSettings;
}

const seedStore = (): StoreShape => ({
  events: [...mockEvents, ...mockOtherEvents],
  organizers: mockAdminOrganizers,
  settings: mockPlatformSettings,
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

// The commission the platform actually keeps and the net owed to the organizer.
export interface EventFinance {
  gross: number;
  refunded: number;
  rate: number;
  commission: number;
  netPayout: number;
}

export function eventFinance(e: Event, settings: PlatformSettings): EventFinance {
  const gross = e.grossSales ?? e.revenue ?? 0;
  const refunded = e.refundedAmount ?? 0;
  const rate = e.commissionRate ?? settings.commissionRate;
  const netAfterRefund = Math.max(0, gross - refunded);
  const commission = Math.round((netAfterRefund * rate) / 100);
  const netPayout = netAfterRefund - commission;
  return { gross, refunded, rate, commission, netPayout };
}

const today = () => new Date().toISOString().split("T")[0];

interface EventsContextType {
  events: Event[];
  organizers: AdminOrganizer[];
  settings: PlatformSettings;
  getEvent: (id: string | undefined) => Event | undefined;
  // Organizer actions
  submitEvent: (draft: Omit<Event, "id" | "status">) => Event;
  saveDraftEvent: (draft: Omit<Event, "id" | "status">) => Event;
  updateEvent: (id: string, patch: Partial<Event>) => void;
  requestCancellation: (id: string, reason: string) => void;
  deleteEvent: (id: string) => void;
  // Admin actions
  approveEvent: (id: string) => void;
  rejectEvent: (id: string, reason: string) => void;
  publishEvent: (id: string) => void;
  forceUnpublish: (id: string) => void;
  approveCancellation: (id: string) => void;
  rejectCancellation: (id: string) => void;
  markPayoutPaid: (id: string) => void;
  createOrganizer: (org: Omit<AdminOrganizer, "id" | "createdAt" | "eventsCount">) => void;
  suspendOrganizer: (id: string) => void;
  saveSettings: (settings: PlatformSettings) => void;
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

  const setEvents = (fn: (prev: Event[]) => Event[]) =>
    setStore((s) => ({ ...s, events: fn(s.events) }));

  const patchEvent = (id: string, patch: Partial<Event>) =>
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));

  // Commission rate for a new event depends on its organizer's tier.
  const rateForOrganizer = (organizerId: string) => {
    const org = store.organizers.find((o) => o.id === organizerId);
    return org?.tier === "vip" ? store.settings.vipCommissionRate : store.settings.commissionRate;
  };

  const createEvent = (draft: Omit<Event, "id" | "status">, status: Event["status"]): Event => {
    const newEvent: Event = {
      ...draft,
      id: `evt-${Date.now()}`,
      status,
      commissionRate: draft.commissionRate ?? rateForOrganizer(draft.organizerId),
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
    requestCancellation: (id, reason) =>
      setEvents((prev) =>
        prev.map((e) =>
          e.id === id
            ? {
                ...e,
                status: "cancellation_requested",
                cancellationReason: reason,
                refundAmount: e.refundAmount ?? e.grossSales ?? e.revenue ?? 0,
              }
            : e
        )
      ),
    deleteEvent: (id) => setEvents((prev) => prev.filter((e) => e.id !== id)),

    approveEvent: (id) => patchEvent(id, { status: "ready_to_publish", rejectionReason: undefined }),
    rejectEvent: (id, reason) => patchEvent(id, { status: "rejected", rejectionReason: reason }),
    publishEvent: (id) => patchEvent(id, { status: "live" }),
    forceUnpublish: (id) => patchEvent(id, { status: "draft" }),
    approveCancellation: (id) => patchEvent(id, { status: "cancelled" }),
    rejectCancellation: (id) =>
      patchEvent(id, { status: "live", cancellationReason: undefined, refundAmount: undefined }),
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
    resetStore: () => setStore(seedStore()),
  };

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
};

export const useEventsStore = () => {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error("useEventsStore must be used within EventsProvider");
  return ctx;
};
