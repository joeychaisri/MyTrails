import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

// Lightweight bilingual layer for the runner landing-page mockup.
// Not a production i18n engine — a small dictionary + context so the
// page can demonstrate a real EN/TH language switch. Strings live here
// so a developer can see the platform is designed to be bilingual.

export type Lang = "en" | "th";

type Vars = Record<string, string | number>;

const STORAGE_KEY = "mt-lang";

// ————— DICTIONARY —————

const en = {
  nav: { findEvents: "Find Events", categories: "Race Categories", why: "Why My Trails", login: "Log In", signup: "Sign Up" },
  hero: {
    badge: "47 races live across Thailand",
    headline1: "Run wild.",
    headline2pre: "Run ",
    headline2accent: "Thailand.",
    subcopy: "From mist-soaked ridges in Chiang Mai to limestone cliffs in Krabi — discover, register, and toe the line at Thailand's best trail races.",
    browse: "Browse Races",
    viewCalendar: "View Calendar",
    statEvents: "Events live",
    statRunners: "Runners registered",
    statOrganizers: "Organizers",
    statRating: "Avg race rating",
  },
  events: {
    eyebrow: "Upcoming races",
    heading_one: "{count} race",
    heading_other: "{count} races",
    headingRegion: " in the {region}",
    subcopy: "Curated weekly. Every event is vetted before it goes live — no missing bibs, no phantom races.",
    searchPlaceholder: "Search by race or province…",
    viewGrid: "Grid",
    viewList: "List",
    viewCalendar: "Calendar",
    regionAll: "All Regions",
    regionNorth: "North",
    regionCentral: "Central",
    regionSouth: "South",
    emptyTitle: "No races match",
    emptyBody: "Try a different region or clear your search.",
    viewAll: "View all 47 races",
  },
  card: { from: "From", register: "Register", runners: "{sold} / {capacity} runners" },
  categories: {
    eyebrow: "Race categories",
    heading: "Pick your distance.",
    subcopy: "Whether you're chasing your first 10K or signing up for a 100K ultra — every race on My Trails lists the same details so you know what you're in for.",
    labelElevation: "Elevation",
    labelFinish: "Finish time",
    tier1Name: "Trail 10K", tier1Use: "Your first taste of the trail",
    tier2Name: "Trail 21K", tier2Use: "Half-marathon, weekend warrior",
    tier3Name: "Trail 42K", tier3Use: "Full marathon, technical sections",
    tier4Name: "Ultra 70K+", tier4Use: "Multi-summit, headlamp & cut-offs",
  },
  why: {
    eyebrow: "Why My Trails",
    heading1: "Built for runners.",
    heading2: "By runners.",
    subcopy: "We started My Trails because finding a real, well-run trail race in Thailand shouldn't mean trawling Facebook groups at midnight.",
    point1Title: "Vetted organizers", point1Body: "Every event on My Trails is reviewed by our team before it goes live. No phantom races, no missing bibs.",
    point2Title: "One-tap registration", point2Body: "Pay with PromptPay, credit card, or QR. Race-pack and BIB confirmation lands in your inbox the same day.",
    point3Title: "A real trail community", point3Body: "Follow organizers, save races to your calendar, and meet other runners on the start line — not in a feed.",
  },
  cta: {
    heading: "Ready to find your next trail?",
    body: "Browse the full calendar, save your favorites, and get notified when registration opens — no fees, sign up free.",
    browse: "Browse All Races",
    alerts: "Get Race Alerts",
  },
  footer: {
    tagline: "Trail running event-management platform for Thailand. Find races, register, and run wild.",
    colRunners: "Runners", colOrganizers: "Organizers", colCompany: "Company", colSupport: "Support",
    findEvents: "Find Events", raceCalendar: "Race Calendar", myReg: "My Registrations", training: "Training Tips",
    orgLogin: "Organizer Login", listEvent: "List Your Event", pricing: "Pricing", resources: "Resources",
    about: "About", blog: "Blog", contact: "Contact", careers: "Careers",
    help: "Help Center", refund: "Refund Policy", terms: "Terms", privacy: "Privacy",
    copyright: "© 2026 My Trails Co., Ltd. · Bangkok, Thailand",
    status: "All systems operational",
  },
  calendar: {
    racesThisYear_one: "{count} race this year",
    racesThisYear_other: "{count} races this year",
    monthRaces_one: "{count} race",
    monthRaces_other: "{count} races",
    almostFull: "Almost full",
    spotsLeft: "{count} spots left",
    emptyTitle: "No races on the calendar",
    emptyBody: "Try a different region or clear your search.",
    prevYear: "Previous year",
    nextYear: "Next year",
  },
};

