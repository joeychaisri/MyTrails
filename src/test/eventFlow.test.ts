import { describe, it, expect } from "vitest";
import { mockEvents, EventStatus } from "@/data/mockData";
import { mockOtherEvents, mockPlatformSettings } from "@/data/adminMockData";
import { eventFinance } from "@/contexts/EventsContext";

// The platform-wide event list is what the shared store seeds from.
const allEvents = [...mockEvents, ...mockOtherEvents];

describe("approval flow — seed coverage", () => {
  const has = (s: EventStatus) => allEvents.some((e) => e.status === s);

  it("seeds every stage of the lifecycle so each admin/organizer surface has data", () => {
    expect(has("pending_review")).toBe(true); // admin submission queue + organizer "In Progress"
    expect(has("ready_to_publish")).toBe(true); // admin Publish gate
    expect(has("rejected")).toBe(true); // organizer sees "Changes Requested"
    expect(has("live")).toBe(true); // runner-visible + payout source
    expect(has("cancellation_requested")).toBe(true); // admin cancellation tab
  });

  it("every event has an owner so the organizer dashboard can scope to 'my events'", () => {
    expect(allEvents.every((e) => e.organizerId && e.organizerName)).toBe(true);
  });

  it("has at least one payout payable now", () => {
    expect(allEvents.some((e) => e.payoutStatus === "payable" && (e.grossSales ?? 0) > 0)).toBe(true);
  });

  it("never contains an impossible event with zero race categories", () => {
    // An organizer can't submit an event without at least one category, so no
    // seed (organizer or other-org) may show that state on the admin side.
    expect(allEvents.every((e) => e.categories.length >= 1)).toBe(true);
  });

  it("keeps the organizer dashboard and admin view consistent (org1 owns the demo set)", () => {
    // The demo organizer (org1) is the one you can log in as; their events are
    // exactly what the organizer dashboard shows AND a subset of what admin sees.
    const org1Events = allEvents.filter((e) => e.organizerId === "org1");
    expect(org1Events.length).toBe(6);
    const statuses = new Set(org1Events.map((e) => e.status));
    // org1 alone spans the full lifecycle, so the flow demos end-to-end for one tenant.
    ["live", "pending_review", "ready_to_publish", "rejected", "draft", "cancellation_requested"].forEach((s) =>
      expect(statuses.has(s as never)).toBe(true)
    );
  });
});

describe("commission & payout math", () => {
  it("computes commission and net payout for a standard-tier event", () => {
    // Doi Inthanon: gross 847,500 − refunds 12,000 = 835,500 net; 6% commission.
    const e = mockEvents.find((x) => x.id === "1")!;
    const f = eventFinance(e, mockPlatformSettings);
    expect(f.commission).toBe(Math.round(835500 * 0.06)); // 50,130
    expect(f.netPayout).toBe(835500 - Math.round(835500 * 0.06)); // 785,370
  });

  it("charges 0% commission for a VIP-tier event (commission-exempt)", () => {
    const vip = mockOtherEvents.find((x) => x.commissionRate === 0 && (x.grossSales ?? 0) > 0)!;
    const f = eventFinance(vip, mockPlatformSettings);
    expect(f.commission).toBe(0);
    expect(f.netPayout).toBe((vip.grossSales ?? 0) - (vip.refundedAmount ?? 0));
  });

  it("falls back to the platform default rate when an event has no explicit rate", () => {
    const e = { revenue: 100000, grossSales: 100000, refundedAmount: 0 } as any;
    const f = eventFinance(e, mockPlatformSettings);
    expect(f.rate).toBe(mockPlatformSettings.commissionRate);
    expect(f.commission).toBe(6000);
  });
});
