export interface Event {
  id: string;
  title: string;
  titleTh: string;
  coverImage: string;
  date: string;
  endDate: string;
  province: string;
  status: 'live' | 'pending' | 'draft';
  sold: number;
  capacity: number;
  revenue: number;
  categories: Category[];
  description: string;
  descriptionTh: string;
  latitude: string;
  longitude: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    website?: string;
  };
}

export interface Category {
  id: string;
  name: string;
  nameTh: string;
  raceDate: string;
  startTime: string;
  distance: number;
  elevation: number;
  elevationLoss: number;
  terrainType: string;
  itra: number;
  cutoff: string;
  checkpoints: Checkpoint[];
  mandatoryGear: string[];
  tickets: Ticket[];
}

export interface Checkpoint {
  id: string;
  name: string;
  distance: number;
  cutoffTime: string;
  services: string[];
}

export interface Ticket {
  id: string;
  name: string;
  price: number;
  quantity: number;
  sold: number;
}

export interface Order {
  id: string;
  buyerName: string;
  buyerEmail: string;
  amount: number;
  status: 'completed' | 'pending' | 'refunded';
  timestamp: string;
  ticketType: string;
  category: string;
}

export interface Participant {
  id: string;
  bibNo: string;
  name: string;
  email: string;
  distance: string;
  gender: 'M' | 'F';
  shirtSize: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
  nationality: string;
  emergencyContact: string;
}

export interface DiscountCode {
  id: string;
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  usageLimit: number;
  used: number;
  validUntil: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatar: string;
}

export interface PaymentInfo {
  accountName: string;
  bank: string;
  accountNumber: string;
}

export const mockProfile: UserProfile = {
  name: "Trail Events Co.",
  email: "organizer@trailevents.co.th",
  phone: "+66 89 123 4567",
  avatar: "",
};

export const mockPaymentInfo: PaymentInfo = {
  accountName: "บริษัท เทรล อีเว้นท์ จำกัด",
  bank: "kbank",
  accountNumber: "123-4-56789-0",
};

