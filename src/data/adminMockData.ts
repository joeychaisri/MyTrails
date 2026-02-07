export interface AdminOrganizer {
  id: string;
  organizationName: string;
  contactName: string;
  email: string;
  phone: string;
  status: "active" | "suspended";
  createdAt: string;
  eventsCount: number;
}

export type AdminEventStatus =
  | "pending_review"
  | "awaiting_payment"
  | "ready_to_publish"
  | "live"
  | "draft";

export interface AdminEvent {
  id: string;
  title: string;
  organizerName: string;
  organizerId: string;
  submittedDate: string;
  status: AdminEventStatus;
  feeAmount: number;
  paymentProof?: string;
  province: string;
  date: string;
  capacity: number;
  sold: number;
}

export interface PlatformSettings {
  platformFee: number;
}

export const mockAdminOrganizers: AdminOrganizer[] = [
  { id: "org1", organizationName: "Trail Events Co.", contactName: "Somchai Rattana", email: "somchai@trailevents.co.th", phone: "+66 89 123 4567", status: "active", createdAt: "2024-06-15", eventsCount: 3 },
  { id: "org2", organizationName: "Mountain Runners TH", contactName: "Natthaporn Sae-tang", email: "natthaporn@mountainrunners.th", phone: "+66 82 345 6789", status: "active", createdAt: "2024-08-20", eventsCount: 2 },
  { id: "org3", organizationName: "Andaman Trail Org", contactName: "Prasert Wongsawat", email: "prasert@andamantrail.com", phone: "+66 91 567 8901", status: "active", createdAt: "2024-09-10", eventsCount: 1 },
  { id: "org4", organizationName: "Northern Run Club", contactName: "Kannika Duangjai", email: "kannika@northernrun.club", phone: "+66 86 789 0123", status: "suspended", createdAt: "2024-10-01", eventsCount: 0 },
  { id: "org5", organizationName: "Gulf Coast Races", contactName: "Worawit Phanich", email: "worawit@gulfcoastraces.th", phone: "+66 84 012 3456", status: "active", createdAt: "2024-11-15", eventsCount: 1 },
  { id: "org6", organizationName: "Isaan Ultra Events", contactName: "Supachai Khamwan", email: "supachai@isaanultra.com", phone: "+66 88 456 7890", status: "active", createdAt: "2025-01-05", eventsCount: 0 },
];

export const mockAdminEvents: AdminEvent[] = [
  { id: "ae1", title: "Doi Suthep Sunrise Trail", organizerName: "Trail Events Co.", organizerId: "org1", submittedDate: "2025-01-20", status: "pending_review", feeAmount: 1500, province: "Chiang Mai", date: "2025-04-15", capacity: 300, sold: 0 },
  { id: "ae2", title: "Khao Sok Jungle Run", organizerName: "Andaman Trail Org", organizerId: "org3", submittedDate: "2025-01-18", status: "pending_review", feeAmount: 1500, province: "Surat Thani", date: "2025-05-20", capacity: 200, sold: 0 },
  { id: "ae3", title: "Erawan Falls Ultra", organizerName: "Mountain Runners TH", organizerId: "org2", submittedDate: "2025-01-10", status: "awaiting_payment", feeAmount: 1500, province: "Kanchanaburi", date: "2025-06-01", capacity: 400, sold: 0 },
  { id: "ae4", title: "Phu Kradueng Challenge", organizerName: "Isaan Ultra Events", organizerId: "org6", submittedDate: "2025-01-05", status: "awaiting_payment", feeAmount: 1500, paymentProof: "proof_ae4.pdf", province: "Loei", date: "2025-07-12", capacity: 250, sold: 0 },
  { id: "ae5", title: "Doi Inthanon Trail Challenge", organizerName: "Trail Events Co.", organizerId: "org1", submittedDate: "2024-12-01", status: "live", feeAmount: 1500, province: "Chiang Mai", date: "2025-03-15", capacity: 600, sold: 423 },
  { id: "ae6", title: "Khao Yai Night Trail", organizerName: "Mountain Runners TH", organizerId: "org2", submittedDate: "2024-11-20", status: "live", feeAmount: 1500, province: "Nakhon Ratchasima", date: "2025-04-20", capacity: 300, sold: 187 },
  { id: "ae7", title: "Koh Chang Coastal Run", organizerName: "Gulf Coast Races", organizerId: "org5", submittedDate: "2025-01-22", status: "ready_to_publish", feeAmount: 1500, province: "Trat", date: "2025-08-05", capacity: 150, sold: 0 },
  { id: "ae8", title: "Chiang Rai Mountain Series", organizerName: "Trail Events Co.", organizerId: "org1", submittedDate: "2025-01-25", status: "draft", feeAmount: 1500, province: "Chiang Rai", date: "2025-09-10", capacity: 500, sold: 0 },
];

export const mockPlatformRevenue = [
  { month: "Aug", revenue: 4500 },
  { month: "Sep", revenue: 7500 },
  { month: "Oct", revenue: 10500 },
  { month: "Nov", revenue: 15000 },
  { month: "Dec", revenue: 19500 },
  { month: "Jan", revenue: 27000 },
];

export const mockPlatformSettings: PlatformSettings = {
  platformFee: 1500,
};
