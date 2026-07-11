import type { CardInput, PaymentOutcome, PaymentProvider } from "./types";

// Stripe test card numbers → outcome ที่กำหนดไว้ (เลียนแบบ Stripe test mode)
const TEST_CARD_OUTCOMES: Record<string, string> = {
  "4000000000000002": "Your card was declined.",
  "4000000000009995": "Insufficient funds.",
};

// Luhn checksum — เลขบัตรจริงทุกใบต้องผ่าน (mod-10)
export function luhnValid(digits: string): boolean {
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = digits.charCodeAt(i) - 48;
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}

const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

// delayMs ฉีดได้เพื่อให้เทสต์รันเร็ว (createStripeMock(0)); ค่า default ~1.8s
// เลียนแบบเวลาประมวลผลของ Stripe จริง
export function createStripeMock(delayMs = 1800): PaymentProvider {
  return {
    id: "card",
    async confirmCard(input: CardInput): Promise<PaymentOutcome> {
      await delay(delayMs);

      const number = input.number.replace(/\s+/g, "");

      if (!/^\d{12,19}$/.test(number) || !luhnValid(number)) {
        return { status: "failed", message: "Invalid card number." };
      }

      const failure = TEST_CARD_OUTCOMES[number];
      if (failure) {
        return { status: "failed", message: failure };
      }

      return { status: "succeeded" };
    },
  };
}

export const stripeMock: PaymentProvider = createStripeMock();
