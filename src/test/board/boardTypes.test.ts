import { describe, it, expect } from "vitest";
import { STATUS_META, STATUS_ORDER, ROLE_META, JOURNEY_OPTIONS } from "@/lib/board/boardTypes";

describe("board metadata", () => {
  it("has meta + ordering for all five statuses", () => {
    const keys = ["asked_ux", "in_progress", "waiting_po", "answered", "closed"] as const;
    for (const k of keys) {
      expect(STATUS_META[k].label).toBeTruthy();
      expect(STATUS_META[k].className).toContain("bg-");
    }
    expect(STATUS_ORDER).toEqual([...keys]);
  });

  it("has meta for all three roles", () => {
    for (const k of ["dev", "ux", "po"] as const) {
      expect(ROLE_META[k].label).toBeTruthy();
    }
  });

  it("offers journey options for the screen-ref dropdown", () => {
    expect(JOURNEY_OPTIONS.length).toBeGreaterThan(5);
  });
});
