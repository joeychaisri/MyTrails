import { Category, Event, EventStatus, PaymentInfo, UserProfile, makeCategory, withDerivedCapacity } from "./mockData";

// Organizer accounts are provisioned by the platform admin (invite model).
export interface AdminOrganizer {
  id: string;
  organizationName: string;
  contactName: string;
  email: string;
  phone: string;
  status: "active" | "suspended";
  createdAt: string;
  eventsCount: number;
  // Where the platform transfers this organizer's net payout after events.
  payoutAccount?: string;
  // The organizer's own editable account (profile + payout bank details).
  // Persisted per-organizer in supabase mode; useOrganizerProfile reads it.
  account?: { profile: UserProfile; paymentInfo: PaymentInfo };
}

// One step of the event-commission scale. Brackets are sorted by minCount and
// each one runs until the next bracket's minCount; the last runs to infinity.
// The bracket the final registration count lands in prices the WHOLE event —
// this is not a progressive/tax-style split.
export interface CommissionBracket {
  id: string;
  minCount: number; // applies from this many registrations upward
  type: "flat" | "percent";
  value: number; // THB when flat, % of net registration revenue when percent
}

// The platform charges an organizer two things per event (deducted at payout):
//  1. Service fee      — a flat amount every event pays, whatever its size
//  2. Event commission — the bracket scale below, by registration count
// Both are configurable here by the admin and overridable per event at review.
export interface PlatformSettings {
  serviceFee: number; // THB, flat per event
  commissionBrackets: CommissionBracket[];
  payoutHoldDays: number; // days after event end before funds become payable
}

// Backwards-compatible aliases — the admin surface used to have its own event
// model; it now shares the single unified Event type.
export type AdminEvent = Event;
export type AdminEventStatus = EventStatus;

export const mockAdminOrganizers: AdminOrganizer[] = [
  { id: "org1", organizationName: "Trail Events Co.", contactName: "Somchai Rattana", email: "somchai@trailevents.co.th", phone: "+66 89 123 4567", status: "active", createdAt: "2024-06-15", eventsCount: 6, payoutAccount: "KBank ···789-0" },
  { id: "org2", organizationName: "Mountain Runners TH", contactName: "Natthaporn Sae-tang", email: "natthaporn@mountainrunners.th", phone: "+66 82 345 6789", status: "active", createdAt: "2024-08-20", eventsCount: 4, payoutAccount: "SCB ···441-2" },
  { id: "org3", organizationName: "Andaman Trail Org", contactName: "Prasert Wongsawat", email: "prasert@andamantrail.com", phone: "+66 91 567 8901", status: "active", createdAt: "2024-09-10", eventsCount: 3, payoutAccount: "Krungsri ···220-5" },
  { id: "org4", organizationName: "Northern Run Club", contactName: "Kannika Duangjai", email: "kannika@northernrun.club", phone: "+66 86 789 0123", status: "suspended", createdAt: "2024-10-01", eventsCount: 0 },
  { id: "org5", organizationName: "Gulf Coast Races", contactName: "Worawit Phanich", email: "worawit@gulfcoastraces.th", phone: "+66 84 012 3456", status: "active", createdAt: "2024-11-15", eventsCount: 3, payoutAccount: "KBank ···330-8" },
  { id: "org6", organizationName: "Isaan Ultra Events", contactName: "Supachai Khamwan", email: "supachai@isaanultra.com", phone: "+66 88 456 7890", status: "active", createdAt: "2025-01-05", eventsCount: 1, payoutAccount: "TTB ···017-3" },
];

// Compact seed for events owned by organizers OTHER than the demo organizer
// (org1). Expanded into full Event objects below. Deliberately distinct from the
// org1 events in mockData (ids "1"–"6"). Every event has real race categories —
// an organizer can never submit one without at least one category, so the admin
// side must never show that impossible state.
interface AdminSeed {
  id: string;
  title: string;
  titleTh: string;
  organizerName: string;
  organizerId: string;
  status: EventStatus;
  province: string;
  date: string;
  endDate?: string;
  capacity: number;
  sold: number;
  submittedDate: string;
  description: string;
  descriptionTh: string;
  latitude: string;
  longitude: string;
  categories: Category[];
  grossSales?: number;
  refundedAmount?: number;
  payoutStatus?: Event["payoutStatus"];
  rejectionReason?: string;
  publishMode?: Event["publishMode"];
  publishAt?: string;
  coverImage?: string;
}

