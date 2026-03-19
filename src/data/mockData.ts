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
  startLocationName: string;
  startLat: number;
  startLng: number;
  distance: number;
  elevation: number;
  elevationLoss: number;
  terrainType: string;
  itra: number;
  utmbIndex: number;
  cutoffTime: string;
  cutoffHours: number;
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

export type OrderStatus =
  | 'submitted'
  | 'complete_stripe_wait_receipt' | 'complete_wait_receipt' | 'complete_receipt_issued'
  | 'complete_name_change_new' | 'name_change_receipt_issued'
  | 'complete_stripe_wait_trc' | 'complete_wait_trc' | 'complete_trc_issued'
  | 'complete_sponsor' | 'complete_vip'
  | 'issue_cash' | 'pending_cash'
  | 'refunded' | 'refunded_receipt_issued'
  | 'complete_wns' | 'complete_wns_receipt'
  | 'complete_wait_crn' | 'complete_crn_issued'
  | 'issue_refund' | 'pending_refund' | 'edit_trc';

export type PaymentMethod = 'Stripe' | 'Cash' | 'VIP' | 'Sponsor';

export interface Order {
  id: string;
  buyerName: string;
  buyerEmail: string;
  amount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  timestamp: string;
  ticketType: string;
  category: string;
  note: string;
}

export interface Participant {
  id: string;
  bibNo: string;
  name: string;
  email: string;
  phone: string;
  distance: string;
  gender: 'M' | 'F';
  shirtSize: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
  nationality: string;
  age: number;
  bloodType: 'A' | 'B' | 'AB' | 'O' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  medicalConditions: string;
  emergencyContact: string;
  club: string;
  itraId: string;
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
        startLocationName: "Doi Inthanon National Park HQ",
        startLat: 18.5881,
        startLng: 98.4864,
        distance: 100,
        elevation: 5200,
        elevationLoss: 5100,
        terrainType: "Mountain Trail",
        itra: 8,
        utmbIndex: 6,
        cutoffTime: "04:00",
        cutoffHours: 24,
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
        startLocationName: "Doi Inthanon National Park HQ",
        startLat: 18.5881,
        startLng: 98.4864,
        distance: 50,
        elevation: 2600,
        elevationLoss: 2500,
        terrainType: "Mountain Trail",
        itra: 4,
        utmbIndex: 3,
        cutoffTime: "17:00",
        cutoffHours: 12,
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
        startLocationName: "Khao Yai National Park Visitor Center",
        startLat: 14.4364,
        startLng: 101.3747,
        distance: 25,
        elevation: 800,
        elevationLoss: 800,
        terrainType: "Forest Trail",
        itra: 2,
        utmbIndex: 1,
        cutoffTime: "00:00",
        cutoffHours: 6,
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
  { id: "ORD-001", buyerName: "Somchai Jaidee", buyerEmail: "somchai@email.com", amount: 2500, status: "complete_trc_issued", paymentMethod: "Stripe", timestamp: "2025-01-15 09:23:45", ticketType: "Early Bird", category: "100K Ultra", note: "" },
  { id: "ORD-002", buyerName: "Sarah Johnson", buyerEmail: "sarah.j@email.com", amount: 3000, status: "complete_receipt_issued", paymentMethod: "Stripe", timestamp: "2025-01-15 10:15:32", ticketType: "Regular", category: "100K Ultra", note: "" },
  { id: "ORD-003", buyerName: "Tanaka Yuki", buyerEmail: "yuki.t@email.jp", amount: 1500, status: "complete_crn_issued", paymentMethod: "Stripe", timestamp: "2025-01-16 14:45:00", ticketType: "Early Bird", category: "50K Trail", note: "" },
  { id: "ORD-004", buyerName: "Prasert Wongsawat", buyerEmail: "prasert@email.com", amount: 1800, status: "complete_wait_trc", paymentMethod: "Stripe", timestamp: "2025-01-17 08:30:00", ticketType: "Regular", category: "50K Trail", note: "" },
  { id: "ORD-005", buyerName: "Emma Wilson", buyerEmail: "emma.w@email.com", amount: 2500, status: "refunded", paymentMethod: "Stripe", timestamp: "2025-01-14 16:20:00", ticketType: "Early Bird", category: "100K Ultra", note: "Cancelled due to injury" },
  { id: "ORD-006", buyerName: "David Chen", buyerEmail: "david.c@email.com", amount: 3000, status: "complete_vip", paymentMethod: "VIP", timestamp: "2025-01-18 11:00:00", ticketType: "VIP", category: "100K Ultra", note: "" },
  { id: "ORD-007", buyerName: "Natthaporn Sae-tang", buyerEmail: "natthaporn@email.com", amount: 1800, status: "pending_cash", paymentMethod: "Cash", timestamp: "2025-01-18 15:30:00", ticketType: "Regular", category: "50K Trail", note: "Waiting for cash payment confirmation" },
  { id: "ORD-008", buyerName: "Marcus Weber", buyerEmail: "marcus.w@email.de", amount: 2500, status: "issue_cash", paymentMethod: "Cash", timestamp: "2025-01-19 09:00:00", ticketType: "Early Bird", category: "100K Ultra", note: "Amount mismatch" },
  { id: "ORD-009", buyerName: "Krit Pongpanich", buyerEmail: "krit.p@email.com", amount: 1200, status: "submitted", paymentMethod: "Stripe", timestamp: "2025-01-19 11:45:00", ticketType: "Early Bird", category: "25K Fun Run", note: "" },
  { id: "ORD-010", buyerName: "Lisa Anderson", buyerEmail: "lisa.a@email.com", amount: 1800, status: "pending_refund", paymentMethod: "Stripe", timestamp: "2025-01-20 08:10:00", ticketType: "Regular", category: "50K Trail", note: "" },
  { id: "ORD-011", buyerName: "Akira Tanaka", buyerEmail: "akira.t@email.jp", amount: 3000, status: "complete_stripe_wait_receipt", paymentMethod: "Stripe", timestamp: "2025-01-20 13:22:00", ticketType: "Regular", category: "100K Ultra", note: "" },
  { id: "ORD-012", buyerName: "Wanchai Saengkaew", buyerEmail: "wanchai@email.com", amount: 2500, status: "complete_wns", paymentMethod: "Stripe", timestamp: "2025-01-21 10:05:00", ticketType: "Early Bird", category: "100K Ultra", note: "DNS - notified organizer" },
  { id: "ORD-013", buyerName: "Chanya Moonmuang", buyerEmail: "chanya@email.com", amount: 1800, status: "edit_trc", paymentMethod: "Stripe", timestamp: "2025-01-21 14:50:00", ticketType: "Regular", category: "50K Trail", note: "" },
  { id: "ORD-014", buyerName: "James Harrington", buyerEmail: "james.h@email.com", amount: 0, status: "complete_sponsor", paymentMethod: "Sponsor", timestamp: "2025-01-22 09:30:00", ticketType: "Sponsor", category: "100K Ultra", note: "Sponsor - Race Thailand 2025" },
];

