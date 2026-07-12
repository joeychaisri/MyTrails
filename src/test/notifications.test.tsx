import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { EventsProvider, useEventsStore } from "@/contexts/EventsContext";
import { EMAIL_FROM, notificationEmail, useNotifications } from "@/hooks/data/useNotifications";
import { RunnerInfo } from "@/data/mockData";

// useNotifications is pure derivation over the shared store — these tests run
// it against the seed data (org1 covers pending/rejected/scheduled/payable) and
// against registrations created live through the store.

const wrapper = ({ children }: { children: React.ReactNode }) => <EventsProvider>{children}</EventsProvider>;

const harness = (organizerId: string | null = "org1") =>
  renderHook(() => ({ store: useEventsStore(), notifications: useNotifications(organizerId) }), { wrapper });

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

describe("useNotifications — event lifecycle (seed store)", () => {
  beforeEach(() => localStorage.clear());

  it("derives submitted / rejected / scheduled / payout notifications for org1's seed events", () => {
    const { result } = harness();
    const kinds = result.current.notifications.map((n) => n.kind);
    expect(kinds).toContain("event_submitted"); // event 2 pending_review
    expect(kinds).toContain("event_rejected"); // event 5 rejected
    expect(kinds).toContain("event_scheduled"); // event 4 scheduled
    expect(kinds).toContain("payout_payable"); // event 1 payoutStatus payable
  });

  it("carries the rejection reason snippet and the publish date in titles/bodies", () => {
    const { result } = harness();
    const rejected = result.current.notifications.find((n) => n.kind === "event_rejected");
    expect(rejected?.body).toContain("Krabi Jungle Trail");
    expect(rejected?.body).toContain("missing ticket prices");
    const scheduled = result.current.notifications.find((n) => n.kind === "event_scheduled");
    expect(scheduled?.title).toContain("Approved — goes live");
    expect(scheduled?.title).toContain("15 Oct 2026"); // event 4 publishAt
  });

  it("reflects store transitions: paying a payable event yields a payout_paid notification", () => {
    const { result } = harness();
    act(() => result.current.store.markPayoutPaid("1"));
    const paid = result.current.notifications.find((n) => n.kind === "payout_paid");
    expect(paid).toBeDefined();
    expect(paid?.eventId).toBe("1");
    // …and payable for that event is gone (status moved on).
    expect(result.current.notifications.some((n) => n.kind === "payout_payable" && n.eventId === "1")).toBe(false);
  });

  it("scopes to the given organizer and returns [] when logged out", () => {
    const { result: none } = harness(null);
    expect(none.current.notifications).toEqual([]);
    const { result: other } = harness("org-does-not-exist");
    expect(other.current.notifications).toEqual([]);
  });

  it("sorts newest-first by the best-available date string", () => {
    const { result } = harness();
    const dates = result.current.notifications.map((n) => n.at);
    const defined = dates.filter((d): d is string => !!d);
    expect([...defined].sort((a, b) => b.localeCompare(a))).toEqual(defined);
    // undated entries (if any) must trail the dated ones
    const firstUndated = dates.findIndex((d) => !d);
    if (firstUndated !== -1) expect(dates.slice(firstUndated).every((d) => !d)).toBe(true);
  });
});

describe("useNotifications — registrations (created via the store)", () => {
  beforeEach(() => localStorage.clear());

  it("surfaces a confirmed card registration as 'New registration — {runner} ({event})'", () => {
    const { result } = harness();
    let id!: string;
    act(() => {
      const res = result.current.store.createRegistration({
        eventId: "1",
        categoryId: "1b",
        ticketId: "t5",
        runner: runner(),
      });
      if (!res.ok) throw new Error(`registration failed: ${res.reason}`);
      id = res.registration.id;
    });
    act(() => result.current.store.confirmRegistration(id, "card"));
    const n = result.current.notifications.find((x) => x.kind === "registration_confirmed");
    expect(n?.title).toBe("New registration — Somchai Jaidee (Doi Inthanon Trail Challenge)");
    expect(n?.eventId).toBe("1");
  });

  it("surfaces an awaiting_verification promptpay registration as a pending slip", () => {
    const { result } = harness();
    let id!: string;
    act(() => {
      const res = result.current.store.createRegistration({
        eventId: "1",
        categoryId: "1b",
        ticketId: "t5",
        runner: runner({ email: "kanya@example.com", firstName: "Kanya", lastName: "Phromma" }),
      });
      if (!res.ok) throw new Error(`registration failed: ${res.reason}`);
      id = res.registration.id;
    });
    act(() => result.current.store.confirmRegistration(id, "promptpay", "data:image/png;base64,x"));
    const n = result.current.notifications.find((x) => x.kind === "slip_pending");
    expect(n?.title).toBe("Slip waiting for verification");
    expect(n?.body).toContain("Kanya Phromma");
    expect(n?.body).toContain("Doi Inthanon Trail Challenge");
  });
});

describe("notificationEmail", () => {
  beforeEach(() => localStorage.clear());

  it("builds a subject / preheader / bodyLines for every derived notification", () => {
    const { result } = harness();
    expect(result.current.notifications.length).toBeGreaterThan(0);
    for (const n of result.current.notifications) {
      const email = notificationEmail(n);
      expect(email.subject.length).toBeGreaterThan(0);
      expect(email.preheader).toBe(n.body);
      expect(email.bodyLines.length).toBeGreaterThan(1);
      expect(email.bodyLines).toContain(n.body);
    }
    expect(EMAIL_FROM).toBe("MyTrails <noreply@mytrails.run>");
  });
});
