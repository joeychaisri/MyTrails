import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  CalendarRange,
  ExternalLink,
  GitBranch,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  journeys,
  roleMeta,
  uxStatusMeta,
  type JourneyScreen,
  type ProductJourney,
  type ProductRole,
  type UxStatus,
} from "./journeyCatalog";

const roleIcons = {
  runner: UserRound,
  organizer: CalendarRange,
  admin: ShieldCheck,
} satisfies Record<ProductRole, typeof UserRound>;

const uxBadgeClasses: Record<UxStatus, string> = {
  locked: "border-success/30 bg-success/10 text-success",
  tentative: "border-warning/40 bg-warning/15 text-warning-foreground",
  draft: "border-destructive/30 bg-destructive/10 text-destructive",
  unclassified: "border-border bg-muted text-muted-foreground",
};

const laneMeta: Record<ProductRole, { start: string; finish: string }> = {
  runner: { start: "Public discovery", finish: "Registration submitted" },
  organizer: { start: "Event creation", finish: "Operations + payout" },
  admin: { start: "Platform review", finish: "Publishing + finance control" },
};

const handoffs = [
  { from: "Organizer · J5", action: "Submit for review", to: "Admin · J9", direction: "down" },
  { from: "Admin · J9", action: "Approve → event becomes public", to: "Runner · J1", direction: "up" },
  { from: "Admin · J9", action: "Reject with reason", to: "Organizer · J6", direction: "up" },
  { from: "Runner · J3", action: "Create order + participant", to: "Organizer · J7/J8", direction: "down" },
  { from: "Admin · J10", action: "Mark payout paid", to: "Organizer · J8", direction: "up" },
] as const;

const storyHref = (storyId: string) => `?path=/story/${storyId}`;
const liveHref = (route: string) => `https://mytrails.theingress.co${route}`;

function StatusBadge({ status }: { status: UxStatus }) {
  return (
    <Badge variant="outline" className={uxBadgeClasses[status]} title={uxStatusMeta[status].short}>
      {uxStatusMeta[status].label}
    </Badge>
  );
}

function ScreenNode({ item, index }: { item: JourneyScreen; index: number }) {
  return (
    <li className="flex min-w-0 items-stretch gap-1" title={[item.purpose, item.route].filter(Boolean).join(" · ")}>
      <a
        className="group flex min-w-0 flex-1 items-center justify-between gap-2 rounded-md border border-primary/20 bg-background px-2 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        href={storyHref(item.storyId)}
        target="_top"
      >
        <span className="truncate">{index + 1}. {item.name}</span>
        <ArrowRight className="h-3 w-3 shrink-0 opacity-50 transition-transform group-hover:translate-x-0.5 group-hover:opacity-100" aria-hidden="true" />
      </a>
      {item.route ? (
        <a
          className="flex w-7 shrink-0 items-center justify-center rounded-md border bg-background text-muted-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          href={liveHref(item.route)}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open ${item.name} in the live app`}
          title={`Live route: ${item.route}`}
        >
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </a>
      ) : null}
    </li>
  );
}

function JourneyNode({ journey }: { journey: ProductJourney }) {
  return (
    <article className="flex w-0 min-w-0 flex-1 flex-col rounded-xl border bg-card p-3 text-card-foreground shadow-card">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Journey {journey.id}</p>
          <h3 className="mt-1 text-base font-semibold leading-tight">{journey.name}</h3>
        </div>
        <StatusBadge status={journey.uxStatus} />
      </div>
      <p className="mt-1.5 min-h-8 text-xs text-muted-foreground">{journey.goal}</p>
      <ol className="mt-2 space-y-1">
        {journey.screens.map((item, index) => <ScreenNode item={item} index={index} key={item.storyId} />)}
      </ol>
      <p className="mt-auto pt-2 text-[11px] text-muted-foreground">
        {journey.verification === "verified" ? `Flow checked ${journey.verifiedDate}` : "Flow not UX-verified"}
      </p>
    </article>
  );
}

