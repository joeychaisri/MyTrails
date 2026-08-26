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

  it("adds, edits and deletes a commission bracket", () => {
    const { result } = renderHook(() => useEventsStore(), { wrapper });
    act(() => result.current.addBracket({ minCount: 2000, type: "percent", value: 4 }));
    const added = result.current.settings.commissionBrackets.find((b) => b.minCount === 2000)!;
    expect(added.value).toBe(4);
    act(() => result.current.updateBracket(added.id, { value: 5 }));
    expect(result.current.settings.commissionBrackets.find((b) => b.id === added.id)?.value).toBe(5);
    act(() => result.current.deleteBracket(added.id));
    expect(result.current.settings.commissionBrackets.some((b) => b.id === added.id)).toBe(false);
  });

  it("refuses to delete the last commission bracket", () => {
    const { result } = renderHook(() => useEventsStore(), { wrapper });
    const ids = result.current.settings.commissionBrackets.map((b) => b.id);
    act(() => ids.slice(0, -1).forEach((id) => result.current.deleteBracket(id)));
    expect(result.current.settings.commissionBrackets).toHaveLength(1);
    const last = result.current.settings.commissionBrackets[0].id;
    act(() => result.current.deleteBracket(last));
    expect(result.current.settings.commissionBrackets).toHaveLength(1);
  });

  it("saves a new platform service fee", () => {
    const { result } = renderHook(() => useEventsStore(), { wrapper });
    act(() => result.current.saveSettings({ ...result.current.settings, serviceFee: 2000 }));
    expect(result.current.settings.serviceFee).toBe(2000);
  });

  it("marking a payout paid records the payout date", () => {
    const { result } = renderHook(() => useEventsStore(), { wrapper });
    act(() => result.current.markPayoutPaid("1"));
    const e = result.current.events.find((x) => x.id === "1");
    expect(e?.payoutStatus).toBe("paid");
    expect(e?.payoutDate).toBeTruthy();
  });
});
