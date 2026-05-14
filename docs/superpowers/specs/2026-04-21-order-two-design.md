# Design Spec: Order Two

**Date:** 2026-04-21  
**Status:** Approved  
**Route:** `/events/:id/orders2`  
**Tab Label:** Order Two

---

## Overview

Order Two เป็นหน้า orders ที่ copy มาจากหน้า Orders (Finance) เดิม (`/events/:id/orders`) โดยเพิ่ม 4 feature หลักที่อิงจากนโยบายการคืนเงินและเปลี่ยนระยะ:

1. **Refund Calculator Modal** — คำนวณยอดคืนเงินตาม policy อัตโนมัติ
2. **Order Log (Audit Trail)** — ประวัติการเปลี่ยนแปลงของแต่ละ order
3. **Cash/Transfer Slip Upload** — แนบสลิปสำหรับ payment method Cash
4. **Distance Change Modal** — คำนวณ upgrade/downgrade พร้อมระบุเอกสารที่ต้องออก

หน้าเดิม (`orders`) ไม่มีการแก้ไขใดๆ

---

## Section 1 — โครงสร้างหน้า

- เพิ่ม `"orders2"` เข้า `HubSection` type
- เพิ่ม nav button "Order Two" ถัดจาก "Orders (Finance)" ใน sidebar
- `case "orders2"` ใน `EventManagerHub.tsx` แสดง component `OrderTwoView`
- แยกออกเป็นไฟล์ใหม่ `src/views/OrderTwoView.tsx` เพื่อไม่ให้ `EventManagerHub.tsx` ใหญ่ขึ้น

---

## Section 2 — Refund Calculator Modal

**Trigger:** ปุ่ม "Refund" ใน `···` action menu ของแต่ละ order row

**ข้อมูลที่แสดงใน Modal:**
- ชื่อ / อีเมล / category / ticketType / paymentMethod ของ order
- Date picker "วันที่ลูกค้ายื่นคำขอ" (default = วันนี้)
- Breakdown การคำนวณ:
  - ยอดที่ชำระจริง
  - หัก 5% ค่าธรรมเนียมระบบ (ทุกกรณี, ไม่คืน)
  - หัก ฿250 ค่าธรรมเนียมดำเนินการ (เฉพาะ period 100%)
  - อัตราคืนเงิน (%) ตาม period
  - **ยอดที่จะคืน** (highlighted)
- Period indicator: ช่วงเวลาปัจจุบัน + deadline ถัดไปที่อัตราจะลดลง

**Hardcoded Refund Policy (ใช้ร่วมกันทั้ง PST และ PYT เนื่องจาก logic เหมือนกัน):**

| ช่วงเวลา | อัตราคืน | หมายเหตุ |
|---------|---------|---------|
| 3 เม.ย. – 12 เม.ย. 2026 | 100% | หักเพิ่ม ฿250 processing fee |
| 13 เม.ย. – 31 ก.ค. 2026 | 70% | — |
| 1 ส.ค. – 30 ก.ย. 2026 | 50% | — |
| ตั้งแต่ 1 ต.ค. 2026 | 0% | ปิดปุ่ม Confirm, แสดง "ไม่สามารถคืนเงินได้" |

**สูตรคำนวณ:**
```
base = amount - (amount × 0.05)           // หัก 5% payment fee
if period === "100%": base = base - 250   // หัก processing fee เฉพาะ period นี้
refundAmount = base × refundRate
```

**หลังกด Confirm:**
- status → `pending_refund`
- เพิ่ม log entry: `"ยื่นคำขอคืนเงิน ฿{refundAmount} ({rate}%) — วันที่ขอ {requestDate}"`

---

## Section 3 — Order Log (Audit Trail)

**ที่อยู่:** Order Detail Modal จะเปลี่ยนจาก single-view เป็น 2 tabs:
- **"ข้อมูล"** — เนื้อหาเดิมทั้งหมด (buyer, payment, status, note, actions)
- **"ประวัติ"** — audit log timeline ของ order นี้

**Log Entry structure:**
```typescript
interface OrderLogEntry {
  timestamp: string;       // "YYYY-MM-DD HH:mm"
  type: "registration" | "payment" | "status_change" | "refund_request"
       | "distance_change" | "document_issued" | "slip_uploaded" | "note";
  description: string;     // ข้อความอธิบาย
  amount?: number;         // ถ้ามีการเปลี่ยนแปลงยอดเงิน
}
```

**Log ที่สร้างอัตโนมัติ:**
- เมื่อ Refund Calculator ยืนยัน → log refund_request
- เมื่อ Distance Change ยืนยัน → log distance_change พร้อมยอดเงินที่เปลี่ยน
- เมื่อ slip อัปโหลด → log slip_uploaded
- เมื่อเปลี่ยนสถานะใน table/modal → log status_change

