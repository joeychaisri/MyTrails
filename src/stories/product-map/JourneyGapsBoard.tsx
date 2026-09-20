import { AlertCircle, CheckCircle2, ExternalLink, ListTodo } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  allGaps,
  completeJourneys,
  incompleteJourneys,
  journeys,
  roleMeta,
  type GapKind,
  type GapPriority,
  type GapStatus,
  type ProductJourney,
  type ProductRole,
} from "./journeyCatalog";

const roleOrder: ProductRole[] = ["runner", "organizer", "admin"];

const kindMeta: Record<GapKind, { label: string; className: string }> = {
  "dead-end": {
    label: "Dead end",
    className: "border-destructive/30 bg-destructive/10 text-destructive",
  },
  "missing-state": {
    label: "Missing state",
    className: "border-warning/40 bg-warning/15 text-warning-foreground",
  },
  "missing-outcome": {
    label: "Missing outcome",
    className: "border-primary/30 bg-primary/10 text-primary",
  },
};

const priorityMeta: Record<GapPriority, { label: string; className: string }> = {
  core: {
    label: "Core",
    className: "border-foreground/20 bg-foreground/5 text-foreground",
  },
  supporting: {
    label: "Supporting",
    className: "border-border bg-muted text-muted-foreground",
  },
};

const statusMeta: Record<GapStatus, { label: string; className: string }> = {
  open: {
    label: "Open",
    className: "border-destructive/30 bg-destructive/10 text-destructive",
  },
  "in-progress": {
    label: "In progress",
    className: "border-warning/40 bg-warning/15 text-warning-foreground",
  },
};

const liveHref = (route: string) => `https://mytrails.theingress.co${route}`;

function GapBadge({ value, type }: { value: GapKind | GapPriority | GapStatus; type: "kind" | "priority" | "status" }) {
  const meta = type === "kind"
    ? kindMeta[value as GapKind]
    : type === "priority"
      ? priorityMeta[value as GapPriority]
      : statusMeta[value as GapStatus];

  return <Badge variant="outline" className={meta.className}>{meta.label}</Badge>;
}

function JourneyGapCard({ journey }: { journey: ProductJourney }) {
  const coreCount = journey.gaps.filter((item) => item.priority === "core").length;

  return (
    <article id={`journey-${journey.id}`} className="scroll-mt-4 rounded-xl border bg-card text-card-foreground shadow-card">
      <header className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {roleMeta[journey.role].label} · Journey {journey.id}
            </p>
            <Badge variant="outline">{journey.gaps.length} open</Badge>
            {coreCount > 0 ? <Badge variant="destructive">{coreCount} core</Badge> : null}
          </div>
          <h3 className="mt-1 text-xl font-semibold">{journey.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{journey.goal}</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <a href={`?path=/docs/product-map--docs#journey-${journey.id}`} target="_top">Open in Product Map</a>
        </Button>
      </header>

      <ol className="divide-y">
        {journey.gaps.map((item, index) => (
          <li className="grid gap-3 p-4 md:grid-cols-[32px_minmax(0,1fr)_auto]" key={item.id}>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10 text-sm font-semibold text-destructive">
              {index + 1}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-semibold text-foreground">{item.title}</h4>
                <GapBadge value={item.status} type="status" />
                <GapBadge value={item.kind} type="kind" />
                <GapBadge value={item.priority} type="priority" />
              </div>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.detail}</p>
            </div>
            {item.route ? (
              <Button asChild variant="ghost" size="sm">
                <a href={liveHref(item.route)} target="_blank" rel="noreferrer">
                  Live route <ExternalLink className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </Button>
            ) : null}
          </li>
        ))}
      </ol>
    </article>
  );
}

export function JourneyGapsBoard() {
  const coreGaps = allGaps.filter((item) => item.priority === "core");
  const inProgress = allGaps.filter((item) => item.status === "in-progress");

  return (
    <main className="mx-auto max-w-6xl space-y-6 py-4 text-foreground">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <ListTodo className="h-4 w-4" aria-hidden="true" />
            Mockup completeness backlog
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Journey gaps</h1>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            This page answers one question: which user journeys are still incomplete as an end-to-end mockup? Remove a gap only when the missing state, action or visible outcome exists and is reviewable.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline"><a href="?path=/docs/product-map--docs" target="_top">Product Map</a></Button>
          <Button asChild variant="outline"><a href="?path=/docs/build-status--docs" target="_top">Build Status</a></Button>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Gap summary">
        <div className="rounded-xl border bg-card p-4 shadow-card">
          <p className="text-sm text-muted-foreground">Journeys audited</p>
          <p className="mt-1 text-3xl font-bold">{journeys.length}</p>
        </div>
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 shadow-card">
          <p className="text-sm text-muted-foreground">Incomplete journeys</p>
          <p className="mt-1 text-3xl font-bold text-destructive">{incompleteJourneys.length}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-card">
          <p className="text-sm text-muted-foreground">Open gaps</p>
          <p className="mt-1 text-3xl font-bold">{allGaps.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">{coreGaps.length} core · {allGaps.length - coreGaps.length} supporting</p>
        </div>
        <div className="rounded-xl border border-success/30 bg-success/5 p-4 shadow-card">
          <p className="text-sm text-muted-foreground">Complete journeys</p>
          <p className="mt-1 text-3xl font-bold text-success">{completeJourneys.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">{inProgress.length} gap items in progress</p>
        </div>
      </section>

      <aside className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-warning-foreground" aria-hidden="true" />
        <div>
          <p className="font-semibold">Coverage is not UX approval</p>
          <p className="mt-1 text-muted-foreground">
            Journey Gaps tracks missing mockup work. Build Status separately tracks Joey's Locked, Tentative or Draft decision, and Product Map tracks the screens that already exist.
          </p>
        </div>
      </aside>

      {roleOrder.map((role) => {
        const roleJourneys = incompleteJourneys.filter((journey) => journey.role === role);
        if (roleJourneys.length === 0) return null;
        return (
          <section className="space-y-3" key={role}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">{roleMeta[role].label}</p>
              <h2 className="mt-1 text-2xl font-bold">Incomplete {roleMeta[role].label} journeys</h2>
            </div>
            {roleJourneys.map((journey) => <JourneyGapCard journey={journey} key={journey.id} />)}
          </section>
        );
      })}

      <section className="rounded-xl border border-success/30 bg-success/5 p-4">
        <div className="flex items-center gap-2 text-success">
          <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          <h2 className="font-semibold">Audited with no open gaps</h2>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {completeJourneys.length > 0
            ? completeJourneys.map((journey) => `J${journey.id} ${journey.name}`).join(" · ")
            : "None yet."}
        </p>
      </section>
    </main>
  );
}