function FlowArrow() {
  return (
    <div className="flex w-7 shrink-0 items-center justify-center text-muted-foreground" aria-hidden="true">
      <ArrowRight className="h-4 w-4" />
    </div>
  );
}

function FlowLane({ role }: { role: ProductRole }) {
  const Icon = roleIcons[role];
  const roleJourneys = journeys.filter((journey) => journey.role === role);

  return (
    <section className="grid grid-cols-[150px_1fr] border-b" aria-labelledby={`${role}-lane-title`}>
      <header className="border-r bg-muted/40 p-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <h2 id={`${role}-lane-title`} className="mt-3 text-lg font-bold">{roleMeta[role].label}</h2>
        <p className="mt-1 text-xs text-muted-foreground">{roleMeta[role].description}</p>
        <div className="mt-4 space-y-2 border-t pt-3 text-[11px] text-muted-foreground">
          <p><span className="font-semibold text-foreground">Start:</span> {laneMeta[role].start}</p>
          <p><span className="font-semibold text-foreground">Finish:</span> {laneMeta[role].finish}</p>
        </div>
      </header>
      <div className="flex items-stretch p-3">
        {roleJourneys.map((journey, index) => (
          <div className="contents" key={journey.id}>
            <JourneyNode journey={journey} />
            {index < roleJourneys.length - 1 ? <FlowArrow /> : null}
          </div>
        ))}
      </div>
    </section>
  );
}

function HandoffRail() {
  return (
    <section className="grid grid-cols-[150px_1fr] bg-muted/20" aria-label="Cross-role hand-offs">
      <div className="border-r p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Cross-role</p>
        <p className="mt-1 text-xs text-muted-foreground">Data and decisions moving between lanes</p>
      </div>
      <div className="grid grid-cols-5 gap-2 p-3">
        {handoffs.map((handoff) => (
          <div key={`${handoff.from}-${handoff.to}`} className="rounded-lg border border-dashed bg-background px-3 py-2 text-xs">
            <div className="flex items-center gap-1 font-semibold text-foreground">
              {handoff.direction === "down" ? <ArrowDown className="h-3 w-3 text-primary" /> : <ArrowUpRight className="h-3 w-3 text-primary" />}
              {handoff.action}
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">{handoff.from} → {handoff.to}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function BirdsEyeProductMap() {
  return (
    <main className="relative left-1/2 w-[calc(100vw-32px)] max-w-none -translate-x-1/2 space-y-4 py-4 text-foreground sm:w-[calc(100vw-64px)] sm:px-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <GitBranch className="h-4 w-4" aria-hidden="true" />
            Interactive product flow
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">MyTrails bird’s-eye map</h1>
          <p className="mt-3 text-base text-muted-foreground">
            Read each lane left → right. Click any page name to inspect that exact Storybook state; use ↗ to open its live route.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline"><a href="?path=/docs/build-status--docs" target="_top">Build Status</a></Button>
          <Button asChild variant="outline"><a href="?path=/docs/journey-map--docs" target="_top">Journey definitions</a></Button>
          <Button asChild>
            <a href="https://mytrails.theingress.co/board" target="_blank" rel="noreferrer">Ask UX <ExternalLink aria-hidden="true" /></a>
          </Button>
        </div>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/30 px-4 py-3 text-xs">
        <p className="font-medium">Page names open Storybook · ↗ opens the live app</p>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status="locked" />
          <StatusBadge status="tentative" />
          <StatusBadge status="draft" />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-background shadow-card">
        <div className="min-w-[1280px]">
          <FlowLane role="runner" />
          <FlowLane role="organizer" />
          <FlowLane role="admin" />
          <HandoffRail />
        </div>
      </div>

      <footer className="rounded-xl border bg-muted/40 p-4 text-sm text-muted-foreground">
        UX status is owned by Joey. A clickable page means the screen is built and inspectable—not necessarily final.
      </footer>
    </main>
  );
}
