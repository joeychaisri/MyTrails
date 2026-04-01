import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  Globe,
  ChevronRight,
  Upload,
  FileSpreadsheet,
  Trash2,
  Copy,
  CalendarDays,
  TrendingUp,
  Sparkles,
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
  AreaChart,
  Area,
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
  Legend,
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
  DiscountCode,
  OrderStatus,
  PaymentMethod,
  mockEvents,
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
  finisherShirtSizeBreakdown,
} from "@/data/mockData";

type HubSection = "overview2" | "overview3" | "orders" | "participants" | "bib" | "promotions" | "broadcast" | "settings";

const sidebarItems: { id: HubSection; label: string; icon: typeof BarChart3 }[] = [
  { id: "overview2", label: "Race Operations", icon: Activity },
  { id: "overview3", label: "Race Operations 2", icon: Sparkles },
  { id: "orders", label: "Orders (Finance)", icon: DollarSign },
  { id: "participants", label: "Participants", icon: Users },
  { id: "bib", label: "BIB Assignment", icon: Hash },
  { id: "promotions", label: "Promotions", icon: Tag },
  { id: "broadcast", label: "Broadcast", icon: Megaphone },
  { id: "settings", label: "Settings", icon: Settings },
];

const COLORS = ["#E85D04", "#F97316", "#FB923C", "#34D399", "#6EE7B7"];

