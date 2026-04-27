# MyTrails — UX Prototype Handoff

Functional prototype สำหรับส่งต่อให้ทีม Developer — ไม่ใช่ production code ข้อมูลทั้งหมดเป็น mock data ไม่มี backend call

---

## Platform Overview

```mermaid
flowchart TB
    subgraph R["🏃 นักวิ่ง (Runner)"]
        R1["Public Event Page\nดูข้อมูลอีเวนต์ · สมัครแข่งขัน"]
    end

    subgraph O["📋 ผู้จัดอีเวนต์ (Organizer)"]
        O1["📊 Dashboard\nพอร์ตโฟลิโออีเวนต์ · สถิติรายได้"]
        O2["✏️ Event Wizard\nสร้าง / แก้ไขอีเวนต์ (4 ขั้นตอน)"]
        O3["👁️ Preview Page\nดูหน้าสาธารณะก่อน Publish"]
        subgraph H["⚙️ Event Manager Hub"]
            H1["📈 Race Analytics\nKPI · กราฟรายได้ · เดโมกราฟิก"]
            H2["💰 Orders / Finance\nคำสั่งซื้อ · สลิปเงินสด · คืนเงิน · เปลี่ยนระยะทาง"]
            H3["👟 Participants\nข้อมูลนักวิ่ง · แก้ไขโปรไฟล์ · Export CSV"]
            H4["🔢 BIB Assignment\nกำหนดหมายเลข · Import Excel/CSV"]
            H5["🏷️ Promotions\nโค้ดส่วนลด · Bulk Generate · ติดตาม Usage"]
            H6["📣 Broadcast\nส่ง Email / SMS แบ่งกลุ่มตามระยะทาง"]
        end
    end

    subgraph A["🛡️ Admin แพลตฟอร์ม"]
        A1["📊 Platform Overview\nKPI รายได้รวม · สถิติอีเวนต์"]
        A2["✅ Event Approvals\nอนุมัติ / ปฏิเสธ · Force Unpublish"]
        A3["💳 Financials\nตรวจสอบชำระค่าลงประกาศ → Publish"]
        A4["👤 User Management\nบัญชีผู้จัด · Suspend · Reset Password"]
        A5["⚙️ Platform Settings\nค่าธรรมเนียมการลงประกาศ"]
    end
```

**Event Lifecycle (Admin-driven):**
`draft` → `pending_review` → `awaiting_payment` → `ready_to_publish` → `live`

---

## Local Setup

```sh
npm install
npm run dev
# → http://localhost:5173
```

| Email | Password | Role |
|-------|----------|------|
| ใดก็ได้ | ใดก็ได้ | Organizer |
| `admin@mytrails.com` | ใดก็ได้ | Admin |

---

## Tech Stack

| Layer | Library |
|-------|---------|
| Framework | React 18 + TypeScript + Vite |
| Routing | react-router-dom v6 |
| UI | shadcn/ui (Radix UI) + Tailwind CSS |
| Charts | Recharts |
| Icons | lucide-react |

---

## Mock Data → Real API

ข้อมูลทั้งหมดอยู่ใน `src/data/mockData.ts` — replace ด้วย API call ตรงนี้จุดเดียว views ไม่ต้องแก้

Business logic (refund policy, distance change policy) อยู่ใน `src/lib/` แยกออกจาก UI — migrate ไป backend ได้เลย มี unit tests ใน `src/test/`
