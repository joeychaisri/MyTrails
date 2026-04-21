import { describe, it, expect } from "vitest";
import { calculateRefund } from "../lib/refundPolicy";

describe("calculateRefund", () => {
  it("คืน 100% หัก 5% payment fee และ ฿250 processing fee ใน period 3-12 เม.ย.", () => {
    const result = calculateRefund(2500, new Date(2026, 3, 5)); // Apr 5
    expect(result.canRefund).toBe(true);
    expect(result.paymentFee).toBe(125);       // 2500 * 0.05
    expect(result.processingFee).toBe(250);
    expect(result.refundRate).toBe(1.0);
    // base = 2500 - 125 = 2375, refund = (2375 - 250) * 1.0 = 2125
    expect(result.refundAmount).toBe(2125);
  });

  it("คืน 70% หัก 5% payment fee ใน period 13 เม.ย.–31 ก.ค.", () => {
    const result = calculateRefund(2500, new Date(2026, 3, 20)); // Apr 20
    expect(result.canRefund).toBe(true);
    expect(result.paymentFee).toBe(125);
    expect(result.processingFee).toBe(0);
    expect(result.refundRate).toBe(0.7);
    // base = 2375, refund = 2375 * 0.7 = 1662.5 → round → 1663
    expect(result.refundAmount).toBe(1663);
  });

  it("คืน 50% ใน period 1 ส.ค.–30 ก.ย.", () => {
    const result = calculateRefund(1800, new Date(2026, 7, 15)); // Aug 15
    expect(result.canRefund).toBe(true);
    expect(result.refundRate).toBe(0.5);
    // base = 1800 - 90 = 1710, refund = 1710 * 0.5 = 855
    expect(result.refundAmount).toBe(855);
  });

  it("ไม่สามารถคืนเงินได้หลัง 1 ต.ค.", () => {
    const result = calculateRefund(2500, new Date(2026, 9, 5)); // Oct 5
    expect(result.canRefund).toBe(false);
    expect(result.refundAmount).toBe(0);
  });

  it("ก่อนช่วงที่กำหนด (ก่อน 3 เม.ย.) ไม่สามารถคืนเงินได้", () => {
    const result = calculateRefund(2500, new Date(2026, 2, 1)); // Mar 1
    expect(result.canRefund).toBe(false);
  });

  it("คืน 0 บาทถ้า amount เป็น 0 (Sponsor)", () => {
    const result = calculateRefund(0, new Date(2026, 3, 10));
    expect(result.refundAmount).toBe(0);
  });
});
