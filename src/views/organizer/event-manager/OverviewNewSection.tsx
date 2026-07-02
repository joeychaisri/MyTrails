import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  UserPlus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Globe,
  ChevronRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Event, Order, Participant } from "@/data/mockData";
import { EventStats, OverviewSectionState } from "./OverviewSection";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
  }).format(amount);
};

interface OverviewNewSectionProps {
  event: Event;
  participants: Participant[];
  orders: Order[];
  stats: EventStats;
  state: OverviewSectionState;
}

const OverviewNewSection = ({ event, participants, orders, stats, state }: OverviewNewSectionProps) => {
  const {
    revenueFilter, setRevenueFilter,
    customRevenueRange, setCustomRevenueRange,
    customPickerOpen, setCustomPickerOpen,
    natModalSearch, setNatModalSearch,
  } = state;

        const MALE_C = "#4A7FC1";
        const FEMALE_C = "#C4607A";
        const FINISHER_C = "#2D9166";
        const PRIMARY_C = "#E8600A";

        const totalP = participants.length;
        const maleP = participants.filter((p) => p.gender === "M").length;
        const femaleP = totalP - maleP;

        const ageRanges3 = useMemo(() => [
          { label: "Under 30", male: participants.filter((p) => p.age < 30 && p.gender === "M").length, female: participants.filter((p) => p.age < 30 && p.gender === "F").length },
          { label: "30–39",    male: participants.filter((p) => p.age >= 30 && p.age < 40 && p.gender === "M").length, female: participants.filter((p) => p.age >= 30 && p.age < 40 && p.gender === "F").length },
          { label: "40–49",    male: participants.filter((p) => p.age >= 40 && p.age < 50 && p.gender === "M").length, female: participants.filter((p) => p.age >= 40 && p.age < 50 && p.gender === "F").length },
          { label: "50–59",    male: participants.filter((p) => p.age >= 50 && p.age < 60 && p.gender === "M").length, female: participants.filter((p) => p.age >= 50 && p.age < 60 && p.gender === "F").length },
          { label: "60+",      male: participants.filter((p) => p.age >= 60 && p.gender === "M").length, female: participants.filter((p) => p.age >= 60 && p.gender === "F").length },
        ], [participants]);
        const butterflyMax = Math.max(...ageRanges3.map((r) => Math.max(r.male, r.female)), 1);

        const { natSorted3, natTop5_3, maxNat3 } = useMemo(() => {
          const natMap3: Record<string, number> = {};
          participants.forEach((p) => { natMap3[p.nationality] = (natMap3[p.nationality] || 0) + 1; });
          const natSorted3 = Object.entries(natMap3).sort((a, b) => b[1] - a[1]);
          const natTop5_3 = natSorted3.slice(0, 5);
          const maxNat3 = Math.max(...natTop5_3.map(([, c]) => c), 1);
          return { natSorted3, natTop5_3, maxNat3 };
        }, [participants]);

        const countryFlags3: Record<string, string> = { TH: "🇹🇭", JP: "🇯🇵", US: "🇺🇸", SG: "🇸🇬", DE: "🇩🇪", AU: "🇦🇺", GB: "🇬🇧", CN: "🇨🇳", KR: "🇰🇷", HK: "🇭🇰" };
        const countryNames3: Record<string, string> = { TH: "Thailand", JP: "Japan", US: "United States", SG: "Singapore", DE: "Germany", AU: "Australia", GB: "United Kingdom", CN: "China", KR: "South Korea", HK: "Hong Kong", FR: "France", MY: "Malaysia", PH: "Philippines", NZ: "New Zealand", CA: "Canada", ZA: "South Africa" };

        const shirtEntries3 = useMemo(() => Object.entries(stats.shirtSizes).map(([size, ev]) => ({
          size, Event: ev, Finisher: stats.finisherShirtSizes[size as keyof typeof stats.finisherShirtSizes] ?? 0,
        })), [stats.shirtSizes, stats.finisherShirtSizes]);

        const overallSold3 = stats.categoryFillRate.reduce((s, c) => s + c.sold, 0);
        const overallCap3 = stats.categoryFillRate.reduce((s, c) => s + c.capacity, 0);
        const overallPct3 = Math.round((overallSold3 / overallCap3) * 100);
        const donutData3 = [{ value: overallSold3 }, { value: overallCap3 - overallSold3 }];

        const raceDate3 = new Date(event.date);
        const daysToRace3 = Math.ceil((raceDate3.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

        const refundedAmount3 = useMemo(() => orders
          .filter((o) => o.status === "refunded" || o.status === "refunded_receipt_issued")
          .reduce((s, o) => s + o.amount, 0), [orders]);
        const pendingPayments3 = useMemo(() => orders.filter((o) => o.status === "pending_cash" || (o.status as string) === "pending").length, [orders]);
        const netRevenue3 = event.revenue - refundedAmount3;

        const revData3 = revenueFilter === "week" ? stats.revenueWeekly : revenueFilter === "month" ? stats.revenueMonthly : stats.revenue;

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
                  {stats.categoryFillRate.map((cat) => {
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
                {stats.recentActivity.map((item) => (
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
};

export default OverviewNewSection;
