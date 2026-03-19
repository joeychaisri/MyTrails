import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  BarChart3,
  Activity,
  DollarSign,
  Users,
  Shirt,
  Tag,
  Megaphone,
  Settings,
  Download,
  Plus,
  RefreshCw,
  Send,
  Search,
  UserPlus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Pencil,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  MoreHorizontal,
  Eye,
  Phone,
  Mail,
  User,
  Hash,
  Receipt,
  RotateCcw,
  ArrowRightLeft,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import Logo from "@/components/Logo";
import StatusBadge from "@/components/StatusBadge";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Event,
  Order,
  Participant,
  OrderStatus,
  PaymentMethod,
  mockOrders,
  mockParticipants,
  mockDiscountCodes,
  mockCategoryFillRate,
  mockRecentActivity,
  revenueData,
  revenueWeeklyData,
  revenueMonthlyData,
  ticketSalesData,
  shirtSizeBreakdown,
  shuttleBusSeats,
} from "@/data/mockData";

interface EventManagerHubProps {
  event: Event;
  onBack: () => void;
  onEditWizard: () => void;
}

type HubSection = "overview" | "overview2" | "orders" | "participants" | "merchandise" | "promotions" | "broadcast" | "settings";

const sidebarItems: { id: HubSection; label: string; icon: typeof BarChart3 }[] = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "overview2", label: "Race Operations", icon: Activity },
  { id: "orders", label: "Orders (Finance)", icon: DollarSign },
  { id: "participants", label: "Participants", icon: Users },
  { id: "merchandise", label: "Merchandise Report", icon: Shirt },
  { id: "promotions", label: "Promotions", icon: Tag },
  { id: "broadcast", label: "Broadcast", icon: Megaphone },
  { id: "settings", label: "Settings", icon: Settings },
];

const COLORS = ["#E85D04", "#F97316", "#FB923C", "#34D399", "#6EE7B7"];

