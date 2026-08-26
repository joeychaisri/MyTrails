import { describe, it, expect } from "vitest";
import { mockEvents, EventStatus } from "@/data/mockData";
import { mockAdminOrganizers, mockOtherEvents, mockPlatformSettings } from "@/data/adminMockData";
import { eventFinance, eventCommissionAmount, eventServiceFee, resolveBracket } from "@/contexts/EventsContext";

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

const brackets = mockPlatformSettings.commissionBrackets;

describe("event commission scale (by registrations)", () => {
  it("charges a flat 1,000 THB under 300 registrations", () => {
    expect(eventCommissionAmount(250, 400000, brackets)).toBe(1000);
  });
  it("charges 8% for 300–999 registrations", () => {
    expect(eventCommissionAmount(500, 750000, brackets)).toBe(Math.round(750000 * 0.08));
  });
  it("charges 6% (volume discount) at 1,000+ registrations", () => {
    expect(eventCommissionAmount(1500, 3_000_000, brackets)).toBe(Math.round(3_000_000 * 0.06));
  });
  it("honours an admin override amount", () => {
    expect(eventCommissionAmount(500, 750000, brackets, 25000)).toBe(25000);
  });
  it("prices the whole event off the bracket the count lands in, not progressively", () => {
    // 500 registrations sits in the 300+ bracket, so all 750,000 is charged at
    // 8% — the first 299 runners are NOT priced at the lower flat rate.
    expect(eventCommissionAmount(500, 750000, brackets)).toBe(60000);
  });
  it("follows a retuned scale from platform settings", () => {
    const custom = [
      { id: "a", minCount: 0, type: "percent" as const, value: 20 },
      { id: "b", minCount: 100, type: "percent" as const, value: 10 },
    ];
    expect(eventCommissionAmount(50, 100000, custom)).toBe(20000);
    expect(eventCommissionAmount(150, 100000, custom)).toBe(10000);
  });
});

describe("bracket resolution", () => {
  it("picks the highest bracket the count reaches", () => {
    expect(resolveBracket(0, brackets)?.minCount).toBe(0);
    expect(resolveBracket(299, brackets)?.minCount).toBe(0);
    expect(resolveBracket(300, brackets)?.minCount).toBe(300);
    expect(resolveBracket(999, brackets)?.minCount).toBe(300);
    expect(resolveBracket(1000, brackets)?.minCount).toBe(1000);
  });
  it("falls back to the lowest bracket when the count is below every minCount", () => {
    const gapped = [{ id: "a", minCount: 50, type: "flat" as const, value: 500 }];
    expect(resolveBracket(10, gapped)?.id).toBe("a");
  });
  it("returns nothing for an empty scale, and that prices at zero", () => {
    expect(resolveBracket(500, [])).toBeUndefined();
    expect(eventCommissionAmount(500, 750000, [])).toBe(0);
  });
});

describe("payout math — service fee + event commission", () => {
  it("adds the flat service fee to the event commission", () => {
    // Doi Inthanon (id 1): gross 847,500 − 12,000 refunds = 835,500 net.
    // sold 423 → 8% event commission; plus the flat 1,500 service fee.
    const e = mockEvents.find((x) => x.id === "1")!;
    const f = eventFinance(e, mockAdminOrganizers, mockPlatformSettings);
    expect(f.eventCommission).toBe(Math.round(835500 * 0.08));
    expect(f.serviceFee).toBe(mockPlatformSettings.serviceFee);
    expect(f.totalCommission).toBe(f.eventCommission + f.serviceFee);
    expect(f.netPayout).toBe(835500 - f.totalCommission);
  });

  it("charges the same service fee to a small event as a large one", () => {
    const small = mockOtherEvents.find((x) => x.id === "ae4")!;
    const large = mockEvents.find((x) => x.id === "1")!;
    const fSmall = eventFinance(small, mockAdminOrganizers, mockPlatformSettings);
    const fLarge = eventFinance(large, mockAdminOrganizers, mockPlatformSettings);
    expect(fSmall.serviceFee).toBe(fLarge.serviceFee);
  });

  it("lets a per-event override replace the platform service fee", () => {
    const e = mockEvents.find((x) => x.id === "1")!;
    expect(eventServiceFee({ ...e, serviceFeeOverride: 0 }, mockPlatformSettings)).toBe(0);
    expect(eventServiceFee({ ...e, serviceFeeOverride: 2500 }, mockPlatformSettings)).toBe(2500);
    expect(eventServiceFee(e, mockPlatformSettings)).toBe(mockPlatformSettings.serviceFee);
  });

  it("applies both admin overrides together", () => {
    const e = mockEvents.find((x) => x.id === "1")!;
    const f = eventFinance(
      { ...e, eventCommissionOverride: 20000, serviceFeeOverride: 500 },
      mockAdminOrganizers,
      mockPlatformSettings
    );
    expect(f.totalCommission).toBe(20500);
    expect(f.netPayout).toBe(835500 - 20500);
  });
});
