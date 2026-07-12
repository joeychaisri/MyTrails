import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act, RenderHookResult } from "@testing-library/react";
import { EventsProvider, useEventsStore } from "@/contexts/EventsContext";
import { Category, Event, Registration, RunnerInfo, Ticket, mockOrders, mockParticipants } from "@/data/mockData";
import { useOrders } from "@/hooks/data/useOrders";
import { useParticipants } from "@/hooks/data/useParticipants";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <EventsProvider>{children}</EventsProvider>
);

const ticket = (over: Partial<Ticket> = {}): Ticket => ({
  id: "tk1",
  name: "Early Bird",
  price: 1200,
  quantity: 5,
  sold: 0,
  salesStart: "2020-01-01T00:00",
  salesEnd: "2099-01-01T00:00",
  ...over,
});

const category = (tickets: Ticket[]): Category => ({
  id: "cat1",
  name: "25K",
  nameTh: "25 กม.",
  raceDate: "2026-12-01",
  startTime: "06:00",
  startLocationName: "Start Line",
  startLat: 18.8,
  startLng: 98.9,
  distance: 25,
  elevation: 1400,
  elevationLoss: 1400,
  terrainType: "Trail",
  itra: 1,
  utmbIndex: 1,
  cutoffTime: "14:00",
  cutoffHours: 8,
  tickets,
});

const draft = (tickets: Ticket[]): Omit<Event, "id" | "status"> => ({
  title: "Reg Test Trail",
  titleTh: "เทสลงทะเบียน",
  coverImage: "",
  date: "2026-12-01",
  endDate: "2026-12-01",
  province: "Chiang Mai",
  organizerId: "org1",
  organizerName: "Trail Events Co.",
  sold: 0,
  capacity: 100,
  revenue: 0,
  categories: [category(tickets)],
  description: "",
  descriptionTh: "",
  latitude: "",
  longitude: "",
  socialLinks: {},
});

const runner = (over: Partial<RunnerInfo> = {}): RunnerInfo => ({
  firstName: "Somchai",
  lastName: "Jaidee",
  dob: "1990-05-01",
  gender: "male",
  nationality: "Thai",
  idNumber: "1234567890123",
  phone: "0812345678",
  email: "somchai@example.com",
  emergencyName: "Somsri Jaidee",
  emergencyPhone: "0898765432",
  bloodGroup: "O",
  shirtSize: "M",
  pdpaConsentAt: "2026-07-11T09:00:00.000Z",
  ...over,
});

type Store = ReturnType<typeof useEventsStore>;
type Harness = RenderHookResult<Store, unknown>;

// Submit + approve a live event carrying the given tickets; returns its id.
const setupEvent = (result: Harness["result"], tickets: Ticket[] = [ticket()]): string => {
  let id!: string;
  act(() => { id = result.current.submitEvent(draft(tickets)).id; });
  act(() => result.current.approveEvent(id));
  return id;
};

const register = (
  result: Harness["result"],
  eventId: string,
  over: Partial<RunnerInfo> = {}
): ReturnType<Store["createRegistration"]> => {
  let res!: ReturnType<Store["createRegistration"]>;
  act(() => {
    res = result.current.createRegistration({
      eventId,
      categoryId: "cat1",
      ticketId: "tk1",
      runner: runner(over),
    });
  });
  return res;
};

const mustOk = (res: ReturnType<Store["createRegistration"]>): Registration => {
  if (!res.ok) throw new Error(`expected ok, got ${res.reason}`);
  return res.registration;
};