const EventManagerHub = ({ event, onBack, onEditWizard }: EventManagerHubProps) => {
  const [activeSection, setActiveSection] = useState<HubSection>("overview");
  const [participantFilter, setParticipantFilter] = useState("all");
  const [participantSearch, setParticipantSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [ageFilter, setAgeFilter] = useState("all");
  const [nationalityFilter, setNationalityFilter] = useState("all");
  const [sortKey, setSortKey] = useState<keyof Participant | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [participants, setParticipants] = useState<Participant[]>(mockParticipants);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [editForm, setEditForm] = useState<Participant | null>(null);
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [orderFilter, setOrderFilter] = useState("all");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderDateFilter, setOrderDateFilter] = useState<"all" | "today" | "7days" | "month" | "custom">("all");
  const [orderCustomRange, setOrderCustomRange] = useState<DateRange | undefined>();
  const [orderCustomPickerOpen, setOrderCustomPickerOpen] = useState(false);
  const [revenueFilter, setRevenueFilter] = useState<"week" | "month" | "custom">("week");
  const [customRevenueRange, setCustomRevenueRange] = useState<DateRange | undefined>();
  const [customPickerOpen, setCustomPickerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderPaymentFilter, setOrderPaymentFilter] = useState<"all" | PaymentMethod>("all");
  const [orderCategoryFilter, setOrderCategoryFilter] = useState("all");
  const [orderTicketFilter, setOrderTicketFilter] = useState("all");
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const shirtData = Object.entries(shirtSizeBreakdown).map(([size, count]) => ({
    size,
    count,
  }));

  const handleSort = (key: keyof Participant) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ col }: { col: keyof Participant }) => {
    if (sortKey !== col) return <ChevronsUpDown className="inline ml-1 h-3 w-3 text-muted-foreground" />;
    return sortDir === "asc"
      ? <ChevronUp className="inline ml-1 h-3 w-3" />
      : <ChevronDown className="inline ml-1 h-3 w-3" />;
  };

  const filteredParticipants = participants
    .filter((p) => participantFilter === "all" || p.distance === participantFilter)
    .filter((p) => genderFilter === "all" || p.gender === genderFilter)
    .filter((p) => {
      if (ageFilter === "all") return true;
      if (ageFilter === "u30") return p.age < 30;
      if (ageFilter === "30-39") return p.age >= 30 && p.age < 40;
      if (ageFilter === "40-49") return p.age >= 40 && p.age < 50;
      if (ageFilter === "50+") return p.age >= 50;
      return true;
    })
    .filter((p) => nationalityFilter === "all" || p.nationality === nationalityFilter)
    .filter((p) => {
      if (!participantSearch) return true;
      const q = participantSearch.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (!sortKey) return 0;
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });

  const hasActiveFilters = participantFilter !== "all" || genderFilter !== "all" || ageFilter !== "all" || nationalityFilter !== "all" || !!participantSearch;

  const clearAllFilters = () => {
    setParticipantFilter("all");
    setGenderFilter("all");
    setAgeFilter("all");
    setNationalityFilter("all");
    setParticipantSearch("");
  };

  const openEditModal = (p: Participant) => {
    setEditingParticipant(p);
    setEditForm({ ...p });
  };

  const saveEdit = () => {
    if (!editForm) return;
    setParticipants((prev) => prev.map((p) => (p.id === editForm.id ? editForm : p)));
    setEditingParticipant(null);
    setEditForm(null);
  };

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-card p-4 shadow-card">
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-card-foreground">{formatCurrency(event.revenue)}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 shadow-card">
                <p className="text-sm text-muted-foreground">Tickets Sold</p>
                <p className="text-2xl font-bold text-card-foreground">{event.sold}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 shadow-card">
                <p className="text-sm text-muted-foreground">Capacity</p>
                <p className="text-2xl font-bold text-card-foreground">{event.capacity}</p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Revenue Chart */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <h3 className="text-lg font-semibold text-card-foreground">Revenue</h3>
                  <div className="flex items-center gap-2">
                    <Tabs value={revenueFilter} onValueChange={(v) => {
                      if (v === "custom") {
                        setCustomPickerOpen(true);
                      } else {
                        setRevenueFilter(v as "week" | "month");
                      }
                    }}>
                      <TabsList>
                        <TabsTrigger value="week">Week</TabsTrigger>
                        <TabsTrigger value="month">Month</TabsTrigger>
                        <Popover open={customPickerOpen} onOpenChange={setCustomPickerOpen}>
                          <PopoverTrigger asChild>
                            <TabsTrigger value="custom" onClick={() => setCustomPickerOpen(true)}>
                              {revenueFilter === "custom" && customRevenueRange?.from && customRevenueRange?.to
                                ? `${format(customRevenueRange.from, "MMM d")} – ${format(customRevenueRange.to, "MMM d")}`
                                : "Custom"}
                            </TabsTrigger>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-popover" align="end">
                            <Calendar
                              initialFocus
                              mode="range"
                              defaultMonth={customRevenueRange?.from}
                              selected={customRevenueRange}
                              onSelect={(range) => {
                                setCustomRevenueRange(range);
                                if (range?.from && range?.to) {
                                  setRevenueFilter("custom");
                                  setCustomPickerOpen(false);
                                }
                              }}
                              numberOfMonths={2}
                              className="p-3"
                            />
                          </PopoverContent>
                        </Popover>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={revenueFilter === "week" ? revenueWeeklyData : revenueFilter === "month" ? revenueMonthlyData : revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Ticket Sales Pie Chart */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <h3 className="mb-4 text-lg font-semibold text-card-foreground">Ticket Sales Breakdown</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={ticketSalesData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {ticketSalesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 flex flex-wrap justify-center gap-4">
                  {ticketSalesData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-xs text-muted-foreground">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case "overview2": {
        const totalParticipants = participants.length;
        const maleCount = participants.filter((p) => p.gender === "M").length;
        const ageRanges = [
          { label: "Under 30", count: participants.filter((p) => p.age < 30).length },
          { label: "30–39",    count: participants.filter((p) => p.age >= 30 && p.age < 40).length },
          { label: "40–49",    count: participants.filter((p) => p.age >= 40 && p.age < 50).length },
          { label: "50+",      count: participants.filter((p) => p.age >= 50).length },
        ];
        const maxAge = Math.max(...ageRanges.map((r) => r.count));
        const nationalityMap: Record<string, number> = {};
        participants.forEach((p) => {
          nationalityMap[p.nationality] = (nationalityMap[p.nationality] || 0) + 1;
        });
        const nationalityTop5 = Object.entries(nationalityMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);
        const maxNat = Math.max(...nationalityTop5.map(([, c]) => c));
        const countryFlags: Record<string, string> = {
          TH: "🇹🇭", JP: "🇯🇵", US: "🇺🇸", SG: "🇸🇬",
          DE: "🇩🇪", AU: "🇦🇺", GB: "🇬🇧", CN: "🇨🇳", KR: "🇰🇷", HK: "🇭🇰",
        };
        const countryNames: Record<string, string> = {
          TH: "Thailand", JP: "Japan", US: "United States", SG: "Singapore",
          DE: "Germany", AU: "Australia", GB: "United Kingdom", CN: "China", KR: "South Korea", HK: "Hong Kong",
        };
        const shirtEntries = Object.entries(shirtSizeBreakdown) as [string, number][];
        const maxShirt = Math.max(...shirtEntries.map(([, v]) => v));

        const activityIcon = (type: string) => {
          switch (type) {
            case "registration": return <UserPlus className="h-4 w-4 text-success" />;
            case "payment": return <CheckCircle2 className="h-4 w-4 text-primary" />;
            case "cancellation": return <XCircle className="h-4 w-4 text-destructive" />;
            case "refund": return <AlertCircle className="h-4 w-4 text-warning" />;
            default: return null;
          }
        };

        return (
          <div className="space-y-6">
            {/* Revenue Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-card p-4 shadow-card">
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-card-foreground">{formatCurrency(event.revenue)}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 shadow-card">
                <p className="text-sm text-muted-foreground">Tickets Sold</p>
                <p className="text-2xl font-bold text-card-foreground">{event.sold}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 shadow-card">
                <p className="text-sm text-muted-foreground">Capacity</p>
                <p className="text-2xl font-bold text-card-foreground">{event.capacity}</p>
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <div className="mb-4 flex items-center justify-between gap-2">
                <h3 className="text-lg font-semibold text-card-foreground">Revenue</h3>
                <Tabs value={revenueFilter} onValueChange={(v) => {
                  if (v === "custom") { setCustomPickerOpen(true); } else { setRevenueFilter(v as "week" | "month"); }
                }}>
                  <TabsList>
                    <TabsTrigger value="week">Week</TabsTrigger>
                    <TabsTrigger value="month">Month</TabsTrigger>
                    <Popover open={customPickerOpen} onOpenChange={setCustomPickerOpen}>
                      <PopoverTrigger asChild>
                        <TabsTrigger value="custom" onClick={() => setCustomPickerOpen(true)}>
                          {revenueFilter === "custom" && customRevenueRange?.from && customRevenueRange?.to
                            ? `${format(customRevenueRange.from, "MMM d")} – ${format(customRevenueRange.to, "MMM d")}`
                            : "Custom"}
                        </TabsTrigger>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-popover" align="end">
                        <Calendar initialFocus mode="range" defaultMonth={customRevenueRange?.from} selected={customRevenueRange}
                          onSelect={(range) => { setCustomRevenueRange(range); if (range?.from && range?.to) { setRevenueFilter("custom"); setCustomPickerOpen(false); } }}
                          numberOfMonths={2} className="p-3" />
                      </PopoverContent>
                    </Popover>
                  </TabsList>
                </Tabs>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={revenueFilter === "week" ? revenueWeeklyData : revenueFilter === "month" ? revenueMonthlyData : revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Row 1: Registration Fill Rate + Runner Demographics */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Registration Fill Rate */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <h3 className="mb-4 text-lg font-semibold text-card-foreground">Registration Fill Rate</h3>
                <div className="space-y-4">
                  {mockCategoryFillRate.map((cat) => {
                    const pct = Math.round((cat.sold / cat.capacity) * 100);
                    return (
                      <div key={cat.name}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="font-medium text-foreground">{cat.name}</span>
                          <span className={`font-medium ${pct >= 80 ? "text-warning" : "text-muted-foreground"}`}>
                            {cat.sold} / {cat.capacity} ({pct}%)
                          </span>
                        </div>
                        <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className={`h-full rounded-full transition-all ${pct >= 80 ? "bg-warning" : "bg-primary"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Runner Demographics */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <h3 className="mb-4 text-lg font-semibold text-card-foreground">Runner Demographics</h3>
                <div className="space-y-6">
                  {/* Age Range */}
                  <div>
                    <p className="mb-3 text-sm font-medium text-foreground">Age Range</p>
                    <div className="space-y-2.5">
                      {ageRanges.map((range) => (
                        <div key={range.label} className="flex items-center gap-3 text-sm">
                          <span className="w-16 text-muted-foreground">{range.label}</span>
                          <div className="flex-1 h-2 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{ width: maxAge > 0 ? `${(range.count / maxAge) * 100}%` : "0%" }}
                            />
                          </div>
                          <span className="w-4 text-right text-muted-foreground">{range.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Gender */}
                  <div>
                    <p className="mb-2 text-sm font-medium text-foreground">Gender</p>
                    <div className="mb-1 flex items-center justify-between text-sm text-muted-foreground">
                      <span>Male ({maleCount})</span>
                      <span>Female ({totalParticipants - maleCount})</span>
                    </div>
                    <div className="flex h-3 overflow-hidden rounded-full">
                      <div className="bg-[#3B82F6] transition-all" style={{ width: `${(maleCount / totalParticipants) * 100}%` }} />
                      <div className="bg-[#EC4899] transition-all" style={{ width: `${((totalParticipants - maleCount) / totalParticipants) * 100}%` }} />
                    </div>
                    <div className="mt-1.5 flex gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-[#3B82F6]" />Male</span>
                      <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-[#EC4899]" />Female</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Top Nationalities + Shirt Size Summary */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Top Nationalities - Flag List */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <h3 className="mb-4 text-lg font-semibold text-card-foreground">Top Nationalities</h3>
                <div className="space-y-3">
                  {nationalityTop5.map(([code, count], index) => (
                    <div key={code} className="flex items-center gap-3 text-sm">
                      <span className="w-5 text-center text-xs font-bold text-muted-foreground">{index + 1}</span>
                      <span className="text-xl leading-none">{countryFlags[code] ?? "🏳️"}</span>
                      <span className="w-28 font-medium text-foreground truncate">{countryNames[code] ?? code}</span>
                      <div className="flex-1 h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${(count / maxNat) * 100}%` }}
                        />
                      </div>
                      <span className="w-6 text-right font-medium text-foreground">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shirt Size Summary */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <h3 className="mb-4 text-lg font-semibold text-card-foreground">Shirt Size Summary</h3>
                <div className="space-y-2.5">
                  {shirtEntries.map(([size, count]) => (
                    <div key={size} className="flex items-center gap-3 text-sm">
                      <span className="w-8 font-medium text-foreground">{size}</span>
                      <div className="flex-1 h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${(count / maxShirt) * 100}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-muted-foreground">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 3: Recent Activity Feed */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <h3 className="mb-4 text-lg font-semibold text-card-foreground">Recent Activity</h3>
              <div className="space-y-3">
                {mockRecentActivity.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 rounded-lg bg-muted/40 px-4 py-3">
                    <div className="shrink-0">{activityIcon(item.type)}</div>
                    <p className="flex-1 text-sm text-foreground">{item.message}</p>
                    <span className="shrink-0 text-xs text-muted-foreground">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }

      case "orders": {
        const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
          submitted: "Submitted",
          complete_stripe_wait_receipt: "Complete Stripe · รอใบรับมัดจำ",
          complete_wait_receipt: "Complete · รอใบรับมัดจำ",
          complete_receipt_issued: "Complete · เปิดใบรับมัดจำแล้ว",
          complete_name_change_new: "Complete เปลี่ยนชื่อ · ใบรับมัดจำแล้ว (คนใหม่)",
          name_change_receipt_issued: "เปลี่ยนชื่อ · เปิดใบรับมัดจำแล้ว (คนเก่า)",
          complete_stripe_wait_trc: "Complete Stripe · รอออก TRC",
          complete_wait_trc: "Complete · รอออก TRC",
          complete_trc_issued: "Complete · ออก TRC แล้ว",
          complete_sponsor: "Complete Sponsor",
          complete_vip: "Complete VIP",
          issue_cash: "มีปัญหา · เงินสด",
          pending_cash: "รอตรวจ · เงินสด",
          refunded: "Refunded",
          refunded_receipt_issued: "Refunded · เปิดใบรับมัดจำแล้ว",
          complete_wns: "Complete Will not Start",
          complete_wns_receipt: "Complete WNS · เปิดใบรับมัดจำแล้ว",
          complete_wait_crn: "Complete · รอออก CrN",
          complete_crn_issued: "Complete · ออก CrN แล้ว",
          issue_refund: "มีปัญหา · คืนเงิน",
          pending_refund: "รอคืนเงิน",
          edit_trc: "แก้ไข TRC",
        };

        const ORDER_STATUS_COLOR: Record<OrderStatus, string> = {
          submitted: "bg-muted text-muted-foreground",
          complete_stripe_wait_receipt: "bg-blue-500/10 text-blue-500",
          complete_wait_receipt: "bg-blue-500/10 text-blue-500",
          complete_receipt_issued: "bg-success/10 text-success",
          complete_name_change_new: "bg-success/10 text-success",
          name_change_receipt_issued: "bg-success/10 text-success",
          complete_stripe_wait_trc: "bg-blue-500/10 text-blue-500",
          complete_wait_trc: "bg-blue-500/10 text-blue-500",
          complete_trc_issued: "bg-success/10 text-success",
          complete_sponsor: "bg-purple-500/10 text-purple-500",
          complete_vip: "bg-purple-500/10 text-purple-500",
          issue_cash: "bg-destructive/10 text-destructive",
          pending_cash: "bg-warning/10 text-warning",
          refunded: "bg-destructive/10 text-destructive",
          refunded_receipt_issued: "bg-destructive/10 text-destructive",
          complete_wns: "bg-muted text-muted-foreground",
          complete_wns_receipt: "bg-muted text-muted-foreground",
          complete_wait_crn: "bg-blue-500/10 text-blue-500",
          complete_crn_issued: "bg-success/10 text-success",
          issue_refund: "bg-destructive/10 text-destructive",
          pending_refund: "bg-warning/10 text-warning",
          edit_trc: "bg-warning/10 text-warning",
        };

        const ORDER_FILTER: Record<string, (s: OrderStatus) => boolean> = {
          all: () => true,
          completed: (s) => s.includes("issued") || s === "complete_trc_issued" || s === "complete_crn_issued",
          pending: (s) => s.includes("wait") || s.includes("pending") || s === "submitted",
          issues: (s) => s.startsWith("issue_") || s === "edit_trc",
          refunds: (s) => s.startsWith("refunded") || s === "pending_refund" || s === "issue_refund",
          special: (s) => s === "complete_vip" || s === "complete_sponsor" || s.includes("wns"),
        };

        // Summary stats
        const COLLECTED_STATUSES: OrderStatus[] = [
          "complete_trc_issued", "complete_receipt_issued", "complete_crn_issued",
          "complete_stripe_wait_receipt", "complete_wait_receipt", "complete_wait_trc",
          "complete_stripe_wait_trc", "complete_wait_crn", "complete_name_change_new",
          "name_change_receipt_issued", "complete_vip", "complete_sponsor",
          "complete_wns", "complete_wns_receipt", "edit_trc",
        ];
        const totalCollected = orders
          .filter((o) => COLLECTED_STATUSES.includes(o.status))
          .reduce((sum, o) => sum + o.amount, 0);
        const pendingCount = orders.filter((o) =>
          ORDER_FILTER["pending"](o.status) || o.status === "pending_cash"
        ).length;
        const issuesCount = orders.filter((o) => ORDER_FILTER["issues"](o.status)).length;
        const refundedTotal = orders
          .filter((o) => o.status === "refunded" || o.status === "refunded_receipt_issued")
          .reduce((sum, o) => sum + o.amount, 0);

        const updateOrderStatus = (id: string, newStatus: OrderStatus) => {
          setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: newStatus } : o));
        };
        const updateOrderNote = (id: string, note: string) => {
          setOrders((prev) => prev.map((o) => o.id === id ? { ...o, note } : o));
        };

        const ALL_STATUSES = Object.keys(ORDER_STATUS_LABEL) as OrderStatus[];

        const PAYMENT_METHOD_COLOR: Record<PaymentMethod, string> = {
          Stripe: "bg-blue-500/10 text-blue-500",
          Cash: "bg-amber-500/10 text-amber-600",
          VIP: "bg-purple-500/10 text-purple-500",
          Sponsor: "bg-emerald-500/10 text-emerald-600",
        };

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOf7Days = new Date(startOfToday); startOf7Days.setDate(startOf7Days.getDate() - 6);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const uniqueCategories = [...new Set(orders.map((o) => o.category))].sort();
        const uniqueTicketTypes = [...new Set(orders.map((o) => o.ticketType))].sort();

        const filteredOrders = orders.filter((o) => {
          const matchesFilter = ORDER_FILTER[orderFilter]?.(o.status) ?? true;
          const q = orderSearch.toLowerCase();
          const matchesSearch = !q ||
            o.buyerName.toLowerCase().includes(q) ||
            o.buyerEmail.toLowerCase().includes(q) ||
            o.id.toLowerCase().includes(q);
          const orderDate = new Date(o.timestamp.replace(" ", "T"));
          let matchesDate = true;
          if (orderDateFilter === "today") {
            matchesDate = orderDate >= startOfToday;
          } else if (orderDateFilter === "7days") {
            matchesDate = orderDate >= startOf7Days;
          } else if (orderDateFilter === "month") {
            matchesDate = orderDate >= startOfMonth;
          } else if (orderDateFilter === "custom" && orderCustomRange?.from) {
            const from = new Date(orderCustomRange.from.getFullYear(), orderCustomRange.from.getMonth(), orderCustomRange.from.getDate());
            const to = orderCustomRange.to
              ? new Date(orderCustomRange.to.getFullYear(), orderCustomRange.to.getMonth(), orderCustomRange.to.getDate() + 1)
              : new Date(from.getTime() + 86400000);
            matchesDate = orderDate >= from && orderDate < to;
          }
          const matchesPayment = orderPaymentFilter === "all" || o.paymentMethod === orderPaymentFilter;
          const matchesCategory = orderCategoryFilter === "all" || o.category === orderCategoryFilter;
          const matchesTicket = orderTicketFilter === "all" || o.ticketType === orderTicketFilter;
          return matchesFilter && matchesSearch && matchesDate && matchesPayment && matchesCategory && matchesTicket;
        });

        const allFilteredSelected = filteredOrders.length > 0 && filteredOrders.every((o) => selectedOrderIds.has(o.id));
        const someFilteredSelected = filteredOrders.some((o) => selectedOrderIds.has(o.id));

        const toggleSelectAll = () => {
          setSelectedOrderIds((prev) => {
            const next = new Set(prev);
            if (allFilteredSelected) {
              filteredOrders.forEach((o) => next.delete(o.id));
            } else {
              filteredOrders.forEach((o) => next.add(o.id));
            }
            return next;
          });
        };

        const toggleSelectOrder = (id: string) => {
          setSelectedOrderIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
          });
        };

        const bulkUpdateStatus = (newStatus: OrderStatus) => {
          setOrders((prev) => prev.map((o) => selectedOrderIds.has(o.id) ? { ...o, status: newStatus } : o));
          setSelectedOrderIds(new Set());
        };

        const exportCSV = () => {
          const headers = ["Order ID", "Buyer Name", "Email", "Category", "Ticket Type", "Payment Method", "Amount (THB)", "Status", "Timestamp", "Note"];
          const rows = filteredOrders.map((o) => [
            o.id,
            o.buyerName,
            o.buyerEmail,
            o.category,
            o.ticketType,
            o.paymentMethod,
            o.amount,
            ORDER_STATUS_LABEL[o.status],
            o.timestamp,
            o.note,
          ]);
          const csv = [headers, ...rows]
            .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
            .join("\n");
          const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
          a.click();
          URL.revokeObjectURL(url);
        };

        return (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Transaction History</h3>
              <Button variant="outline" size="sm" onClick={exportCSV}>
                <Download className="mr-2 h-4 w-4" />
                Export {filteredOrders.length > 0 && `(${filteredOrders.length})`}
              </Button>
            </div>

            {/* Date Filter */}
            <div className="flex flex-wrap items-center gap-2">
              {(["all", "today", "7days", "month", "custom"] as const).map((val) => {
                const labels = { all: "ทั้งหมด", today: "วันนี้", "7days": "7 วันล่าสุด", month: "เดือนนี้", custom: "กำหนดเอง" };
                if (val === "custom") {
                  return (
                    <Popover key="custom" open={orderCustomPickerOpen} onOpenChange={setOrderCustomPickerOpen}>
                      <PopoverTrigger asChild>
                        <button
                          onClick={() => setOrderDateFilter("custom")}
                          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                            orderDateFilter === "custom"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          {orderDateFilter === "custom" && orderCustomRange?.from
                            ? orderCustomRange.to
                              ? `${format(orderCustomRange.from, "d MMM")} – ${format(orderCustomRange.to, "d MMM")}`
                              : format(orderCustomRange.from, "d MMM yyyy")
                            : "กำหนดเอง"}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-popover" align="start">
                        <Calendar
                          mode="range"
                          selected={orderCustomRange}
                          onSelect={(range) => {
                            setOrderCustomRange(range);
                            setOrderDateFilter("custom");
                            if (range?.from && range?.to) setOrderCustomPickerOpen(false);
                          }}
                          numberOfMonths={2}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  );
                }
                return (
                  <button
                    key={val}
                    onClick={() => setOrderDateFilter(val)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      orderDateFilter === val
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {labels[val]}
                  </button>
                );
              })}
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <div className="rounded-xl border border-border bg-card p-4 shadow-card">
                <p className="text-xs text-muted-foreground">Total Collected</p>
                <p className="mt-1 text-xl font-bold text-success">{formatCurrency(totalCollected)}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 shadow-card">
                <p className="text-xs text-muted-foreground">Pending Review</p>
                <p className="mt-1 text-xl font-bold text-warning">{pendingCount} orders</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 shadow-card">
                <p className="text-xs text-muted-foreground">Issues</p>
                <p className="mt-1 text-xl font-bold text-destructive">{issuesCount} orders</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 shadow-card">
                <p className="text-xs text-muted-foreground">Refunded</p>
                <p className="mt-1 text-xl font-bold text-muted-foreground">{formatCurrency(refundedTotal)}</p>
              </div>
            </div>

            {/* Secondary Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <Select value={orderPaymentFilter} onValueChange={(v) => setOrderPaymentFilter(v as "all" | PaymentMethod)}>
                <SelectTrigger className="h-8 w-[130px] bg-card text-xs">
                  <SelectValue placeholder="Payment" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="Stripe">Stripe</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="VIP">VIP</SelectItem>
                  <SelectItem value="Sponsor">Sponsor</SelectItem>
                </SelectContent>
              </Select>
              <Select value={orderCategoryFilter} onValueChange={setOrderCategoryFilter}>
                <SelectTrigger className="h-8 w-[140px] bg-card text-xs">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">All Categories</SelectItem>
                  {uniqueCategories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={orderTicketFilter} onValueChange={setOrderTicketFilter}>
                <SelectTrigger className="h-8 w-[140px] bg-card text-xs">
                  <SelectValue placeholder="Ticket Type" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">All Tickets</SelectItem>
                  {uniqueTicketTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
              {(orderPaymentFilter !== "all" || orderCategoryFilter !== "all" || orderTicketFilter !== "all") && (
                <button
                  onClick={() => { setOrderPaymentFilter("all"); setOrderCategoryFilter("all"); setOrderTicketFilter("all"); }}
                  className="h-8 rounded-lg px-2.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>

            {/* Filter Tabs + Search */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Tabs value={orderFilter} onValueChange={setOrderFilter}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="issues">Issues</TabsTrigger>
                  <TabsTrigger value="refunds">Refunds</TabsTrigger>
                  <TabsTrigger value="special">Special</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search name, email, order ID..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            {/* Order Detail Modal */}
            {selectedOrder && (() => {
              const o = selectedOrder;
              const linkedParticipant = participants.find(
                (p) => p.email.toLowerCase() === o.buyerEmail.toLowerCase()
              );
              return (
                <Dialog open={!!selectedOrder} onOpenChange={(open) => { if (!open) setSelectedOrder(null); }}>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <DialogTitle className="font-mono text-lg">{o.id}</DialogTitle>
                          <p className="mt-0.5 text-sm text-muted-foreground">{o.timestamp}</p>
                        </div>
                        <span className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-medium ${ORDER_STATUS_COLOR[o.status]}`}>
                          {ORDER_STATUS_LABEL[o.status]}
                        </span>
                      </div>
                    </DialogHeader>

                    <div className="mt-4 space-y-5">
                      {/* Buyer + Participant */}
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {/* Buyer */}
                        <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2.5">
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">ผู้ซื้อ</p>
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="font-medium">{o.buyerName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="text-muted-foreground break-all">{o.buyerEmail}</span>
                          </div>
                          {linkedParticipant && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <span className="text-muted-foreground">{linkedParticipant.phone}</span>
                            </div>
                          )}
                        </div>

                        {/* Order Info */}
                        <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2.5">
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">รายละเอียดการสมัคร</p>
                          <div className="flex items-center gap-2 text-sm">
                            <Hash className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span>
                              {linkedParticipant?.bibNo
                                ? <span className="font-mono font-medium">BIB #{linkedParticipant.bibNo}</span>
                                : <span className="text-muted-foreground">ยังไม่มี BIB</span>}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="h-3.5 w-3.5 text-muted-foreground text-xs font-bold shrink-0">🏃</span>
                            <span>{o.category}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Tag className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="text-muted-foreground">{o.ticketType}</span>
                          </div>
                          {linkedParticipant && (
                            <div className="flex items-center gap-2 text-sm">
                              <Shirt className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <span className="text-muted-foreground">Shirt: {linkedParticipant.shirtSize}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Payment */}
                      <div className="rounded-lg border border-border bg-muted/30 p-4">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">การชำระเงิน</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${PAYMENT_METHOD_COLOR[o.paymentMethod]}`}>
                              {o.paymentMethod}
                            </span>
                          </div>
                          <span className="text-xl font-bold text-foreground">{formatCurrency(o.amount)}</span>
                        </div>
                      </div>

                      {/* Status Change */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">เปลี่ยนสถานะ</Label>
                        <Select
                          value={o.status}
                          onValueChange={(val) => {
                            updateOrderStatus(o.id, val as OrderStatus);
                            setSelectedOrder({ ...o, status: val as OrderStatus });
                          }}
                        >
                          <SelectTrigger className="bg-background">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${ORDER_STATUS_COLOR[o.status]}`}>
                              {ORDER_STATUS_LABEL[o.status]}
                            </span>
                          </SelectTrigger>
                          <SelectContent className="bg-popover max-h-64 overflow-y-auto">
                            {ALL_STATUSES.map((s) => (
                              <SelectItem key={s} value={s} className="text-xs">
                                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${ORDER_STATUS_COLOR[s]}`}>
                                  {ORDER_STATUS_LABEL[s]}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Note */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Note (internal)</Label>
                        <Textarea
                          value={o.note}
                          onChange={(e) => {
                            updateOrderNote(o.id, e.target.value);
                            setSelectedOrder({ ...o, note: e.target.value });
                          }}
                          placeholder="เพิ่ม note สำหรับ order นี้..."
                          rows={2}
                          className="bg-background text-sm"
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 pt-1 border-t border-border">
                        <Button variant="outline" size="sm" className="gap-2">
                          <RotateCcw className="h-3.5 w-3.5" />
                          Refund
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                          <ArrowRightLeft className="h-3.5 w-3.5" />
                          เปลี่ยนระยะวิ่ง
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Receipt className="h-3.5 w-3.5" />
                          Issue Tax Invoice
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-auto text-muted-foreground"
                          onClick={() => setSelectedOrder(null)}
                        >
                          ปิด
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              );
            })()}

            {/* Table */}
            <div className="rounded-xl border border-border bg-card shadow-card overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <input
                        type="checkbox"
                        checked={allFilteredSelected}
                        ref={(el) => { if (el) el.indeterminate = someFilteredSelected && !allFilteredSelected; }}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
                      />
                    </TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <td colSpan={10} className="py-8 text-center text-sm text-muted-foreground">No orders found</td>
                    </TableRow>
                  ) : filteredOrders.map((order) => (
                    <TableRow
                      key={order.id}
                      className={`cursor-pointer transition-colors ${selectedOrderIds.has(order.id) ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/30"}`}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedOrderIds.has(order.id)}
                          onChange={() => toggleSelectOrder(order.id)}
                          className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
                        />
                      </TableCell>
                      <TableCell className="font-mono text-sm">{order.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.buyerName}</p>
                          <p className="text-sm text-muted-foreground">{order.buyerEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>{order.category}</TableCell>
                      <TableCell>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${PAYMENT_METHOD_COLOR[order.paymentMethod]}`}>
                          {order.paymentMethod}
                        </span>
                      </TableCell>
                      <TableCell>{formatCurrency(order.amount)}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Select
                          value={order.status}
                          onValueChange={(val) => updateOrderStatus(order.id, val as OrderStatus)}
                        >
                          <SelectTrigger className="h-auto border-0 bg-transparent p-0 shadow-none focus:ring-0 [&>svg]:ml-1 [&>svg]:h-3 [&>svg]:w-3">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${ORDER_STATUS_COLOR[order.status]}`}>
                              {ORDER_STATUS_LABEL[order.status]}
                            </span>
                          </SelectTrigger>
                          <SelectContent className="bg-popover max-h-72 overflow-y-auto">
                            {ALL_STATUSES.map((s) => (
                              <SelectItem key={s} value={s} className="text-xs">
                                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${ORDER_STATUS_COLOR[s]}`}>
                                  {ORDER_STATUS_LABEL[s]}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{order.timestamp}</TableCell>
                      <TableCell className="min-w-[160px]" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={order.note}
                          onChange={(e) => updateOrderNote(order.id, e.target.value)}
                          placeholder="Add note..."
                          className="w-full rounded border border-transparent bg-transparent px-1 py-0.5 text-xs text-foreground placeholder:text-muted-foreground/50 hover:border-border focus:border-border focus:outline-none focus:ring-1 focus:ring-primary/50"
                        />
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover">
                            <DropdownMenuItem>
                              <RefreshCw className="mr-2 h-3.5 w-3.5" />
                              Refund
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <ChevronDown className="mr-2 h-3.5 w-3.5" />
                              เปลี่ยนแปลงระยะวิ่ง
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-3.5 w-3.5" />
                              Issue Tax Invoice
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Bulk Action Bar */}
            {selectedOrderIds.size > 0 && (
              <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-xl">
                <span className="text-sm font-medium text-foreground whitespace-nowrap">
                  เลือก {selectedOrderIds.size} orders
                </span>
                <div className="h-4 w-px bg-border" />
                <Select onValueChange={(val) => bulkUpdateStatus(val as OrderStatus)}>
                  <SelectTrigger className="h-8 w-[200px] bg-background text-xs">
                    <SelectValue placeholder="เปลี่ยนสถานะ..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover max-h-64 overflow-y-auto">
                    {ALL_STATUSES.map((s) => (
                      <SelectItem key={s} value={s} className="text-xs">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${ORDER_STATUS_COLOR[s]}`}>
                          {ORDER_STATUS_LABEL[s]}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setSelectedOrderIds(new Set())}
                >
                  ยกเลิก
                </Button>
              </div>
            )}
          </div>
        );
      }

      case "participants": {
        const uniqueNationalities = [...new Set(participants.map((p) => p.nationality))].sort();
        return (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-foreground">Registered Participants</h3>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  {filteredParticipants.length} / {participants.length}
                </span>
              </div>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>

            {/* Filter row */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative min-w-[200px] flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search name or email..."
                  value={participantSearch}
                  onChange={(e) => setParticipantSearch(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              {/* Distance */}
              <Select value={participantFilter} onValueChange={setParticipantFilter}>
                <SelectTrigger className="w-[110px] bg-card">
                  <SelectValue placeholder="Distance" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">All Races</SelectItem>
                  <SelectItem value="100K">100K</SelectItem>
                  <SelectItem value="50K">50K</SelectItem>
                  <SelectItem value="25K">25K</SelectItem>
                </SelectContent>
              </Select>
              {/* Gender */}
              <Select value={genderFilter} onValueChange={setGenderFilter}>
                <SelectTrigger className="w-[110px] bg-card">
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">All Genders</SelectItem>
                  <SelectItem value="M">Male</SelectItem>
                  <SelectItem value="F">Female</SelectItem>
                </SelectContent>
              </Select>
              {/* Age */}
              <Select value={ageFilter} onValueChange={setAgeFilter}>
                <SelectTrigger className="w-[120px] bg-card">
                  <SelectValue placeholder="Age" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">All Ages</SelectItem>
                  <SelectItem value="u30">Under 30</SelectItem>
                  <SelectItem value="30-39">30 – 39</SelectItem>
                  <SelectItem value="40-49">40 – 49</SelectItem>
                  <SelectItem value="50+">50+</SelectItem>
                </SelectContent>
              </Select>
              {/* Nationality */}
              <Select value={nationalityFilter} onValueChange={setNationalityFilter}>
                <SelectTrigger className="w-[130px] bg-card">
                  <SelectValue placeholder="Nationality" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">All Countries</SelectItem>
                  {uniqueNationalities.map((nat) => (
                    <SelectItem key={nat} value={nat}>{nat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* Clear */}
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-muted-foreground">
                  Clear
                </Button>
              )}
            </div>

            <div className="rounded-xl border border-border bg-card shadow-card overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer select-none whitespace-nowrap"
                      onClick={() => handleSort("bibNo")}
                    >
                      BIB No.<SortIcon col="bibNo" />
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none whitespace-nowrap"
                      onClick={() => handleSort("name")}
                    >
                      Name<SortIcon col="name" />
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none whitespace-nowrap"
                      onClick={() => handleSort("distance")}
                    >
                      Distance<SortIcon col="distance" />
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none whitespace-nowrap"
                      onClick={() => handleSort("gender")}
                    >
                      Gender<SortIcon col="gender" />
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none whitespace-nowrap"
                      onClick={() => handleSort("shirtSize")}
                    >
                      Shirt<SortIcon col="shirtSize" />
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none whitespace-nowrap"
                      onClick={() => handleSort("nationality")}
                    >
                      Nationality<SortIcon col="nationality" />
                    </TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredParticipants.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No participants found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredParticipants.map((participant) => (
                      <TableRow key={participant.id}>
                        <TableCell>
                          {participant.bibNo || (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{participant.name}</p>
                            <p className="text-sm text-muted-foreground">{participant.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>{participant.distance}</TableCell>
                        <TableCell>{participant.gender === "M" ? "Male" : "Female"}</TableCell>
                        <TableCell>{participant.shirtSize}</TableCell>
                        <TableCell>{participant.nationality}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => openEditModal(participant)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Edit Participant Modal */}
            <Dialog open={!!editingParticipant} onOpenChange={(open) => { if (!open) { setEditingParticipant(null); setEditForm(null); } }}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Participant</DialogTitle>
                </DialogHeader>
                {editForm && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
                    <div className="space-y-1.5">
                      <Label>BIB No.</Label>
                      <Input value={editForm.bibNo} onChange={(e) => setEditForm({ ...editForm, bibNo: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Distance</Label>
                      <Select value={editForm.distance} onValueChange={(v) => setEditForm({ ...editForm, distance: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-popover">
                          <SelectItem value="100K">100K</SelectItem>
                          <SelectItem value="50K">50K</SelectItem>
                          <SelectItem value="25K">25K</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Full Name</Label>
                      <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Email</Label>
                      <Input value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Phone</Label>
                      <Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Age</Label>
                      <Input type="number" value={editForm.age} onChange={(e) => setEditForm({ ...editForm, age: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Gender</Label>
                      <Select value={editForm.gender} onValueChange={(v) => setEditForm({ ...editForm, gender: v as "M" | "F" })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-popover">
                          <SelectItem value="M">Male</SelectItem>
                          <SelectItem value="F">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Nationality</Label>
                      <Input value={editForm.nationality} onChange={(e) => setEditForm({ ...editForm, nationality: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Shirt Size</Label>
                      <Select value={editForm.shirtSize} onValueChange={(v) => setEditForm({ ...editForm, shirtSize: v as Participant["shirtSize"] })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-popover">
                          {["XS","S","M","L","XL","XXL"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Blood Type</Label>
                      <Select value={editForm.bloodType} onValueChange={(v) => setEditForm({ ...editForm, bloodType: v as Participant["bloodType"] })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-popover">
                          {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Emergency Contact</Label>
                      <Input value={editForm.emergencyContact} onChange={(e) => setEditForm({ ...editForm, emergencyContact: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Club / Team</Label>
                      <Input value={editForm.club} onChange={(e) => setEditForm({ ...editForm, club: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>ITRA ID</Label>
                      <Input value={editForm.itraId} onChange={(e) => setEditForm({ ...editForm, itraId: e.target.value })} />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label>Medical Conditions / Allergies</Label>
                      <Textarea
                        value={editForm.medicalConditions}
                        onChange={(e) => setEditForm({ ...editForm, medicalConditions: e.target.value })}
                        placeholder="e.g. Asthma, allergic to penicillin..."
                        rows={2}
                      />
                    </div>
                    <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                      <Button variant="outline" onClick={() => { setEditingParticipant(null); setEditForm(null); }}>Cancel</Button>
                      <Button onClick={saveEdit}>Save Changes</Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        );
      }

      case "merchandise":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Merchandise Summary</h3>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Shirt className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Shirts</p>
                    <p className="text-2xl font-bold text-card-foreground">
                      {Object.values(shirtSizeBreakdown).reduce((a, b) => a + b, 0)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Shuttle Bus (Departure)</p>
                    <p className="text-2xl font-bold text-card-foreground">{shuttleBusSeats.departure}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Shuttle Bus (Return)</p>
                    <p className="text-2xl font-bold text-card-foreground">{shuttleBusSeats.return}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <h4 className="mb-4 font-semibold text-card-foreground">T-Shirt Size Breakdown</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={shirtData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="size" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case "promotions":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Discount Codes</h3>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Code
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Discount Code</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Code</Label>
                      <Input placeholder="SUMMER2025" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Discount</Label>
                        <Input type="number" placeholder="20" />
                      </div>
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select defaultValue="percentage">
                          <SelectTrigger className="bg-background">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-popover">
                            <SelectItem value="percentage">Percentage (%)</SelectItem>
                            <SelectItem value="fixed">Fixed (THB)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Usage Limit</Label>
                        <Input type="number" placeholder="100" />
                      </div>
                      <div className="space-y-2">
                        <Label>Valid Until</Label>
                        <Input type="date" />
                      </div>
                    </div>
                    <Button className="w-full">Create Code</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="rounded-xl border border-border bg-card shadow-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Valid Until</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockDiscountCodes.map((code) => (
                    <TableRow key={code.id}>
                      <TableCell className="font-mono font-medium">{code.code}</TableCell>
                      <TableCell>
                        {code.type === "percentage" ? `${code.discount}%` : formatCurrency(code.discount)}
                      </TableCell>
                      <TableCell>
                        {code.used} / {code.usageLimit}
                      </TableCell>
                      <TableCell>{code.validUntil}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            new Date(code.validUntil) > new Date()
                              ? "bg-success/10 text-success"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {new Date(code.validUntil) > new Date() ? "Active" : "Expired"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        );

      case "broadcast":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Send Broadcast Message</h3>
            <div className="max-w-2xl rounded-xl border border-border bg-card p-6 shadow-card">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Recipient Group</Label>
                  <Select defaultValue="all">
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="all">All Participants</SelectItem>
                      <SelectItem value="100k">100K Ultra Runners</SelectItem>
                      <SelectItem value="50k">50K Trail Runners</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input placeholder="Important Race Day Information" />
                </div>
                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea
                    placeholder="Write your message here..."
                    rows={6}
                  />
                </div>
                <div className="flex gap-3">
                  <Button className="flex-1">
                    <Send className="mr-2 h-4 w-4" />
                    Send Email
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Send className="mr-2 h-4 w-4" />
                    Send SMS
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      case "settings":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Event Settings</h3>
            <div className="max-w-md">
              <Button onClick={onEditWizard} className="w-full">
                <Settings className="mr-2 h-4 w-4" />
                Open Event Wizard
              </Button>
              <p className="mt-2 text-sm text-muted-foreground">
                Edit event details, race categories, checkpoints, and tickets in the full wizard.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <div className="hidden h-6 w-px bg-border sm:block" />
            <div className="hidden sm:block">
              <Logo size="sm" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-foreground">{event.title}</h1>
            <StatusBadge status={event.status} />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 border-r border-border bg-card lg:block">
          <nav className="p-4">
            <ul className="space-y-1">
              {sidebarItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveSection(item.id)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      activeSection === item.id
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Mobile Navigation */}
        <div className="lg:hidden sticky top-16 z-30 w-full border-b border-border bg-card overflow-x-auto">
          <div className="flex p-2 gap-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm whitespace-nowrap transition-colors ${
                  activeSection === item.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-6">{renderContent()}</main>
      </div>
    </div>
  );
};

export default EventManagerHub;
