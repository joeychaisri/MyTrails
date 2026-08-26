import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Event, Registration, RunnerInfo, mockEvents } from "@/data/mockData";
import { ticketWindowState } from "@/lib/eventPhase";
import {
  AdminOrganizer,
  CommissionBracket,
  PlatformSettings,
  mockAdminOrganizers,
  mockOtherEvents,
  mockPlatformSettings,
} from "@/data/adminMockData";
import { dataSource } from "@/lib/dataSource";
import { getSupabase } from "@/lib/supabaseClient";
import {
  RegistrationRow,
  deleteEventTree,
  fetchAll,
  must,
  pushEventTree,
  pushSettings,
  registrationRowToRegistration,
  upsertOrganizer,
  updateOrganizerAccount,
} from "@/lib/supabaseAdapter";
import { useAuth } from "@/contexts/AuthContext";

// ---------------------------------------------------------------------------
// Shared, writable store for the whole platform. Before this, the organizer,
// admin and runner surfaces each read a static mock array and mutated a private
// useState copy, so an action on one side was invisible to the others. Every
// side now reads and writes this single store, so an organizer submission shows
// up in the admin queue, an admin approval reflects on the organizer dashboard,
// and so on. Still mock (in-memory + localStorage) — no backend.
// ---------------------------------------------------------------------------

const STORAGE_KEY = "mt_store_v10";

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

// Supabase mode boots empty and hydrates from the server on mount; settings
// fall back to the mock seed values so runner pages render even if the
// settings select is denied. No localStorage — the server IS the store.
const emptyStore = (): StoreShape => ({
  events: [],
  organizers: [],
  settings: mockPlatformSettings,
  registrations: [],
});

// Reconcile fetched registrations with local state: server rows win by id, but
// registrations only this browser knows about are kept — an anon runner's own
// registration is hidden from the select by RLS yet must survive a refetch.
const mergeRegistrations = (server: Registration[], local: Registration[]): Registration[] => {
  const seen = new Set(server.map((r) => r.id));
  return [...server, ...local.filter((r) => !seen.has(r.id))];
};

// The bracket a given registration count falls into. Brackets are sorted by
// minCount; the matching one is the last whose minCount the count reaches. A
// count below every bracket still uses the first one, so there is always a
// price even if an admin sets the lowest bracket's minCount above zero.
export function resolveBracket(
  regCount: number,
  brackets: CommissionBracket[]
): CommissionBracket | undefined {
  if (!brackets.length) return undefined;
  const sorted = [...brackets].sort((a, b) => a.minCount - b.minCount);
  return sorted.filter((b) => regCount >= b.minCount).pop() ?? sorted[0];
}

// Event-portion commission by number of registrations. The scale itself lives
// in platform settings (Admin → Settings), so the PO can retune it without a
// deploy; the resolved bracket prices the whole event. An admin can override
// the resolved amount per event at review time.
export function eventCommissionAmount(
  regCount: number,
  netRevenue: number,
  brackets: CommissionBracket[],
  overrideAmount?: number
): number {
  if (overrideAmount !== undefined) return Math.max(0, Math.round(overrideAmount));
  const bracket = resolveBracket(regCount, brackets);
  if (!bracket) return 0;
  if (bracket.type === "flat") return Math.max(0, Math.round(bracket.value));
  return Math.max(0, Math.round((netRevenue * bracket.value) / 100));
}

// The flat fee every event pays regardless of size, overridable per event.
export function eventServiceFee(e: Event, settings: PlatformSettings): number {
  const fee = e.serviceFeeOverride ?? settings.serviceFee ?? 0;
  return Math.max(0, Math.round(fee));
}

// The two charges the platform keeps and the net owed to the organizer.
// Service fee = flat per event; event commission = registration-count bracket
// scale (above). Payout uses ACTUAL registrations (sold).
export interface EventFinance {
  gross: number;
  refunded: number;
  eventCommission: number;
  serviceFee: number;
  totalCommission: number;
  netPayout: number;
}

