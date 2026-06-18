import { describe, it, expect } from "vitest";
import {
  parseEventDate,
  groupEventsByMonth,
  monthHistogram,
  yearsWithEvents,
} from "@/lib/eventCalendar";

describe("parseEventDate", () => {
  it("parses 'MMM DD, YYYY'", () => {
    const d = parseEventDate("Apr 27, 2026");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(3); // April = index 3
    expect(d.getDate()).toBe(27);
  });

  it("tolerates single-digit days and missing comma", () => {
    expect(parseEventDate("Jun 7, 2026").getDate()).toBe(7);
    expect(parseEventDate("Jun 7 2026").getMonth()).toBe(5);
  });

  it("returns an Invalid Date for garbage input", () => {
    expect(isNaN(parseEventDate("not a date").getTime())).toBe(true);
    expect(isNaN(parseEventDate("Xyz 1, 2026").getTime())).toBe(true);
  });
});

describe("groupEventsByMonth", () => {
  const events = [
    { date: "May 18, 2026", id: "b" },
    { date: "Apr 27, 2026", id: "a" },
    { date: "May 2, 2026", id: "a2" },
    { date: "bad date", id: "skip" },
  ];

  it("groups by month and sorts groups chronologically", () => {
    const groups = groupEventsByMonth(events);
    expect(groups.map((g) => g.key)).toEqual(["2026-04", "2026-05"]);
    expect(groups[0].label).toBe("April 2026");
  });

  it("sorts events within a month by day and drops unparseable dates", () => {
    const groups = groupEventsByMonth(events);
    const may = groups.find((g) => g.key === "2026-05")!;
    expect(may.events.map((e) => e.id)).toEqual(["a2", "b"]); // May 2 before May 18
    const total = groups.reduce((n, g) => n + g.events.length, 0);
    expect(total).toBe(3); // "skip" dropped
  });
});

describe("monthHistogram", () => {
  it("counts events per month for the given year", () => {
    const events = [
      { date: "Apr 27, 2026" },
      { date: "May 18, 2026" },
      { date: "May 2, 2026" },
      { date: "Jan 5, 2025" }, // different year, excluded
    ];
    const hist = monthHistogram(events, 2026);
    expect(hist).toHaveLength(12);
    expect(hist[3]).toBe(1); // April
    expect(hist[4]).toBe(2); // May
    expect(hist[0]).toBe(0); // January (only the 2025 one)
  });
});

describe("yearsWithEvents", () => {
  it("returns sorted unique years, ignoring bad dates", () => {
    const events = [
      { date: "May 18, 2026" },
      { date: "Jan 5, 2025" },
      { date: "Apr 27, 2026" },
      { date: "broken" },
    ];
    expect(yearsWithEvents(events)).toEqual([2025, 2026]);
  });
});
