import {
  ArrowRight,
  Banknote,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Landmark,
  LockKeyhole,
  ReceiptText,
  RefreshCcw,
  ShieldCheck,
  TriangleAlert,
  WalletCards,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const decisionStory = "?path=/story/experiments-not-for-build-payout-workflow-options--decision-overview";
const optionAStory = "?path=/story/experiments-not-for-build-payout-workflow-options--option-a-after-event";
const optionBStory = "?path=/story/experiments-not-for-build-payout-workflow-options--option-b-monthly";

const money = (amount: number) =>
  new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(amount);

function StoryLinks({ current }: { current: "overview" | "after-event" | "monthly" }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button asChild variant={current === "overview" ? "default" : "outline"} size="sm">
        <a href={decisionStory} target="_top">Decision overview</a>
      </Button>
      <Button asChild variant={current === "after-event" ? "default" : "outline"} size="sm">
        <a href={optionAStory} target="_top">Option A · After event</a>
      </Button>
      <Button asChild variant={current === "monthly" ? "default" : "outline"} size="sm">
        <a href={optionBStory} target="_top">Option B · Monthly</a>
      </Button>
    </div>
  );
}

function PageHeader({
  current,
  eyebrow,
  title,
  description,
}: {
  current: "overview" | "after-event" | "monthly";
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-5 border-b border-border pb-6 lg:flex-row lg:items-start lg:justify-between">
      <div className="max-w-3xl">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-warning/40 bg-warning/10 text-warning-foreground">
            Proposal · not approved
          </Badge>
          <span className="text-xs font-medium text-muted-foreground">PO decision pack · 21 Sep 2026</span>
        </div>
        <p className="text-sm font-semibold text-primary">{eyebrow}</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      <StoryLinks current={current} />
    </div>
  );
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-1 text-xl font-bold text-foreground">{value}</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{note}</p>
      </CardContent>
    </Card>
  );
}

function TimelineStep({
  number,
  title,
  detail,
  tone = "neutral",
}: {
  number: number;
  title: string;
  detail: string;
  tone?: "neutral" | "warning" | "success";
}) {
  const toneClass = {
    neutral: "border-border bg-muted text-foreground",
    warning: "border-warning/40 bg-warning/10 text-warning-foreground",
    success: "border-success/30 bg-success/10 text-success",
  }[tone];

  return (
    <div className="relative flex min-w-0 flex-1 gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${toneClass}`}>
        {number}
      </span>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p>
      </div>
    </div>
  );
}

const currentRows = [
  ["Trigger", "A payout appears only when an event already has status Payable"],
  ["Cadence", "One event-level payout; no generated payout cycle"],
  ["Admin action", "Mark Transferred changes the event to Paid"],
  ["Evidence", "Paid date only; no bank reference or transfer status"],
  ["Risk control", "14-day setting exists, but no automatic eligibility or reserve logic"],
  ["Organizer hand-off", "No payout-received state or statement"],
];

const optionCards = [
  {
    label: "Option A",
    title: "Pay after the event",
    badge: "Recommended for MVP",
    description: "Release one final payout after the event ends, the refund window closes, and Finance approves the settlement.",
    strengths: ["Simplest reconciliation", "Lowest refund and cancellation exposure", "Closest to the production data model"],
    tradeoffs: ["Organizer funds operations upfront", "Longer wait for cash", "Needs a clear hold countdown"],
    href: optionAStory,
  },
  {
    label: "Option B",
    title: "Monthly advances + final settlement",
    badge: "Later / trusted organizers",
    description: "Pay a portion of cleared sales every month, keep a reserve, then true-up fees and refunds after the event.",
    strengths: ["Better organizer cash flow", "Predictable monthly funding", "Useful for long sales periods"],
    tradeoffs: ["Requires a payout ledger", "Refund and negative-balance risk", "Final commission must be recalculated"],
    href: optionBStory,
  },
];

