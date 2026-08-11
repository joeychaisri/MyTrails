import { describe, it, expect } from "vitest";
import { formatDigest, nextCheckpoint, NotifyMessage } from "@/lib/board/notify";

const msg = (over: Partial<NotifyMessage> = {}): NotifyMessage => ({
  id: "m1",
  ticketId: "t1",
  ticketTitle: "ปุ่ม Submit ควรอยู่ตรงไหน",
  ticketStatus: "asked_ux",
  authorName: "Nan",
  authorRole: "dev",
  body: "ปุ่มอยู่ล่างสุด ต้องเลื่อนจอลงไปกด",
  createdAt: "2026-08-11T07:00:00.000000+00:00",
  ...over,
});

describe("nextCheckpoint", () => {
  it("returns the newest createdAt in the batch", () => {
    const out = nextCheckpoint([
      msg({ id: "a", createdAt: "2026-08-11T07:00:00.000000+00:00" }),
      msg({ id: "b", createdAt: "2026-08-11T09:30:00.000000+00:00" }),
      msg({ id: "c", createdAt: "2026-08-11T08:00:00.000000+00:00" }),
    ]);
    expect(out).toBe("2026-08-11T09:30:00.000000+00:00");
  });

  it("returns null for an empty batch", () => {
    expect(nextCheckpoint([])).toBeNull();
  });
});

describe("formatDigest", () => {
  it("renders one message as header, topic, author line and link", () => {
    expect(formatDigest([msg({ ticketId: "abc-123" })])).toBe(
      [
        "🎫 MyTrails board — 1 ข้อความใหม่",
        "",
        "▸ ปุ่ม Submit ควรอยู่ตรงไหน [Asked UX]",
        "  Nan (Dev): ปุ่มอยู่ล่างสุด ต้องเลื่อนจอลงไปกด",
        "  https://mytrails.theingress.co/board/abc-123",
      ].join("\n"),
    );
  });

  it("counts every new message in the header", () => {
    const out = formatDigest([
      msg({ id: "a", ticketId: "t1" }),
      msg({ id: "b", ticketId: "t2" }),
      msg({ id: "c", ticketId: "t2" }),
    ]);
    expect(out.split("\n")[0]).toBe("🎫 MyTrails board — 3 ข้อความใหม่");
  });

  it("collapses a topic with several new messages, showing the newest body and a count", () => {
    const out = formatDigest([
      msg({ id: "a", body: "ข้อความเก่า", createdAt: "2026-08-11T07:00:00.000000+00:00" }),
      msg({
        id: "b",
        authorName: "Joey",
        authorRole: "ux",
        ticketStatus: "answered",
        body: "ข้อความใหม่สุด",
        createdAt: "2026-08-11T08:00:00.000000+00:00",
      }),
    ]);
    expect(out).toContain("▸ ปุ่ม Submit ควรอยู่ตรงไหน [Answered] · 2 ข้อความ");
    expect(out).toContain("  Joey (UX): ข้อความใหม่สุด");
    expect(out).not.toContain("ข้อความเก่า");
  });

  it("orders topics by their newest message, newest first", () => {
    const out = formatDigest([
      msg({ id: "a", ticketId: "old", ticketTitle: "เรื่องเก่า", createdAt: "2026-08-11T07:00:00.000000+00:00" }),
      msg({ id: "b", ticketId: "new", ticketTitle: "เรื่องใหม่", createdAt: "2026-08-11T09:00:00.000000+00:00" }),
    ]);
    expect(out.indexOf("เรื่องใหม่")).toBeLessThan(out.indexOf("เรื่องเก่า"));
  });

  it("truncates a long body to 80 characters", () => {
    const body = "ก".repeat(200);
    const out = formatDigest([msg({ body })]);
    expect(out).toContain(`  Nan (Dev): ${"ก".repeat(80)}…`);
    expect(out).not.toContain("ก".repeat(81));
  });

  it("collapses newlines in the body to single spaces", () => {
    const out = formatDigest([msg({ body: "บรรทัดหนึ่ง\n\nบรรทัดสอง" })]);
    expect(out).toContain("  Nan (Dev): บรรทัดหนึ่ง บรรทัดสอง");
  });

  it("shows at most five topics and notes how many were left out", () => {
    const messages = Array.from({ length: 7 }, (_, i) =>
      msg({
        id: `m${i}`,
        ticketId: `t${i}`,
        ticketTitle: `เรื่องที่ ${i}`,
        createdAt: `2026-08-11T0${i}:00:00.000000+00:00`,
      }),
    );
    const out = formatDigest(messages);
    expect(out).toContain("▸ เรื่องที่ 6");
    expect(out).toContain("▸ เรื่องที่ 2");
    expect(out).not.toContain("▸ เรื่องที่ 1");
    expect(out).not.toContain("▸ เรื่องที่ 0");
    expect(out).toContain("…และอีก 2 เรื่อง");
  });

  it("returns an empty string when there is nothing new", () => {
    expect(formatDigest([])).toBe("");
  });
});