describe("Registration domain — capacity holds, payment, slip verification", () => {
  beforeEach(() => localStorage.clear());

  it("seeds registrations as an empty array", () => {
    const { result } = renderHook(() => useEventsStore(), { wrapper });
    expect(result.current.registrations).toEqual([]);
  });

  it("card happy path: MT- code, 15-min hold, confirm sells exactly one seat", () => {
    const { result } = renderHook(() => useEventsStore(), { wrapper });
    const eventId = setupEvent(result);
    const reg = mustOk(register(result, eventId));

    expect(reg.code).toMatch(/^MT-[A-Z0-9]{6}$/);
    expect(reg.status).toBe("pending_payment");
    expect(reg.amount).toBe(1200);
    const holdMs = new Date(reg.expiresAt!).getTime() - new Date(reg.createdAt).getTime();
    expect(holdMs).toBe(15 * 60 * 1000);

    act(() => result.current.confirmRegistration(reg.id, "card"));
    const stored = result.current.registrations.find((r) => r.id === reg.id)!;
    expect(stored.status).toBe("confirmed");
    expect(stored.paymentMethod).toBe("card");
    const event = result.current.events.find((e) => e.id === eventId)!;
    expect(event.sold).toBe(1);
    expect(event.categories[0].tickets[0].sold).toBe(1);
  });

  it("promptpay: awaiting_verification does not sell; approve confirms and sells once", () => {
    const { result } = renderHook(() => useEventsStore(), { wrapper });
    const eventId = setupEvent(result);
    const reg = mustOk(register(result, eventId));

    act(() => result.current.confirmRegistration(reg.id, "promptpay", "data:image/png;base64,slip"));
    let stored = result.current.registrations.find((r) => r.id === reg.id)!;
    expect(stored.status).toBe("awaiting_verification");
    expect(stored.slipDataUrl).toBe("data:image/png;base64,slip");
    expect(result.current.events.find((e) => e.id === eventId)!.sold).toBe(0);

    act(() => result.current.verifySlip(reg.id, true));
    stored = result.current.registrations.find((r) => r.id === reg.id)!;
    expect(stored.status).toBe("confirmed");
    const event = result.current.events.find((e) => e.id === eventId)!;
    expect(event.sold).toBe(1);
    expect(event.categories[0].tickets[0].sold).toBe(1);
  });

  it("promptpay: rejected slip cancels without selling", () => {
    const { result } = renderHook(() => useEventsStore(), { wrapper });
    const eventId = setupEvent(result);
    const reg = mustOk(register(result, eventId));

    act(() => result.current.confirmRegistration(reg.id, "promptpay", "data:image/png;base64,slip"));
    act(() => result.current.verifySlip(reg.id, false));
    expect(result.current.registrations.find((r) => r.id === reg.id)!.status).toBe("cancelled");
    const event = result.current.events.find((e) => e.id === eventId)!;
    expect(event.sold).toBe(0);
    expect(event.categories[0].tickets[0].sold).toBe(0);
  });

  it("rejects sold_out when seeded sold + active holds fill the quantity", () => {
    const { result } = renderHook(() => useEventsStore(), { wrapper });
    // quantity 2, one seat already seeded as sold → one seat left.
    const eventId = setupEvent(result, [ticket({ quantity: 2, sold: 1 })]);

    expect(mustOk(register(result, eventId, { email: "a@example.com" })).status).toBe("pending_payment");
    // The pending hold occupies the last seat even though nothing is confirmed yet.
    const res = register(result, eventId, { email: "b@example.com" });
    expect(res).toEqual({ ok: false, reason: "sold_out" });
  });

  it("rejects window_closed when the ticket sales window has ended", () => {
    const { result } = renderHook(() => useEventsStore(), { wrapper });
    const eventId = setupEvent(result, [ticket({ salesEnd: "2020-02-01T00:00" })]);
    expect(register(result, eventId)).toEqual({ ok: false, reason: "window_closed" });
  });

  it("rejects duplicate email on the same event, frees the email after payment_failed", () => {
    const { result } = renderHook(() => useEventsStore(), { wrapper });
    const eventId = setupEvent(result);
    const reg = mustOk(register(result, eventId));

    expect(register(result, eventId)).toEqual({ ok: false, reason: "duplicate" });

    act(() => result.current.failRegistration(reg.id));
    expect(result.current.registrations.find((r) => r.id === reg.id)!.status).toBe("payment_failed");
    expect(register(result, eventId).ok).toBe(true);
  });

  it("expiry releases the hold for the next runner", () => {
    const { result } = renderHook(() => useEventsStore(), { wrapper });
    const eventId = setupEvent(result, [ticket({ quantity: 1 })]);
    const reg = mustOk(register(result, eventId, { email: "a@example.com" }));

    expect(register(result, eventId, { email: "b@example.com" })).toEqual({ ok: false, reason: "sold_out" });

    act(() => result.current.expireStaleRegistrations(new Date(Date.now() + 16 * 60 * 1000)));
    expect(result.current.registrations.find((r) => r.id === reg.id)!.status).toBe("expired");
    expect(register(result, eventId, { email: "b@example.com" }).ok).toBe(true);
  });

  it("cancel with refundPct: refunded status, seat released, refundedAmount accrued", () => {
    const { result } = renderHook(() => useEventsStore(), { wrapper });
    const eventId = setupEvent(result);
    const reg = mustOk(register(result, eventId));
    act(() => result.current.confirmRegistration(reg.id, "card"));

    act(() => result.current.cancelRegistration(reg.id, 50));
    expect(result.current.registrations.find((r) => r.id === reg.id)!.status).toBe("refunded");
    const event = result.current.events.find((e) => e.id === eventId)!;
    expect(event.sold).toBe(0);
    expect(event.categories[0].tickets[0].sold).toBe(0);
    expect(event.refundedAmount).toBe(600); // round(1200 * 50 / 100)
  });

  it("generated codes are unique across registrations", () => {
    const { result } = renderHook(() => useEventsStore(), { wrapper });
    const eventId = setupEvent(result, [ticket({ quantity: 10 })]);
    const codes = new Set<string>();
    for (let i = 0; i < 5; i++) {
      codes.add(mustOk(register(result, eventId, { email: `r${i}@example.com` })).code);
    }
    expect(codes.size).toBe(5);
  });
});

