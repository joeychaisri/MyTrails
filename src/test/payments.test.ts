import { describe, it, expect } from "vitest";
import { createStripeMock } from "../lib/payments/stripeMock";
import { promptpayMock, promptpayQR } from "../lib/payments/promptpayMock";
import { providers, stripeMock } from "../lib/payments";
import type { CardInput } from "../lib/payments";

// ใช้ delay 0 ในเทสต์ให้รันเร็ว — provider จริงหน่วง ~1.8s เลียนแบบ Stripe
const stripe = createStripeMock(0);

const card = (number: string): CardInput => ({
  number,
  exp: "12/28",
  cvc: "123",
  name: "Somchai Jaidee",
});

describe("stripeMock.confirmCard", () => {
  it("บัตรทดสอบ 4242 4242 4242 4242 → succeeded", async () => {
    const result = await stripe.confirmCard!(card("4242424242424242"));
    expect(result).toEqual({ status: "succeeded" });
  });

  it("บัตร 4000 0000 0000 0002 → declined", async () => {
    const result = await stripe.confirmCard!(card("4000000000000002"));
    expect(result).toEqual({
      status: "failed",
      message: "Your card was declined.",
    });
  });

  it("บัตร 4000 0000 0000 9995 → insufficient funds", async () => {
    const result = await stripe.confirmCard!(card("4000000000009995"));
    expect(result).toEqual({
      status: "failed",
      message: "Insufficient funds.",
    });
  });

  it("เลขบัตรที่ luhn ไม่ผ่าน → invalid card number", async () => {
    const result = await stripe.confirmCard!(card("4242424242424241"));
    expect(result).toEqual({
      status: "failed",
      message: "Invalid card number.",
    });
  });

  it("เลขบัตรสั้นเกินไป → invalid card number", async () => {
    const result = await stripe.confirmCard!(card("4242"));
    expect(result).toEqual({
      status: "failed",
      message: "Invalid card number.",
    });
  });

  it("บัตรอื่นที่ luhn ผ่าน → succeeded", async () => {
    const result = await stripe.confirmCard!(card("5555555555554444"));
    expect(result).toEqual({ status: "succeeded" });
  });

  it("เว้นวรรคในเลขบัตรได้ (strip spaces ก่อนเช็ค)", async () => {
    const result = await stripe.confirmCard!(card("4242 4242 4242 4242"));
    expect(result).toEqual({ status: "succeeded" });
  });
});

describe("promptpayQR", () => {
  it("input เดิม → payload เดิมเสมอ (deterministic)", () => {
    expect(promptpayQR(1800, "MT-ABC123")).toBe(promptpayQR(1800, "MT-ABC123"));
  });

  it("code ต่างกัน → payload ต่างกัน", () => {
    expect(promptpayQR(1800, "MT-ABC123")).not.toBe(promptpayQR(1800, "MT-XYZ789"));
  });

  it("payload มี amount และขึ้นต้นตาม EMV template", () => {
    const payload = promptpayQR(2500, "MT-ABC123");
    expect(payload.startsWith("00020101021129370016A0000006770101110113006689999999")).toBe(true);
    expect(payload).toContain("54062500.00");
    expect(payload).toMatch(/6304[0-9A-F]{4}$/);
  });
});

describe("providers registry", () => {
  it("รวม provider ครบทั้ง card และ promptpay ตาม id", () => {
    expect(providers.card).toBe(stripeMock);
    expect(providers.promptpay).toBe(promptpayMock);
    expect(stripeMock.id).toBe("card");
    expect(promptpayMock.id).toBe("promptpay");
    expect(promptpayMock.confirmCard).toBeUndefined();
  });
});