export const mockParticipants: Participant[] = [
  // 100K Ultra (34 runners)
  { id:"p1",  bibNo:"001", name:"Somchai Jaidee",        email:"somchai@email.com",      phone:"+66 81 234 5678",   distance:"100K", gender:"M", shirtSize:"L",  nationality:"TH", age:34, bloodType:"O+",  medicalConditions:"",                         emergencyContact:"+66 81 234 0000",  club:"BKK Trail Runners",         itraId:"ITRA-12345" },
  { id:"p2",  bibNo:"002", name:"Sarah Johnson",          email:"sarah.j@email.com",      phone:"+1 555 123 4567",   distance:"100K", gender:"F", shirtSize:"S",  nationality:"US", age:28, bloodType:"A+",  medicalConditions:"",                         emergencyContact:"+1 555 987 6543",  club:"",                          itraId:"ITRA-67890" },
  { id:"p4",  bibNo:"004", name:"David Chen",             email:"david.c@email.com",      phone:"+65 9123 4567",     distance:"100K", gender:"M", shirtSize:"XL", nationality:"SG", age:36, bloodType:"AB+", medicalConditions:"",                         emergencyContact:"+65 9876 5432",    club:"SG Ultra",                  itraId:"ITRA-11223" },
  { id:"p6",  bibNo:"006", name:"Marcus Weber",           email:"marcus.w@email.de",      phone:"+49 170 1234567",   distance:"100K", gender:"M", shirtSize:"L",  nationality:"DE", age:45, bloodType:"A-",  medicalConditions:"Hypertension (controlled)",emergencyContact:"+49 171 9876543",  club:"Berlin Ultrarunners",       itraId:"ITRA-33445" },
  { id:"p8",  bibNo:"",    name:"Krit Pongpanich",        email:"krit.p@email.com",        phone:"+66 82 345 6789",   distance:"100K", gender:"M", shirtSize:"M",  nationality:"TH", age:38, bloodType:"O+",  medicalConditions:"",                         emergencyContact:"+66 82 987 6543",  club:"Trail TH",                  itraId:"" },
  { id:"p11", bibNo:"011", name:"Wichai Promphan",        email:"wichai.p@email.com",     phone:"+66 83 111 2222",   distance:"100K", gender:"M", shirtSize:"XL", nationality:"TH", age:44, bloodType:"B+",  medicalConditions:"",                         emergencyContact:"+66 83 333 4444",  club:"Chiang Mai Trail",          itraId:"" },
  { id:"p13", bibNo:"013", name:"Surachai Tantipornsuk",  email:"surachai.t@email.com",   phone:"+66 84 555 6666",   distance:"100K", gender:"M", shirtSize:"L",  nationality:"TH", age:39, bloodType:"O+",  medicalConditions:"",                         emergencyContact:"+66 84 777 8888",  club:"",                          itraId:"ITRA-44556" },
  { id:"p17", bibNo:"017", name:"Prayut Suwannarat",      email:"prayut.s@email.com",     phone:"+66 85 111 3333",   distance:"100K", gender:"M", shirtSize:"L",  nationality:"TH", age:48, bloodType:"A+",  medicalConditions:"",                         emergencyContact:"+66 85 444 5555",  club:"",                          itraId:"" },
  { id:"p21", bibNo:"021", name:"Ekachai Phanomchai",     email:"ekachai.p@email.com",    phone:"+66 86 222 4444",   distance:"100K", gender:"M", shirtSize:"L",  nationality:"TH", age:51, bloodType:"B+",  medicalConditions:"Knee surgery history",     emergencyContact:"+66 86 555 6666",  club:"BKK Trail Runners",         itraId:"ITRA-77889" },
  { id:"p23", bibNo:"023", name:"Boonchai Rattanakul",    email:"boonchai.r@email.com",   phone:"+66 87 333 5555",   distance:"100K", gender:"M", shirtSize:"XL", nationality:"TH", age:43, bloodType:"O+",  medicalConditions:"",                         emergencyContact:"+66 87 666 7777",  club:"",                          itraId:"" },
  { id:"p27", bibNo:"027", name:"Chaiyaphon Sittiwong",   email:"chaiyaphon@email.com",   phone:"+66 88 444 6666",   distance:"100K", gender:"M", shirtSize:"M",  nationality:"TH", age:35, bloodType:"A+",  medicalConditions:"",                         emergencyContact:"+66 88 777 8888",  club:"Trail TH",                  itraId:"ITRA-99001" },
  { id:"p29", bibNo:"029", name:"Thanaboon Rattanasorn",  email:"thanaboon@email.com",    phone:"+66 89 555 7777",   distance:"100K", gender:"M", shirtSize:"L",  nationality:"TH", age:40, bloodType:"AB+", medicalConditions:"",                         emergencyContact:"+66 89 888 9999",  club:"",                          itraId:"" },
  { id:"p32", bibNo:"032", name:"Vorapol Sawangchit",     email:"vorapol.s@email.com",    phone:"+66 90 666 8888",   distance:"100K", gender:"M", shirtSize:"XL", nationality:"TH", age:44, bloodType:"O-",  medicalConditions:"",                         emergencyContact:"+66 90 999 0000",  club:"",                          itraId:"" },
  { id:"p34", bibNo:"034", name:"Yamamoto Kenji",         email:"kenji.y@email.jp",       phone:"+81 90 2345 6789",  distance:"100K", gender:"M", shirtSize:"M",  nationality:"JP", age:38, bloodType:"B+",  medicalConditions:"",                         emergencyContact:"+81 90 9876 5432", club:"Osaka Ultra",               itraId:"ITRA-23456" },
  { id:"p36", bibNo:"036", name:"Nakamura Hiroshi",       email:"hiroshi.n@email.jp",     phone:"+81 80 3456 7890",  distance:"100K", gender:"M", shirtSize:"L",  nationality:"JP", age:45, bloodType:"O+",  medicalConditions:"",                         emergencyContact:"+81 80 8765 4321", club:"",                          itraId:"ITRA-34567" },
  { id:"p38", bibNo:"038", name:"Suzuki Takeshi",         email:"takeshi.s@email.jp",     phone:"+81 70 4567 8901",  distance:"100K", gender:"M", shirtSize:"L",  nationality:"JP", age:52, bloodType:"A+",  medicalConditions:"Diabetes (type 2, controlled)", emergencyContact:"+81 70 7654 3210", club:"Tokyo Mountain Runners", itraId:"ITRA-45678" },
  { id:"p42", bibNo:"042", name:"Sato Masaki",            email:"masaki.s@email.jp",      phone:"+81 90 5678 9012",  distance:"100K", gender:"M", shirtSize:"L",  nationality:"JP", age:40, bloodType:"AB-", medicalConditions:"",                         emergencyContact:"+81 90 6543 2109", club:"",                          itraId:"" },
  { id:"p45", bibNo:"045", name:"Tanaka Hiroki",          email:"hiroki.t@email.jp",      phone:"+81 80 6789 0123",  distance:"100K", gender:"M", shirtSize:"M",  nationality:"JP", age:43, bloodType:"O+",  medicalConditions:"",                         emergencyContact:"+81 80 5432 1098", club:"Kyoto Trail Club",          itraId:"ITRA-56789" },
  { id:"p46", bibNo:"046", name:"Michael Thompson",       email:"michael.t@email.com",    phone:"+1 555 234 5678",   distance:"100K", gender:"M", shirtSize:"XL", nationality:"US", age:34, bloodType:"A+",  medicalConditions:"",                         emergencyContact:"+1 555 876 5432",  club:"Colorado Ultra",            itraId:"ITRA-67891" },
  { id:"p48", bibNo:"048", name:"Robert Davis",           email:"robert.d@email.com",     phone:"+1 555 345 6789",   distance:"100K", gender:"M", shirtSize:"L",  nationality:"US", age:47, bloodType:"O+",  medicalConditions:"",                         emergencyContact:"+1 555 765 4321",  club:"",                          itraId:"ITRA-78902" },
  { id:"p50", bibNo:"050", name:"Chris Martinez",         email:"chris.m@email.com",      phone:"+1 555 456 7890",   distance:"100K", gender:"M", shirtSize:"L",  nationality:"US", age:39, bloodType:"B+",  medicalConditions:"",                         emergencyContact:"+1 555 654 3210",  club:"",                          itraId:"" },
  { id:"p56", bibNo:"056", name:"Raj Kumar",              email:"raj.k@email.sg",         phone:"+65 8234 5678",     distance:"100K", gender:"M", shirtSize:"L",  nationality:"SG", age:40, bloodType:"B+",  medicalConditions:"",                         emergencyContact:"+65 8765 4321",    club:"SG Ultra",                  itraId:"ITRA-89013" },
  { id:"p59", bibNo:"059", name:"Ahmad Fauzi",            email:"ahmad.f@email.sg",       phone:"+65 8345 6789",     distance:"100K", gender:"M", shirtSize:"L",  nationality:"SG", age:42, bloodType:"O+",  medicalConditions:"",                         emergencyContact:"+65 8654 3210",    club:"",                          itraId:"" },
  { id:"p60", bibNo:"060", name:"Klaus Müller",           email:"klaus.m@email.de",       phone:"+49 171 2345678",   distance:"100K", gender:"M", shirtSize:"XL", nationality:"DE", age:49, bloodType:"A+",  medicalConditions:"",                         emergencyContact:"+49 172 9876543",  club:"Munich Trail",              itraId:"ITRA-90124" },
  { id:"p65", bibNo:"065", name:"James O'Brien",          email:"james.ob@email.au",      phone:"+61 411 234 567",   distance:"100K", gender:"M", shirtSize:"L",  nationality:"AU", age:41, bloodType:"O+",  medicalConditions:"",                         emergencyContact:"+61 411 765 432",  club:"Sydney Trailheads",         itraId:"ITRA-01235" },
  { id:"p71", bibNo:"071", name:"Park Jaeho",             email:"jaeho.p@email.kr",       phone:"+82 10 1234 5678",  distance:"100K", gender:"M", shirtSize:"L",  nationality:"KR", age:35, bloodType:"A+",  medicalConditions:"",                         emergencyContact:"+82 10 8765 4321", club:"Seoul Trail",               itraId:"ITRA-12346" },
  { id:"p74", bibNo:"074", name:"Pierre Dupont",          email:"pierre.d@email.fr",      phone:"+33 6 12 34 56 78", distance:"100K", gender:"M", shirtSize:"L",  nationality:"FR", age:43, bloodType:"B+",  medicalConditions:"",                         emergencyContact:"+33 6 87 65 43 21",club:"UTMB Crew",               itraId:"ITRA-23457" },
  { id:"p78", bibNo:"078", name:"Tom Baker",              email:"tom.b@email.co.uk",      phone:"+44 7700 900123",   distance:"100K", gender:"M", shirtSize:"L",  nationality:"GB", age:40, bloodType:"O+",  medicalConditions:"",                         emergencyContact:"+44 7700 900456",  club:"UK Ultra Runners",          itraId:"ITRA-34568" },
  { id:"p82", bibNo:"082", name:"Zhang Wei",              email:"zhang.w@email.cn",       phone:"+86 138 1234 5678", distance:"100K", gender:"M", shirtSize:"L",  nationality:"CN", age:38, bloodType:"B+",  medicalConditions:"",                         emergencyContact:"+86 138 8765 4321",club:"Beijing Trail",            itraId:"ITRA-45679" },
  { id:"p88", bibNo:"088", name:"Ben Fletcher",           email:"ben.f@email.nz",         phone:"+64 21 234 5678",   distance:"100K", gender:"M", shirtSize:"L",  nationality:"NZ", age:39, bloodType:"O+",  medicalConditions:"",                         emergencyContact:"+64 21 876 5432",  club:"",                          itraId:"" },
  { id:"p89", bibNo:"089", name:"Eric Morrison",          email:"eric.m@email.ca",        phone:"+1 604 234 5678",   distance:"100K", gender:"M", shirtSize:"XL", nationality:"CA", age:45, bloodType:"A+",  medicalConditions:"",                         emergencyContact:"+1 604 876 5432",  club:"Vancouver Mountain Runners",itraId:"ITRA-56790" },
  { id:"p91", bibNo:"091", name:"Sompong Weerachai",      email:"sompong@email.com",      phone:"+66 81 900 1111",   distance:"100K", gender:"M", shirtSize:"L",  nationality:"TH", age:53, bloodType:"O+",  medicalConditions:"",                         emergencyContact:"+66 81 111 2222",  club:"",                          itraId:"ITRA-67892" },
  { id:"p94", bibNo:"094", name:"Prasit Thepthong",       email:"prasit.t@email.com",     phone:"+66 82 900 2222",   distance:"100K", gender:"M", shirtSize:"XL", nationality:"TH", age:46, bloodType:"B+",  medicalConditions:"High cholesterol",         emergencyContact:"+66 82 222 3333",  club:"",                          itraId:"" },
  { id:"p97", bibNo:"",    name:"Akira Tanaka",           email:"akira.t@email.jp",       phone:"+81 90 7890 1234",  distance:"100K", gender:"M", shirtSize:"M",  nationality:"JP", age:39, bloodType:"AB+", medicalConditions:"",                         emergencyContact:"+81 90 4321 0987", club:"",                          itraId:"" },
  // 50K Trail (45 runners)
  { id:"p3",  bibNo:"003", name:"Tanaka Yuki",            email:"yuki.t@email.jp",        phone:"+81 90 1234 5678",  distance:"50K",  gender:"M", shirtSize:"M",  nationality:"JP", age:41, bloodType:"B+",  medicalConditions:"Asthma (mild)",            emergencyContact:"+81 90 8765 4321", club:"Tokyo Mountain Runners",    itraId:"" },
  { id:"p5",  bibNo:"005", name:"Natthaporn Sae-tang",    email:"natthaporn@email.com",   phone:"+66 89 876 5432",   distance:"50K",  gender:"F", shirtSize:"M",  nationality:"TH", age:29, bloodType:"O-",  medicalConditions:"",                         emergencyContact:"+66 89 111 2222",  club:"Chiang Mai Trail",          itraId:"" },
  { id:"p7",  bibNo:"007", name:"Lisa Anderson",          email:"lisa.a@email.com",        phone:"+61 400 123 456",   distance:"50K",  gender:"F", shirtSize:"S",  nationality:"AU", age:52, bloodType:"B-",  medicalConditions:"",                         emergencyContact:"+61 400 654 321",  club:"",                          itraId:"ITRA-55667" },
  { id:"p9",  bibNo:"009", name:"Narong Wutthichai",      email:"narong.w@email.com",     phone:"+66 83 234 5678",   distance:"50K",  gender:"M", shirtSize:"L",  nationality:"TH", age:32, bloodType:"O+",  medicalConditions:"",                         emergencyContact:"+66 83 876 5432",  club:"",                          itraId:"" },
  { id:"p12", bibNo:"012", name:"Siriporn Charoenwong",   email:"siriporn.c@email.com",   phone:"+66 84 345 6789",   distance:"50K",  gender:"F", shirtSize:"M",  nationality:"TH", age:31, bloodType:"A+",  medicalConditions:"",                         emergencyContact:"+66 84 765 4321",  club:"",                          itraId:"" },
  { id:"p14", bibNo:"014", name:"Malee Uthaiwan",         email:"malee.u@email.com",      phone:"+66 85 456 7890",   distance:"50K",  gender:"F", shirtSize:"M",  nationality:"TH", age:35, bloodType:"B+",  medicalConditions:"",                         emergencyContact:"+66 85 654 3210",  club:"BKK Trail Runners",         itraId:"" },
  { id:"p16", bibNo:"016", name:"Nanthita Kerdkaew",      email:"nanthita.k@email.com",   phone:"+66 86 567 8901",   distance:"50K",  gender:"F", shirtSize:"S",  nationality:"TH", age:42, bloodType:"O+",  medicalConditions:"",                         emergencyContact:"+66 86 543 2109",  club:"",                          itraId:"" },
  { id:"p18", bibNo:"018", name:"Patchara Meechok",       email:"patchara.m@email.com",   phone:"+66 87 678 9012",   distance:"50K",  gender:"F", shirtSize:"M",  nationality:"TH", age:33, bloodType:"A-",  medicalConditions:"",                         emergencyContact:"+66 87 432 1098",  club:"",                          itraId:"" },
  { id:"p19", bibNo:"019", name:"Teerasak Buarapha",      email:"teerasak.b@email.com",   phone:"+66 88 789 0123",   distance:"50K",  gender:"M", shirtSize:"L",  nationality:"TH", age:36, bloodType:"AB+", medicalConditions:"",                         emergencyContact:"+66 88 321 0987",  club:"Trail TH",                  itraId:"" },
  { id:"p24", bibNo:"024", name:"Duangjai Thongsuk",      email:"duangjai.t@email.com",   phone:"+66 89 890 1234",   distance:"50K",  gender:"F", shirtSize:"M",  nationality:"TH", age:38, bloodType:"O+",  medicalConditions:"",                         emergencyContact:"+66 89 210 9876",  club:"",                          itraId:"" },
  { id:"p25", bibNo:"025", name:"Pornchai Wongpradit",    email:"pornchai.w@email.com",   phone:"+66 90 901 2345",   distance:"50K",  gender:"M", shirtSize:"M",  nationality:"TH", age:30, bloodType:"B-",  medicalConditions:"",                         emergencyContact:"+66 90 109 8765",  club:"",                          itraId:"" },
  { id:"p26", bibNo:"",    name:"Suchada Lertpimolchai",  email:"suchada.l@email.com",    phone:"+66 81 012 3456",   distance:"50K",  gender:"F", shirtSize:"L",  nationality:"TH", age:46, bloodType:"A+",  medicalConditions:"",                         emergencyContact:"+66 81 098 7654",  club:"Chiang Mai Trail",          itraId:"" },
  { id:"p30", bibNo:"030", name:"Pawinee Chandee",        email:"pawinee.c@email.com",    phone:"+66 82 123 4567",   distance:"50K",  gender:"F", shirtSize:"M",  nationality:"TH", age:33, bloodType:"O+",  medicalConditions:"",                         emergencyContact:"+66 82 987 6543",  club:"",                          itraId:"" },
  { id:"p31", bibNo:"031", name:"Suriya Petchkrua",       email:"suriya.p@email.com",     phone:"+66 83 234 5679",   distance:"50K",  gender:"M", shirtSize:"M",  nationality:"TH", age:37, bloodType:"B+",  medicalConditions:"",                         emergencyContact:"+66 83 876 5431",  club:"BKK Trail Runners",         itraId:"" },
  { id:"p35", bibNo:"035", name:"Kimura Yui",             email:"yui.k@email.jp",         phone:"+81 80 1234 5679",  distance:"50K",  gender:"F", shirtSize:"S",  nationality:"JP", age:32, bloodType:"A+",  medicalConditions:"",                         emergencyContact:"+81 80 9876 5431", club:"",                          itraId:"" },
  { id:"p39", bibNo:"039", name:"Yoshida Nana",           email:"nana.y@email.jp",        phone:"+81 70 2345 6780",  distance:"50K",  gender:"F", shirtSize:"M",  nationality:"JP", age:35, bloodType:"O+",  medicalConditions:"",                         emergencyContact:"+81 70 8765 4320", club:"Osaka Ultra",               itraId:"" },
  { id:"p40", bibNo:"040", name:"Watanabe Ryo",           email:"ryo.w@email.jp",         phone:"+81 90 3456 7891",  distance:"50K",  gender:"M", shirtSize:"M",  nationality:"JP", age:33, bloodType:"B+",  medicalConditions:"",                         emergencyContact:"+81 90 7654 3209", club:"",                          itraId:"ITRA-78903" },
  { id:"p41", bibNo:"041", name:"Kobayashi Miki",         email:"miki.k@email.jp",        phone:"+81 80 4567 8902",  distance:"50K",  gender:"F", shirtSize:"S",  nationality:"JP", age:41, bloodType:"AB+", medicalConditions:"",                         emergencyContact:"+81 80 6543 2108", club:"Tokyo Mountain Runners",    itraId:"" },
  { id:"p44", bibNo:"044", name:"Ito Kenta",              email:"kenta.i@email.jp",       phone:"+81 70 5678 9013",  distance:"50K",  gender:"M", shirtSize:"M",  nationality:"JP", age:36, bloodType:"O+",  medicalConditions:"",                         emergencyContact:"+81 70 5432 1097", club:"",                          itraId:"" },
  { id:"p47", bibNo:"047", name:"Emily White",            email:"emily.w@email.com",      phone:"+1 555 567 8901",   distance:"50K",  gender:"F", shirtSize:"S",  nationality:"US", age:31, bloodType:"A+",  medicalConditions:"",                         emergencyContact:"+1 555 543 2109",  club:"",                          itraId:"" },
  { id:"p51", bibNo:"051", name:"Jennifer Lee",           email:"jennifer.l@email.com",   phone:"+1 555 678 9012",   distance:"50K",  gender:"F", shirtSize:"S",  nationality:"US", age:35, bloodType:"B+",  medicalConditions:"",                         emergencyContact:"+1 555 432 1098",  club:"Colorado Ultra",            itraId:"" },
  { id:"p52", bibNo:"052", name:"Tyler Brooks",           email:"tyler.b@email.com",      phone:"+1 555 789 0123",   distance:"50K",  gender:"M", shirtSize:"M",  nationality:"US", age:29, bloodType:"O+",  medicalConditions:"",                         emergencyContact:"+1 555 321 0987",  club:"",                          itraId:"" },
  { id:"p53", bibNo:"053", name:"Megan Foster",           email:"megan.f@email.com",      phone:"+1 555 890 1234",   distance:"50K",  gender:"F", shirtSize:"M",  nationality:"US", age:43, bloodType:"A-",  medicalConditions:"",                         emergencyContact:"+1 555 210 9876",  club:"",                          itraId:"" },
  { id:"p54", bibNo:"054", name:"Wei Liang",              email:"wei.l@email.sg",         phone:"+65 8456 7890",     distance:"50K",  gender:"M", shirtSize:"M",  nationality:"SG", age:31, bloodType:"O+",  medicalConditions:"",                         emergencyContact:"+65 8543 2109",    club:"",                          itraId:"" },
  { id:"p57", bibNo:"057", name:"Michelle Lim",           email:"michelle.l@email.sg",    phone:"+65 8567 8901",     distance:"50K",  gender:"F", shirtSize:"S",  nationality:"SG", age:28, bloodType:"A+",  medicalConditions:"",                         emergencyContact:"+65 8432 1098",    club:"SG Runners",                itraId:"" },
  { id:"p58", bibNo:"058", name:"Kevin Tan",              email:"kevin.t@email.sg",       phone:"+65 8678 9012",     distance:"50K",  gender:"M", shirtSize:"M",  nationality:"SG", age:35, bloodType:"B+",  medicalConditions:"",                         emergencyContact:"+65 8321 0987",    club:"",                          itraId:"" },
  { id:"p61", bibNo:"061", name:"Anna Schmidt",           email:"anna.s@email.de",        phone:"+49 172 3456789",   distance:"50K",  gender:"F", shirtSize:"M",  nationality:"DE", age:36, bloodType:"A+",  medicalConditions:"",                         emergencyContact:"+49 173 9876543",  club:"",                          itraId:"" },
  { id:"p62", bibNo:"062", name:"Stefan Becker",          email:"stefan.b@email.de",      phone:"+49 173 4567890",   distance:"50K",  gender:"M", shirtSize:"L",  nationality:"DE", age:38, bloodType:"O+",  medicalConditions:"",                         emergencyContact:"+49 174 8765432",  club:"Munich Trail",              itraId:"" },
  { id:"p64", bibNo:"064", name:"Christine Wagner",       email:"christine.w@email.de",   phone:"+49 174 5678901",   distance:"50K",  gender:"F", shirtSize:"M",  nationality:"DE", age:44, bloodType:"B+",  medicalConditions:"",                         emergencyContact:"+49 175 7654321",  club:"",                          itraId:"ITRA-90125" },
  { id:"p67", bibNo:"067", name:"Matt Harrison",          email:"matt.h@email.au",        phone:"+61 422 345 678",   distance:"50K",  gender:"M", shirtSize:"L",  nationality:"AU", age:37, bloodType:"O+",  medicalConditions:"",                         emergencyContact:"+61 422 876 543",  club:"Melbourne Trailrunners",    itraId:"" },
  { id:"p69", bibNo:"069", name:"Kim Minjun",             email:"minjun.k@email.kr",      phone:"+82 10 2345 6789",  distance:"50K",  gender:"M", shirtSize:"M",  nationality:"KR", age:30, bloodType:"A+",  medicalConditions:"",                         emergencyContact:"+82 10 9876 5432", club:"",                          itraId:"" },
  { id:"p72", bibNo:"072", name:"Lee Dongwoo",            email:"dongwoo.l@email.kr",     phone:"+82 10 3456 7890",  distance:"50K",  gender:"M", shirtSize:"M",  nationality:"KR", age:42, bloodType:"O+",  medicalConditions:"",                         emergencyContact:"+82 10 8765 4321", club:"Seoul Trail",               itraId:"" },
  { id:"p73", bibNo:"073", name:"Jung Sooyeon",           email:"sooyeon.j@email.kr",     phone:"+82 10 4567 8901",  distance:"50K",  gender:"F", shirtSize:"S",  nationality:"KR", age:31, bloodType:"B+",  medicalConditions:"",                         emergencyContact:"+82 10 7654 3210", club:"",                          itraId:"" },
  { id:"p75", bibNo:"075", name:"Marie Leroy",            email:"marie.l@email.fr",       phone:"+33 6 23 45 67 89", distance:"50K",  gender:"F", shirtSize:"M",  nationality:"FR", age:35, bloodType:"A+",  medicalConditions:"",                         emergencyContact:"+33 6 76 54 32 10",club:"UTMB Crew",               itraId:"" },
  { id:"p76", bibNo:"076", name:"Antoine Bernard",        email:"antoine.b@email.fr",     phone:"+33 6 34 56 78 90", distance:"50K",  gender:"M", shirtSize:"L",  nationality:"FR", age:37, bloodType:"O+",  medicalConditions:"",                         emergencyContact:"+33 6 65 43 21 09",club:"",                        itraId:"ITRA-12347" },
  { id:"p79", bibNo:"079", name:"Charlotte Hughes",       email:"charlotte.h@email.co.uk",phone:"+44 7700 900234",   distance:"50K",  gender:"F", shirtSize:"S",  nationality:"GB", age:32, bloodType:"A+",  medicalConditions:"",                         emergencyContact:"+44 7700 900567",  club:"",                          itraId:"" },
  { id:"p80", bibNo:"080", name:"Jackson Wong",           email:"jackson.w@email.hk",     phone:"+852 9234 5678",    distance:"50K",  gender:"M", shirtSize:"M",  nationality:"HK", age:34, bloodType:"B+",  medicalConditions:"",                         emergencyContact:"+852 8765 4321",   club:"HK Trail Runners",          itraId:"" },
  { id:"p83", bibNo:"083", name:"Li Na",                  email:"li.n@email.cn",          phone:"+86 139 1234 5678", distance:"50K",  gender:"F", shirtSize:"M",  nationality:"CN", age:30, bloodType:"O+",  medicalConditions:"",                         emergencyContact:"+86 139 8765 4321",club:"",                         itraId:"" },
  { id:"p84", bibNo:"084", name:"Ahmad Razif",            email:"razif@email.my",         phone:"+60 12 345 6789",   distance:"50K",  gender:"M", shirtSize:"L",  nationality:"MY", age:36, bloodType:"O+",  medicalConditions:"",                         emergencyContact:"+60 12 876 5432",  club:"",                          itraId:"" },
  { id:"p86", bibNo:"086", name:"Juan dela Cruz",         email:"juan.dc@email.ph",       phone:"+63 917 234 5678",  distance:"50K",  gender:"M", shirtSize:"M",  nationality:"PH", age:33, bloodType:"B+",  medicalConditions:"",                         emergencyContact:"+63 917 876 5432", club:"",                          itraId:"" },
  { id:"p90", bibNo:"090", name:"James van der Berg",     email:"james.vdb@email.za",     phone:"+27 82 345 6789",   distance:"50K",  gender:"M", shirtSize:"L",  nationality:"ZA", age:41, bloodType:"O+",  medicalConditions:"",                         emergencyContact:"+27 82 876 5432",  club:"Cape Town Trail",           itraId:"" },
  { id:"p93", bibNo:"093", name:"Ratchanok Buakaew",      email:"ratchanok@email.com",    phone:"+66 83 900 3333",   distance:"50K",  gender:"F", shirtSize:"M",  nationality:"TH", age:37, bloodType:"A+",  medicalConditions:"",                         emergencyContact:"+66 83 333 4444",  club:"",                          itraId:"" },
  { id:"p95", bibNo:"095", name:"Yanee Wongsombat",       email:"yanee.w@email.com",      phone:"+66 84 900 4444",   distance:"50K",  gender:"F", shirtSize:"S",  nationality:"TH", age:31, bloodType:"O+",  medicalConditions:"",                         emergencyContact:"+66 84 444 5555",  club:"",                          itraId:"" },
  { id:"p98", bibNo:"098", name:"Park Soyeon",            email:"soyeon.p@email.kr",      phone:"+82 10 5678 9012",  distance:"50K",  gender:"F", shirtSize:"S",  nationality:"KR", age:33, bloodType:"A+",  medicalConditions:"",                         emergencyContact:"+82 10 6543 2109", club:"Seoul Trail",               itraId:"" },
  { id:"p100",bibNo:"100", name:"Thanwa Nantakrit",       email:"thanwa.n@email.com",     phone:"+66 85 900 5555",   distance:"50K",  gender:"M", shirtSize:"L",  nationality:"TH", age:42, bloodType:"B+",  medicalConditions:"",                         emergencyContact:"+66 85 555 6666",  club:"Trail TH",                  itraId:"" },
  // 25K Fun Run (21 runners)
  { id:"p10", bibNo:"010", name:"Kanokwan Srisai",        email:"kanokwan.s@email.com",   phone:"+66 86 012 3456",   distance:"25K",  gender:"F", shirtSize:"S",  nationality:"TH", age:26, bloodType:"O+",  medicalConditions:"",                         emergencyContact:"+66 86 234 5678",  club:"",                          itraId:"" },
  { id:"p15", bibNo:"015", name:"Anuwat Polchaisri",      email:"anuwat.p@email.com",     phone:"+66 87 123 4568",   distance:"25K",  gender:"M", shirtSize:"M",  nationality:"TH", age:27, bloodType:"A+",  medicalConditions:"",                         emergencyContact:"+66 87 345 6789",  club:"",                          itraId:"" },
  { id:"p20", bibNo:"020", name:"Warunee Kaewsri",        email:"warunee.k@email.com",    phone:"+66 88 234 5679",   distance:"25K",  gender:"F", shirtSize:"S",  nationality:"TH", age:28, bloodType:"B+",  medicalConditions:"",                         emergencyContact:"+66 88 456 7890",  club:"",                          itraId:"" },
  { id:"p22", bibNo:"022", name:"Noppawan Srimuang",      email:"noppawan.s@email.com",   phone:"+66 89 345 6780",   distance:"25K",  gender:"F", shirtSize:"XS", nationality:"TH", age:24, bloodType:"O-",  medicalConditions:"",                         emergencyContact:"+66 89 567 8901",  club:"",                          itraId:"" },
  { id:"p28", bibNo:"028", name:"Jutamas Boonsong",       email:"jutamas.b@email.com",    phone:"+66 90 456 7891",   distance:"25K",  gender:"F", shirtSize:"S",  nationality:"TH", age:29, bloodType:"A+",  medicalConditions:"",                         emergencyContact:"+66 90 678 9012",  club:"",                          itraId:"" },
  { id:"p33", bibNo:"033", name:"Chatchai Mongkol",       email:"chatchai.m@email.com",   phone:"+66 81 567 8902",   distance:"25K",  gender:"M", shirtSize:"M",  nationality:"TH", age:29, bloodType:"B+",  medicalConditions:"",                         emergencyContact:"+66 81 789 0123",  club:"",                          itraId:"" },
  { id:"p37", bibNo:"037", name:"Hayashi Akiko",          email:"akiko.h@email.jp",       phone:"+81 70 1234 5679",  distance:"25K",  gender:"F", shirtSize:"XS", nationality:"JP", age:28, bloodType:"A+",  medicalConditions:"",                         emergencyContact:"+81 70 9876 5430", club:"",                          itraId:"" },
  { id:"p43", bibNo:"043", name:"Inoue Emi",              email:"emi.i@email.jp",         phone:"+81 80 2345 6780",  distance:"25K",  gender:"F", shirtSize:"S",  nationality:"JP", age:27, bloodType:"O+",  medicalConditions:"",                         emergencyContact:"+81 80 8765 4319", club:"",                          itraId:"" },
  { id:"p49", bibNo:"049", name:"Amanda Clark",           email:"amanda.c@email.com",     phone:"+1 555 901 2345",   distance:"25K",  gender:"F", shirtSize:"M",  nationality:"US", age:26, bloodType:"A+",  medicalConditions:"",                         emergencyContact:"+1 555 109 8765",  club:"",                          itraId:"" },
  { id:"p55", bibNo:"055", name:"Priya Nair",             email:"priya.n@email.sg",       phone:"+65 8789 0123",     distance:"25K",  gender:"F", shirtSize:"S",  nationality:"SG", age:33, bloodType:"O+",  medicalConditions:"",                         emergencyContact:"+65 8210 9876",    club:"",                          itraId:"" },
  { id:"p63", bibNo:"063", name:"Julia Hoffmann",         email:"julia.h@email.de",       phone:"+49 175 6789012",   distance:"25K",  gender:"F", shirtSize:"S",  nationality:"DE", age:30, bloodType:"A+",  medicalConditions:"",                         emergencyContact:"+49 176 6543210",  club:"",                          itraId:"" },
  { id:"p66", bibNo:"066", name:"Emma Clarke",            email:"emma.c@email.au",        phone:"+61 433 456 789",   distance:"25K",  gender:"F", shirtSize:"S",  nationality:"AU", age:33, bloodType:"B+",  medicalConditions:"",                         emergencyContact:"+61 433 987 654",  club:"",                          itraId:"" },
  { id:"p68", bibNo:"068", name:"Rachel Moore",           email:"rachel.m@email.au",      phone:"+61 444 567 890",   distance:"25K",  gender:"F", shirtSize:"M",  nationality:"AU", age:45, bloodType:"O+",  medicalConditions:"",                         emergencyContact:"+61 444 098 765",  club:"",                          itraId:"" },
  { id:"p70", bibNo:"070", name:"Choi Jiyeon",            email:"jiyeon.c@email.kr",      phone:"+82 10 6789 0123",  distance:"25K",  gender:"F", shirtSize:"S",  nationality:"KR", age:27, bloodType:"A+",  medicalConditions:"",                         emergencyContact:"+82 10 3210 9876", club:"",                          itraId:"" },
  { id:"p77", bibNo:"077", name:"Sophie Martin",          email:"sophie.m@email.fr",      phone:"+33 6 45 67 89 01", distance:"25K",  gender:"F", shirtSize:"S",  nationality:"FR", age:29, bloodType:"B+",  medicalConditions:"",                         emergencyContact:"+33 6 54 32 10 98",club:"",                        itraId:"" },
  { id:"p81", bibNo:"081", name:"Chloe Lam",              email:"chloe.l@email.hk",       phone:"+852 9345 6789",    distance:"25K",  gender:"F", shirtSize:"S",  nationality:"HK", age:28, bloodType:"O+",  medicalConditions:"",                         emergencyContact:"+852 7654 3210",   club:"",                          itraId:"" },
  { id:"p85", bibNo:"085", name:"Nurul Aina",             email:"aina@email.my",          phone:"+60 12 456 7890",   distance:"25K",  gender:"F", shirtSize:"S",  nationality:"MY", age:25, bloodType:"A+",  medicalConditions:"",                         emergencyContact:"+60 12 765 4321",  club:"",                          itraId:"" },
  { id:"p87", bibNo:"087", name:"Maria Santos",           email:"maria.s@email.ph",       phone:"+63 918 345 6789",  distance:"25K",  gender:"F", shirtSize:"S",  nationality:"PH", age:27, bloodType:"B+",  medicalConditions:"",                         emergencyContact:"+63 918 765 4321", club:"",                          itraId:"" },
  { id:"p92", bibNo:"092", name:"Nuttapong Apirak",       email:"nuttapong.a@email.com",  phone:"+66 86 900 6666",   distance:"25K",  gender:"M", shirtSize:"M",  nationality:"TH", age:26, bloodType:"O+",  medicalConditions:"",                         emergencyContact:"+66 86 666 7777",  club:"",                          itraId:"" },
  { id:"p96", bibNo:"096", name:"Kanchanok Phakdeewong",  email:"kanchanok@email.com",    phone:"+66 87 900 7777",   distance:"25K",  gender:"F", shirtSize:"M",  nationality:"TH", age:35, bloodType:"A+",  medicalConditions:"",                         emergencyContact:"+66 87 777 8888",  club:"",                          itraId:"" },
  { id:"p99", bibNo:"099", name:"Napat Suksiri",          email:"napat.s@email.com",      phone:"+66 88 900 8888",   distance:"25K",  gender:"M", shirtSize:"M",  nationality:"TH", age:28, bloodType:"B+",  medicalConditions:"",                         emergencyContact:"+66 88 888 9999",  club:"",                          itraId:"" },
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

export const revenueWeeklyData = [
  { date: "Mon", revenue: 45000 },
  { date: "Tue", revenue: 62000 },
  { date: "Wed", revenue: 38000 },
  { date: "Thu", revenue: 91000 },
  { date: "Fri", revenue: 124000 },
  { date: "Sat", revenue: 210000 },
  { date: "Sun", revenue: 155000 },
];

export const revenueMonthlyData = [
  { date: "Week 1", revenue: 245000 },
  { date: "Week 2", revenue: 398000 },
  { date: "Week 3", revenue: 512000 },
  { date: "Week 4", revenue: 847500 },
];

export const ticketSalesData = [
  { name: "100K Early Bird", value: 100, color: "#E85D04" },
  { name: "100K Regular", value: 89, color: "#F97316" },
  { name: "100K Late", value: 12, color: "#FB923C" },
  { name: "50K Early Bird", value: 100, color: "#34D399" },
  { name: "50K Regular", value: 122, color: "#6EE7B7" },
];

export const mockCategoryFillRate = [
  { name: "100K Ultra", sold: 89, capacity: 100 },
  { name: "50K Trail", sold: 122, capacity: 150 },
  { name: "25K Fun Run", sold: 45, capacity: 200 },
  { name: "10K Sprint", sold: 198, capacity: 200 },
];

export const mockRecentActivity = [
  { id: "a1", type: "registration", message: "Sarah Johnson registered for 100K Ultra", time: "2 min ago" },
  { id: "a2", type: "payment", message: "Krit Pongpanich completed payment", time: "15 min ago" },
  { id: "a3", type: "cancellation", message: "Marcus Weber cancelled registration", time: "1 hr ago" },
  { id: "a4", type: "registration", message: "Tanaka Yuki registered for 50K Trail", time: "2 hr ago" },
  { id: "a5", type: "refund", message: "Lisa Anderson requested a refund", time: "3 hr ago" },
];