**Mock data:** แต่ละ order ใน mockData เพิ่ม field `log: OrderLogEntry[]` พร้อม initial entry จากวันที่ timestamp ของ order

---

## Section 4 — Cash/Transfer Slip

**Trigger:** แสดงเฉพาะ order ที่ `paymentMethod === "Cash"`

**ใน Order Detail Modal** เพิ่มส่วน "หลักฐานการโอนเงิน":
- ถ้ายังไม่มีสลิป: ปุ่ม "แนบสลิป" (input file หรือ URL text field)
- ถ้ามีแล้ว: แสดง thumbnail/link พร้อมปุ่ม "เปลี่ยน"

**ใน Order Table row:**
- Cash order ที่ยังไม่มีสลิป → แสดง badge เล็กๆ "รอสลิป" สีเหลืองที่คอลัมน์ Payment

**Mock data:** เพิ่ม field `slipUrl?: string` ใน Order interface

---

## Section 5 — Distance Change Modal

**Trigger:** ปุ่ม "เปลี่ยนแปลงระยะวิ่ง" ใน `···` action menu

**ข้อมูลใน Modal:**
- ระยะปัจจุบัน (current category)
- Dropdown เลือกระยะใหม่ (ตัวเลือก: ระยะอื่นๆ ของ event)
- วันที่ยื่นคำขอ (date picker, default = วันนี้)
- ราคาปัจจุบันของแต่ละระยะ (hardcode mock: 100K Ultra = ฿3,000 / 50K Trail = ฿1,800 / 25K Fun Run = ฿1,200)
- Breakdown:

**กรณี Upgrade (ระยะยาวขึ้น — จ่ายเพิ่ม):**
```
ส่วนต่างราคา = ราคาระยะใหม่ - ราคาระยะเดิม
+ ค่าธรรมเนียมดำเนินการ (250 หรือ 500 บาทตาม period)
= ยอดที่ต้องชำระเพิ่ม
→ เอกสาร: ใบกำกับภาษี (Tax Invoice) ของยอดที่จ่ายเพิ่ม
```

**กรณี Downgrade (ระยะสั้นลง — ได้คืน):**
```
ส่วนต่างราคา = ราคาระยะเดิม - ราคาระยะใหม่
× อัตราคืนตาม period (100%/70%/50%/0%)
- ค่าธรรมเนียมดำเนินการ (250 หรือ 500 บาทตาม period)
= ยอดที่จะคืน
→ เอกสาร: Credit Note (ใบลดหนี้)
```

**Distance Change Policy (hardcode):**

| ช่วงเวลา | Downgrade | Upgrade |
|---------|-----------|---------|
| 3–12 เม.ย. 2026 | ฟรี / คืนส่วนต่าง | ฟรี / จ่ายส่วนต่าง |
| 13 เม.ย.–31 ก.ค. 2026 | ฿250 / คืนส่วนต่าง | ฿250 / จ่ายส่วนต่าง |
| 1 ส.ค.–30 ก.ย. 2026 | ฿250 / ไม่คืนส่วนต่าง | ฿250 / จ่ายส่วนต่าง |
| ตั้งแต่ 1 ต.ค. 2026 | ฿500 / ไม่คืนส่วนต่าง | ❌ ไม่อนุญาต |

**หลังกด Confirm:**
- อัปเดต `category` ของ order
- เพิ่ม log entry บันทึกการเปลี่ยนระยะและยอดเงิน
- แสดง badge/label บอกว่าเอกสารที่ต้องออกคือ Tax Invoice หรือ Credit Note

---

## Data Model Changes

```typescript
interface OrderLogEntry {
  timestamp: string;
  type: "registration" | "payment" | "status_change" | "refund_request"
       | "distance_change" | "document_issued" | "slip_uploaded" | "note";
  description: string;
  amount?: number;
}

// เพิ่มใน Order interface
interface Order {
  // ... existing fields ...
  slipUrl?: string;           // สำหรับ Cash payment
  log: OrderLogEntry[];       // audit trail
}
```

---

## สิ่งที่ไม่อยู่ใน scope

- การอัปโหลดไฟล์จริงไปยัง server (ใช้ URL string แทน)
- Backend API / database persistence (ทุกอย่างยังเป็น in-memory state)
- การส่งอีเมลแจ้งลูกค้า
- การออกเอกสาร PDF จริง (แสดงเป็น label/status เท่านั้น)

---

*Spec version 1.0 — พร้อมสำหรับ implementation plan*
