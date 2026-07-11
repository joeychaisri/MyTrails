import type { PaymentProvider } from "./types";
import { stripeMock } from "./stripeMock";
import { promptpayMock } from "./promptpayMock";

export type { CardInput, PaymentOutcome, PaymentProvider } from "./types";
export { createStripeMock, stripeMock, luhnValid } from "./stripeMock";
export { promptpayMock, promptpayQR } from "./promptpayMock";

// provider ทั้งหมด key ตาม id — ฝั่ง UI เลือกด้วย paymentMethod ได้ตรงๆ
export const providers: Record<PaymentProvider["id"], PaymentProvider> = {
  card: stripeMock,
  promptpay: promptpayMock,
};
