import { describe, it, expect } from "vitest";
import { eventPhase, ticketWindowState } from "@/lib/eventPhase";
import { mockEvents, Ticket } from "@/data/mockData";

const at = (s: string) => new Date(s);

const ticket = (over: Partial<Ticket> = {}): Ticket => ({
  id: "t1",
  name: "Regular",
  price: 1500,
  quantity: 100,
  sold: 0,
  ...over,
});

const eventWith = (tickets: Ticket[], date = "2026-09-15", endDate = "2026-09-16") => ({
  ...mockEvents[0],
  date,
  endDate,
  categories: [{ ...mockEvents[0].categories[0], tickets }],
});

describe("ticketWindowState", () => {
  it("is not_yet before salesStart", () => {
    const t = ticket({ salesStart: "2026-08-01T00:00", salesEnd: "2026-08-31T23:59" });
    expect(ticketWindowState(t, at("2026-07-15T00:00:00"))).toBe("not_yet");
  });
  it("is on_sale inside the window", () => {
    const t = ticket({ salesStart: "2026-08-01T00:00", salesEnd: "2026-08-31T23:59" });
    expect(ticketWindowState(t, at("2026-08-15T00:00:00"))).toBe("on_sale");
  });
  it("is ended after salesEnd", () => {
    const t = ticket({ salesStart: "2026-08-01T00:00", salesEnd: "2026-08-31T23:59" });
    expect(ticketWindowState(t, at("2026-09-01T00:00:00"))).toBe("ended");
  });
  it("is on_sale when no window is set (open-ended)", () => {
    expect(ticketWindowState(ticket(), at("2026-01-01T00:00:00"))).toBe("on_sale");
  });
});

describe("eventPhase", () => {
  it("is finished after endDate", () => {
    expect(eventPhase(eventWith([ticket()]), at("2026-09-17T00:00:00"))).toBe("finished");
  });
  it("is ongoing between date and endDate", () => {
    expect(eventPhase(eventWith([ticket()]), at("2026-09-15T12:00:00"))).toBe("ongoing");
  });
  it("treats a missing endDate as a same-day event", () => {
    const ev = eventWith([ticket()], "2026-09-15", "");
    expect(eventPhase(ev, at("2026-09-15T12:00:00"))).toBe("ongoing");
    expect(eventPhase(ev, at("2026-09-16T12:00:00"))).toBe("finished");
  });
  it("is registration_open before the event while a ticket is on sale", () => {
    const t = ticket({ salesStart: "2026-07-01T00:00", salesEnd: "2026-08-31T23:59" });
    expect(eventPhase(eventWith([t]), at("2026-07-15T00:00:00"))).toBe("registration_open");
  });
  it("is registration_closed when every window has ended but the event has not started", () => {
    const t = ticket({ salesStart: "2026-06-01T00:00", salesEnd: "2026-06-30T23:59" });
    expect(eventPhase(eventWith([t]), at("2026-08-01T00:00:00"))).toBe("registration_closed");
  });
  it("is upcoming before any window opens", () => {
    const t = ticket({ salesStart: "2026-08-01T00:00", salesEnd: "2026-08-31T23:59" });
    expect(eventPhase(eventWith([t]), at("2026-07-01T00:00:00"))).toBe("upcoming");
  });
});