export const mockEvents: Event[] = [
  {
    id: "1",
    title: "Doi Inthanon Trail Challenge",
    titleTh: "ดอยอินทนนท์เทรลชาเลนจ์",
    coverImage: "",
    date: "2025-03-15",
    endDate: "2025-03-16",
    province: "Chiang Mai",
    status: "live",
    sold: 423,
    capacity: 600,
    revenue: 847500,
    description: "Experience Thailand's highest peak with breathtaking views and challenging terrain. This iconic race takes you through ancient cloud forests, past waterfalls, and to the summit at 2,565 meters.",
    descriptionTh: "สัมผัสประสบการณ์ยอดเขาสูงสุดของประเทศไทย พร้อมวิวที่สวยงามและเส้นทางที่ท้าทาย",
    latitude: "18.5881",
    longitude: "98.4864",
    socialLinks: {
      facebook: "https://facebook.com/doiinthanon",
      instagram: "https://instagram.com/doiinthanon",
    },
    categories: [
      {
        id: "1a",
        name: "100K Ultra",
        nameTh: "100K อัลตร้า",
        raceDate: "2025-03-15",
        startTime: "04:00",
        distance: 100,
        elevation: 5200,
        elevationLoss: 5100,
        terrainType: "Mountain Trail",
        itra: 8,
        cutoff: "24:00:00",
        checkpoints: [
          { id: "cp1", name: "Km 20 - Mae Klang", distance: 20, cutoffTime: "04:00:00", services: ["Water", "Food", "Medical"] },
          { id: "cp2", name: "Km 45 - Siriphum Falls", distance: 45, cutoffTime: "10:00:00", services: ["Water", "Food", "Medical", "Drop Bag"] },
          { id: "cp3", name: "Km 70 - Ang Ka", distance: 70, cutoffTime: "16:00:00", services: ["Water", "Food", "Medical"] },
        ],
        mandatoryGear: ["Headlamp", "Emergency Blanket", "Whistle", "First Aid Kit", "Water 1.5L", "Mobile Phone"],
        tickets: [
          { id: "t1", name: "Early Bird", price: 2500, quantity: 100, sold: 100 },
          { id: "t2", name: "Regular", price: 3000, quantity: 150, sold: 89 },
          { id: "t3", name: "Late Registration", price: 3500, quantity: 50, sold: 12 },
        ],
      },
      {
        id: "1b",
        name: "50K Trail",
        nameTh: "50K เทรล",
        raceDate: "2025-03-15",
        startTime: "05:00",
        distance: 50,
        elevation: 2600,
        elevationLoss: 2500,
        terrainType: "Mountain Trail",
        itra: 4,
        cutoff: "12:00:00",
        checkpoints: [
          { id: "cp4", name: "Km 15 - Pha Dok Siew", distance: 15, cutoffTime: "03:00:00", services: ["Water", "Food"] },
          { id: "cp5", name: "Km 30 - Kew Mae Pan", distance: 30, cutoffTime: "06:00:00", services: ["Water", "Food", "Medical"] },
        ],
        mandatoryGear: ["Headlamp", "Water 1L", "Mobile Phone"],
        tickets: [
          { id: "t4", name: "Early Bird", price: 1500, quantity: 100, sold: 100 },
          { id: "t5", name: "Regular", price: 1800, quantity: 200, sold: 122 },
        ],
      },
    ],
  },
  {
    id: "2",
    title: "Khao Yai Night Trail",
    titleTh: "เขาใหญ่ไนท์เทรล",
    coverImage: "",
    date: "2025-04-20",
    endDate: "2025-04-20",
    province: "Nakhon Ratchasima",
    status: "pending",
    sold: 0,
    capacity: 300,
    revenue: 0,
    description: "A unique night running experience through one of Thailand's oldest national parks.",
    descriptionTh: "ประสบการณ์วิ่งกลางคืนที่ไม่เหมือนใคร ผ่านอุทยานแห่งชาติที่เก่าแก่ที่สุดแห่งหนึ่งของไทย",
    latitude: "14.4364",
    longitude: "101.3747",
    socialLinks: {},
    categories: [
      {
        id: "2a",
        name: "25K Night Run",
        nameTh: "25K ไนท์รัน",
        raceDate: "2025-04-20",
        startTime: "18:00",
        distance: 25,
        elevation: 800,
        elevationLoss: 800,
        terrainType: "Forest Trail",
        itra: 2,
        cutoff: "06:00:00",
        checkpoints: [],
        mandatoryGear: ["Headlamp", "Reflective Vest"],
        tickets: [
          { id: "t6", name: "Early Bird", price: 900, quantity: 150, sold: 0 },
          { id: "t7", name: "Regular", price: 1100, quantity: 150, sold: 0 },
        ],
      },
    ],
  },
  {
    id: "3",
    title: "Phuket Coastal Ultra",
    titleTh: "ภูเก็ตโคสทอลอัลตร้า",
    coverImage: "",
    date: "2025-05-10",
    endDate: "2025-05-11",
    province: "Phuket",
    status: "draft",
    sold: 0,
    capacity: 400,
    revenue: 0,
    description: "Run along stunning Andaman Sea coastlines with views of limestone cliffs.",
    descriptionTh: "วิ่งตามชายฝั่งทะเลอันดามันที่สวยงาม พร้อมวิวหน้าผาหินปูน",
    latitude: "7.9519",
    longitude: "98.3381",
    socialLinks: {},
    categories: [],
  },
];

export const mockOrders: Order[] = [
  { id: "ORD-001", buyerName: "Somchai Jaidee", buyerEmail: "somchai@email.com", amount: 2500, status: "completed", timestamp: "2025-01-15 09:23:45", ticketType: "Early Bird", category: "100K Ultra" },
  { id: "ORD-002", buyerName: "Sarah Johnson", buyerEmail: "sarah.j@email.com", amount: 3000, status: "completed", timestamp: "2025-01-15 10:15:32", ticketType: "Regular", category: "100K Ultra" },
  { id: "ORD-003", buyerName: "Tanaka Yuki", buyerEmail: "yuki.t@email.jp", amount: 1500, status: "completed", timestamp: "2025-01-16 14:45:00", ticketType: "Early Bird", category: "50K Trail" },
  { id: "ORD-004", buyerName: "Prasert Wongsawat", buyerEmail: "prasert@email.com", amount: 1800, status: "pending", timestamp: "2025-01-17 08:30:00", ticketType: "Regular", category: "50K Trail" },
  { id: "ORD-005", buyerName: "Emma Wilson", buyerEmail: "emma.w@email.com", amount: 2500, status: "refunded", timestamp: "2025-01-14 16:20:00", ticketType: "Early Bird", category: "100K Ultra" },
  { id: "ORD-006", buyerName: "David Chen", buyerEmail: "david.c@email.com", amount: 3000, status: "completed", timestamp: "2025-01-18 11:00:00", ticketType: "Regular", category: "100K Ultra" },
  { id: "ORD-007", buyerName: "Natthaporn Sae-tang", buyerEmail: "natthaporn@email.com", amount: 1800, status: "completed", timestamp: "2025-01-18 15:30:00", ticketType: "Regular", category: "50K Trail" },
];

