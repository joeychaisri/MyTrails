import { describe, expect, it } from "vitest";
import { allScreens, journeys } from "@/stories/product-map/journeyCatalog";

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
});

