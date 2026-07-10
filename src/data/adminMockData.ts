import { Category, Event, EventStatus, makeCategory, withDerivedCapacity } from "./mockData";

// Organizer accounts are provisioned by the platform admin (invite model).
// Each account is assigned a Tier, which carries the tier-portion commission.
export interface Tier {
  id: string;
  name: string;
  commissionRate: number; // % of net registration revenue — the tier commission
}

export interface AdminOrganizer {
  id: string;
  organizationName: string;
  contactName: string;
  email: string;
  phone: string;
  status: "active" | "suspended";
  tierId: string;
  createdAt: string;
  eventsCount: number;
  // Where the platform transfers this organizer's net payout after events.
  payoutAccount?: string;
}

// The platform takes commission on registrations in two parts (deducted at payout):
//  1. Event commission — a scale by registration count (see eventCommissionAmount)
//  2. Tier commission  — the organizer account's tier rate (configurable below)
export interface PlatformSettings {
  tiers: Tier[];
  payoutHoldDays: number; // days after event end before funds become payable
}

// Backwards-compatible aliases — the admin surface used to have its own event
// model; it now shares the single unified Event type.
export type AdminEvent = Event;
export type AdminEventStatus = EventStatus;

export const mockAdminOrganizers: AdminOrganizer[] = [
  { id: "org1", organizationName: "Trail Events Co.", contactName: "Somchai Rattana", email: "somchai@trailevents.co.th", phone: "+66 89 123 4567", status: "active", tierId: "t-standard", createdAt: "2024-06-15", eventsCount: 6, payoutAccount: "KBank ···789-0" },
  { id: "org2", organizationName: "Mountain Runners TH", contactName: "Natthaporn Sae-tang", email: "natthaporn@mountainrunners.th", phone: "+66 82 345 6789", status: "active", tierId: "t-vip", createdAt: "2024-08-20", eventsCount: 2, payoutAccount: "SCB ···441-2" },
  { id: "org3", organizationName: "Andaman Trail Org", contactName: "Prasert Wongsawat", email: "prasert@andamantrail.com", phone: "+66 91 567 8901", status: "active", tierId: "t-standard", createdAt: "2024-09-10", eventsCount: 1, payoutAccount: "Krungsri ···220-5" },
  { id: "org4", organizationName: "Northern Run Club", contactName: "Kannika Duangjai", email: "kannika@northernrun.club", phone: "+66 86 789 0123", status: "suspended", tierId: "t-standard", createdAt: "2024-10-01", eventsCount: 0 },
  { id: "org5", organizationName: "Gulf Coast Races", contactName: "Worawit Phanich", email: "worawit@gulfcoastraces.th", phone: "+66 84 012 3456", status: "active", tierId: "t-standard", createdAt: "2024-11-15", eventsCount: 1, payoutAccount: "KBank ···330-8" },
  { id: "org6", organizationName: "Isaan Ultra Events", contactName: "Supachai Khamwan", email: "supachai@isaanultra.com", phone: "+66 88 456 7890", status: "active", tierId: "t-vip", createdAt: "2025-01-05", eventsCount: 0, payoutAccount: "TTB ···017-3" },
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
}

const adminSeeds: AdminSeed[] = [
  {
    id: "ae1", title: "Doi Suthep Sunrise Trail", titleTh: "ดอยสุเทพซันไรส์เทรล", organizerName: "Andaman Trail Org", organizerId: "org3",
    status: "pending_review", province: "Chiang Mai", date: "2026-09-15", capacity: 300, sold: 0, submittedDate: "2026-07-06",
    description: "A dawn ascent of Chiang Mai's guardian mountain.", descriptionTh: "พิชิตดอยคู่เมืองเชียงใหม่ยามรุ่งอรุณ",
    latitude: "18.8047", longitude: "98.9217",
    categories: [
      makeCategory({ id: "ae1a", name: "32K Sunrise", nameTh: "32K ซันไรส์", distance: 32, elevation: 1900, elevationLoss: 1900, raceDate: "2026-09-15", startLocationName: "Wat Phra That Doi Suthep" }),
      makeCategory({ id: "ae1b", name: "16K", nameTh: "16K", distance: 16, elevation: 900, elevationLoss: 900, raceDate: "2026-09-15", startLocationName: "Wat Phra That Doi Suthep" }),
    ],
  },
  {
    id: "ae2", title: "Kanchanaburi River Marathon", titleTh: "กาญจนบุรีริเวอร์มาราธอน", organizerName: "Mountain Runners TH", organizerId: "org2",
    status: "live", province: "Kanchanaburi", date: "2026-05-18", capacity: 500, sold: 388, submittedDate: "2026-02-14",
    description: "A riverside trail marathon along the River Kwai.", descriptionTh: "เทรลมาราธอนเลียบแม่น้ำแคว",
    latitude: "14.0227", longitude: "99.5328",
    grossSales: 640000, refundedAmount: 8500, payoutStatus: "payable",
    categories: [
      makeCategory({ id: "ae2a", name: "42K River", nameTh: "42K ริเวอร์", distance: 42, elevation: 900, elevationLoss: 900, terrainType: "Riverside Trail", raceDate: "2026-05-18", startLocationName: "River Kwai Bridge", tickets: [{ id: "ae2a-t1", name: "Regular", price: 1800, quantity: 500, sold: 388 }] }),
    ],
  },
  {
    id: "ae3", title: "Erawan Falls Ultra", titleTh: "เอราวัณฟอลส์อัลตร้า", organizerName: "Mountain Runners TH", organizerId: "org2",
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
    id: "ae4", title: "Pai Canyon Sunset Run", titleTh: "ปายแคนยอนซันเซ็ตรัน", organizerName: "Gulf Coast Races", organizerId: "org5",
    status: "live", province: "Mae Hong Son", date: "2026-08-10", capacity: 200, sold: 96, submittedDate: "2026-03-12",
    description: "A golden-hour run through Pai's canyon ridges.", descriptionTh: "วิ่งชมพระอาทิตย์ตกบนสันปายแคนยอน",
    latitude: "19.3583", longitude: "98.4419",
    grossSales: 144000, refundedAmount: 0, payoutStatus: "held",
    categories: [
      makeCategory({ id: "ae4a", name: "18K Canyon", nameTh: "18K แคนยอน", distance: 18, elevation: 800, elevationLoss: 800, raceDate: "2026-08-10", startLocationName: "Pai Canyon", tickets: [{ id: "ae4a-t1", name: "Regular", price: 1500, quantity: 200, sold: 96 }] }),
    ],
  },
];

const seedToEvent = (s: AdminSeed): Event => ({
  id: s.id,
  title: s.title,
  titleTh: s.titleTh,
  coverImage: "",
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
  tiers: [
    { id: "t-standard", name: "Standard", commissionRate: 2 },
    { id: "t-vip", name: "VIP", commissionRate: 0 },
    { id: "t-partner", name: "Partner", commissionRate: 1 },
  ],
  payoutHoldDays: 14,
};
