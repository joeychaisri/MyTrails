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

  it("approves an ASAP event straight to live", () => {
    const { result } = renderHook(() => useEventsStore(), { wrapper });
    let id!: string;
    act(() => { id = result.current.submitEvent(draft({ publishMode: "asap" })).id; });
    act(() => result.current.approveEvent(id));
    expect(result.current.events.find((e) => e.id === id)?.status).toBe("live");
  });

  it("approves a future-scheduled event to 'scheduled', not live", () => {
    const { result } = renderHook(() => useEventsStore(), { wrapper });
    let id!: string;
    act(() => {
      id = result.current.submitEvent(draft({ publishMode: "scheduled", publishAt: "2099-01-01T00:00:00" })).id;
    });
    act(() => result.current.approveEvent(id));
    expect(result.current.events.find((e) => e.id === id)?.status).toBe("scheduled");
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

  it("adds and deletes a tier (delete blocked while in use)", () => {
    const { result } = renderHook(() => useEventsStore(), { wrapper });
    act(() => result.current.addTier("Elite", 3));
    const elite = result.current.settings.tiers.find((t) => t.name === "Elite")!;
    expect(elite.commissionRate).toBe(3);
    // t-standard is used by org1 → delete is a no-op.
    act(() => result.current.deleteTier("t-standard"));
    expect(result.current.settings.tiers.some((t) => t.id === "t-standard")).toBe(true);
    // Unused new tier can be deleted.
    act(() => result.current.deleteTier(elite.id));
    expect(result.current.settings.tiers.some((t) => t.id === elite.id)).toBe(false);
  });

  it("marking a payout paid records the payout date", () => {
    const { result } = renderHook(() => useEventsStore(), { wrapper });
    act(() => result.current.markPayoutPaid("1"));
    const e = result.current.events.find((x) => x.id === "1");
    expect(e?.payoutStatus).toBe("paid");
    expect(e?.payoutDate).toBeTruthy();
  });
});
