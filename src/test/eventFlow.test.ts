import { describe, it, expect } from "vitest";
import { mockEvents, EventStatus } from "@/data/mockData";
import { mockAdminOrganizers, mockOtherEvents, mockPlatformSettings } from "@/data/adminMockData";
import { eventFinance, eventCommissionAmount } from "@/contexts/EventsContext";

// The platform-wide event list is what the shared store seeds from.
const allEvents = [...mockEvents, ...mockOtherEvents];

describe("approval flow — seed coverage", () => {
  const has = (s: EventStatus) => allEvents.some((e) => e.status === s);

  it("seeds every stage of the lifecycle so each admin/organizer surface has data", () => {
    expect(has("pending_review")).toBe(true); // admin submission queue + organizer "In Review"
    expect(has("scheduled")).toBe(true); // approved, waiting for go-live date
    expect(has("rejected")).toBe(true); // organizer sees "Changes Requested"
    expect(has("live")).toBe(true); // runner-visible + payout source
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
    ["live", "pending_review", "scheduled", "rejected", "draft"].forEach((s) =>
      expect(statuses.has(s as never)).toBe(true)
    );
  });
});

describe("event commission scale (by registrations)", () => {
  it("charges a flat 1,000 THB under 300 registrations", () => {
    expect(eventCommissionAmount(250, 400000)).toBe(1000);
  });
  it("charges 8% for 300–999 registrations", () => {
    expect(eventCommissionAmount(500, 750000)).toBe(Math.round(750000 * 0.08));
  });
  it("charges 6% (volume discount) at 1,000+ registrations", () => {
    expect(eventCommissionAmount(1500, 3_000_000)).toBe(Math.round(3_000_000 * 0.06));
  });
  it("honours an admin override amount", () => {
    expect(eventCommissionAmount(500, 750000, 25000)).toBe(25000);
  });
});

describe("two-part payout math", () => {
  it("adds event + tier commission for a standard-tier event", () => {
    // Doi Inthanon (id 1, org1=Standard 2%): gross 847,500 − 12,000 refunds = 835,500 net.
    // sold 423 → 8% event commission; +2% tier.
    const e = mockEvents.find((x) => x.id === "1")!;
    const f = eventFinance(e, mockAdminOrganizers, mockPlatformSettings);
    expect(f.eventCommission).toBe(Math.round(835500 * 0.08));
    expect(f.tierCommission).toBe(Math.round(835500 * 0.02));
    expect(f.totalCommission).toBe(f.eventCommission + f.tierCommission);
    expect(f.netPayout).toBe(835500 - f.totalCommission);
  });

  it("charges 0% tier commission for a VIP-tier organizer", () => {
    // ae2 (Kanchanaburi) belongs to org2 = VIP (0% tier).
    const vip = mockOtherEvents.find((x) => x.id === "ae2")!;
    const f = eventFinance(vip, mockAdminOrganizers, mockPlatformSettings);
    expect(f.tierCommission).toBe(0);
    expect(f.totalCommission).toBe(f.eventCommission);
  });
});
