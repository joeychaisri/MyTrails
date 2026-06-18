// Shared event data for the runner side.
// Single import point — replace MOCK_EVENTS with a real API call here and
// every runner view (landing grid/list, calendar) updates at once.

export const UNSPLASH = (id: string, w = 800) =>
  `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;

export interface RunnerEvent {
  id: string;
  title: string;
  province: string;
  region: string;
  /** Human date, "MMM DD, YYYY" — parsed by src/lib/eventCalendar.ts */
  date: string;
  dateShort: string;
  distances: string[];
  elevation: string;
  price: number;
  sold: number;
  capacity: number;
  image: string;
  tag: string;
}

export const MOCK_EVENTS: RunnerEvent[] = [
  { id: "doi-inthanon", title: "Doi Inthanon Sky Trail 2026", province: "Chiang Mai", region: "north", date: "Apr 27, 2026", dateShort: "27 APR", distances: ["21K", "42K", "70K"], elevation: "3,800m", price: 1500, sold: 847, capacity: 1200, image: UNSPLASH("photo-1464822759023-fed622ff2c3b"), tag: "Featured" },
  { id: "khao-yai", title: "Khao Yai Forest Ultra", province: "Nakhon Ratchasima", region: "central", date: "May 18, 2026", dateShort: "18 MAY", distances: ["12K", "25K", "50K"], elevation: "2,100m", price: 1200, sold: 320, capacity: 800, image: UNSPLASH("photo-1486870591958-9b9d0d1dda99"), tag: "Open" },
  { id: "phu-kradueng", title: "Phu Kradueng Ridge Run", province: "Loei", region: "north", date: "Jun 7, 2026", dateShort: "07 JUN", distances: ["10K", "21K", "42K"], elevation: "1,600m", price: 1100, sold: 612, capacity: 900, image: UNSPLASH("photo-1551524559-8af4e6624178"), tag: "Early Bird" },
  { id: "krabi-coast", title: "Krabi Coast & Cliff 42", province: "Krabi", region: "south", date: "Jul 12, 2026", dateShort: "12 JUL", distances: ["15K", "30K", "42K"], elevation: "1,400m", price: 1400, sold: 188, capacity: 600, image: UNSPLASH("photo-1551632811-561732d1e306"), tag: "New" },
  { id: "pai-jungle", title: "Pai Jungle Marathon", province: "Mae Hong Son", region: "north", date: "Aug 24, 2026", dateShort: "24 AUG", distances: ["10K", "21K", "42K"], elevation: "1,900m", price: 1300, sold: 95, capacity: 500, image: UNSPLASH("photo-1469474968028-56623f02e42e"), tag: "Open" },
  { id: "kanchanaburi", title: "Erawan Falls Trail 21", province: "Kanchanaburi", region: "central", date: "Sep 14, 2026", dateShort: "14 SEP", distances: ["10K", "21K"], elevation: "900m", price: 950, sold: 432, capacity: 700, image: UNSPLASH("photo-1455218873509-8097305ee378"), tag: "Open" },
];

export const REGIONS = [
  { value: "all",     label: "All Regions" },
  { value: "north",   label: "North" },
  { value: "central", label: "Central" },
  { value: "south",   label: "South" },
];
