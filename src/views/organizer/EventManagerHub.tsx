import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
  ArrowLeft,
  BarChart3,
  Activity,
  DollarSign,
  Users,
  Tag,
  Megaphone,
  Settings,
  Send,
  Hash,
  Receipt,
  Sparkles,
} from "lucide-react";
import Logo from "@/components/Logo";
import OrderTwoView from "@/views/OrderTwoView";
import OrderThreeView from "@/views/OrderThreeView";
import StatusBadge from "@/components/StatusBadge";
import { Order, Participant, DiscountCode } from "@/data/mockData";
import { useEvent } from "@/hooks/data/useEvents";
import { useOrders } from "@/hooks/data/useOrders";
import { useParticipants } from "@/hooks/data/useParticipants";
import { useDiscountCodes } from "@/hooks/data/useDiscountCodes";
import { useEventStats } from "@/hooks/data/useEventStats";
import OverviewSection, { useOverviewSectionState } from "./event-manager/OverviewSection";
import OverviewNewSection from "./event-manager/OverviewNewSection";
import OrdersSection, { useOrdersSectionState } from "./event-manager/OrdersSection";
import BibSection, { useBibSectionState } from "./event-manager/BibSection";
import ParticipantsSection, { useParticipantsSectionState } from "./event-manager/ParticipantsSection";
import PromotionsSection, { usePromotionsSectionState } from "./event-manager/PromotionsSection";

type HubSection = "overview2" | "overview3" | "orders" | "orders2" | "orders3" | "participants" | "bib" | "promotions" | "broadcast" | "settings";

const sidebarItems: { id: HubSection; label: string; icon: typeof BarChart3 }[] = [
  { id: "overview2", label: "Race Operations (Obsolete)", icon: Activity },
  { id: "overview3", label: "Race Operations (New)", icon: Sparkles },
  { id: "orders", label: "Orders (Finance)", icon: DollarSign },
  { id: "orders2", label: "Order (Direction 2)", icon: Receipt },
  { id: "orders3", label: "Order (Direction 3)", icon: Receipt },
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
  const { data: maybeEvent } = useEvent(id);
  const event = maybeEvent!;
  const activeSection = ((section ?? "overview2") as HubSection);
  const onBack = () => navigate("/organizer/dashboard");
  const onEditWizard = () => navigate(`/organizer/events/${id}/edit`);

  const { data: liveParticipants } = useParticipants(id);
  const { data: liveOrders } = useOrders(id);
  const { data: initialDiscountCodes } = useDiscountCodes();
  const { data: stats } = useEventStats();

  // Shared domain data — lives at the hub so it persists across section switches
  const [participants, setParticipants] = useState<Participant[]>(liveParticipants);
  const [orders, setOrders] = useState<Order[]>(liveOrders);
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>(initialDiscountCodes);

  // Store registrations live-update the hub copies: rows derived from the store
  // (marked registrationCode / registrationId) are re-synced from the hooks so a
  // runner registering — or a slip approval — reflects here instantly, while
  // local edits to legacy mock rows are preserved.
  useEffect(() => {
    setParticipants((prev) => {
      const legacy = prev.filter((p) => !p.registrationCode);
      const derived = liveParticipants
        .filter((p) => p.registrationCode)
        .map((d) => prev.find((p) => p.id === d.id) ?? d); // keep local edits on known rows
      return [...derived, ...legacy];
    });
  }, [liveParticipants]);
  useEffect(() => {
    setOrders((prev) => {
      const legacy = prev.filter((o) => !o.registrationId);
      const derived = liveOrders
        .filter((o) => o.registrationId)
        .map((d) => {
          const old = prev.find((o) => o.id === d.id);
          return old ? { ...d, note: old.note } : d; // store wins on status, keep local notes
        });
      return [...derived, ...legacy];
    });
  }, [liveOrders]);

  // Per-section UI state — hooks are called unconditionally at the hub level
  // (Rules of Hooks) so filter/modal state persists when switching sections.
  const overviewState = useOverviewSectionState();
  const ordersState = useOrdersSectionState();
  const participantsState = useParticipantsSectionState();
  const bibState = useBibSectionState();
  const promotionsState = usePromotionsSectionState();

  const renderContent = () => {
    switch (activeSection) {
      case "overview2":
        return (
          <OverviewSection
            event={event!}
            participants={participants}
            stats={stats}
            state={overviewState}
          />
        );

      case "overview3":
        return (
          <OverviewNewSection
            event={event!}
            participants={participants}
            orders={orders}
            stats={stats}
            state={overviewState}
          />
        );

      case "orders2":
        return (
          <OrderTwoView
            orders={orders}
            setOrders={setOrders}
            participants={participants}
          />
        );

      case "orders3":
        return (
          <OrderThreeView
            orders={orders}
            setOrders={setOrders}
            participants={participants}
          />
        );

      case "orders":
        return (
          <OrdersSection
            eventId={event.id}
            orders={orders}
            setOrders={setOrders}
            participants={participants}
            state={ordersState}
          />
        );

      case "bib":
        return (
          <BibSection
            participants={participants}
            setParticipants={setParticipants}
            state={bibState}
          />
        );

      case "participants":
        return (
          <ParticipantsSection
            eventId={event.id}
            participants={participants}
            setParticipants={setParticipants}
            state={participantsState}
          />
        );

      case "promotions":
        return (
          <PromotionsSection
            discountCodes={discountCodes}
            setDiscountCodes={setDiscountCodes}
            state={promotionsState}
          />
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
                Edit event details, race categories, and tickets in the full wizard.
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
                    onClick={() => navigate(`/organizer/events/${id}/${item.id}`)}
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
                onClick={() => navigate(`/organizer/events/${id}/${item.id}`)}
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
