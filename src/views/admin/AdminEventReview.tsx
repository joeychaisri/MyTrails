import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  MapPin,
  CalendarDays,
  Users,
  Clock,
  Mountain,
  Building2,
  AlertTriangle,
  Image as ImageIcon,
  Navigation,
  Facebook,
  Instagram,
  Globe,
} from "lucide-react";
import AdminStatusBadge from "@/components/AdminStatusBadge";
import { Category } from "@/data/mockData";
import { useEventsStore, eventCommissionAmount, eventServiceFee, resolveBracket } from "@/contexts/EventsContext";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", minimumFractionDigits: 0 }).format(amount);

const fmtDate = (d?: string) => (d ? format(new Date(d), "MMM d, yyyy") : "—");

const InfoTile = ({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) => (
  <div className="flex items-start gap-2">
    <Icon className="mt-0.5 h-4 w-4 text-muted-foreground" />
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  </div>
);

const CategoryCard = ({ cat }: { cat: Category }) => {
  const prices = cat.tickets.map((t) => t.price);
  return (
    <div className="rounded-xl border border-border bg-card shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div>
          <h4 className="font-semibold">{cat.name || "Untitled category"}</h4>
          {cat.nameTh && <p className="text-xs text-muted-foreground">{cat.nameTh}</p>}
        </div>
        <div className="flex flex-wrap gap-1.5 text-xs">
          <span className="rounded-full bg-muted px-2 py-0.5 font-medium">{cat.distance}K</span>
          {cat.itra > 0 && <span className="rounded-full bg-muted px-2 py-0.5">ITRA {cat.itra}</span>}
          {cat.utmbIndex > 0 && <span className="rounded-full bg-muted px-2 py-0.5">UTMB {cat.utmbIndex}</span>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 px-4 py-3 sm:grid-cols-3">
        <InfoTile icon={CalendarDays} label="Race date" value={fmtDate(cat.raceDate)} />
        <InfoTile icon={Clock} label="Start time" value={cat.startTime || "—"} />
        <InfoTile icon={Clock} label="Cut-off" value={cat.cutoffTime ? `${cat.cutoffTime} (${cat.cutoffHours}h)` : "—"} />
        <InfoTile icon={Mountain} label="Elevation" value={`+${cat.elevation}m / -${cat.elevationLoss}m`} />
        <InfoTile icon={MapPin} label="Terrain" value={cat.terrainType || "—"} />
      </div>

      {cat.startLocationName && (
        <div className="px-4 pb-2 text-xs text-muted-foreground">
          Start: {cat.startLocationName}
          {cat.startLat || cat.startLng ? ` (${cat.startLat}, ${cat.startLng})` : ""}
        </div>
      )}

      {/* Tickets */}
      <div className="border-t border-border px-4 py-3">
        <p className="mb-1.5 text-xs font-medium text-muted-foreground">
          Tickets{prices.length ? ` · ${formatCurrency(Math.min(...prices))}–${formatCurrency(Math.max(...prices))}` : ""}
        </p>
        {cat.tickets.length === 0 ? (
          <p className="text-xs text-muted-foreground">No tickets defined</p>
        ) : (
          <div className="space-y-2">
            {cat.tickets.map((t) => {
              const window = t.salesStart || t.salesEnd
                ? `${t.salesStart ? format(new Date(t.salesStart), "d MMM HH:mm") : "—"} → ${t.salesEnd ? format(new Date(t.salesEnd), "d MMM HH:mm") : "—"}`
                : null;
              return (
                <div key={t.id} className="text-sm">
                  <div className="flex items-center justify-between">
                    <span>{t.name}</span>
                    <span className="text-muted-foreground">{formatCurrency(t.price)} · {t.quantity} seats</span>
                  </div>
                  {window && <p className="text-xs text-muted-foreground">Sales: {window}</p>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const AdminEventReview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getEvent, organizers, settings, approveEvent, rejectEvent, updateEvent, hydrated } = useEventsStore();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [commissionOverrideInput, setCommissionOverrideInput] = useState("");
  const [serviceFeeOverrideInput, setServiceFeeOverrideInput] = useState("");

  const event = getEvent(id);
  const backToQueue = () => navigate("/organizer/admin", { state: { page: "approvals" } });

  if (!event) {
    // Supabase mode hydrates async — don't cry "not found" before the data arrives.
    if (!hydrated) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background">
          <p className="text-muted-foreground">Loading event…</p>
        </div>
      );
    }
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
        <p className="text-muted-foreground">Event not found.</p>
        <Button variant="outline" onClick={backToQueue}>
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to queue
        </Button>
      </div>
    );
  }

  const organizer = organizers.find((o) => o.id === event.organizerId);
  const dateLabel =
    event.endDate && event.endDate !== event.date
      ? `${fmtDate(event.date)} – ${fmtDate(event.endDate)}`
      : fmtDate(event.date);

  // Commission preview based on the planned capacity (estimate shown to admin).
  // Pending events have revenue 0, so fall back to the ticket-priced gross.
  const ticketGross = event.categories.reduce((s, c) => s + c.tickets.reduce((a, t) => a + t.price * t.quantity, 0), 0);
  const grossEstimate = event.grossSales ?? (event.revenue || ticketGross);
  const eventCommission = eventCommissionAmount(event.capacity, grossEstimate, settings.commissionBrackets, event.eventCommissionOverride);
  const serviceFee = eventServiceFee(event, settings);
  const resolvedBracket = resolveBracket(event.capacity, settings.commissionBrackets);
  const bracketLabel = resolvedBracket
    ? resolvedBracket.type === "flat"
      ? formatCurrency(resolvedBracket.value)
      : `${resolvedBracket.value}%`
    : "—";

  const handleApprove = () => {
    approveEvent(event.id);
    toast({
      title: "Event Approved",
      description: event.publishMode === "scheduled" ? "It will go live at its scheduled time." : "It is now live.",
    });
    backToQueue();
  };

  const saveCommissionOverride = () => {
    const val = parseFloat(commissionOverrideInput);
    updateEvent(event.id, { eventCommissionOverride: isNaN(val) ? undefined : Math.max(0, val) });
    toast({ title: "Commission updated", description: "Event commission override saved." });
    setCommissionOverrideInput("");
  };

  const clearCommissionOverride = () => {
    updateEvent(event.id, { eventCommissionOverride: undefined });
    toast({ title: "Override cleared", description: "Reverted to the standard commission scale." });
  };

  const saveServiceFeeOverride = () => {
    const val = parseFloat(serviceFeeOverrideInput);
    updateEvent(event.id, { serviceFeeOverride: isNaN(val) ? undefined : Math.max(0, val) });
    toast({ title: "Service fee updated", description: "Service fee override saved." });
    setServiceFeeOverrideInput("");
  };

  const clearServiceFeeOverride = () => {
    updateEvent(event.id, { serviceFeeOverride: undefined });
    toast({ title: "Override cleared", description: "Reverted to the standard service fee." });
  };

  const handleReject = () => {
    if (rejectReason.trim()) {
      rejectEvent(event.id, rejectReason);
      toast({ title: "Changes Requested", description: "Sent back to the organizer with your reason." });
      backToQueue();
    }
  };

  const canDecide = event.status === "pending_review";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={backToQueue}>
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back
            </Button>
            <div className="hidden sm:block">
              <p className="text-xs text-muted-foreground">Admin Panel &gt; Event Approvals &gt; Review</p>
              <h1 className="text-lg font-bold leading-tight">Review Event</h1>
            </div>
          </div>
          <AdminStatusBadge status={event.status} />
        </div>
      </header>

      {/* Body */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-28 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Cover photo */}
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
              {event.coverImage ? (
                <img src={event.coverImage} alt={event.title} className="h-48 w-full object-cover" />
              ) : (
                <div className="flex h-32 flex-col items-center justify-center gap-1 bg-muted/50 text-muted-foreground">
                  <ImageIcon className="h-6 w-6" />
                  <p className="text-xs">No cover photo uploaded</p>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border bg-card p-5 shadow-card">
              <h2 className="text-xl font-bold">{event.title}</h2>
              {event.titleTh && <p className="text-sm text-muted-foreground">{event.titleTh}</p>}
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <InfoTile icon={MapPin} label="Province" value={event.province} />
                <InfoTile icon={CalendarDays} label="Event Dates" value={dateLabel} />
                <InfoTile icon={Users} label="Capacity" value={`${event.capacity}`} />
                <InfoTile icon={Users} label="Sold" value={`${event.sold}`} />
              </div>

              {event.description && (
                <div className="mt-4">
                  <p className="text-xs text-muted-foreground">Description (EN)</p>
                  <p className="mt-0.5 text-sm">{event.description}</p>
                </div>
              )}
              {event.descriptionTh && (
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground">Description (TH)</p>
                  <p className="mt-0.5 text-sm">{event.descriptionTh}</p>
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border pt-4 text-sm">
                {(event.latitude || event.longitude) && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Navigation className="h-3.5 w-3.5" />
                    <span>{event.latitude}, {event.longitude}</span>
                    <a
                      className="text-primary hover:underline"
                      href={`https://www.google.com/maps?q=${event.latitude},${event.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      map
                    </a>
                  </div>
                )}
                {event.socialLinks.facebook && (
                  <a className="flex items-center gap-1.5 text-primary hover:underline" href={event.socialLinks.facebook} target="_blank" rel="noreferrer">
                    <Facebook className="h-3.5 w-3.5" /> Facebook
                  </a>
                )}
                {event.socialLinks.instagram && (
                  <a className="flex items-center gap-1.5 text-primary hover:underline" href={event.socialLinks.instagram} target="_blank" rel="noreferrer">
                    <Instagram className="h-3.5 w-3.5" /> Instagram
                  </a>
                )}
                {event.socialLinks.website && (
                  <a className="flex items-center gap-1.5 text-primary hover:underline" href={event.socialLinks.website} target="_blank" rel="noreferrer">
                    <Globe className="h-3.5 w-3.5" /> Website
                  </a>
                )}
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                Race Categories ({event.categories.length})
              </h3>
              {event.categories.length === 0 ? (
                <div className="flex items-start gap-2 rounded-xl border border-warning/40 bg-warning/10 px-4 py-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 text-warning-foreground" />
                  <p className="text-sm text-warning-foreground">
                    No race categories provided. There's nothing to verify on distances, gear, cut-offs or tickets — consider requesting changes before approving.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {event.categories.map((cat) => (
                    <CategoryCard key={cat.id} cat={cat} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Organizer side panel */}
          <aside className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-5 shadow-card">
              <div className="mb-3 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold">Organizer</h3>
              </div>
              {organizer ? (
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium">{organizer.organizationName}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                          organizer.status === "active" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
                        )}
                      >
                        {organizer.status === "active" ? "Active" : "Suspended"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Contact</p>
                    <p>{organizer.contactName}</p>
                    <p className="text-muted-foreground">{organizer.email}</p>
                    <p className="text-muted-foreground">{organizer.phone}</p>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2">
                    <span className="text-muted-foreground">Events on platform</span>
                    <span className="font-medium">{organizer.eventsCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Member since</span>
                    <span className="font-medium">{fmtDate(organizer.createdAt)}</span>
                  </div>
                </div>
              ) : !hydrated ? (
                <p className="text-sm text-muted-foreground">Loading organizer…</p>
              ) : (
                <p className="text-sm text-muted-foreground">Organizer "{event.organizerName}" not found.</p>
              )}
            </div>

            <div className="rounded-xl border border-border bg-card p-5 shadow-card text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Submitted</span>
                <span className="font-medium">{fmtDate(event.submittedDate)}</span>
              </div>
              <div className="mt-2 flex justify-between">
                <span className="text-muted-foreground">Go-live</span>
                <span className="font-medium">
                  {event.publishMode === "scheduled" && event.publishAt
                    ? format(new Date(event.publishAt), "MMM d, yyyy HH:mm")
                    : "As soon as approved"}
                </span>
              </div>
              {event.rejectionReason && (
                <div className="mt-3 rounded-lg bg-destructive/10 p-3">
                  <p className="text-xs font-medium text-destructive">Previously sent back</p>
                  <p className="mt-0.5 text-xs text-destructive">{event.rejectionReason}</p>
                </div>
              )}
            </div>

            {/* Commission — two parts, each independently overridable */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-card text-sm">
              <h3 className="mb-3 font-semibold">Commission (estimate)</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Service fee{event.serviceFeeOverride !== undefined ? " (override)" : ""}
                  </span>
                  <span className="font-medium">{formatCurrency(serviceFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Event commission{" "}
                    {event.eventCommissionOverride !== undefined
                      ? "(override)"
                      : `(${event.capacity} regs · ${bracketLabel})`}
                  </span>
                  <span className="font-medium">{formatCurrency(eventCommission)}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2">
                  <span className="font-medium">Total</span>
                  <span className="font-semibold">{formatCurrency(serviceFee + eventCommission)}</span>
                </div>
              </div>

              <div className="mt-4 border-t border-border pt-3">
                <p className="mb-1.5 text-xs text-muted-foreground">Override service fee (THB)</p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={0}
                    value={serviceFeeOverrideInput}
                    onChange={(e) => setServiceFeeOverrideInput(e.target.value)}
                    placeholder={`${serviceFee}`}
                    className="h-8 w-full rounded-md border border-border bg-background px-2 text-sm"
                  />
                  <Button size="sm" variant="outline" onClick={saveServiceFeeOverride} disabled={serviceFeeOverrideInput === ""}>Set</Button>
                </div>
                {event.serviceFeeOverride !== undefined && (
                  <button className="mt-2 text-xs text-primary hover:underline" onClick={clearServiceFeeOverride}>
                    Clear override (use standard service fee)
                  </button>
                )}
              </div>

              <div className="mt-4 border-t border-border pt-3">
                <p className="mb-1.5 text-xs text-muted-foreground">Override event commission (THB)</p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={0}
                    value={commissionOverrideInput}
                    onChange={(e) => setCommissionOverrideInput(e.target.value)}
                    placeholder={`${eventCommission}`}
                    className="h-8 w-full rounded-md border border-border bg-background px-2 text-sm"
                  />
                  <Button size="sm" variant="outline" onClick={saveCommissionOverride} disabled={commissionOverrideInput === ""}>Set</Button>
                </div>
                {event.eventCommissionOverride !== undefined && (
                  <button className="mt-2 text-xs text-primary hover:underline" onClick={clearCommissionOverride}>
                    Clear override (use standard scale)
                  </button>
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <p className="text-sm text-muted-foreground">
            {canDecide ? "Review the details, then decide." : "This event is not awaiting review."}
          </p>
          <div className="flex gap-2">
            <Button variant="destructive" disabled={!canDecide} onClick={() => setRejectOpen(true)}>
              <XCircle className="mr-1.5 h-4 w-4" />
              Request Changes
            </Button>
            <Button disabled={!canDecide} onClick={handleApprove}>
              <CheckCircle className="mr-1.5 h-4 w-4" />
              Approve
            </Button>
          </div>
        </div>
      </div>

      {/* Reject dialog */}
      <Dialog open={rejectOpen} onOpenChange={(o) => { setRejectOpen(o); if (!o) setRejectReason(""); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request Changes</DialogTitle>
            <DialogDescription>
              Tell the organizer what needs fixing on "{event.title}". They'll see this and can resubmit.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="e.g. Missing GPX route, checkpoint cut-off times incomplete..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectReason.trim()}>
              Send Back to Organizer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminEventReview;
