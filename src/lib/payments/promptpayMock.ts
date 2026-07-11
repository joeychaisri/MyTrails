import type { PaymentProvider } from "./types";

// PromptPay ไม่มี card confirmation — จ่ายด้วยสแกน QR + อัพโหลดสลิป
export const promptpayMock: PaymentProvider = {
  id: "promptpay",
};

// CRC16-CCITT (ตัว checksum ที่ PromptPay/EMV QR ใช้จริง) — deterministic ล้วน
function crc16(text: string): string {
  let crc = 0xffff;
  for (let i = 0; i < text.length; i++) {
    crc ^= text.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

// สร้าง payload ปลอมหน้าตาเหมือน EMV QR — deterministic จาก input เท่านั้น
// (ไม่มี Date.now/random) ให้ UI เอาไป render เป็น QR ได้ซ้ำผลเดิมเสมอ
export function promptpayQR(amount: number, code: string): string {
  return (
    "00020101021129370016A00000067701011101130066899999999" +
    "5802TH" +
    "5303764" +
    `5406${amount.toFixed(2)}` +
    `6304${crc16(code)}`
  );
}