export function PayoutDecisionOverview() {
  return (
    <main className="min-h-screen bg-background p-5 text-foreground sm:p-8">
      <div className="mx-auto max-w-7xl space-y-7">
        <PageHeader
          current="overview"
          eyebrow="Admin · Platform Finance"
          title="Organizer payout workflow decision"
          description="Two reviewable directions for the PO. Both keep the current fee model, bank account, and Admin confirmation pattern; neither changes production until one option is approved."
        />

        <section className="rounded-xl border border-success/30 bg-success/10 p-5">
          <div className="flex gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
            <div>
              <p className="font-semibold text-foreground">Recommendation: launch Option A, design Option B as a controlled advance program</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Event payouts carry cancellation, refund, dispute, and final-fee risk. Start every organizer on one payout after the event and hold period. Add monthly payouts only for verified organizers, retain a configurable reserve, cap advances, and always run a final post-event settlement.
              </p>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Choose a direction</p>
            <h2 className="mt-1 text-2xl font-bold">Two separate workflows</h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {optionCards.map((option) => (
              <Card key={option.label} className="flex flex-col">
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge variant="outline">{option.label}</Badge>
                    <Badge className={option.label === "Option A" ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"}>
                      {option.badge}
                    </Badge>
                  </div>
                  <CardTitle className="pt-2 text-xl">{option.title}</CardTitle>
                  <CardDescription className="leading-6">{option.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-success">Why choose it</p>
                      <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                        {option.strengths.map((item) => <li key={item}>• {item}</li>)}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-warning-foreground">Trade-offs</p>
                      <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                        {option.tradeoffs.map((item) => <li key={item}>• {item}</li>)}
                      </ul>
                    </div>
                  </div>
                  <Button asChild className="mt-auto w-full sm:w-fit">
                    <a href={option.href} target="_top">Walk through {option.label}<ArrowRight className="ml-2 h-4 w-4" /></a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">What production does today</CardTitle>
              <CardDescription>This is implemented behavior, not the proposed workflow.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-left text-sm">
                  <tbody>
                    {currentRows.map(([label, value]) => (
                      <tr key={label} className="border-b border-border last:border-0">
                        <th className="w-36 bg-muted/50 px-4 py-3 font-medium text-foreground">{label}</th>
                        <td className="px-4 py-3 text-muted-foreground">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">PO decisions required</CardTitle>
              <CardDescription>These rules cannot be inferred from the current product.</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {[
                  "Is the default payout after the event or a monthly advance?",
                  "How long is the post-event refund hold? Current setting: 14 days.",
                  "Who qualifies for monthly advances, and who can suspend them?",
                  "What reserve rate and advance cap protect refunds or cancellation?",
                  "Is Finance initiating a bank transfer or recording an external transfer?",
                  "What evidence is mandatory: reference, slip, operator, and timestamp?",
                  "How are post-payout refunds and negative balances recovered?",
                ].map((item, index) => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-muted-foreground">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-foreground">{index + 1}</span>
                    {item}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </section>

        <section>
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Industry references</p>
            <h2 className="mt-1 text-2xl font-bold">Why the recommendation is structured this way</h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Post-event by default</CardTitle>
                <CardDescription className="leading-6">Eventbrite's default sends the payout after the event ends; earlier schedules are conditional rather than the baseline.</CardDescription>
              </CardHeader>
              <CardContent><Button asChild variant="outline" size="sm"><a href="https://www.eventbrite.com/help/en-us/articles/640593/" target="_blank" rel="noreferrer">Eventbrite payout guide</a></Button></CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Reserve for future losses</CardTitle>
                <CardDescription className="leading-6">Stripe documents reserves as a way for platforms to cover refunds, disputes, and negative-balance exposure.</CardDescription>
              </CardHeader>
              <CardContent><Button asChild variant="outline" size="sm"><a href="https://docs.stripe.com/api/reserves" target="_blank" rel="noreferrer">Stripe reserves</a></Button></CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Schedule + retained amount</CardTitle>
                <CardDescription className="leading-6">Adyen supports monthly schedules with payout thresholds and an amount that remains in the balance account.</CardDescription>
              </CardHeader>
              <CardContent><Button asChild variant="outline" size="sm"><a href="https://docs.adyen.com/platforms/managed-payouts" target="_blank" rel="noreferrer">Adyen managed payouts</a></Button></CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}

export function PayoutAfterEventOption() {
  const gross = 870_400;
  const refunds = 15_300;
  const eventCommission = 68_408;
  const serviceFee = 1_500;
  const payout = gross - refunds - eventCommission - serviceFee;

  return (
    <main className="min-h-screen bg-background p-5 text-foreground sm:p-8">
      <div className="mx-auto max-w-7xl space-y-7">
        <PageHeader
          current="after-event"
          eyebrow="Option A · Final settlement"
          title="Pay once after the event"
          description="The event must end before payout eligibility begins. A hold window absorbs late refunds and reconciliation issues; Finance then records one final transfer to the organizer."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Eligibility trigger" value="Event completed" note="Never payable before the event end date" />
          <Metric label="Refund hold" value="14 days" note="Existing platform setting; PO can change it" />
          <Metric label="Number of payouts" value="1 final payout" note="One statement and one bank transfer per event" />
          <Metric label="Risk level" value="Lowest" note="Funds remain available for refunds and cancellation" />
        </div>

        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">End-to-end workflow</h2>
          <div className="grid gap-3 lg:grid-cols-4">
            <TimelineStep number={1} title="Event ends" detail="Sales close and the final participant count is locked for fee calculation." />
            <TimelineStep number={2} title="14-day hold" detail="Refunds, chargebacks, and manual adjustments remain deductible." tone="warning" />
            <TimelineStep number={3} title="Finance reviews" detail="Admin verifies net payout, payout account, and any unresolved exceptions." />
            <TimelineStep number={4} title="Transfer + receipt" detail="Admin records the bank reference; Organizer receives a final statement." tone="success" />
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-xl">Ready for final payout</CardTitle>
                  <CardDescription className="mt-1">Samoeng Loop Trail Festival · Mountain Runners TH</CardDescription>
                </div>
                <Badge className="bg-success text-success-foreground">Eligible now</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {[
                  ["Gross", money(gross)],
                  ["Refunds", `−${money(refunds)}`],
                  ["Event commission", `−${money(eventCommission)}`],
                  ["Service fee", `−${money(serviceFee)}`],
                  ["Final payout", money(payout)],
                ].map(([label, value], index) => (
                  <div key={label} className={`rounded-lg border p-3 ${index === 4 ? "border-success/30 bg-success/10" : "border-border bg-muted/30"}`}>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="flex gap-3 rounded-lg border border-border p-3">
                  <CalendarClock className="h-5 w-5 shrink-0 text-primary" />
                  <div><p className="text-sm font-medium">Hold completed</p><p className="text-xs text-muted-foreground">26 Sep 2026</p></div>
                </div>
                <div className="flex gap-3 rounded-lg border border-border p-3">
                  <Landmark className="h-5 w-5 shrink-0 text-primary" />
                  <div><p className="text-sm font-medium">Verified payout account</p><p className="text-xs text-muted-foreground">SCB ···441-2</p></div>
                </div>
                <div className="flex gap-3 rounded-lg border border-border p-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
                  <div><p className="text-sm font-medium">No open exceptions</p><p className="text-xs text-muted-foreground">Refund ledger reconciled</p></div>
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
                <Button variant="outline">Download statement</Button>
                <Button><Banknote className="mr-2 h-4 w-4" />Review transfer</Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-5">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Transfer confirmation</CardTitle>
                <CardDescription>New evidence required before marking Paid.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Bank transfer reference</p>
                  <p className="mt-1 font-mono text-sm font-semibold">SCB-260926-1842</p>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Recorded by</p>
                  <p className="mt-1 text-sm font-semibold">Admin · 26 Sep 2026, 14:32</p>
                </div>
                <Button className="w-full">Confirm final payout</Button>
              </CardContent>
            </Card>

            <Card className="border-success/30 bg-success/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg"><ReceiptText className="h-5 w-5 text-success" />Organizer receipt</CardTitle>
                <CardDescription>New hand-off missing from production today.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{money(payout)}</p>
                <p className="mt-1 text-sm text-muted-foreground">Paid to SCB ···441-2 · 26 Sep 2026</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-lg font-semibold">Difference from production</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {[
              [Clock3, "Automatic eligibility", "Event end + hold date creates the Finance queue item."],
              [LockKeyhole, "Blocking checks", "Missing bank account or open refund prevents transfer."],
              [ReceiptText, "Transfer evidence", "Reference, operator, timestamp, and statement are retained."],
              [WalletCards, "Organizer outcome", "Organizer sees Paid with the same amount and destination."],
            ].map(([Icon, title, detail]) => {
              const ItemIcon = Icon as typeof Clock3;
              return <div key={String(title)} className="rounded-lg border border-border p-4"><ItemIcon className="h-5 w-5 text-primary" /><p className="mt-3 text-sm font-semibold">{String(title)}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{String(detail)}</p></div>;
            })}
          </div>
        </section>
      </div>
    </main>
  );
}

export function PayoutMonthlyOption() {
  const gross = 320_000;
  const refunds = 6_000;
  const provisionalFees = 25_120;
  const available = gross - refunds - provisionalFees;
  const reserve = Math.round(available * 0.2);
  const monthlyPayout = available - reserve;

  return (
    <main className="min-h-screen bg-background p-5 text-foreground sm:p-8">
      <div className="mx-auto max-w-7xl space-y-7">
        <PageHeader
          current="monthly"
          eyebrow="Option B · Advance program"
          title="Monthly payouts with a reserve"
          description="Eligible organizers receive a monthly advance from cleared ticket sales. MyTrails retains part of the balance for refunds and recalculates the real commission and final balance after the event."
        />

        <section className="rounded-xl border border-warning/40 bg-warning/10 p-5">
          <div className="flex gap-3">
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-warning-foreground" />
            <div>
              <p className="font-semibold">This cannot be “pay all sales every month”</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">The final registration bracket, refunds, event cancellation, and disputes are not known yet. Monthly payments should be treated as advances, not final settlements, and require a retained reserve plus a post-event true-up.</p>
            </div>
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Payout date" value="5th monthly" note="Proposal for the prior calendar month's cleared sales" />
          <Metric label="Advance rate" value="80%" note="Proposal only; 20% retained as a risk reserve" />
          <Metric label="Eligibility" value="Verified organizer" note="Completed events, verified bank, no active risk hold" />
          <Metric label="Final settlement" value="Event + 14 days" note="Recalculate fees, refunds, advances, and remaining reserve" />
        </div>

        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recurring workflow</h2>
          <div className="grid gap-3 lg:grid-cols-4">
            <TimelineStep number={1} title="Month closes" detail="Only cleared sales through the cut-off enter the batch." />
            <TimelineStep number={2} title="Apply deductions" detail="Subtract refunds and provisional fees; retain a configurable reserve." tone="warning" />
            <TimelineStep number={3} title="Finance releases batch" detail="Admin reviews exceptions and records one transfer reference for the period." />
            <TimelineStep number={4} title="Final true-up" detail="After the event, recalculate the real fee bracket and release or recover the balance." tone="success" />
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-xl">September payout batch</CardTitle>
                  <CardDescription className="mt-1">August cleared sales · Chiang Dao Skyline Ultra</CardDescription>
                </div>
                <Badge className="bg-warning text-warning-foreground">Advance · not final</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="bg-muted/50 text-xs text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Period</th>
                      <th className="px-4 py-3 text-right font-medium">Cleared sales</th>
                      <th className="px-4 py-3 text-right font-medium">Refunds</th>
                      <th className="px-4 py-3 text-right font-medium">Provisional fees</th>
                      <th className="px-4 py-3 text-right font-medium">20% reserve</th>
                      <th className="px-4 py-3 text-right font-medium">Advance</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-4"><p className="font-medium">1–31 Aug 2026</p><p className="text-xs text-muted-foreground">168 registrations settled</p></td>
                      <td className="px-4 py-4 text-right">{money(gross)}</td>
                      <td className="px-4 py-4 text-right text-muted-foreground">−{money(refunds)}</td>
                      <td className="px-4 py-4 text-right text-muted-foreground">−{money(provisionalFees)}</td>
                      <td className="px-4 py-4 text-right text-warning-foreground">−{money(reserve)}</td>
                      <td className="px-4 py-4 text-right font-bold">{money(monthlyPayout)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-border bg-muted/30 p-3"><p className="text-xs text-muted-foreground">Available before reserve</p><p className="mt-1 font-semibold">{money(available)}</p></div>
                <div className="rounded-lg border border-warning/40 bg-warning/10 p-3"><p className="text-xs text-muted-foreground">Reserve carried forward</p><p className="mt-1 font-semibold">{money(reserve)}</p></div>
                <div className="rounded-lg border border-success/30 bg-success/10 p-3"><p className="text-xs text-muted-foreground">Pay this cycle</p><p className="mt-1 font-semibold">{money(monthlyPayout)}</p></div>
              </div>

              <div className="flex flex-wrap justify-between gap-3 border-t border-border pt-4">
                <p className="max-w-xl text-xs leading-5 text-muted-foreground">The fixed service fee and final commission bracket are reconciled at final settlement. Any shortfall first consumes the reserve, then becomes a recoverable negative balance.</p>
                <Button><CircleDollarSign className="mr-2 h-4 w-4" />Review monthly advance</Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-5">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Eligibility gate</CardTitle>
                <CardDescription>Proposed rules before an organizer can enter the program.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  "Payout account verified",
                  "At least one completed event",
                  "No open dispute or compliance hold",
                  "Sales are settled, not merely charged",
                  "Advance remains below the PO-approved cap",
                ].map((item) => <div key={item} className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4 shrink-0 text-success" />{item}</div>)}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg"><RefreshCcw className="h-5 w-5 text-primary" />Final true-up</CardTitle>
                <CardDescription>Always required even after every monthly advance.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>Final net payout</p>
                <p>− all advances already paid</p>
                <p>− final refunds and fees</p>
                <p>+ remaining reserve released</p>
                <p className="border-t border-border pt-2 font-semibold text-foreground">= final payment or amount recoverable</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-lg">Difference from production</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
                <li>• Production has one payout status on the event; this option needs many payout-cycle records per event.</li>
                <li>• Production calculates one current net amount; this option needs provisional calculations and a final reconciliation.</li>
                <li>• Production has no reserve balance, eligibility tier, advance cap, or negative-balance recovery.</li>
                <li>• Production marks an event Paid once; this option keeps the event open until the final true-up completes.</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="border-warning/40">
            <CardHeader><CardTitle className="text-lg">PO must set these numbers</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {["Monthly cut-off and pay date", "Reserve percentage", "Maximum advance per event", "Organizer eligibility", "Negative-balance recovery", "Who can suspend payouts"].map((item) => (
                  <div key={item} className="rounded-lg border border-border bg-muted/30 p-3 text-sm font-medium">{item}</div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