const adminSeeds: AdminSeed[] = [
  {
    id: "ae1", coverImage: "/covers/doi-suthep.jpg", title: "Doi Suthep Sunrise Trail", titleTh: "ดอยสุเทพซันไรส์เทรล", organizerName: "Andaman Trail Org", organizerId: "org3",
    status: "pending_review", province: "Chiang Mai", date: "2026-09-15", capacity: 300, sold: 0, submittedDate: "2026-07-06",
    description: "A dawn ascent of Chiang Mai's guardian mountain.", descriptionTh: "พิชิตดอยคู่เมืองเชียงใหม่ยามรุ่งอรุณ",
    latitude: "18.8047", longitude: "98.9217",
    categories: [
      makeCategory({ id: "ae1a", name: "32K Sunrise", nameTh: "32K ซันไรส์", distance: 32, elevation: 1900, elevationLoss: 1900, raceDate: "2026-09-15", startLocationName: "Wat Phra That Doi Suthep" }),
      makeCategory({ id: "ae1b", name: "16K", nameTh: "16K", distance: 16, elevation: 900, elevationLoss: 900, raceDate: "2026-09-15", startLocationName: "Wat Phra That Doi Suthep" }),
    ],
  },
  {
    id: "ae2", coverImage: "/covers/river-kwai.jpg", title: "Kanchanaburi River Marathon", titleTh: "กาญจนบุรีริเวอร์มาราธอน", organizerName: "Mountain Runners TH", organizerId: "org2",
    status: "live", province: "Kanchanaburi", date: "2026-05-18", capacity: 500, sold: 388, submittedDate: "2026-02-14",
    description: "A riverside trail marathon along the River Kwai.", descriptionTh: "เทรลมาราธอนเลียบแม่น้ำแคว",
    latitude: "14.0227", longitude: "99.5328",
    grossSales: 640000, refundedAmount: 8500, payoutStatus: "payable",
    categories: [
      makeCategory({ id: "ae2a", name: "42K River", nameTh: "42K ริเวอร์", distance: 42, elevation: 900, elevationLoss: 900, terrainType: "Riverside Trail", raceDate: "2026-05-18", startLocationName: "River Kwai Bridge", tickets: [{ id: "ae2a-t1", name: "Regular", price: 1800, quantity: 500, sold: 388 }] }),
    ],
  },
  {
    id: "ae3", coverImage: "/covers/erawan-falls.jpg", title: "Erawan Falls Ultra", titleTh: "เอราวัณฟอลส์อัลตร้า", organizerName: "Mountain Runners TH", organizerId: "org2",
    status: "scheduled", province: "Kanchanaburi", date: "2026-11-01", capacity: 400, sold: 0, submittedDate: "2026-06-30",
    publishMode: "scheduled", publishAt: "2026-09-20T09:00",
    description: "An ultra past the seven tiers of Erawan waterfall.", descriptionTh: "อัลตร้าผ่านน้ำตกเอราวัณเจ็ดชั้น",
    latitude: "14.3690", longitude: "99.1440",
    categories: [
      makeCategory({ id: "ae3a", name: "70K Ultra", nameTh: "70K อัลตร้า", distance: 70, elevation: 4000, elevationLoss: 4000, raceDate: "2026-11-01", startLocationName: "Erawan National Park" }),
      makeCategory({ id: "ae3b", name: "35K", nameTh: "35K", distance: 35, elevation: 1800, elevationLoss: 1800, raceDate: "2026-11-01", startLocationName: "Erawan National Park" }),
    ],
  },
  {
    id: "ae4", coverImage: "/covers/pai-canyon.jpg", title: "Pai Canyon Sunset Run", titleTh: "ปายแคนยอนซันเซ็ตรัน", organizerName: "Gulf Coast Races", organizerId: "org5",
    status: "live", province: "Mae Hong Son", date: "2026-08-10", capacity: 200, sold: 96, submittedDate: "2026-03-12",
    description: "A golden-hour run through Pai's canyon ridges.", descriptionTh: "วิ่งชมพระอาทิตย์ตกบนสันปายแคนยอน",
    latitude: "19.3583", longitude: "98.4419",
    grossSales: 144000, refundedAmount: 0, payoutStatus: "held",
    categories: [
      makeCategory({ id: "ae4a", name: "18K Canyon", nameTh: "18K แคนยอน", distance: 18, elevation: 800, elevationLoss: 800, raceDate: "2026-08-10", startLocationName: "Pai Canyon", tickets: [{ id: "ae4a-t1", name: "Regular", price: 1500, quantity: 200, sold: 96 }] }),
    ],
  },
  {
    id: "ae5", coverImage: "/covers/khao-sok.jpg", title: "Khao Sok Rainforest Trail", titleTh: "เขาสกเรนฟอเรสต์เทรล", organizerName: "Andaman Trail Org", organizerId: "org3",
    status: "live", province: "Surat Thani", date: "2026-03-08", capacity: 350, sold: 350, submittedDate: "2025-11-20",
    description: "A humid jungle loop under one of the world's oldest rainforests.", descriptionTh: "วิ่งลูปป่าดิบชื้นใต้ผืนป่าเก่าแก่ที่สุดแห่งหนึ่งของโลก",
    latitude: "8.9146", longitude: "98.5253",
    grossSales: 525000, refundedAmount: 12000, payoutStatus: "paid",
    categories: [
      makeCategory({ id: "ae5a", name: "25K Rainforest", nameTh: "25K เรนฟอเรสต์", distance: 25, elevation: 1200, elevationLoss: 1200, raceDate: "2026-03-08", startLocationName: "Khao Sok National Park", tickets: [{ id: "ae5a-t1", name: "Regular", price: 1500, quantity: 350, sold: 350, salesStart: "2025-12-01T00:00", salesEnd: "2026-02-20T23:59" }] }),
    ],
  },
  {
    id: "ae6", coverImage: "/covers/chiang-dao.jpg", title: "Chiang Dao Skyline Ultra", titleTh: "เชียงดาวสกายไลน์อัลตร้า", organizerName: "Mountain Runners TH", organizerId: "org2",
    status: "live", province: "Chiang Mai", date: "2026-10-18", capacity: 400, sold: 168, submittedDate: "2026-05-02",
    description: "Limestone skyline running beneath Doi Luang Chiang Dao.", descriptionTh: "วิ่งสันเขาหินปูนใต้ดอยหลวงเชียงดาว",
    latitude: "19.3964", longitude: "98.9203",
    grossSales: 302400, refundedAmount: 3600, payoutStatus: "held",
    categories: [
      makeCategory({ id: "ae6a", name: "55K Skyline", nameTh: "55K สกายไลน์", distance: 55, elevation: 3200, elevationLoss: 3200, raceDate: "2026-10-18", startLocationName: "Chiang Dao Cave", tickets: [{ id: "ae6a-t1", name: "Early Bird", price: 1600, quantity: 150, sold: 150, salesStart: "2026-05-15T00:00", salesEnd: "2026-06-30T23:59" }, { id: "ae6a-t2", name: "Regular", price: 1900, quantity: 250, sold: 18, salesStart: "2026-07-01T00:00", salesEnd: "2026-09-30T23:59" }] }),
    ],
  },
  {
    id: "ae7", coverImage: "/covers/mae-kampong.jpg", title: "Mae Kampong Village Trail", titleTh: "แม่กำปองวิลเลจเทรล", organizerName: "Gulf Coast Races", organizerId: "org5",
    status: "live", province: "Chiang Mai", date: "2026-12-06", capacity: 250, sold: 250, submittedDate: "2026-04-18",
    description: "Tea-house switchbacks and waterfall singletrack above Mae Kampong.", descriptionTh: "โค้งไต่บ้านชาและซิงเกิลแทร็กน้ำตกเหนือแม่กำปอง",
    latitude: "18.8661", longitude: "99.3550",
    grossSales: 425000, refundedAmount: 0, payoutStatus: "held",
    categories: [
      makeCategory({ id: "ae7a", name: "21K Village", nameTh: "21K วิลเลจ", distance: 21, elevation: 1100, elevationLoss: 1100, raceDate: "2026-12-06", startLocationName: "Mae Kampong Village", tickets: [{ id: "ae7a-t1", name: "Regular", price: 1700, quantity: 250, sold: 250, salesStart: "2026-05-01T00:00", salesEnd: "2026-11-15T23:59" }] }),
    ],
  },
  {
    id: "ae8", coverImage: "/covers/phu-chi-fa.jpg", title: "Phu Chi Fa Cloud Run", titleTh: "ภูชี้ฟ้าคลาวด์รัน", organizerName: "Isaan Ultra Events", organizerId: "org6",
    status: "pending_review", province: "Chiang Rai", date: "2026-11-22", capacity: 300, sold: 0, submittedDate: "2026-07-09",
    description: "A ridge run above the sea of mist on the Lao border.", descriptionTh: "วิ่งสันเขาเหนือทะเลหมอกชายแดนลาว",
    latitude: "19.8494", longitude: "100.4425",
    categories: [
      makeCategory({ id: "ae8a", name: "28K Cloud", nameTh: "28K คลาวด์", distance: 28, elevation: 1600, elevationLoss: 1600, raceDate: "2026-11-22", startLocationName: "Phu Chi Fa Forest Park" }),
    ],
  },
  {
    id: "ae9", coverImage: "/covers/khao-laem.jpg", title: "Khao Laem Lakeside Ultra", titleTh: "เขาแหลมเลคไซด์อัลตร้า", organizerName: "Gulf Coast Races", organizerId: "org5",
    status: "rejected", province: "Kanchanaburi", date: "2026-10-04", capacity: 500, sold: 0, submittedDate: "2026-06-28",
    rejectionReason: "Course map is missing aid-station locations and the 100K category has no cutoff times. Please add both and resubmit.",
    description: "Big-lake ultra distances along Khao Laem reservoir.", descriptionTh: "อัลตร้าเลียบอ่างเก็บน้ำเขาแหลม",
    latitude: "14.9114", longitude: "98.6531",
    categories: [
      makeCategory({ id: "ae9a", name: "100K Lakeside", nameTh: "100K เลคไซด์", distance: 100, elevation: 3800, elevationLoss: 3800, raceDate: "2026-10-04", startLocationName: "Khao Laem Dam" }),
    ],
  },
  {
    id: "ae10", coverImage: "/covers/samoeng-loop.jpg", title: "Samoeng Loop Trail Festival", titleTh: "สะเมิงลูปเทรลเฟสติวัล", organizerName: "Mountain Runners TH", organizerId: "org2",
    status: "live", province: "Chiang Mai", date: "2026-07-11", endDate: "2026-07-12", capacity: 600, sold: 512, submittedDate: "2026-03-30",
    description: "A two-day trail festival on the classic Samoeng loop.", descriptionTh: "เทศกาลเทรลสองวันบนเส้นทางสะเมิงลูปสุดคลาสสิก",
    latitude: "18.8306", longitude: "98.7286",
    grossSales: 870400, refundedAmount: 15300, payoutStatus: "held",
    categories: [
      makeCategory({ id: "ae10a", name: "34K Loop", nameTh: "34K ลูป", distance: 34, elevation: 1700, elevationLoss: 1700, raceDate: "2026-07-11", startLocationName: "Samoeng District Office", tickets: [{ id: "ae10a-t1", name: "Regular", price: 1700, quantity: 600, sold: 512, salesStart: "2026-04-01T00:00", salesEnd: "2026-06-30T23:59" }] }),
    ],
  },
  {
    id: "ae11", coverImage: "/covers/summit-dawn.jpg", title: "Mon Jam Sunrise Half", titleTh: "ม่อนแจ่มซันไรส์ฮาล์ฟ", organizerName: "Andaman Trail Org", organizerId: "org3",
    status: "live", province: "Chiang Mai", date: "2026-07-26", capacity: 280, sold: 231, submittedDate: "2026-04-10",
    description: "A sunrise half up the flower terraces of Mon Jam.", descriptionTh: "ฮาล์ฟยามรุ่งอรุณบนไร่ดอกไม้ม่อนแจ่ม",
    latitude: "18.9469", longitude: "98.8117",
    grossSales: 346500, refundedAmount: 4500, payoutStatus: "held",
    categories: [
      makeCategory({ id: "ae11a", name: "21K Sunrise", nameTh: "21K ซันไรส์", distance: 21, elevation: 950, elevationLoss: 950, raceDate: "2026-07-26", startLocationName: "Mon Jam Viewpoint", tickets: [{ id: "ae11a-t1", name: "Regular", price: 1500, quantity: 280, sold: 231, salesStart: "2026-04-15T00:00", salesEnd: "2026-06-30T23:59" }] }),
    ],
  },
];