const EventManagerHub = () => {
  const { id, section } = useParams<{ id: string; section: string }>();
  const navigate = useNavigate();
  const event = mockEvents.find((e) => e.id === id);
  const activeSection = ((section ?? "overview2") as HubSection);
  const onBack = () => navigate("/dashboard");
  const onEditWizard = () => navigate(`/events/${id}/edit`);
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
  const [natModalSearch, setNatModalSearch] = useState("");
  // BIB Assignment
  const [bibSearch, setBibSearch] = useState("");
  const [bibFilter, setBibFilter] = useState<"all" | "tba" | "assigned">("all");
  const [bibCategoryFilter, setBibCategoryFilter] = useState("all");
  const [importOpen, setImportOpen] = useState(false);
  const [importStep, setImportStep] = useState<1 | 2 | 3 | 4>(1);
  const [importFileReady, setImportFileReady] = useState(false);
  const [importFileName, setImportFileName] = useState("");
  const [importColBib, setImportColBib] = useState("A");
  const [importColId, setImportColId] = useState("D");
  const [importConflictChoice, setImportConflictChoice] = useState<Record<string, string>>({});
  const [editingBibId, setEditingBibId] = useState<string | null>(null);
  const [editingBibValue, setEditingBibValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [orderPaymentFilter, setOrderPaymentFilter] = useState<"all" | PaymentMethod>("all");
  const [orderCategoryFilter, setOrderCategoryFilter] = useState("all");
  const [orderTicketFilter, setOrderTicketFilter] = useState("all");
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());

  // Promotions state
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>(mockDiscountCodes);
  const [promoSearch, setPromoSearch] = useState("");
  const [createPromoOpen, setCreatePromoOpen] = useState(false);
  const [editPromoOpen, setEditPromoOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<DiscountCode | null>(null);
  const [usageDetailOpen, setUsageDetailOpen] = useState(false);
  const [usageDetailCode, setUsageDetailCode] = useState<DiscountCode | null>(null);
  const [bulkGenOpen, setBulkGenOpen] = useState(false);
  const [deletePromoId, setDeletePromoId] = useState<string | null>(null);
  const emptyPromoForm = { code: "", discount: "", type: "percentage", usageLimit: "", validUntil: "", categories: [] as string[], isActive: true };
  const [promoForm, setPromoForm] = useState(emptyPromoForm);
  const emptyBulkGenForm = { prefix: "CODE", count: "10", discount: "", type: "percentage", usageLimit: "1", validUntil: "", categories: [] as string[] };
  const [bulkGenForm, setBulkGenForm] = useState(emptyBulkGenForm);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 0,
    }).format(amount);
  };

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
      case "overview2": {
        const totalParticipants = participants.length;
        const maleCount = participants.filter((p) => p.gender === "M").length;
        const ageRanges = [
          { label: "Under 30", male: participants.filter((p) => p.age < 30 && p.gender === "M").length,           female: participants.filter((p) => p.age < 30 && p.gender === "F").length },
          { label: "30–39",    male: participants.filter((p) => p.age >= 30 && p.age < 40 && p.gender === "M").length, female: participants.filter((p) => p.age >= 30 && p.age < 40 && p.gender === "F").length },
          { label: "40–49",    male: participants.filter((p) => p.age >= 40 && p.age < 50 && p.gender === "M").length, female: participants.filter((p) => p.age >= 40 && p.age < 50 && p.gender === "F").length },
          { label: "50–59",    male: participants.filter((p) => p.age >= 50 && p.age < 60 && p.gender === "M").length, female: participants.filter((p) => p.age >= 50 && p.age < 60 && p.gender === "F").length },
          { label: "60+",      male: participants.filter((p) => p.age >= 60 && p.gender === "M").length,           female: participants.filter((p) => p.age >= 60 && p.gender === "F").length },
        ].map((r) => ({ ...r, count: r.male + r.female }));
        const maxAge = Math.max(...ageRanges.map((r) => r.count));
        const nationalityMap: Record<string, number> = {};
        participants.forEach((p) => {
          nationalityMap[p.nationality] = (nationalityMap[p.nationality] || 0) + 1;
        });
        const nationalitySorted = Object.entries(nationalityMap).sort((a, b) => b[1] - a[1]);
        const nationalityTop5 = nationalitySorted.slice(0, 5);
        const maxNat = Math.max(...nationalityTop5.map(([, c]) => c));
        const countryFlags: Record<string, string> = {
          TH: "🇹🇭", JP: "🇯🇵", US: "🇺🇸", SG: "🇸🇬",
          DE: "🇩🇪", AU: "🇦🇺", GB: "🇬🇧", CN: "🇨🇳", KR: "🇰🇷", HK: "🇭🇰",
        };
        const countryNames: Record<string, string> = {
          TH: "Thailand", JP: "Japan", US: "United States", SG: "Singapore",
          DE: "Germany", AU: "Australia", GB: "United Kingdom", CN: "China", KR: "South Korea", HK: "Hong Kong",
        };
        const shirtEntries = Object.entries(shirtSizeBreakdown).map(([size, event]) => ({
          size,
          event,
          finisher: finisherShirtSizeBreakdown[size as keyof typeof finisherShirtSizeBreakdown] ?? 0,
        }));
        const maxShirt = Math.max(...shirtEntries.map((s) => s.event));

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
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-card-foreground">Registration Fill Rate</h3>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-[#3B82F6]" />Male</span>
                    <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-[#EC4899]" />Female</span>
                  </div>
                </div>
                <div className="space-y-4">
                  {mockCategoryFillRate.map((cat) => {
                    const distKey = cat.name.split(" ")[0]; // "100K", "50K", "25K"
                    const catMale = participants.filter((p) => p.distance === distKey && p.gender === "M").length;
                    const catFemale = participants.filter((p) => p.distance === distKey && p.gender === "F").length;
                    const pct = Math.round((cat.sold / cat.capacity) * 100);
                    const malePct = cat.sold > 0 ? (catMale / cat.capacity) * 100 : 0;
                    const femalePct = cat.sold > 0 ? (catFemale / cat.capacity) * 100 : 0;
                    return (
                      <div key={cat.name}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="font-medium text-foreground">{cat.name}</span>
                          <span className={`font-medium ${pct >= 80 ? "text-warning" : "text-muted-foreground"}`}>
                            {cat.sold} / {cat.capacity} ({pct}%)
                          </span>
                        </div>
                        <div className="h-2.5 overflow-hidden rounded-full bg-muted flex">
                          <div className="h-full bg-[#3B82F6] transition-all" style={{ width: `${malePct}%` }} />
                          <div className="h-full bg-[#EC4899] transition-all" style={{ width: `${femalePct}%` }} />
                        </div>
                        <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
                          <span>{catMale}M</span>
                          <span>{catFemale}F</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Runner Demographics */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-card-foreground">Runner Demographics</h3>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-[#3B82F6]" />Male ({maleCount})</span>
                    <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-[#EC4899]" />Female ({totalParticipants - maleCount})</span>
                  </div>
                </div>
                <div className="space-y-2.5">
                  {ageRanges.map((range) => (
                    <div key={range.label} className="flex items-center gap-3 text-sm">
                      <span className="w-16 shrink-0 text-muted-foreground">{range.label}</span>
                      <div className="flex flex-1 h-2.5 overflow-hidden rounded-full bg-muted">
                        {range.count > 0 && (
                          <>
                            <div
                              className="h-full bg-[#3B82F6] transition-all"
                              style={{ width: maxAge > 0 ? `${(range.male / maxAge) * 100}%` : "0%" }}
                            />
                            <div
                              className="h-full bg-[#EC4899] transition-all"
                              style={{ width: maxAge > 0 ? `${(range.female / maxAge) * 100}%` : "0%" }}
                            />
                          </>
                        )}
                      </div>
                      <span className="w-16 shrink-0 text-right text-xs text-muted-foreground">
                        {range.male}M / {range.female}F
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 2: Top Nationalities + Shirt Size Summary */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Top Nationalities - Flag List */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-card-foreground">Top Nationalities</h3>
                  <Dialog onOpenChange={(open) => { if (!open) setNatModalSearch(""); }}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground">
                        View all
                        <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold leading-none">{nationalitySorted.length}</span>
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[480px] gap-0 overflow-hidden p-0 bg-card">
                      {/* Modal header */}
                      <div className="flex items-start gap-3 border-b border-border px-6 py-5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <Globe className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <DialogTitle className="text-base font-semibold leading-tight">Runner Nationalities</DialogTitle>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {nationalitySorted.length} countries · {totalParticipants} runners
                          </p>
                        </div>
                      </div>
                      {/* Search */}
                      <div className="border-b border-border px-4 py-3">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            placeholder="Search country…"
                            value={natModalSearch}
                            onChange={(e) => setNatModalSearch(e.target.value)}
                            className="h-8 pl-8 text-sm bg-muted/50 border-0 focus-visible:ring-1"
                          />
                        </div>
                      </div>
                      {/* List */}
                      <div className="max-h-[52vh] overflow-y-auto">
                        {(() => {
                          const filtered = nationalitySorted.filter(([code]) =>
                            (countryNames[code] ?? code).toLowerCase().includes(natModalSearch.toLowerCase())
                          );
                          const topCount = nationalitySorted[0]?.[1] ?? 1;
                          if (filtered.length === 0) {
                            return (
                              <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
                                <Globe className="h-8 w-8 opacity-30" />
                                <p className="text-sm">No countries found</p>
                              </div>
                            );
                          }
                          return filtered.map(([code, count], index) => {
                            const originalRank = nationalitySorted.findIndex(([c]) => c === code) + 1;
                            const pct = Math.round((count / totalParticipants) * 100);
                            const rankBadge =
                              originalRank === 1 ? (
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-yellow-400/20 text-[11px] font-bold text-yellow-600">1</span>
                              ) : originalRank === 2 ? (
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-400/20 text-[11px] font-bold text-slate-500">2</span>
                              ) : originalRank === 3 ? (
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-400/20 text-[11px] font-bold text-orange-600">3</span>
                              ) : (
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center text-[11px] text-muted-foreground">{originalRank}</span>
                              );
                            return (
                              <div
                                key={code}
                                className={`flex items-center gap-3 px-6 py-3 transition-colors hover:bg-muted/40 ${index !== filtered.length - 1 ? "border-b border-border/50" : ""}`}
                              >
                                {rankBadge}
                                <span className="text-[22px] leading-none">{countryFlags[code] ?? "🏳️"}</span>
                                <div className="flex min-w-0 flex-1 flex-col gap-1">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="truncate text-sm font-medium text-foreground">{countryNames[code] ?? code}</span>
                                    <span className="shrink-0 text-xs font-semibold text-foreground">{count} <span className="font-normal text-muted-foreground">({pct}%)</span></span>
                                  </div>
                                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                                    <div
                                      className="h-full rounded-full bg-primary transition-all duration-500"
                                      style={{ width: `${(count / topCount) * 100}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
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
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-card-foreground">Shirt Size Summary</h3>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-primary" />Event</span>
                    <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-[#10B981]" />Finisher</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {shirtEntries.map(({ size, event, finisher }) => (
                    <div key={size} className="flex items-center gap-3 text-sm">
                      <span className="w-8 shrink-0 font-medium text-foreground">{size}</span>
                      <div className="flex flex-1 flex-col gap-1">
                        <div className="flex h-2 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(event / maxShirt) * 100}%` }} />
                        </div>
                        <div className="flex h-2 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-[#10B981] transition-all" style={{ width: `${(finisher / maxShirt) * 100}%` }} />
                        </div>
                      </div>
                      <div className="w-16 shrink-0 text-right text-xs text-muted-foreground">
                        <div>{event}</div>
                        <div className="text-[#10B981]">{finisher}</div>
                      </div>
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

      case "overview3": {
        const MALE_C = "#4A7FC1";
        const FEMALE_C = "#C4607A";
        const FINISHER_C = "#2D9166";
        const PRIMARY_C = "#E8600A";

        const totalP = participants.length;
        const maleP = participants.filter((p) => p.gender === "M").length;
        const femaleP = totalP - maleP;

        const ageRanges3 = [
          { label: "Under 30", male: participants.filter((p) => p.age < 30 && p.gender === "M").length, female: participants.filter((p) => p.age < 30 && p.gender === "F").length },
          { label: "30–39",    male: participants.filter((p) => p.age >= 30 && p.age < 40 && p.gender === "M").length, female: participants.filter((p) => p.age >= 30 && p.age < 40 && p.gender === "F").length },
          { label: "40–49",    male: participants.filter((p) => p.age >= 40 && p.age < 50 && p.gender === "M").length, female: participants.filter((p) => p.age >= 40 && p.age < 50 && p.gender === "F").length },
          { label: "50–59",    male: participants.filter((p) => p.age >= 50 && p.age < 60 && p.gender === "M").length, female: participants.filter((p) => p.age >= 50 && p.age < 60 && p.gender === "F").length },
          { label: "60+",      male: participants.filter((p) => p.age >= 60 && p.gender === "M").length, female: participants.filter((p) => p.age >= 60 && p.gender === "F").length },
        ];
        const butterflyMax = Math.max(...ageRanges3.map((r) => Math.max(r.male, r.female)), 1);

        const natMap3: Record<string, number> = {};
        participants.forEach((p) => { natMap3[p.nationality] = (natMap3[p.nationality] || 0) + 1; });
        const natSorted3 = Object.entries(natMap3).sort((a, b) => b[1] - a[1]);
        const natTop5_3 = natSorted3.slice(0, 5);
        const maxNat3 = Math.max(...natTop5_3.map(([, c]) => c), 1);

        const countryFlags3: Record<string, string> = { TH: "🇹🇭", JP: "🇯🇵", US: "🇺🇸", SG: "🇸🇬", DE: "🇩🇪", AU: "🇦🇺", GB: "🇬🇧", CN: "🇨🇳", KR: "🇰🇷", HK: "🇭🇰" };
        const countryNames3: Record<string, string> = { TH: "Thailand", JP: "Japan", US: "United States", SG: "Singapore", DE: "Germany", AU: "Australia", GB: "United Kingdom", CN: "China", KR: "South Korea", HK: "Hong Kong", FR: "France", MY: "Malaysia", PH: "Philippines", NZ: "New Zealand", CA: "Canada", ZA: "South Africa" };

        const shirtEntries3 = Object.entries(shirtSizeBreakdown).map(([size, ev]) => ({
          size, Event: ev, Finisher: finisherShirtSizeBreakdown[size as keyof typeof finisherShirtSizeBreakdown] ?? 0,
        }));

        const overallSold3 = mockCategoryFillRate.reduce((s, c) => s + c.sold, 0);
        const overallCap3 = mockCategoryFillRate.reduce((s, c) => s + c.capacity, 0);
        const overallPct3 = Math.round((overallSold3 / overallCap3) * 100);
        const donutData3 = [{ value: overallSold3 }, { value: overallCap3 - overallSold3 }];

        const raceDate3 = new Date(event.date);
        const daysToRace3 = Math.ceil((raceDate3.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

        const refundedAmount3 = orders
          .filter((o) => o.status === "refunded" || o.status === "refunded_receipt_issued")
          .reduce((s, o) => s + o.amount, 0);
        const pendingPayments3 = orders.filter((o) => o.status === "pending_cash" || o.status === "pending").length;
        const netRevenue3 = event.revenue - refundedAmount3;

        const revData3 = revenueFilter === "week" ? revenueWeeklyData : revenueFilter === "month" ? revenueMonthlyData : revenueData;

        const activityBorder3 = (type: string) => {
          switch (type) {
            case "registration": return "border-l-[#2D9166]";
            case "payment": return "border-l-primary";
            case "cancellation": return "border-l-destructive";
            case "refund": return "border-l-warning";
            default: return "border-l-border";
          }
        };
        const activityIcon3 = (type: string) => {
          switch (type) {
            case "registration": return <UserPlus className="h-4 w-4 text-[#2D9166]" />;
            case "payment": return <CheckCircle2 className="h-4 w-4 text-primary" />;
            case "cancellation": return <XCircle className="h-4 w-4 text-destructive" />;
            case "refund": return <AlertCircle className="h-4 w-4 text-warning" />;
            default: return null;
          }
        };

        return (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              {/* Net Revenue */}
              <div className="rounded-xl border border-border bg-card p-5 shadow-card">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Net Revenue</p>
                <p className="mt-2 text-2xl font-bold text-card-foreground">{formatCurrency(netRevenue3)}</p>
                <p className="mt-1 text-xs text-muted-foreground">after refunds</p>
              </div>

              {/* Fill Rate */}
              <div className="rounded-xl border border-border bg-card p-5 shadow-card">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Fill Rate</p>
                <p className="mt-2 text-2xl font-bold text-card-foreground">{overallPct3}%</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full transition-all" style={{ width: `${overallPct3}%`, background: PRIMARY_C }} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{overallSold3.toLocaleString()} / {overallCap3.toLocaleString()} · {(overallCap3 - overallSold3).toLocaleString()} left</p>
              </div>

              {/* Race Countdown */}
              <div className="rounded-xl border border-border bg-card p-5 shadow-card">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Race Day</p>
                <p className="mt-2 text-2xl font-bold text-card-foreground">
                  {daysToRace3 > 0 ? `${daysToRace3} days` : "Today"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{format(raceDate3, "dd MMM yyyy")}</p>
              </div>
            </div>

            {/* Area Revenue Chart */}
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
                <AreaChart data={revData3}>
                  <defs>
                    <linearGradient id="revGrad3" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={PRIMARY_C} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={PRIMARY_C} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Area type="monotone" dataKey="revenue" stroke={PRIMARY_C} strokeWidth={2.5} fill="url(#revGrad3)" dot={{ fill: PRIMARY_C, r: 4 }} activeDot={{ r: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Fill Rate + Butterfly Demographics */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Registration Fill Rate */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <div className="mb-5 flex items-start gap-2">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-card-foreground">Registration Fill Rate</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">{overallSold3} registered · {overallCap3} total capacity</p>
                  </div>
                  <div className="flex shrink-0 gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full" style={{ background: MALE_C }} />Male</span>
                    <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full" style={{ background: FEMALE_C }} />Female</span>
                  </div>
                </div>
                <div className="space-y-5">
                  {mockCategoryFillRate.map((cat) => {
                    const distKey = cat.name.split(" ")[0];
                    const catMale = participants.filter((p) => p.distance === distKey && p.gender === "M").length;
                    const catFemale = participants.filter((p) => p.distance === distKey && p.gender === "F").length;
                    const pct = Math.round((cat.sold / cat.capacity) * 100);
                    const malePct = cat.capacity > 0 ? (catMale / cat.capacity) * 100 : 0;
                    const femalePct = cat.capacity > 0 ? (catFemale / cat.capacity) * 100 : 0;
                    const isAlmostFull = pct >= 80;
                    return (
                      <div key={cat.name}>
                        <div className="mb-1.5 flex items-center justify-between text-sm">
                          <span className="font-medium text-foreground">{cat.name}</span>
                          <div className="flex items-center gap-2">
                            {isAlmostFull && (
                              <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: `${PRIMARY_C}1A`, color: PRIMARY_C }}>
                                {pct >= 99 ? "Full" : "Almost Full"}
                              </span>
                            )}
                            <span className="text-xs font-medium" style={isAlmostFull ? { color: PRIMARY_C } : { color: "hsl(var(--muted-foreground))" }}>
                              {cat.sold} / {cat.capacity}
                            </span>
                          </div>
                        </div>
                        <div className="flex h-3 overflow-hidden rounded-full bg-muted">
                          <div className="h-full transition-all" style={{ width: `${malePct}%`, background: MALE_C }} />
                          <div className="h-full transition-all" style={{ width: `${femalePct}%`, background: FEMALE_C }} />
                        </div>
                        <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                          <span>{catMale}M · {catFemale}F</span>
                          <span>{cat.capacity - cat.sold} remaining</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Butterfly Demographics */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <div className="mb-5 flex items-start gap-2">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-card-foreground">Runner Demographics</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">Age & gender distribution</p>
                  </div>
                  <div className="flex shrink-0 gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full" style={{ background: MALE_C }} />Male ({maleP})</span>
                    <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full" style={{ background: FEMALE_C }} />Female ({femaleP})</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {ageRanges3.map((r) => {
                    const malePct3 = butterflyMax > 0 ? (r.male / butterflyMax) * 100 : 0;
                    const femalePct3 = butterflyMax > 0 ? (r.female / butterflyMax) * 100 : 0;
                    return (
                      <div key={r.label} className="flex items-center gap-2 text-sm">
                        <div className="flex flex-1 items-center justify-end gap-2">
                          <span className="w-6 shrink-0 text-right text-xs font-medium text-muted-foreground">{r.male}</span>
                          <div className="flex h-5 flex-1 items-center justify-end overflow-hidden rounded-l-full bg-muted">
                            <div className="h-full rounded-l-full transition-all" style={{ width: `${malePct3}%`, background: MALE_C }} />
                          </div>
                        </div>
                        <span className="w-14 shrink-0 text-center text-xs font-medium text-muted-foreground">{r.label}</span>
                        <div className="flex flex-1 items-center gap-2">
                          <div className="flex h-5 flex-1 overflow-hidden rounded-r-full bg-muted">
                            <div className="h-full rounded-r-full transition-all" style={{ width: `${femalePct3}%`, background: FEMALE_C }} />
                          </div>
                          <span className="w-6 shrink-0 text-xs font-medium text-muted-foreground">{r.female}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Nationalities + Shirt Grouped Bar */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Nationalities with SVG flags + gradient opacity */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-card-foreground">Top Nationalities</h3>
                  <Dialog onOpenChange={(open) => { if (!open) setNatModalSearch(""); }}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground">
                        View all
                        <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold leading-none">{natSorted3.length}</span>
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[480px] gap-0 overflow-hidden p-0 bg-card">
                      <div className="flex items-start gap-3 border-b border-border px-6 py-5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <Globe className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <DialogTitle className="text-base font-semibold leading-tight">Runner Nationalities</DialogTitle>
                          <p className="mt-0.5 text-xs text-muted-foreground">{natSorted3.length} countries · {totalP} runners</p>
                        </div>
                      </div>
                      <div className="border-b border-border px-4 py-3">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                          <Input placeholder="Search country…" value={natModalSearch} onChange={(e) => setNatModalSearch(e.target.value)} className="h-8 pl-8 text-sm bg-muted/50 border-0 focus-visible:ring-1" />
                        </div>
                      </div>
                      <div className="max-h-[52vh] overflow-y-auto">
                        {natSorted3.filter(([code]) => (countryNames3[code] ?? code).toLowerCase().includes(natModalSearch.toLowerCase())).map(([code, count], index) => {
                          const pct3 = Math.round((count / totalP) * 100);
                          const topCount3 = natSorted3[0]?.[1] ?? 1;
                          return (
                            <div key={code} className={`flex items-center gap-3 px-6 py-3 hover:bg-muted/40 ${index !== natSorted3.length - 1 ? "border-b border-border/50" : ""}`}>
                              <span className="flex h-5 w-5 shrink-0 items-center justify-center text-[11px] text-muted-foreground">{index + 1}</span>
                              <img src={`https://flagcdn.com/24x18/${code.toLowerCase()}.png`} width={24} height={18} alt={code} className="rounded-sm object-cover shadow-sm" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                              <div className="flex min-w-0 flex-1 flex-col gap-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="truncate text-sm font-medium text-foreground">{countryNames3[code] ?? code}</span>
                                  <span className="shrink-0 text-xs font-semibold text-foreground">{count} <span className="font-normal text-muted-foreground">({pct3}%)</span></span>
                                </div>
                                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                                  <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${(count / topCount3) * 100}%` }} />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="space-y-3">
                  {natTop5_3.map(([code, count], index) => {
                    const barOpacity = 1 - index * 0.15;
                    return (
                      <div key={code} className="flex items-center gap-3 text-sm">
                        <span className="w-5 shrink-0 text-center text-xs font-bold text-muted-foreground">{index + 1}</span>
                        <img src={`https://flagcdn.com/24x18/${code.toLowerCase()}.png`} width={24} height={18} alt={code} className="rounded-sm object-cover shadow-sm" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        <span className="w-28 truncate font-medium text-foreground">{countryNames3[code] ?? code}</span>
                        <div className="flex-1 h-2 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full transition-all" style={{ width: `${(count / maxNat3) * 100}%`, background: PRIMARY_C, opacity: barOpacity }} />
                        </div>
                        <span className="w-6 shrink-0 text-right font-medium text-foreground">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Shirt Size Grouped Bar Chart */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-card-foreground">Shirt Size Summary</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">Event vs Finisher shirts per size</p>
                  </div>
                  <div className="flex shrink-0 gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full" style={{ background: PRIMARY_C }} />Event</span>
                    <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full" style={{ background: FINISHER_C }} />Finisher</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={190}>
                  <BarChart data={shirtEntries3} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barCategoryGap="25%" barGap={3}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="size" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                    <Bar dataKey="Event" fill={PRIMARY_C} radius={[4, 4, 0, 0]} maxBarSize={26} />
                    <Bar dataKey="Finisher" fill={FINISHER_C} radius={[4, 4, 0, 0]} maxBarSize={26} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Activity with left-border accents */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <h3 className="mb-4 text-lg font-semibold text-card-foreground">Recent Activity</h3>
              <div className="space-y-2">
                {mockRecentActivity.map((item) => (
                  <div key={item.id} className={`flex items-center gap-3 rounded-lg border-l-[3px] bg-muted/30 px-4 py-3 ${activityBorder3(item.type)}`}>
                    <div className="shrink-0">{activityIcon3(item.type)}</div>
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

      case "bib": {
        const bibAssigned = participants.filter(p => p.bibNo !== "").length;
        const bibTba = participants.filter(p => p.bibNo === "").length;
        const bibCategories = [...new Set(participants.map(p => p.distance))].sort();
        const filteredBib = participants.filter(p => {
          if (bibFilter !== "all" && (p.bibNo !== "" ? "assigned" : "tba") !== bibFilter) return false;
          if (bibCategoryFilter !== "all" && p.distance !== bibCategoryFilter) return false;
          if (bibSearch) {
            const q = bibSearch.toLowerCase();
            if (!p.name.toLowerCase().includes(q) && !p.bibNo.toLowerCase().includes(q) && !p.email.toLowerCase().includes(q)) return false;
          }
          return true;
        });

        const mockExcelPreview = [
          { A:"201", B:"Anuwat Polchaisri",  C:"25K", D:"anuwat.p@email.com"   },
          { A:"202", B:"Warunee Kaewsri",    C:"25K", D:"warunee.k@email.com"  },
          { A:"203", B:"Noppawan Srimuang",  C:"25K", D:"noppawan.s@email.com" },
          { A:"203", B:"John Unknown",       C:"25K", D:"john.u@nowhere.com"   },
          { A:"205", B:"Jutamas Boonsong",   C:"25K", D:"jutamas.b@email.com"  },
        ];
        const mockMatched = [
          { bib:"201", name:"Anuwat Polchaisri",     email:"anuwat.p@email.com",     category:"25K" },
          { bib:"202", name:"Warunee Kaewsri",       email:"warunee.k@email.com",    category:"25K" },
          { bib:"204", name:"Chatchai Mongkol",      email:"chatchai.m@email.com",   category:"25K" },
          { bib:"205", name:"Jutamas Boonsong",      email:"jutamas.b@email.com",    category:"25K" },
          { bib:"206", name:"Hayashi Akiko",         email:"akiko.h@email.jp",       category:"25K" },
          { bib:"207", name:"Inoue Emi",             email:"emi.i@email.jp",         category:"25K" },
          { bib:"208", name:"Amanda Clark",          email:"amanda.c@email.com",     category:"25K" },
          { bib:"209", name:"Priya Nair",            email:"priya.n@email.sg",       category:"25K" },
          { bib:"210", name:"Julia Hoffmann",        email:"julia.h@email.de",       category:"25K" },
          { bib:"211", name:"Emma Clarke",           email:"emma.c@email.au",        category:"25K" },
          { bib:"212", name:"Rachel Moore",          email:"rachel.m@email.au",      category:"25K" },
          { bib:"213", name:"Choi Jiyeon",           email:"jiyeon.c@email.kr",      category:"25K" },
          { bib:"214", name:"Sophie Martin",         email:"sophie.m@email.fr",      category:"25K" },
          { bib:"215", name:"Chloe Lam",             email:"chloe.l@email.hk",       category:"25K" },
          { bib:"216", name:"Nurul Aina",            email:"aina@email.my",          category:"25K" },
          { bib:"217", name:"Maria Santos",          email:"maria.s@email.ph",       category:"25K" },
          { bib:"218", name:"Nuttapong Apirak",      email:"nuttapong.a@email.com",  category:"25K" },
          { bib:"219", name:"Kanchanok Phakdeewong", email:"kanchanok@email.com",    category:"25K" },
        ];
        const mockConflicts = [{
          bib: "203",
          candidates: [
            { id:"p22",  name:"Noppawan Srimuang", email:"noppawan.s@email.com", row:3 },
            { id:"p_unk", name:"John Unknown",      email:"john.u@nowhere.com",   row:4 },
          ],
        }];
        const mockUnmatched = [
          { row:4,  bib:"203", identifier:"john.u@nowhere.com", name:"John Unknown" },
          { row:19, bib:"221", identifier:"ghost@email.com",    name:"Ghost Runner" },
          { row:22, bib:"224", identifier:"nobody@test.com",    name:"Test User"    },
        ];

        const handleImportApply = () => {
          const emailToBib: Record<string, string> = {};
          mockMatched.forEach(m => { emailToBib[m.email] = m.bib; });
          mockConflicts.forEach(c => {
            const winnerId = importConflictChoice[c.bib] ?? c.candidates[0].id;
            const winner = c.candidates.find(x => x.id === winnerId);
            if (winner) emailToBib[winner.email] = c.bib;
          });
          setParticipants(prev => prev.map(p =>
            emailToBib[p.email] ? { ...p, bibNo: emailToBib[p.email] } : p
          ));
          setImportStep(4);
        };

        const importStepLabels = ["Upload", "Map Columns", "Preview", "Done"];

        return (
          <div className="space-y-6">
            {/* Stat cards */}
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="rounded-xl border border-border bg-card p-5 shadow-card">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Runners</p>
                <p className="mt-1 text-3xl font-bold text-card-foreground">{participants.length}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5 shadow-card">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Assigned</p>
                <p className="mt-1 text-3xl font-bold text-success">{bibAssigned}</p>
                <p className="mt-1 text-xs text-muted-foreground">{Math.round((bibAssigned / participants.length) * 100)}% complete</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5 shadow-card">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">TBA</p>
                <p className="mt-1 text-3xl font-bold text-warning">{bibTba}</p>
                <p className="mt-1 text-xs text-muted-foreground">Awaiting assignment</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5 shadow-card">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Conflicts</p>
                <p className="mt-1 text-3xl font-bold text-destructive">0</p>
                <p className="mt-1 text-xs text-muted-foreground">Duplicate BIBs</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-card">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">Assignment Progress</span>
                <span className="text-muted-foreground">{bibAssigned} / {participants.length}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-success transition-all duration-500" style={{ width: `${(bibAssigned / participants.length) * 100}%` }} />
              </div>
            </div>

            {/* Action bar + filters */}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={() => { setImportStep(1); setImportFileName(""); setImportFileReady(false); setImportConflictChoice({}); setImportOpen(true); }}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />Import Excel
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />Download Template
              </Button>
              <div className="flex-1" />
              <Select value={bibCategoryFilter} onValueChange={setBibCategoryFilter}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">All Categories</SelectItem>
                  {bibCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={bibFilter} onValueChange={(v) => setBibFilter(v as typeof bibFilter)}>
                <SelectTrigger className="w-32"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="tba">TBA</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative w-56">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search name or BIB…" value={bibSearch} onChange={e => setBibSearch(e.target.value)} className="pl-9" />
              </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 text-center">#</TableHead>
                    <TableHead className="w-36">BIB No.</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBib.slice(0, 50).map((p, i) => {
                    const isEditing = editingBibId === p.id;
                    const isAssigned = p.bibNo !== "";
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="text-center text-xs text-muted-foreground">{i + 1}</TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              autoFocus
                              value={editingBibValue}
                              onChange={e => setEditingBibValue(e.target.value)}
                              onBlur={() => {
                                if (editingBibValue.trim()) setParticipants(prev => prev.map(x => x.id === p.id ? { ...x, bibNo: editingBibValue.trim() } : x));
                                setEditingBibId(null);
                              }}
                              onKeyDown={e => {
                                if (e.key === "Enter") {
                                  if (editingBibValue.trim()) setParticipants(prev => prev.map(x => x.id === p.id ? { ...x, bibNo: editingBibValue.trim() } : x));
                                  setEditingBibId(null);
                                }
                                if (e.key === "Escape") setEditingBibId(null);
                              }}
                              className="h-7 w-24 font-mono text-sm"
                            />
                          ) : (
                            <button
                              onClick={() => { setEditingBibId(p.id); setEditingBibValue(p.bibNo); }}
                              className="group flex items-center gap-1.5 rounded px-2 py-0.5 font-mono text-sm transition-colors hover:bg-muted"
                            >
                              <span className={isAssigned ? "text-foreground font-semibold" : "text-muted-foreground"}>
                                {isAssigned ? p.bibNo : "TBA"}
                              </span>
                              <Pencil className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-60" />
                            </button>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell>
                          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground">{p.distance}</span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{p.gender === "M" ? "Male" : "Female"}</TableCell>
                        <TableCell>
                          {isAssigned ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
                              <span className="h-1.5 w-1.5 rounded-full bg-success" />Assigned
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-medium text-warning">
                              <span className="h-1.5 w-1.5 rounded-full bg-warning" />TBA
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredBib.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">No participants found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {filteredBib.length > 50 && (
                <div className="border-t border-border px-6 py-3 text-center text-xs text-muted-foreground">
                  Showing 50 of {filteredBib.length} — use filters to narrow down
                </div>
              )}
            </div>

            {/* Import Dialog */}
            <Dialog open={importOpen} onOpenChange={open => { if (!open) setImportOpen(false); }}>
              <DialogContent className="max-w-2xl gap-0 overflow-hidden p-0 bg-card">
                {/* Step indicator header */}
                <div className="border-b border-border px-6 py-4">
                  <DialogTitle className="mb-3 text-base font-semibold text-card-foreground">Import BIB Numbers</DialogTitle>
                  <div className="flex items-center">
                    {importStepLabels.map((label, i) => {
                      const s = (i + 1) as 1 | 2 | 3 | 4;
                      const done = importStep > s;
                      const active = importStep === s;
                      return (
                        <div key={s} className="flex flex-1 items-center">
                          <div className={`flex items-center gap-1.5 text-xs font-medium ${done || active ? "text-primary" : "text-muted-foreground"}`}>
                            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-all
                              ${done ? "bg-primary text-primary-foreground" : active ? "bg-primary/10 text-primary ring-1 ring-primary" : "bg-muted text-muted-foreground"}`}>
                              {done ? "✓" : s}
                            </span>
                            <span className="hidden sm:block">{label}</span>
                          </div>
                          {i < importStepLabels.length - 1 && (
                            <div className={`mx-2 h-px flex-1 transition-colors ${importStep > s ? "bg-primary" : "bg-border"}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Step content */}
                <div className="min-h-[340px]">
                  {/* Step 1 — Upload */}
                  {importStep === 1 && (
                    <div className="space-y-4 p-6">
                      <div>
                        <p className="text-sm font-medium text-foreground">Upload your BIB assignment file</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">We'll match runners by email address (or name as fallback)</p>
                      </div>
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`group cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-all
                          ${importFileReady ? "border-primary/40 bg-primary/5" : "border-border hover:border-primary/30 hover:bg-muted/30"}`}
                      >
                        {importFileReady ? (
                          <div className="flex flex-col items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                              <FileSpreadsheet className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">{importFileName}</p>
                              <p className="mt-0.5 text-xs text-muted-foreground">Ready to process · Click to change</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted transition-colors group-hover:bg-primary/10">
                              <Upload className="h-6 w-6 text-muted-foreground transition-colors group-hover:text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">Drag & drop or click to browse</p>
                              <p className="mt-0.5 text-xs text-muted-foreground">Supports .xlsx and .csv</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.csv"
                        className="hidden"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) { setImportFileName(file.name); setImportFileReady(true); }
                        }}
                      />
                      <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-border" />
                        <span className="text-xs text-muted-foreground">or</span>
                        <div className="h-px flex-1 bg-border" />
                      </div>
                      <Button variant="outline" size="sm" className="w-full gap-2">
                        <Download className="h-4 w-4" />Download Excel Template
                      </Button>
                    </div>
                  )}

                  {/* Step 2 — Map Columns */}
                  {importStep === 2 && (
                    <div className="space-y-4 p-6">
                      <div>
                        <p className="text-sm font-medium text-foreground">Map your columns</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">Tell us which columns hold the BIB number and runner identifier</p>
                      </div>
                      {/* Mini Excel preview */}
                      <div className="overflow-auto rounded-lg border border-border text-xs">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-muted/60">
                              {["A","B","C","D"].map(col => (
                                <th key={col} className="border-r border-border px-3 py-2 text-left font-semibold text-muted-foreground last:border-r-0">
                                  Col {col}
                                  {col === importColBib && <span className="ml-1 font-normal text-primary">(BIB)</span>}
                                  {col === importColId  && col !== importColBib && <span className="ml-1 font-normal text-[#3B82F6]">(ID)</span>}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {mockExcelPreview.map((row, i) => (
                              <tr key={i} className="border-t border-border hover:bg-muted/30">
                                <td className={`border-r border-border px-3 py-2 font-mono ${importColBib === "A" ? "text-primary font-semibold" : ""}`}>{row.A}</td>
                                <td className={`border-r border-border px-3 py-2 ${importColBib === "B" ? "text-primary font-semibold" : importColId === "B" ? "text-[#3B82F6]" : ""}`}>{row.B}</td>
                                <td className={`border-r border-border px-3 py-2 ${importColBib === "C" ? "text-primary font-semibold" : importColId === "C" ? "text-[#3B82F6]" : ""}`}>{row.C}</td>
                                <td className={`px-3 py-2 ${importColId === "D" ? "text-[#3B82F6]" : ""}`}>{row.D}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                            <span className="inline-block h-2 w-2 rounded-full bg-primary" />BIB Number column
                          </label>
                          <Select value={importColBib} onValueChange={setImportColBib}>
                            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-popover">
                              {["A","B","C","D"].map(c => <SelectItem key={c} value={c}>Column {c}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                            <span className="inline-block h-2 w-2 rounded-full bg-[#3B82F6]" />Runner identifier
                          </label>
                          <Select value={importColId} onValueChange={setImportColId}>
                            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-popover">
                              {["A","B","C","D"].map(c => (
                                <SelectItem key={c} value={c}>
                                  Column {c}{c === "D" ? " (Email — recommended)" : c === "B" ? " (Name)" : ""}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3 — Preview & Resolve */}
                  {importStep === 3 && (
                    <div className="space-y-3 p-6">
                      <div className="flex flex-wrap gap-2">
                        <span className="flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
                          <CheckCircle2 className="h-3.5 w-3.5" />{mockMatched.length} matched
                        </span>
                        <span className="flex items-center gap-1.5 rounded-full bg-warning/10 px-3 py-1 text-xs font-medium text-warning">
                          <AlertCircle className="h-3.5 w-3.5" />{mockConflicts.length} conflict
                        </span>
                        <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                          <XCircle className="h-3.5 w-3.5" />{mockUnmatched.length} unmatched — will be skipped
                        </span>
                      </div>
                      <Tabs defaultValue="matched">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="matched">Matched ({mockMatched.length})</TabsTrigger>
                          <TabsTrigger value="conflicts">⚠ Conflicts ({mockConflicts.length})</TabsTrigger>
                          <TabsTrigger value="unmatched">Unmatched ({mockUnmatched.length})</TabsTrigger>
                        </TabsList>
                        <TabsContent value="matched" className="mt-2">
                          <div className="max-h-56 overflow-y-auto rounded-lg border border-border divide-y divide-border">
                            {mockMatched.map(m => (
                              <div key={m.bib} className="flex items-center justify-between px-4 py-2 text-sm hover:bg-muted/30">
                                <div className="flex items-center gap-3">
                                  <span className="w-10 font-mono font-bold text-foreground">{m.bib}</span>
                                  <span className="text-foreground">{m.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{m.category}</span>
                                  <CheckCircle2 className="h-4 w-4 text-success" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </TabsContent>
                        <TabsContent value="conflicts" className="mt-2 space-y-3">
                          {mockConflicts.map(c => (
                            <div key={c.bib} className="rounded-lg border border-warning/30 bg-warning/5 p-4">
                              <p className="mb-3 text-xs font-semibold text-warning">
                                BIB #{c.bib} — assigned to multiple rows. Pick one to keep:
                              </p>
                              <div className="space-y-2">
                                {c.candidates.map(candidate => {
                                  const chosen = importConflictChoice[c.bib] ?? c.candidates[0].id;
                                  return (
                                    <label
                                      key={candidate.id}
                                      className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors
                                        ${chosen === candidate.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"}`}
                                    >
                                      <input
                                        type="radio"
                                        name={`conflict-${c.bib}`}
                                        checked={chosen === candidate.id}
                                        onChange={() => setImportConflictChoice(prev => ({ ...prev, [c.bib]: candidate.id }))}
                                        className="accent-primary"
                                      />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground">{candidate.name}</p>
                                        <p className="text-xs text-muted-foreground">{candidate.email} · Row {candidate.row}</p>
                                      </div>
                                      {chosen === candidate.id && (
                                        <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                                      )}
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </TabsContent>
                        <TabsContent value="unmatched" className="mt-2">
                          <div className="max-h-56 overflow-y-auto rounded-lg border border-border divide-y divide-border">
                            {mockUnmatched.map(u => (
                              <div key={u.row} className="flex items-start justify-between px-4 py-3 text-sm hover:bg-muted/30">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-foreground">{u.bib}</span>
                                    <span className="text-foreground">{u.name}</span>
                                  </div>
                                  <p className="mt-0.5 text-xs text-muted-foreground">{u.identifier}</p>
                                </div>
                                <span className="shrink-0 rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">Row {u.row} · Skipped</span>
                              </div>
                            ))}
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  )}

                  {/* Step 4 — Done */}
                  {importStep === 4 && (
                    <div className="flex flex-col items-center justify-center gap-5 p-10 text-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                        <CheckCircle2 className="h-8 w-8 text-success" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-foreground">Import Complete!</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {mockMatched.length + 1} BIBs assigned · {mockUnmatched.length} rows skipped
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <div className="rounded-xl bg-success/10 px-6 py-3 text-center">
                          <p className="text-2xl font-bold text-success">{mockMatched.length + 1}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">Assigned</p>
                        </div>
                        <div className="rounded-xl bg-muted px-6 py-3 text-center">
                          <p className="text-2xl font-bold text-foreground">{mockUnmatched.length}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">Skipped</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-border bg-muted/30 px-6 py-4">
                  <div>
                    {importStep > 1 && importStep < 4 && (
                      <Button variant="ghost" size="sm" onClick={() => setImportStep(prev => (prev - 1) as typeof importStep)}>
                        ← Back
                      </Button>
                    )}
                  </div>
                  <div>
                    {importStep === 1 && (
                      <Button disabled={!importFileReady} onClick={() => setImportStep(2)}>
                        Next →
                      </Button>
                    )}
                    {importStep === 2 && (
                      <Button onClick={() => setImportStep(3)}>
                        Preview results →
                      </Button>
                    )}
                    {importStep === 3 && (
                      <Button onClick={handleImportApply} className="gap-2">
                        <CheckCircle2 className="h-4 w-4" />Apply {mockMatched.length + 1} BIBs
                      </Button>
                    )}
                    {importStep === 4 && (
                      <Button onClick={() => setImportOpen(false)}>Done</Button>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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

      case "promotions": {
        const RACE_CATS = ["100K", "50K", "25K"];

        const filteredCodes = discountCodes.filter(
          (c) => promoSearch === "" || c.code.toLowerCase().includes(promoSearch.toLowerCase())
        );
        const activeCount = discountCodes.filter((c) => c.isActive && new Date(c.validUntil) > new Date()).length;
        const totalUsage = discountCodes.reduce((s, c) => s + c.used, 0);

        const handleSavePromo = (editing: boolean) => {
          if (!promoForm.code || !promoForm.discount) return;
          if (editing && editingPromo) {
            setDiscountCodes((prev) =>
              prev.map((c) =>
                c.id === editingPromo.id
                  ? { ...c, code: promoForm.code.toUpperCase(), discount: Number(promoForm.discount), type: promoForm.type as "percentage" | "fixed", usageLimit: Number(promoForm.usageLimit), validUntil: promoForm.validUntil, categories: promoForm.categories, isActive: promoForm.isActive }
                  : c
              )
            );
            setEditPromoOpen(false);
          } else {
            setDiscountCodes((prev) => [
              ...prev,
              { id: `dc${Date.now()}`, code: promoForm.code.toUpperCase(), discount: Number(promoForm.discount), type: promoForm.type as "percentage" | "fixed", usageLimit: Number(promoForm.usageLimit), used: 0, validUntil: promoForm.validUntil, categories: promoForm.categories, isActive: true, usages: [] },
            ]);
            setCreatePromoOpen(false);
          }
          setPromoForm(emptyPromoForm);
        };

        const handleToggleActive = (codeId: string) =>
          setDiscountCodes((prev) => prev.map((c) => (c.id === codeId ? { ...c, isActive: !c.isActive } : c)));

        const handleDeletePromo = () => {
          setDiscountCodes((prev) => prev.filter((c) => c.id !== deletePromoId));
          setDeletePromoId(null);
        };

        const handleBulkGenerate = () => {
          if (!bulkGenForm.discount || !bulkGenForm.validUntil) return;
          const count = Math.min(Math.max(Number(bulkGenForm.count) || 1, 1), 100);
          const newCodes: DiscountCode[] = Array.from({ length: count }, (_, i) => ({
            id: `dc${Date.now()}-${i}`,
            code: `${bulkGenForm.prefix || "CODE"}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
            discount: Number(bulkGenForm.discount),
            type: bulkGenForm.type as "percentage" | "fixed",
            usageLimit: Number(bulkGenForm.usageLimit) || 1,
            used: 0,
            validUntil: bulkGenForm.validUntil,
            categories: bulkGenForm.categories,
            isActive: true,
            usages: [],
          }));
          setDiscountCodes((prev) => [...prev, ...newCodes]);
          setBulkGenOpen(false);
          setBulkGenForm(emptyBulkGenForm);
        };

        const renderPromoFormFields = (form: typeof promoForm, setForm: (f: typeof promoForm) => void) => (
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Code</Label>
              <Input
                placeholder="SUMMER2025"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="font-mono"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Discount</Label>
                <Input type="number" placeholder="20" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
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
                <Input type="number" placeholder="100" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Valid Until</Label>
                <Input type="date" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>
                Categories{" "}
                <span className="font-normal text-muted-foreground">(empty = all)</span>
              </Label>
              <div className="flex gap-2">
                {RACE_CATS.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        categories: form.categories.includes(cat)
                          ? form.categories.filter((c) => c !== cat)
                          : [...form.categories, cat],
                      })
                    }
                    className={`rounded-md border px-3 py-1 text-sm font-medium transition-colors ${
                      form.categories.includes(cat)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

        return (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-foreground">Discount Codes</h3>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => { setBulkGenForm(emptyBulkGenForm); setBulkGenOpen(true); }}>
                  <Copy className="mr-2 h-4 w-4" />
                  Bulk Generate
                </Button>
                <Button onClick={() => { setPromoForm(emptyPromoForm); setCreatePromoOpen(true); }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Code
                </Button>
              </div>
            </div>

            {/* Summary cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-card p-5 shadow-card">
                <p className="text-sm text-muted-foreground">Total Codes</p>
                <p className="text-2xl font-bold text-card-foreground">{discountCodes.length}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5 shadow-card">
                <p className="text-sm text-muted-foreground">Active Codes</p>
                <p className="text-2xl font-bold text-success">{activeCount}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5 shadow-card">
                <p className="text-sm text-muted-foreground">Total Uses</p>
                <p className="text-2xl font-bold text-card-foreground">{totalUsage}</p>
              </div>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search codes..." value={promoSearch} onChange={(e) => setPromoSearch(e.target.value)} />
            </div>

            {/* Table */}
            <div className="rounded-xl border border-border bg-card shadow-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Categories</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Valid Until</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCodes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                        No discount codes found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCodes.map((code) => {
                      const isExpired = new Date(code.validUntil) <= new Date();
                      const effectivelyActive = code.isActive && !isExpired;
                      return (
                        <TableRow key={code.id}>
                          <TableCell className="font-mono font-medium">{code.code}</TableCell>
                          <TableCell>
                            {code.type === "percentage" ? `${code.discount}%` : formatCurrency(code.discount)}
                          </TableCell>
                          <TableCell>
                            {code.categories.length === 0 ? (
                              <span className="text-sm text-muted-foreground">All</span>
                            ) : (
                              <div className="flex flex-wrap gap-1">
                                {code.categories.map((cat) => (
                                  <span key={cat} className="rounded-md bg-muted px-1.5 py-0.5 text-xs">{cat}</span>
                                ))}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex min-w-[88px] flex-col gap-1">
                              <span className="text-sm">{code.used} / {code.usageLimit}</span>
                              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                  className="h-full rounded-full bg-primary transition-all"
                                  style={{ width: `${Math.min((code.used / code.usageLimit) * 100, 100)}%` }}
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{code.validUntil}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                isExpired
                                  ? "bg-muted text-muted-foreground"
                                  : effectivelyActive
                                  ? "bg-success/10 text-success"
                                  : "bg-warning/10 text-warning"
                              }`}
                            >
                              {isExpired ? "Expired" : effectivelyActive ? "Active" : "Inactive"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-popover">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditingPromo(code);
                                    setPromoForm({ code: code.code, discount: String(code.discount), type: code.type, usageLimit: String(code.usageLimit), validUntil: code.validUntil, categories: [...code.categories], isActive: code.isActive });
                                    setEditPromoOpen(true);
                                  }}
                                >
                                  <Pencil className="mr-2 h-4 w-4" />Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => { setUsageDetailCode(code); setUsageDetailOpen(true); }}
                                >
                                  <Eye className="mr-2 h-4 w-4" />View Usage ({code.used})
                                </DropdownMenuItem>
                                {!isExpired && (
                                  <DropdownMenuItem onClick={() => handleToggleActive(code.id)}>
                                    {code.isActive
                                      ? <XCircle className="mr-2 h-4 w-4" />
                                      : <CheckCircle2 className="mr-2 h-4 w-4" />}
                                    {code.isActive ? "Deactivate" : "Activate"}
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() => setDeletePromoId(code.id)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Create Dialog */}
            <Dialog open={createPromoOpen} onOpenChange={setCreatePromoOpen}>
              <DialogContent>
                <DialogHeader><DialogTitle>Create Discount Code</DialogTitle></DialogHeader>
                {renderPromoFormFields(promoForm, setPromoForm)}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => setCreatePromoOpen(false)}>Cancel</Button>
                  <Button className="flex-1" onClick={() => handleSavePromo(false)}>Create Code</Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={editPromoOpen} onOpenChange={setEditPromoOpen}>
              <DialogContent>
                <DialogHeader><DialogTitle>Edit — {editingPromo?.code}</DialogTitle></DialogHeader>
                {renderPromoFormFields(promoForm, setPromoForm)}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => setEditPromoOpen(false)}>Cancel</Button>
                  <Button className="flex-1" onClick={() => handleSavePromo(true)}>Save Changes</Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Usage Detail Dialog */}
            <Dialog open={usageDetailOpen} onOpenChange={setUsageDetailOpen}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Usage Detail — {usageDetailCode?.code}</DialogTitle>
                </DialogHeader>
                <div className="pt-2">
                  {!usageDetailCode || usageDetailCode.usages.length === 0 ? (
                    <p className="py-8 text-center text-muted-foreground">No usages recorded yet.</p>
                  ) : (
                    <div className="max-h-80 space-y-2 overflow-y-auto">
                      {usageDetailCode.usages.map((usage, i) => (
                        <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3">
                          <div>
                            <p className="text-sm font-medium text-foreground">{usage.name}</p>
                            <p className="text-xs text-muted-foreground">{usage.email}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-mono text-xs text-muted-foreground">{usage.orderId}</p>
                            <p className="text-xs text-muted-foreground">{usage.usedAt}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {/* Bulk Generate Dialog */}
            <Dialog open={bulkGenOpen} onOpenChange={setBulkGenOpen}>
              <DialogContent>
                <DialogHeader><DialogTitle>Bulk Generate Codes</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Prefix</Label>
                      <Input
                        placeholder="CODE"
                        value={bulkGenForm.prefix}
                        onChange={(e) => setBulkGenForm({ ...bulkGenForm, prefix: e.target.value.toUpperCase() })}
                        className="font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Count (max 100)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        placeholder="10"
                        value={bulkGenForm.count}
                        onChange={(e) => setBulkGenForm({ ...bulkGenForm, count: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Discount</Label>
                      <Input type="number" placeholder="20" value={bulkGenForm.discount} onChange={(e) => setBulkGenForm({ ...bulkGenForm, discount: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select value={bulkGenForm.type} onValueChange={(v) => setBulkGenForm({ ...bulkGenForm, type: v })}>
                        <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-popover">
                          <SelectItem value="percentage">Percentage (%)</SelectItem>
                          <SelectItem value="fixed">Fixed (THB)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Usage Limit / code</Label>
                      <Input type="number" placeholder="1" value={bulkGenForm.usageLimit} onChange={(e) => setBulkGenForm({ ...bulkGenForm, usageLimit: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Valid Until</Label>
                      <Input type="date" value={bulkGenForm.validUntil} onChange={(e) => setBulkGenForm({ ...bulkGenForm, validUntil: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Categories{" "}
                      <span className="font-normal text-muted-foreground">(empty = all)</span>
                    </Label>
                    <div className="flex gap-2">
                      {RACE_CATS.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() =>
                            setBulkGenForm({
                              ...bulkGenForm,
                              categories: bulkGenForm.categories.includes(cat)
                                ? bulkGenForm.categories.filter((c) => c !== cat)
                                : [...bulkGenForm.categories, cat],
                            })
                          }
                          className={`rounded-md border px-3 py-1 text-sm font-medium transition-colors ${
                            bulkGenForm.categories.includes(cat)
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:border-primary/50"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => setBulkGenOpen(false)}>Cancel</Button>
                  <Button className="flex-1" onClick={handleBulkGenerate}>
                    Generate {bulkGenForm.count || "0"} Codes
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={!!deletePromoId} onOpenChange={(open) => { if (!open) setDeletePromoId(null); }}>
              <DialogContent className="max-w-sm">
                <DialogHeader><DialogTitle>Delete Discount Code</DialogTitle></DialogHeader>
                <p className="pt-2 text-sm text-muted-foreground">
                  Are you sure you want to delete{" "}
                  <span className="font-mono font-medium text-foreground">
                    {discountCodes.find((c) => c.id === deletePromoId)?.code}
                  </span>
                  ? This action cannot be undone.
                </p>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => setDeletePromoId(null)}>Cancel</Button>
                  <Button variant="destructive" className="flex-1" onClick={handleDeletePromo}>Delete</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        );
      }

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
                    onClick={() => navigate(`/events/${id}/${item.id}`)}
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
                onClick={() => navigate(`/events/${id}/${item.id}`)}
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