const th: typeof en = {
  nav: { findEvents: "ค้นหางานวิ่ง", categories: "ประเภทการแข่ง", why: "ทำไมต้อง My Trails", login: "เข้าสู่ระบบ", signup: "สมัครสมาชิก" },
  hero: {
    badge: "47 งานวิ่งทั่วไทยกำลังเปิดรับสมัคร",
    headline1: "ออกไปวิ่งให้สุด",
    headline2pre: "ทั่ว",
    headline2accent: "เมืองไทย",
    subcopy: "จากสันเขาในม่านหมอกที่เชียงใหม่ ไปจนถึงหน้าผาหินปูนที่กระบี่ — ค้นหา สมัคร แล้วออกสตาร์ทในงานวิ่งเทรลที่ดีที่สุดของไทย",
    browse: "ดูงานวิ่งทั้งหมด",
    viewCalendar: "ดูปฏิทิน",
    statEvents: "งานที่เปิดรับ",
    statRunners: "นักวิ่งที่สมัครแล้ว",
    statOrganizers: "ผู้จัดงาน",
    statRating: "คะแนนเฉลี่ย",
  },
  events: {
    eyebrow: "งานที่กำลังจะมาถึง",
    heading_one: "{count} งานวิ่ง",
    heading_other: "{count} งานวิ่ง",
    headingRegion: " {region}",
    subcopy: "คัดสรรใหม่ทุกสัปดาห์ ทุกงานผ่านการตรวจสอบก่อนเปิดรับสมัคร — ไม่มีบิบหาย ไม่มีงานหลอก",
    searchPlaceholder: "ค้นหาด้วยชื่องานหรือจังหวัด…",
    viewGrid: "ตาราง",
    viewList: "รายการ",
    viewCalendar: "ปฏิทิน",
    regionAll: "ทุกภาค",
    regionNorth: "ภาคเหนือ",
    regionCentral: "ภาคกลาง",
    regionSouth: "ภาคใต้",
    emptyTitle: "ไม่พบงานที่ตรงกับที่ค้นหา",
    emptyBody: "ลองเปลี่ยนภาคหรือล้างคำค้นหา",
    viewAll: "ดูงานทั้งหมด 47 งาน",
  },
  card: { from: "เริ่มต้น", register: "สมัคร", runners: "{sold} / {capacity} คน" },
  categories: {
    eyebrow: "ประเภทการแข่ง",
    heading: "เลือกระยะของคุณ",
    subcopy: "ไม่ว่าจะวิ่ง 10K ครั้งแรก หรือสมัคร 100K อัลตร้า — ทุกงานบน My Trails บอกรายละเอียดแบบเดียวกัน คุณจึงรู้ว่าต้องเจอกับอะไร",
    labelElevation: "ความสูงสะสม",
    labelFinish: "เวลาที่ใช้",
    tier1Name: "เทรล 10K", tier1Use: "ลิ้มลองเส้นทางเทรลครั้งแรก",
    tier2Name: "เทรล 21K", tier2Use: "ฮาล์ฟมาราธอน สำหรับสายวันหยุด",
    tier3Name: "เทรล 42K", tier3Use: "ฟูลมาราธอน มีช่วงเทคนิคัล",
    tier4Name: "อัลตร้า 70K+", tier4Use: "หลายยอดเขา ไฟคาดหัวและเส้นตาย cut-off",
  },
  why: {
    eyebrow: "ทำไมต้อง My Trails",
    heading1: "สร้างเพื่อนักวิ่ง",
    heading2: "โดยนักวิ่ง",
    subcopy: "เราเริ่ม My Trails เพราะการหางานวิ่งเทรลดีๆ ในไทย ไม่ควรต้องไล่ส่องกลุ่ม Facebook ตอนเที่ยงคืน",
    point1Title: "ผู้จัดงานที่ผ่านการตรวจสอบ", point1Body: "ทุกงานบน My Trails ผ่านการตรวจสอบจากทีมเราก่อนเปิดรับสมัคร ไม่มีงานหลอก ไม่มีบิบหาย",
    point2Title: "สมัครจบในแตะเดียว", point2Body: "จ่ายด้วยพร้อมเพย์ บัตรเครดิต หรือ QR ใบยืนยัน Race-pack และ BIB ส่งเข้าอีเมลภายในวันเดียว",
    point3Title: "คอมมูนิตี้นักวิ่งตัวจริง", point3Body: "ติดตามผู้จัดงาน บันทึกงานลงปฏิทิน และเจอนักวิ่งคนอื่นที่จุดสตาร์ท — ไม่ใช่แค่ในฟีด",
  },
  cta: {
    heading: "พร้อมหาเส้นทางต่อไปของคุณหรือยัง?",
    body: "ดูปฏิทินทั้งหมด บันทึกงานที่ชอบ และรับแจ้งเตือนเมื่อเปิดรับสมัคร — สมัครได้เลย ไม่มีค่าธรรมเนียม",
    browse: "ดูงานทั้งหมด",
    alerts: "รับแจ้งเตือนงานวิ่ง",
  },
  footer: {
    tagline: "แพลตฟอร์มจัดการงานวิ่งเทรลสำหรับเมืองไทย ค้นหางาน สมัคร แล้วออกไปวิ่งให้สุด",
    colRunners: "นักวิ่ง", colOrganizers: "ผู้จัดงาน", colCompany: "บริษัท", colSupport: "ช่วยเหลือ",
    findEvents: "ค้นหางานวิ่ง", raceCalendar: "ปฏิทินงานวิ่ง", myReg: "การสมัครของฉัน", training: "เคล็ดลับการซ้อม",
    orgLogin: "เข้าสู่ระบบผู้จัดงาน", listEvent: "ลงงานของคุณ", pricing: "ค่าบริการ", resources: "แหล่งข้อมูล",
    about: "เกี่ยวกับเรา", blog: "บล็อก", contact: "ติดต่อ", careers: "ร่วมงานกับเรา",
    help: "ศูนย์ช่วยเหลือ", refund: "นโยบายการคืนเงิน", terms: "ข้อกำหนด", privacy: "ความเป็นส่วนตัว",
    copyright: "© 2026 My Trails Co., Ltd. · กรุงเทพฯ ประเทศไทย",
    status: "ระบบทำงานปกติทั้งหมด",
  },
  calendar: {
    racesThisYear_one: "{count} งานในปีนี้",
    racesThisYear_other: "{count} งานในปีนี้",
    monthRaces_one: "{count} งาน",
    monthRaces_other: "{count} งาน",
    almostFull: "ใกล้เต็มแล้ว",
    spotsLeft: "เหลือ {count} ที่",
    emptyTitle: "ยังไม่มีงานในปฏิทิน",
    emptyBody: "ลองเปลี่ยนภาคหรือล้างคำค้นหา",
    prevYear: "ปีก่อนหน้า",
    nextYear: "ปีถัดไป",
  },
};

