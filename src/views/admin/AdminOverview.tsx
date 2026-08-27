import { Banknote, CalendarCheck, Users, TrendingUp } from "lucide-react";
import StatsCard from "@/components/StatsCard";
import { AdminEvent, AdminOrganizer, PlatformSettings } from "@/data/adminMockData";
import { useAdminData } from "@/hooks/data/useAdminData";
import { eventFinance } from "@/contexts/EventsContext";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface AdminOverviewProps {
  events: AdminEvent[];
  organizers: AdminOrganizer[];
  platformSettings: PlatformSettings;
}

const AdminOverview = ({ events, organizers, platformSettings }: AdminOverviewProps) => {
  const { data: { platformRevenue } } = useAdminData();
  // Platform revenue = the service fee + event commission the platform keeps
  // on each live/completed event.
  const totalRevenue = events
    .filter((e) => e.status === "live")
    .reduce((sum, e) => sum + eventFinance(e, organizers, platformSettings).totalCommission, 0);
  const pendingReview = events.filter((e) => e.status === "pending_review").length;
  const scheduled = events.filter((e) => e.status === "scheduled").length;
  const liveEvents = events.filter((e) => e.status === "live").length;
  const activeOrganizers = organizers.filter((o) => o.status === "active").length;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", minimumFractionDigits: 0 }).format(amount);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Platform Revenue" value={formatCurrency(totalRevenue)} icon={Banknote} subtitle="Fees earned" />
        <StatsCard
          title="Events Pipeline"
          value={`${pendingReview} / ${scheduled} / ${liveEvents}`}
          icon={CalendarCheck}
          subtitle="Review / Scheduled / Live"
        />
        <StatsCard title="Total Organizers" value={activeOrganizers} icon={Users} subtitle="Active accounts" />
        <StatsCard title="Total Events" value={events.length} icon={TrendingUp} subtitle="All statuses" />
      </div>

      {/* Revenue Chart */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-card">
        <h3 className="mb-4 text-lg font-semibold text-card-foreground">Monthly Platform Revenue</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={platformRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 46%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 46%)" tickFormatter={(v) => `฿${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: number) => [formatCurrency(value), "Revenue"]} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(24, 95%, 46%)" fill="hsl(24, 95%, 46%)" fillOpacity={0.15} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