describe("Organizer data hooks — registrations surface in useParticipants/useOrders", () => {
  beforeEach(() => localStorage.clear());

  it("registration rows are prepended ahead of legacy mocks and live-update through the lifecycle", () => {
    const { result, rerender } = renderHook(
      ({ eventId }: { eventId: string }) => ({
        store: useEventsStore(),
        participants: useParticipants(eventId),
        orders: useOrders(eventId),
      }),
      { wrapper, initialProps: { eventId: "none" } }
    );

    let eventId!: string;
    act(() => { eventId = result.current.store.submitEvent(draft([ticket()])).id; });
    act(() => result.current.store.approveEvent(eventId));
    rerender({ eventId });

    // No registrations yet: hooks return exactly the legacy mock rows.
    expect(result.current.participants.data).toHaveLength(mockParticipants.length);
    expect(result.current.orders.data).toHaveLength(mockOrders.length);

    let res!: ReturnType<Store["createRegistration"]>;
    act(() => {
      res = result.current.store.createRegistration({
        eventId, categoryId: "cat1", ticketId: "tk1", runner: runner(),
      });
    });
    const reg = mustOk(res);

    // pending_payment: order row prepended, no participant yet.
    expect(result.current.orders.data).toHaveLength(mockOrders.length + 1);
    expect(result.current.orders.data[0]).toMatchObject({
      id: reg.code,
      registrationId: reg.id,
      buyerName: "Somchai Jaidee",
      buyerEmail: "somchai@example.com",
      amount: 1200,
      status: "submitted",
      category: "25K",
      ticketType: "Early Bird",
    });
    expect(result.current.participants.data).toHaveLength(mockParticipants.length);

    // promptpay slip uploaded → awaiting_verification → pending_slip order row.
    act(() => result.current.store.confirmRegistration(reg.id, "promptpay", "data:image/png;base64,AAAA"));
    expect(result.current.orders.data[0]).toMatchObject({
      status: "pending_slip",
      paymentMethod: "PromptPay",
      slipUrl: "data:image/png;base64,AAAA",
    });

    // organizer approves the slip → confirmed → participant row appears, marked for CSV.
    act(() => result.current.store.verifySlip(reg.id, true));
    expect(result.current.orders.data[0].status).toBe("complete_wait_receipt");
    expect(result.current.participants.data).toHaveLength(mockParticipants.length + 1);
    expect(result.current.participants.data[0]).toMatchObject({
      id: reg.id,
      name: "Somchai Jaidee",
      email: "somchai@example.com",
      gender: "M",
      genderDetail: "male",
      distance: "25K",
      shirtSize: "M",
      bloodType: "O",
      dob: "1990-05-01",
      idNumber: "1234567890123",
      emergencyName: "Somsri Jaidee",
      emergencyPhone: "0898765432",
      category: "25K",
      ticket: "Early Bird",
      registrationCode: reg.code,
    });
  });

  it("hooks scope rows to the requested event", () => {
    const { result, rerender } = renderHook(
      ({ eventId }: { eventId: string }) => ({
        store: useEventsStore(),
        orders: useOrders(eventId),
      }),
      { wrapper, initialProps: { eventId: "none" } }
    );
    let eventId!: string;
    act(() => { eventId = result.current.store.submitEvent(draft([ticket()])).id; });
    act(() => result.current.store.approveEvent(eventId));
    act(() => {
      result.current.store.createRegistration({
        eventId, categoryId: "cat1", ticketId: "tk1", runner: runner(),
      });
    });

    // Other event id → only legacy mock rows.
    rerender({ eventId: "some-other-event" });
    expect(result.current.orders.data).toHaveLength(mockOrders.length);
    rerender({ eventId });
    expect(result.current.orders.data).toHaveLength(mockOrders.length + 1);
  });
});