const DICTS: Record<Lang, typeof en> = { en, th };

function resolve(dict: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined), dict);
}

// ————— CONTEXT —————

interface LangCtx {
  lang: Lang;
  locale: string;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Vars) => string;
}

const LanguageContext = createContext<LangCtx | null>(null);

function readInitialLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "th") return stored;
  } catch {
    /* ignore */
  }
  return "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readInitialLang);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const t = useCallback(
    (key: string, vars?: Vars): string => {
      // Pick a plural variant when a numeric `count` is supplied (English
      // pluralises; Thai variants are identical so it's a no-op there).
      let template: unknown;
      if (vars && typeof vars.count === "number") {
        const variant = vars.count === 1 ? `${key}_one` : `${key}_other`;
        template = resolve(DICTS[lang], variant) ?? resolve(en, variant) ?? resolve(DICTS[lang], key) ?? resolve(en, key);
      } else {
        template = resolve(DICTS[lang], key) ?? resolve(en, key);
      }
      if (typeof template !== "string") return key;
      return vars ? template.replace(/\{(\w+)\}/g, (_, n) => String(vars[n] ?? `{${n}}`)) : template;
    },
    [lang],
  );

  const locale = lang === "th" ? "th-TH" : "en-US";

  return <LanguageContext.Provider value={{ lang, locale, setLang, t }}>{children}</LanguageContext.Provider>;
}

export function useLang(): LangCtx {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within a LanguageProvider");
  return ctx;
}
