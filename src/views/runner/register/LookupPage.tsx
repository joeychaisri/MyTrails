import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Logo from "@/components/Logo";
import { useEventsStore } from "@/contexts/EventsContext";
import { RegistrationStatus } from "@/data/mockData";
import { fmtTHB } from "./RegisterFlow";

// Runner-facing copy + badge style per registration status (same badge pattern
// as components/StatusBadge, which is EventStatus-only so not reused directly).
const STATUS_COPY: Record<RegistrationStatus, { label: string; className: string }> = {
  confirmed: { label: "Confirmed", className: "bg-success text-success-foreground" },
  awaiting_verification: { label: "Awaiting slip verification", className: "bg-warning text-warning-foreground" },
  pending_payment: { label: "Awaiting payment", className: "bg-warning text-warning-foreground" },
  payment_failed: { label: "Payment failed", className: "bg-destructive text-destructive-foreground" },
  expired: { label: "Expired", className: "bg-muted text-muted-foreground" },
  cancelled: { label: "Cancelled", className: "bg-muted text-muted-foreground" },
  refunded: { label: "Refunded", className: "bg-primary text-primary-foreground" },
};

// "mt-a1b2c3", "A1B2C3", " MT-A1B2C3 " all normalize to "MT-A1B2C3".
const normalizeCode = (raw: string) => `MT-${raw.trim().toUpperCase().replace(/^MT-/, "")}`;

// Public lookup: email + MT-XXXXXX code → current registration status.
const LookupPage = () => {
  const navigate = useNavigate();
  const { registrations, getEvent } = useEventsStore();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  // Set on submit; the match itself is derived at render so status stays live.
  const [query, setQuery] = useState<{ email: string; code: string } | null>(null);

  const registration = query
    ? registrations.find(
        (r) => r.runner.email.trim().toLowerCase() === query.email && r.code === query.code
      )
    : undefined;
  const event = registration ? getEvent(registration.eventId) : undefined;
  const category = event?.categories.find((c) => c.id === registration?.categoryId);
  const ticket = category?.tickets.find((t) => t.id === registration?.ticketId);
  const status = registration ? STATUS_COPY[registration.status] : undefined;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setQuery({ email: email.trim().toLowerCase(), code: normalizeCode(code) });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Logo size="sm" />
          <Button variant="outline" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to events
          </Button>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-1">Registration lookup</p>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Find my registration</h1>
        </div>

        {/* Lookup form */}
        <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="lookup-email">Email</Label>
              <Input
                id="lookup-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="bg-background"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lookup-code">Registration code</Label>
              <Input
                id="lookup-code"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="MT-XXXXXX"
                className="bg-background font-mono"
              />
            </div>
          </div>
          <Button type="submit">
            <Search className="mr-2 h-4 w-4" />
            Look up
          </Button>
        </form>

        {/* Result */}
        {query && !registration && (
          <p className="mt-4 text-sm text-muted-foreground">
            No registration found for that email and code.
          </p>
        )}

        {registration && status && (
          <div className="mt-6 rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                  Registration code
                </p>
                <p className="font-mono text-2xl font-bold tracking-widest text-foreground">
                  {registration.code}
                </p>
              </div>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}
              >
                {status.label}
              </span>
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm space-y-1">
              <p className="font-medium text-foreground">{event?.title ?? "Unknown event"}</p>
              {category && ticket && (
                <p className="text-muted-foreground">
                  {category.name} ({category.distance}K) · {ticket.name}
                </p>
              )}
              <p className="text-muted-foreground">
                {registration.runner.firstName} {registration.runner.lastName}
              </p>
              <p className="font-semibold text-foreground">{fmtTHB(registration.amount)}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default LookupPage;