export function eventFinance(e: Event, organizers: AdminOrganizer[], settings: PlatformSettings): EventFinance {
  const gross = e.grossSales ?? e.revenue ?? 0;
  const refunded = e.refundedAmount ?? 0;
  const netAfterRefund = Math.max(0, gross - refunded);
  const eventCommission = eventCommissionAmount(
    e.sold,
    netAfterRefund,
    settings.commissionBrackets,
    e.eventCommissionOverride
  );
  const serviceFee = eventServiceFee(e, settings);
  const totalCommission = eventCommission + serviceFee;
  const netPayout = netAfterRefund - totalCommission;
  return { gross, refunded, eventCommission, serviceFee, totalCommission, netPayout };
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
  /** false only in supabase mode before the first fetch resolves */
  hydrated: boolean;
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
  /** Persist an organizer's own editable account (profile + payout details). */
  updateMyAccount: (organizerId: string, account: NonNullable<AdminOrganizer["account"]>) => void;
  saveSettings: (settings: PlatformSettings) => void;
  // Commission-scale management. deleteBracket is a no-op on the last bracket —
  // an empty scale would leave nothing to price an event with.
  addBracket: (bracket: Omit<CommissionBracket, "id">) => void;
  updateBracket: (id: string, patch: Partial<CommissionBracket>) => void;
  deleteBracket: (id: string) => void;
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
  const [store, setStore] = useState<StoreShape>(dataSource === "supabase" ? emptyStore : loadStore);
  // Auth scope drives what fetchAll can see (RLS does the real enforcement).
  // In mock mode these are simply unused.
  const { role, organizerId, authReady } = useAuth();

  useEffect(() => {
    if (dataSource === "supabase") return; // server is the store — nothing to persist
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch {
      // Storage full/unavailable — the in-memory store still works this session.
    }
  }, [store]);

  // Supabase mode: hydrate on mount and whenever the auth scope changes
  // (login/logout swaps which slice of the tree RLS lets us read).
  // `hydrated` lets views distinguish "still loading" from "really not found"
  // when they deep-link into an entity (mock mode is synchronous, so always true).
  const [hydrated, setHydrated] = useState(dataSource !== "supabase");
  // Monotonic token: a fetchAll only applies its result if no newer fetch has
  // started since. Without this, the mount-time anon fetch and the post-login
  // admin fetch race, and whichever resolves LAST wins — so organizers (readable
  // only when authed) intermittently came back empty and clobbered the good data.
  const fetchSeq = useRef(0);
  const applyFetched = () => {
    const seq = ++fetchSeq.current;
    return fetchAll(getSupabase(), { isAdmin: role === "admin", organizerId }).then((fetched) => {
      if (seq !== fetchSeq.current) return; // superseded by a newer fetch — drop this stale result
      setStore((s) => ({ ...fetched, registrations: mergeRegistrations(fetched.registrations, s.registrations) }));
      setHydrated(true);
    });
  };

  useEffect(() => {
    if (dataSource !== "supabase") return;
    // Wait for the auth session to be restored before the first fetch: that both
    // gives the supabase client its access token (else RLS-guarded reads like
    // `organizers` return []) and tells us the real scope, so we fetch ONCE with
    // the right role instead of an anon→admin double fetch that can race.
    if (!authReady) return;
    applyFetched().catch((e) => {
      console.error("[supabase] hydrate failed", e);
      setHydrated(true); // unblock views; they render not-found rather than spin forever
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, role, organizerId]);

  // Fire-and-forget remote write: run it, log failures, then refetch so the
  // optimistic local state reconciles with the server. No-op in mock mode.
  const remote = (write: (client: SupabaseClient) => Promise<unknown>) => {
    if (dataSource !== "supabase") return;
    write(getSupabase())
      .catch((e) => console.error("[supabase] write failed", e))
      .then(() => applyFetched())
      .catch((e) => console.error("[supabase] refetch failed", e));
  };

  // Settings are one row remotely, so every edit inside them (service fee,
  // commission brackets) pushes the whole object rather than a partial patch.
  const mutateSettings = (fn: (s: PlatformSettings) => PlatformSettings) => {
    const next = fn(store.settings);
    setStore((s) => ({ ...s, settings: fn(s.settings) }));
    remote((client) => pushSettings(client, next));
  };

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
  const expireStaleRegistrations = (now: Date = new Date()) => {
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
    // Server-side expiry (ignores the `now` override — the DB clock rules there).
    remote(async (client) => must(await client.rpc("expire_stale_registrations")));
  };

  useEffect(() => {
    expireStaleRegistrations();
    const timer = setInterval(() => expireStaleRegistrations(), 60_000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setEvents = (fn: (prev: Event[]) => Event[]) => {
    setStore((s) => ({ ...s, events: fn(s.events) }));
    if (dataSource === "supabase") {
      // Mirror the event mutation to the server: every event mutation flows
      // through here as a pure transform, so diffing prev vs next (by object
      // identity per id) tells us exactly which trees to upsert or delete.
      const prev = store.events;
      const next = fn(prev);
      const prevById = new Map(prev.map((e) => [e.id, e]));
      const changed = next.filter((e) => prevById.get(e.id) !== e);
      const removedIds = prev.filter((e) => !next.some((n) => n.id === e.id)).map((e) => e.id);
      if (changed.length || removedIds.length)
        remote(async (client) => {
          for (const e of changed) await pushEventTree(client, e);
          for (const id of removedIds) await deleteEventTree(client, id);
        });
    }
  };

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
    hydrated,
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

    createOrganizer: (org) => {
      const newOrganizer: AdminOrganizer = { ...org, id: `org${Date.now()}`, createdAt: today(), eventsCount: 0 };
      setStore((s) => ({ ...s, organizers: [newOrganizer, ...s.organizers] }));
      remote((client) => upsertOrganizer(client, newOrganizer));
    },
    suspendOrganizer: (id) => {
      setStore((s) => ({
        ...s,
        organizers: s.organizers.map((o) =>
          o.id === id ? { ...o, status: o.status === "active" ? "suspended" : "active" } : o
        ),
      }));
      const org = store.organizers.find((o) => o.id === id);
      if (org)
        remote((client) =>
          upsertOrganizer(client, { ...org, status: org.status === "active" ? "suspended" : "active" })
        );
    },
    updateMyAccount: (organizerId, account) => {
      setStore((s) => ({
        ...s,
        organizers: s.organizers.map((o) => (o.id === organizerId ? { ...o, account } : o)),
      }));
      remote((client) => updateOrganizerAccount(client, organizerId, account));
    },
    saveSettings: (settings) => {
      setStore((s) => ({ ...s, settings }));
      remote((client) => pushSettings(client, settings));
    },
    addBracket: (bracket) => {
      const added: CommissionBracket = { ...bracket, id: `cb-${Date.now()}` };
      mutateSettings((s) => ({ ...s, commissionBrackets: [...s.commissionBrackets, added] }));
    },
    updateBracket: (id, patch) => {
      mutateSettings((s) => ({
        ...s,
        commissionBrackets: s.commissionBrackets.map((b) => (b.id === id ? { ...b, ...patch } : b)),
      }));
    },
    deleteBracket: (id) => {
      if (store.settings.commissionBrackets.length <= 1) return; // keep the scale priceable
      mutateSettings((s) => ({ ...s, commissionBrackets: s.commissionBrackets.filter((b) => b.id !== id) }));
    },
    registrations: store.registrations,
    createRegistration: (input) => {
      if (dataSource === "supabase") {
        // Capacity/window/duplicate checks run server-side in the RPC, which
        // returns the same result union. This branch is async — RegisterFlow
        // awaits it via Promise.resolve() — but the declared sync signature is
        // kept so mock mode (and its tests/stories) stays byte-identical.
        const promise = (async () => {
          const { data, error } = await getSupabase().rpc("create_registration", {
            p_event_id: input.eventId,
            p_category_id: input.categoryId,
            p_ticket_id: input.ticketId,
            p_runner: input.runner,
          });
          if (error) {
            console.error("[supabase] create_registration failed", error);
            return { ok: false as const, reason: "window_closed" as const };
          }
          const res = data as {
            ok: boolean;
            reason?: "sold_out" | "window_closed" | "duplicate";
            registration?: RegistrationRow;
          };
          if (!res.ok || !res.registration)
            return { ok: false as const, reason: res.reason ?? ("window_closed" as const) };
          const registration = registrationRowToRegistration(res.registration);
          setStore((s) => ({ ...s, registrations: [registration, ...s.registrations] }));
          return { ok: true as const, registration };
        })();
        return promise as unknown as ReturnType<EventsContextType["createRegistration"]>;
      }

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
    confirmRegistration: (id, method, slipDataUrl) => {
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
      });
      // Server mirrors the same transition (card also bumps sold/revenue there).
      // The slip dataURL goes straight into the text slip_path column (demo-ok).
      remote(async (client) =>
        must(await client.rpc("confirm_registration", { p_id: id, p_method: method, p_slip_path: slipDataUrl ?? null }))
      );
    },
    failRegistration: (id) => {
      setStore((s) => ({
        ...s,
        registrations: s.registrations.map((r) =>
          r.id === id && r.status === "pending_payment" ? { ...r, status: "payment_failed" } : r
        ),
      }));
      remote(async (client) => must(await client.rpc("fail_registration", { p_id: id })));
    },
    // Organizer verdict on an uploaded slip. Approve is the single point where a
    // promptpay registration increments sold; reject cancels without selling.
    verifySlip: (id, approve) => {
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
      });
      remote(async (client) => must(await client.rpc("verify_slip", { p_id: id, p_approve: approve })));
    },
    // Cancel a confirmed registration: seat released, refundPct% of the amount
    // accrues to the event's refundedAmount (feeds eventFinance).
    cancelRegistration: (id, refundPct) => {
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
      });
      if (dataSource === "supabase") {
        // No RPC for cancel — the organizer/admin session updates the rows
        // directly (their RLS allows it): registration → refunded, seat back,
        // refund accrued on the event.
        const reg = store.registrations.find((r) => r.id === id && r.status === "confirmed");
        if (!reg) return;
        const event = store.events.find((e) => e.id === reg.eventId);
        const ticket = event?.categories
          .find((c) => c.id === reg.categoryId)
          ?.tickets.find((t) => t.id === reg.ticketId);
        const refund = Math.round((reg.amount * refundPct) / 100);
        remote(async (client) => {
          must(await client.from("registrations").update({ status: "refunded" }).eq("id", id));
          if (ticket) must(await client.from("tickets").update({ sold: ticket.sold - 1 }).eq("id", reg.ticketId));
          if (event)
            must(
              await client
                .from("events")
                .update({ sold: event.sold - 1, refunded_amount: (event.refundedAmount ?? 0) + refund })
                .eq("id", reg.eventId)
            );
        });
      }
    },
    expireStaleRegistrations,

    resetStore: () => {
      if (dataSource === "supabase") {
        // Server owns the data — "reset" just re-syncs local state from it.
        applyFetched().catch((e) => console.error("[supabase] refetch failed", e));
        return;
      }
      setStore(seedStore());
    },
  };

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
};

export const useEventsStore = () => {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error("useEventsStore must be used within EventsProvider");
  return ctx;
};
