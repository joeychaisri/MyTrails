import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";

// Static PDPA consent notice for race registration (TH + EN), linked from the
// registration form's consent checkbox. Same typographic dialect as
// PublicEventPage's sections.
const PdpaPage = () => (
  <div className="min-h-screen bg-background">
    <nav className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Logo size="sm" />
        <Button variant="outline" asChild>
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>
    </nav>

    <main className="mx-auto max-w-3xl px-4 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Personal Data Protection Notice</h1>
        <p className="mt-1 text-muted-foreground">ประกาศความเป็นส่วนตัวตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)</p>
      </div>

      <section>
        <h2 className="mb-4 text-2xl font-bold text-foreground">1. Data we collect · ข้อมูลที่เราเก็บรวบรวม</h2>
        <p className="text-muted-foreground leading-relaxed">
          When you register for a race on MyTrails we collect: your name (English and Thai), date of birth, gender,
          nationality, national ID or passport number, phone number, email address, emergency contact details, blood
          group, shirt size and any medical conditions you choose to share, together with your payment records
          (amount, payment method, and payment slip where applicable).
        </p>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          เมื่อท่านสมัครเข้าร่วมการแข่งขันผ่าน MyTrails เราเก็บรวบรวม: ชื่อ-นามสกุล (ภาษาอังกฤษและภาษาไทย) วันเกิด เพศ สัญชาติ
          เลขบัตรประชาชนหรือหนังสือเดินทาง หมายเลขโทรศัพท์ อีเมล ข้อมูลผู้ติดต่อฉุกเฉิน หมู่เลือด ขนาดเสื้อ
          และข้อมูลสุขภาพที่ท่านเลือกแจ้ง รวมถึงข้อมูลการชำระเงิน (จำนวนเงิน วิธีชำระ และสลิปโอนเงินกรณีชำระผ่าน PromptPay)
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold text-foreground">2. Why we collect it · วัตถุประสงค์</h2>
        <p className="text-muted-foreground leading-relaxed">
          Your data is used to process your race entry, allocate your bib and race kit, verify payments, contact you
          about the event, and — critically — to keep you safe on course: emergency contact, blood group and medical
          information are shared with the event's medical and rescue teams only when needed. We do not sell your
          personal data or use it for advertising.
        </p>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          ข้อมูลของท่านถูกใช้เพื่อดำเนินการรับสมัคร ออกหมายเลข BIB และชุดอุปกรณ์นักวิ่ง ตรวจสอบการชำระเงิน
          ติดต่อสื่อสารเกี่ยวกับงานแข่งขัน และที่สำคัญที่สุดคือเพื่อความปลอดภัยของท่านในสนาม — ข้อมูลผู้ติดต่อฉุกเฉิน หมู่เลือด
          และข้อมูลสุขภาพจะถูกเปิดเผยต่อทีมแพทย์และทีมกู้ภัยของงานเฉพาะเมื่อจำเป็นเท่านั้น เราไม่ขายข้อมูลส่วนบุคคลของท่าน
          และไม่นำไปใช้เพื่อการโฆษณา
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold text-foreground">3. Who can see it · การเปิดเผยข้อมูล</h2>
        <p className="text-muted-foreground leading-relaxed">
          Your registration details are visible to the event organizer of the race you register for and to MyTrails
          platform administrators. Published results and start lists show only your name, nationality, category and
          bib number — never your contact, ID or medical details.
        </p>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          ข้อมูลการสมัครของท่านจะปรากฏต่อผู้จัดงานของรายการที่ท่านสมัคร และผู้ดูแลระบบของ MyTrails เท่านั้น
          ผลการแข่งขันและรายชื่อผู้เข้าแข่งขันที่เผยแพร่สาธารณะจะแสดงเพียงชื่อ สัญชาติ ระยะที่ลงแข่ง และหมายเลข BIB
          โดยไม่เปิดเผยข้อมูลติดต่อ เลขบัตร หรือข้อมูลสุขภาพของท่าน
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold text-foreground">4. How long we keep it · ระยะเวลาการเก็บรักษา</h2>
        <p className="text-muted-foreground leading-relaxed">
          Registration and payment records are retained for 2 years after the event date for accounting and dispute
          purposes, after which they are deleted or anonymised. Medical information is deleted within 90 days after
          the event ends.
        </p>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          ข้อมูลการสมัครและการชำระเงินจะถูกเก็บรักษาไว้ 2 ปีหลังวันแข่งขันเพื่อวัตถุประสงค์ทางบัญชีและการระงับข้อพิพาท
          หลังจากนั้นจะถูกลบหรือทำให้ไม่สามารถระบุตัวตนได้ ข้อมูลสุขภาพจะถูกลบภายใน 90 วันหลังจบงาน
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold text-foreground">5. Your rights & contact · สิทธิของท่านและช่องทางติดต่อ</h2>
        <p className="text-muted-foreground leading-relaxed">
          Under the Personal Data Protection Act B.E. 2562 (2019) you may request access to, correction of, or
          deletion of your personal data, and may withdraw consent at any time (which may cancel your race entry).
          Contact our Data Protection Officer at privacy@mytrails.run.
        </p>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 ท่านมีสิทธิขอเข้าถึง แก้ไข หรือลบข้อมูลส่วนบุคคลของท่าน
          และสามารถถอนความยินยอมได้ทุกเมื่อ (ซึ่งอาจส่งผลให้การสมัครแข่งขันถูกยกเลิก) ติดต่อเจ้าหน้าที่คุ้มครองข้อมูลของเราได้ที่
          privacy@mytrails.run
        </p>
      </section>
    </main>
  </div>
);

export default PdpaPage;