const seedToEvent = (s: AdminSeed): Event => ({
  id: s.id,
  title: s.title,
  titleTh: s.titleTh,
  coverImage: s.coverImage ?? "",
  date: s.date,
  endDate: s.endDate ?? s.date,
  province: s.province,
  status: s.status,
  organizerId: s.organizerId,
  organizerName: s.organizerName,
  submittedDate: s.submittedDate,
  rejectionReason: s.rejectionReason,
  sold: s.sold,
  capacity: s.capacity,
  revenue: s.grossSales ?? 0,
  grossSales: s.grossSales,
  refundedAmount: s.refundedAmount,
  payoutStatus: s.payoutStatus,
  publishMode: s.publishMode,
  publishAt: s.publishAt,
  categories: s.categories,
  description: s.description,
  descriptionTh: s.descriptionTh,
  latitude: s.latitude,
  longitude: s.longitude,
  socialLinks: {},
});

// Events belonging to organizers other than the demo organizer. Merged with the
// three rich org1 events (mockData) to form the platform-wide event list.
export const mockOtherEvents: Event[] = adminSeeds.map(seedToEvent).map(withDerivedCapacity);

export const mockPlatformRevenue = [
  { month: "Feb", revenue: 18000 },
  { month: "Mar", revenue: 24500 },
  { month: "Apr", revenue: 31000 },
  { month: "May", revenue: 47000 },
  { month: "Jun", revenue: 52500 },
  { month: "Jul", revenue: 61000 },
];

export const mockPlatformSettings: PlatformSettings = {
  serviceFee: 1500,
  commissionBrackets: [
    { id: "cb-small", minCount: 0, type: "flat", value: 1000 },
    { id: "cb-mid", minCount: 300, type: "percent", value: 8 },
    { id: "cb-large", minCount: 1000, type: "percent", value: 6 },
  ],
  payoutHoldDays: 14,
};
