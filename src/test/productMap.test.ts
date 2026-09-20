import { describe, expect, it } from "vitest";
import {
  allGaps,
  allScreens,
  completeJourneys,
  incompleteJourneys,
  journeys,
} from "@/stories/product-map/journeyCatalog";

describe("Product Map catalog", () => {
  it("covers every numbered journey exactly once", () => {
    expect(journeys.map((journey) => journey.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });

  it("keeps every pinned story id unique", () => {
    const storyIds = allScreens.map((screen) => screen.storyId);
    expect(new Set(storyIds).size).toBe(storyIds.length);
  });

  it("records ownership and delivery status for every screen", () => {
    expect(allScreens.length).toBeGreaterThan(0);
    for (const { journey, ...screen } of allScreens) {
      expect(["runner", "organizer", "admin"]).toContain(journey.role);
      expect(["locked", "tentative", "draft", "unclassified"]).toContain(journey.uxStatus);
      expect(["verified", "needs-retest", "untested"]).toContain(journey.verification);
      expect(["done", "partial", "planned"]).toContain(screen.buildStatus);
      expect(screen.storyId).not.toBe("");
    }
  });

  it("keeps the Journey Gaps backlog attributable and unique", () => {
    const gapIds = allGaps.map((gap) => gap.id);
    expect(new Set(gapIds).size).toBe(gapIds.length);
    expect(allGaps.length).toBeGreaterThan(0);

    for (const { journey, ...gap } of allGaps) {
      expect(gap.id).toMatch(/^j\d+-/);
      expect(gap.id.startsWith(`j${journey.id}-`)).toBe(true);
      expect(gap.title).not.toBe("");
      expect(gap.detail).not.toBe("");
      expect(["dead-end", "missing-state", "missing-outcome"]).toContain(gap.kind);
      expect(["core", "supporting"]).toContain(gap.priority);
      expect(["open", "in-progress"]).toContain(gap.status);
    }
  });

  it("derives complete and incomplete journeys from one gap source of truth", () => {
    expect(incompleteJourneys.map((journey) => journey.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 11]);
    expect(completeJourneys.map((journey) => journey.id)).toEqual([10]);
    expect(incompleteJourneys.length + completeJourneys.length).toBe(journeys.length);
  });
});
