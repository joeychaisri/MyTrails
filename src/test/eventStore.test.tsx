import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { EventsProvider, useEventsStore } from "@/contexts/EventsContext";
import { Event } from "@/data/mockData";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <EventsProvider>{children}</EventsProvider>
);

const draft = (over: Partial<Event> = {}): Omit<Event, "id" | "status"> => ({
  title: "Test Trail",
  titleTh: "เทสเทรล",
  coverImage: "",
  date: "2026-12-01",
  endDate: "2026-12-01",
  province: "Chiang Mai",
  organizerId: "org1",
  organizerName: "Trail Events Co.",
  sold: 0,
  capacity: 100,
  revenue: 0,
  categories: [],
  description: "",
  descriptionTh: "",
  latitude: "",
  longitude: "",
  socialLinks: {},
  ...over,
});

describe("EventsStore — the full organizer→admin flow", () => {
  beforeEach(() => localStorage.clear());

  it("organizer submit lands in the admin queue as pending_review", () => {
    const { result } = renderHook(() => useEventsStore(), { wrapper });
    let created!: Event;
    act(() => { created = result.current.submitEvent(draft()); });
    const found = result.current.events.find((e) => e.id === created.id);
    expect(found?.status).toBe("pending_review");
    expect(found?.submittedDate).toBeTruthy();
  });

  it("drives submit → approve → publish → live", () => {
    const { result } = renderHook(() => useEventsStore(), { wrapper });
    let id!: string;
    act(() => { id = result.current.submitEvent(draft()).id; });
    act(() => result.current.approveEvent(id));
    expect(result.current.events.find((e) => e.id === id)?.status).toBe("ready_to_publish");
    act(() => result.current.publishEvent(id));
    expect(result.current.events.find((e) => e.id === id)?.status).toBe("live");
  });

  it("reject stores the reason and sends it back", () => {
    const { result } = renderHook(() => useEventsStore(), { wrapper });
    let id!: string;
    act(() => { id = result.current.submitEvent(draft()).id; });
    act(() => result.current.rejectEvent(id, "Missing GPX route"));
    const e = result.current.events.find((x) => x.id === id);
    expect(e?.status).toBe("rejected");
    expect(e?.rejectionReason).toBe("Missing GPX route");
  });

  it("VIP organizer's submission gets 0% commission", () => {
    const { result } = renderHook(() => useEventsStore(), { wrapper });
    let created!: Event;
    // org2 is VIP in the seed.
    act(() => { created = result.current.submitEvent(draft({ organizerId: "org2", organizerName: "Mountain Runners TH" })); });
    expect(result.current.events.find((e) => e.id === created.id)?.commissionRate).toBe(0);
  });

  it("cancellation request reaches the admin cancellation queue with a refund amount", () => {
    const { result } = renderHook(() => useEventsStore(), { wrapper });
    // Use a seeded live event that carries money (Doi Inthanon = id "1").
    act(() => result.current.requestCancellation("1", "Landslide"));
    const e = result.current.events.find((x) => x.id === "1");
    expect(e?.status).toBe("cancellation_requested");
    expect(e?.refundAmount).toBeGreaterThan(0);
  });

  it("marking a payout paid records the payout date", () => {
    const { result } = renderHook(() => useEventsStore(), { wrapper });
    act(() => result.current.markPayoutPaid("1"));
    const e = result.current.events.find((x) => x.id === "1");
    expect(e?.payoutStatus).toBe("paid");
    expect(e?.payoutDate).toBeTruthy();
  });
});
