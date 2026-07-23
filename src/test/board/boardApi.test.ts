import { describe, it, expect } from "vitest";
import { rowToTicket, rowToMessage } from "@/lib/board/boardApi";

describe("board mappers", () => {
  it("maps a ticket row (snake_case → camelCase, null-safe refs)", () => {
    const t = rowToTicket({
      id: "t1",
      title: "Button spacing",
      status: "asked_ux",
      screen_ref_journey: "Design System",
      screen_ref_note: null,
      created_by_name: "Dao",
      created_by_role: "dev",
      created_at: "2026-07-23T00:00:00Z",
      updated_at: "2026-07-23T01:00:00Z",
      support_ticket_messages: [{ count: 3 }],
    });
    expect(t).toMatchObject({
      id: "t1",
      title: "Button spacing",
      status: "asked_ux",
      screenRefJourney: "Design System",
      screenRefNote: null,
      createdByName: "Dao",
      createdByRole: "dev",
      replyCount: 3,
    });
  });

  it("defaults replyCount to 0 when no aggregate is present", () => {
    const t = rowToTicket({
      id: "t2", title: "x", status: "closed",
      screen_ref_journey: null, screen_ref_note: "somewhere",
      created_by_name: "A", created_by_role: "ux",
      created_at: "2026-07-23T00:00:00Z", updated_at: "2026-07-23T00:00:00Z",
    });
    expect(t.replyCount).toBe(0);
    expect(t.screenRefNote).toBe("somewhere");
  });

  it("maps a message row", () => {
    const m = rowToMessage({
      id: "m1", ticket_id: "t1", author_name: "Joey",
      author_role: "ux", body: "Use 8px", created_at: "2026-07-23T02:00:00Z",
    });
    expect(m).toEqual({
      id: "m1", ticketId: "t1", authorName: "Joey",
      authorRole: "ux", body: "Use 8px", createdAt: "2026-07-23T02:00:00Z",
    });
  });
});
