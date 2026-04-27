import { describe, it, expect } from "vitest";
import { calculateDistanceChange } from "../lib/distanceChangePolicy";

describe("calculateDistanceChange", () => {
  it("Upgrade ใน period 3-12 เม.ย.: ไม่มีค่าธรรมเนียม จ่ายส่วนต่าง + ออก Tax Invoice", () => {
    const result = calculateDistanceChange("50K Trail", "100K Ultra", new Date(2026, 3, 5));
    expect(result.type).toBe("upgrade");
    expect(result.allowed).toBe(true);
    expect(result.fee).toBe(0);
    expect(result.priceDiff).toBe(1200);       // 3000 - 1800
    expect(result.netAmount).toBe(1200);        // 1200 + 0 fee
    expect(result.documentType).toBe("tax_invoice");
  });

  it("Upgrade ใน period 13 เม.ย.-31 ก.ค.: ค่าธรรมเนียม ฿250 + Tax Invoice", () => {
    const result = calculateDistanceChange("25K Fun Run", "50K Trail", new Date(2026, 3, 20));
    expect(result.type).toBe("upgrade");
    expect(result.allowed).toBe(true);
    expect(result.fee).toBe(250);
    expect(result.priceDiff).toBe(600);        // 1800 - 1200
    expect(result.netAmount).toBe(850);         // 600 + 250 fee
    expect(result.documentType).toBe("tax_invoice");
  });

  it("Downgrade ใน period 3-12 เม.ย.: ฟรี คืนส่วนต่างเต็ม + Credit Note", () => {
    const result = calculateDistanceChange("100K Ultra", "50K Trail", new Date(2026, 3, 8));
    expect(result.type).toBe("downgrade");
    expect(result.allowed).toBe(true);
    expect(result.fee).toBe(0);
    expect(result.priceDiff).toBe(1200);       // 3000 - 1800
    expect(result.refundAmount).toBe(1200);
    expect(result.netAmount).toBe(1200);        // 1200 - 0 fee
    expect(result.documentType).toBe("credit_note");
  });

  it("Downgrade ใน period 1 ส.ค.-30 ก.ย.: ค่าธรรมเนียม ฿250 ไม่คืนส่วนต่าง", () => {
    const result = calculateDistanceChange("100K Ultra", "50K Trail", new Date(2026, 7, 10));
    expect(result.type).toBe("downgrade");
    expect(result.allowed).toBe(true);
    expect(result.fee).toBe(250);
    expect(result.refundAmount).toBe(0);
    expect(result.netAmount).toBe(0);
    expect(result.documentType).toBe("credit_note");
  });

  it("Upgrade หลัง 1 ต.ค.: ไม่อนุญาต", () => {
    const result = calculateDistanceChange("50K Trail", "100K Ultra", new Date(2026, 9, 5));
    expect(result.type).toBe("upgrade");
    expect(result.allowed).toBe(false);
  });

  it("ระยะเดิมและใหม่เหมือนกัน: type same", () => {
    const result = calculateDistanceChange("50K Trail", "50K Trail", new Date(2026, 3, 5));
    expect(result.type).toBe("same");
    expect(result.allowed).toBe(false);
  });
});
