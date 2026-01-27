import { useState, useMemo } from "react";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Calendar, Users, DollarSign, LogOut, User, ChevronDown, CreditCard } from "lucide-react";
import Logo from "@/components/Logo";
import EventCard from "@/components/EventCard";
import StatsCard from "@/components/StatsCard";
import ProfileModal from "@/components/ProfileModal";
import PaymentModal from "@/components/PaymentModal";
import DateRangeFilter, { DateFilterOption } from "@/components/DateRangeFilter";
import { mockEvents, mockProfile, mockPaymentInfo, Event, UserProfile, PaymentInfo } from "@/data/mockData";

interface DashboardViewProps {
  onLogout: () => void;
  onSelectEvent: (event: Event) => void;
  onCreateEvent: () => void;
  onEditEvent: (event: Event) => void;
  onPreviewEvent: (event: Event) => void;
}

const DashboardView = ({
  onLogout,
  onSelectEvent,
  onCreateEvent,
  onEditEvent,
  onPreviewEvent,
}: DashboardViewProps) => {
  const [profile, setProfile] = useState<UserProfile>(mockProfile);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>(mockPaymentInfo);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [events] = useState<Event[]>(mockEvents);
  const [dateFilter, setDateFilter] = useState<DateFilterOption>("7days");
  const [customRange, setCustomRange] = useState<DateRange | undefined>();

  // Mock data multipliers based on date filter (simulating different date ranges)
  const statsMultiplier = useMemo(() => {
    switch (dateFilter) {
      case "7days":
        return 1;
      case "14days":
        return 1.8;
      case "month":
        return 3.2;
      case "custom":
        return 2.1;
      default:
        return 1;
    }
  }, [dateFilter]);

  const filteredEvents = events.filter((event) => {
    if (activeTab === "all") return true;
    if (activeTab === "live") return event.status === "live";
    if (activeTab === "drafts") return event.status === "draft";
    if (activeTab === "pending") return event.status === "pending";
    return true;
  });

  const baseRevenue = events.reduce((sum, e) => sum + e.revenue, 0);
  const baseSold = events.reduce((sum, e) => sum + e.sold, 0);
  const activeEvents = events.filter((e) => e.status === "live").length;
  
  // Apply multiplier for date-filtered stats
  const totalRevenue = Math.round(baseRevenue * statsMultiplier);
  const totalSold = Math.round(baseSold * statsMultiplier);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo />

          <div className="flex items-center gap-4">
            <Button onClick={onCreateEvent}>
              <Plus className="mr-2 h-4 w-4" />
              Create New Event
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile.avatar} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {profile.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline">{profile.name}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-popover">
                <DropdownMenuItem onClick={() => setProfileModalOpen(true)}>
                  <User className="mr-2 h-4 w-4" />
                  Edit Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPaymentModalOpen(true)}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Payment
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow mx-auto w-full max-w-7xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
        {/* Hero Stats Section */}
        <div className="mb-8">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-foreground sm:text-xl">Performance Overview</h2>
            <DateRangeFilter
              selectedOption={dateFilter}
              customRange={customRange}
              onOptionChange={setDateFilter}
              onCustomRangeChange={setCustomRange}
            />
          </div>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <StatsCard
              title="Active Events"
              value={activeEvents}
              icon={Calendar}
              subtitle="Currently live"
            />
            <StatsCard
              title="Tickets Sold"
              value={totalSold.toLocaleString()}
              icon={Users}
              subtitle={`In selected period`}
            />
            <StatsCard
              title="Total Revenue"
              value={formatCurrency(totalRevenue)}
              icon={DollarSign}
              subtitle={`In selected period`}
            />
          </div>
        </div>

        {/* Event List Section */}
        <div>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-bold text-foreground">Your Events</h2>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="live">Live</TabsTrigger>
                <TabsTrigger value="drafts">Drafts</TabsTrigger>
                <TabsTrigger value="pending">Pending Review</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16">
              <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-medium text-foreground">No events found</h3>
              <p className="mb-4 text-muted-foreground">
                {activeTab === "all"
                  ? "Create your first trail running event"
                  : `No ${activeTab} events`}
              </p>
              <Button onClick={onCreateEvent}>
                <Plus className="mr-2 h-4 w-4" />
                Create Event
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onSelect={onSelectEvent}
                  onEdit={onEditEvent}
                  onPreview={onPreviewEvent}
                  onDelete={event.status === "draft" ? () => {} : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <ProfileModal
        open={profileModalOpen}
        onOpenChange={setProfileModalOpen}
        profile={profile}
        onSave={setProfile}
      />

      <PaymentModal
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        paymentInfo={paymentInfo}
        onSave={setPaymentInfo}
      />
    </div>
  );
};

export default DashboardView;