export const mockParticipants: Participant[] = [
  { id: "p1", bibNo: "001", name: "Somchai Jaidee", email: "somchai@email.com", distance: "100K", gender: "M", shirtSize: "L", nationality: "TH", emergencyContact: "+66 81 234 5678" },
  { id: "p2", bibNo: "002", name: "Sarah Johnson", email: "sarah.j@email.com", distance: "100K", gender: "F", shirtSize: "S", nationality: "US", emergencyContact: "+1 555 123 4567" },
  { id: "p3", bibNo: "003", name: "Tanaka Yuki", email: "yuki.t@email.jp", distance: "50K", gender: "M", shirtSize: "M", nationality: "JP", emergencyContact: "+81 90 1234 5678" },
  { id: "p4", bibNo: "004", name: "David Chen", email: "david.c@email.com", distance: "100K", gender: "M", shirtSize: "XL", nationality: "SG", emergencyContact: "+65 9123 4567" },
  { id: "p5", bibNo: "005", name: "Natthaporn Sae-tang", email: "natthaporn@email.com", distance: "50K", gender: "F", shirtSize: "M", nationality: "TH", emergencyContact: "+66 89 876 5432" },
  { id: "p6", bibNo: "006", name: "Marcus Weber", email: "marcus.w@email.de", distance: "100K", gender: "M", shirtSize: "L", nationality: "DE", emergencyContact: "+49 170 1234567" },
  { id: "p7", bibNo: "007", name: "Lisa Anderson", email: "lisa.a@email.com", distance: "50K", gender: "F", shirtSize: "S", nationality: "AU", emergencyContact: "+61 400 123 456" },
  { id: "p8", bibNo: "", name: "Krit Pongpanich", email: "krit.p@email.com", distance: "100K", gender: "M", shirtSize: "M", nationality: "TH", emergencyContact: "+66 82 345 6789" },
];

export const mockDiscountCodes: DiscountCode[] = [
  { id: "dc1", code: "EARLYBIRD20", discount: 20, type: "percentage", usageLimit: 100, used: 67, validUntil: "2025-02-28" },
  { id: "dc2", code: "GROUPRUN", discount: 500, type: "fixed", usageLimit: 50, used: 12, validUntil: "2025-03-10" },
  { id: "dc3", code: "TRAIL2025", discount: 15, type: "percentage", usageLimit: 200, used: 45, validUntil: "2025-03-15" },
];

export const shirtSizeBreakdown = {
  XS: 12,
  S: 45,
  M: 89,
  L: 67,
  XL: 34,
  XXL: 8,
};

export const shuttleBusSeats = {
  departure: 156,
  return: 142,
};

export const revenueData = [
  { date: "Jan 1", revenue: 45000 },
  { date: "Jan 5", revenue: 72000 },
  { date: "Jan 10", revenue: 125000 },
  { date: "Jan 15", revenue: 198000 },
  { date: "Jan 20", revenue: 340000 },
  { date: "Jan 25", revenue: 567000 },
  { date: "Jan 30", revenue: 847500 },
];

export const ticketSalesData = [
  { name: "100K Early Bird", value: 100, color: "#E85D04" },
  { name: "100K Regular", value: 89, color: "#F97316" },
  { name: "100K Late", value: 12, color: "#FB923C" },
  { name: "50K Early Bird", value: 100, color: "#34D399" },
  { name: "50K Regular", value: 122, color: "#6EE7B7" },
];
