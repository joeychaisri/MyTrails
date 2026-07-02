import { useMemo, useState } from "react";
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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Event, Participant } from "@/data/mockData";
import { useEventStats } from "@/hooks/data/useEventStats";

export type EventStats = ReturnType<typeof useEventStats>["data"];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
  }).format(amount);
};

export function useOverviewSectionState() {
  const [revenueFilter, setRevenueFilter] = useState<"week" | "month" | "custom">("week");
  const [customRevenueRange, setCustomRevenueRange] = useState<DateRange | undefined>();
  const [customPickerOpen, setCustomPickerOpen] = useState(false);
  const [natModalSearch, setNatModalSearch] = useState("");
  return {
    revenueFilter, setRevenueFilter,
    customRevenueRange, setCustomRevenueRange,
    customPickerOpen, setCustomPickerOpen,
    natModalSearch, setNatModalSearch,
  };
}

export type OverviewSectionState = ReturnType<typeof useOverviewSectionState>;

interface OverviewSectionProps {
  event: Event;
  participants: Participant[];
  stats: EventStats;
  state: OverviewSectionState;
}

const OverviewSection = ({ event, participants, stats, state }: OverviewSectionProps) => {
  const {
    revenueFilter, setRevenueFilter,
    customRevenueRange, setCustomRevenueRange,
    customPickerOpen, setCustomPickerOpen,
    natModalSearch, setNatModalSearch,
  } = state;

        const totalParticipants = participants.length;
        const maleCount = participants.filter((p) => p.gender === "M").length;
        const ageRanges = useMemo(() => [
          { label: "Under 30", male: participants.filter((p) => p.age < 30 && p.gender === "M").length,           female: participants.filter((p) => p.age < 30 && p.gender === "F").length },
          { label: "30–39",    male: participants.filter((p) => p.age >= 30 && p.age < 40 && p.gender === "M").length, female: participants.filter((p) => p.age >= 30 && p.age < 40 && p.gender === "F").length },
          { label: "40–49",    male: participants.filter((p) => p.age >= 40 && p.age < 50 && p.gender === "M").length, female: participants.filter((p) => p.age >= 40 && p.age < 50 && p.gender === "F").length },
          { label: "50–59",    male: participants.filter((p) => p.age >= 50 && p.age < 60 && p.gender === "M").length, female: participants.filter((p) => p.age >= 50 && p.age < 60 && p.gender === "F").length },
          { label: "60+",      male: participants.filter((p) => p.age >= 60 && p.gender === "M").length,           female: participants.filter((p) => p.age >= 60 && p.gender === "F").length },
        ].map((r) => ({ ...r, count: r.male + r.female })), [participants]);
        const maxAge = Math.max(...ageRanges.map((r) => r.count));
        const { nationalitySorted, nationalityTop5, maxNat } = useMemo(() => {
          const nationalityMap: Record<string, number> = {};
          participants.forEach((p) => {
            nationalityMap[p.nationality] = (nationalityMap[p.nationality] || 0) + 1;
          });
          const nationalitySorted = Object.entries(nationalityMap).sort((a, b) => b[1] - a[1]);
          const nationalityTop5 = nationalitySorted.slice(0, 5);
          const maxNat = Math.max(...nationalityTop5.map(([, c]) => c));
          return { nationalitySorted, nationalityTop5, maxNat };
        }, [participants]);
        const countryFlags: Record<string, string> = {
          TH: "🇹🇭", JP: "🇯🇵", US: "🇺🇸", SG: "🇸🇬",
          DE: "🇩🇪", AU: "🇦🇺", GB: "🇬🇧", CN: "🇨🇳", KR: "🇰🇷", HK: "🇭🇰",
        };
        const countryNames: Record<string, string> = {
          TH: "Thailand", JP: "Japan", US: "United States", SG: "Singapore",
          DE: "Germany", AU: "Australia", GB: "United Kingdom", CN: "China", KR: "South Korea", HK: "Hong Kong",
        };
        const shirtEntries = useMemo(() => Object.entries(stats.shirtSizes).map(([size, event]) => ({
          size,
          event,
          finisher: stats.finisherShirtSizes[size as keyof typeof stats.finisherShirtSizes] ?? 0,
        })), [stats.shirtSizes, stats.finisherShirtSizes]);
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
                <LineChart data={revenueFilter === "week" ? stats.revenueWeekly : revenueFilter === "month" ? stats.revenueMonthly : stats.revenue}>
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
                  {stats.categoryFillRate.map((cat) => {
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
                {stats.recentActivity.map((item) => (
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
};

export default OverviewSection;
