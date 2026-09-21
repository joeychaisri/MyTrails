import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ArrowLeftRight,
  Banknote,
  CalendarClock,
  Check,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  ExternalLink,
  FileCheck2,
  Landmark,
  LockKeyhole,
  ReceiptText,
  RefreshCcw,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  WalletCards,
} from "lucide-react";
import Logo from "@/components/Logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

type PrototypeMode = "after-event" | "monthly";
type FinalStage = "holding" | "ready" | "review" | "paid";
type MonthlyStage = "collecting" | "ready" | "review" | "advanced" | "settled";

const formatMoney = (amount: number) =>
  new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(amount);

const finalSettlement = {
  event: "Samoeng Loop Trail Festival",
  organizer: "Mountain Runners TH",
  account: "SCB ···441-2",
  endDate: "20 Sep 2026",
  holdUntil: "4 Oct 2026",
  gross: 870_400,
  refunds: 15_300,
  eventCommission: 68_408,
  serviceFee: 1_500,
};

const finalPayout =
  finalSettlement.gross -
  finalSettlement.refunds -
  finalSettlement.eventCommission -
  finalSettlement.serviceFee;

const monthlyCycle = {
  event: "Chiang Dao Skyline Ultra",
  organizer: "Mountain Runners TH",
  account: "SCB ···441-2",
  period: "1–31 Aug 2026",
  gross: 320_000,
  refunds: 6_000,
  provisionalFees: 25_120,
  finalNetPayout: 785_192,
};

function PrototypeNotice() {
  return (
    <div className="border-b border-warning/30 bg-warning/10 px-4 py-3 text-warning-foreground">
      <div className="mx-auto flex max-w-7xl items-start gap-3">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold">Interactive prototype — no real money moves and nothing is saved</p>
          <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
            Every action on this page changes local UI state only. It does not read or write Supabase and does not affect Admin Financials.
          </p>
        </div>
      </div>
    </div>
  );
}

function Step({
  number,
  label,
  state,
}: {
  number: number;
  label: string;
  state: "upcoming" | "active" | "done";
}) {
  const styles = {
    upcoming: "border-border bg-card text-muted-foreground",
    active: "border-primary bg-primary/10 text-foreground",
    done: "border-success/30 bg-success/10 text-foreground",
  }[state];

  return (
    <div className={`flex min-w-0 flex-1 items-center gap-3 rounded-xl border p-3 ${styles}`}>
      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${state === "active" ? "bg-primary text-primary-foreground" : state === "done" ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}`}>
        {state === "done" ? <Check className="h-4 w-4" /> : number}
      </span>
      <span className="text-sm font-semibold">{label}</span>
    </div>
  );
}

function AmountTile({ label, value, emphasized = false }: { label: string; value: string; emphasized?: boolean }) {
  return (
    <div className={`rounded-lg border p-3 ${emphasized ? "border-success/30 bg-success/10" : "border-border bg-muted/30"}`}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-bold text-foreground">{value}</p>
    </div>
  );
}

function GuardRow({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-foreground">
      <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
      {children}
    </div>
  );
}

function AfterEventPrototype({
  stage,
  setStage,
  reference,
  setReference,
}: {
  stage: FinalStage;
  setStage: (stage: FinalStage) => void;
  reference: string;
  setReference: (reference: string) => void;
}) {
  const stageIndex = { holding: 0, ready: 1, review: 2, paid: 3 }[stage];
  const stepState = (index: number) => index < stageIndex ? "done" : index === stageIndex ? "active" : "upcoming";

  return (
    <div className="space-y-6">
      <div className="grid gap-3 lg:grid-cols-4">
        <Step number={1} label="Event ended" state={stepState(0)} />
        <Step number={2} label="Refund hold" state={stepState(1)} />
        <Step number={3} label="Finance review" state={stepState(2)} />
        <Step number={4} label="Paid + receipt" state={stepState(3)} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>{finalSettlement.event}</CardTitle>
                <CardDescription className="mt-1">{finalSettlement.organizer} · Event ended {finalSettlement.endDate}</CardDescription>
              </div>
              <Badge className={stage === "paid" ? "bg-success text-success-foreground" : stage === "holding" ? "bg-warning text-warning-foreground" : "bg-primary text-primary-foreground"}>
                {stage === "holding" ? "Holding refunds" : stage === "ready" ? "Ready for review" : stage === "review" ? "Awaiting confirmation" : "Paid"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <AmountTile label="Gross" value={formatMoney(finalSettlement.gross)} />
              <AmountTile label="Refunds" value={`−${formatMoney(finalSettlement.refunds)}`} />
              <AmountTile label="Event commission" value={`−${formatMoney(finalSettlement.eventCommission)}`} />
              <AmountTile label="Service fee" value={`−${formatMoney(finalSettlement.serviceFee)}`} />
              <AmountTile label="Final payout" value={formatMoney(finalPayout)} emphasized />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="flex gap-3 rounded-lg border border-border p-3">
                <CalendarClock className="h-5 w-5 shrink-0 text-primary" />
                <div><p className="text-sm font-semibold">14-day hold</p><p className="text-xs text-muted-foreground">Until {finalSettlement.holdUntil}</p></div>
              </div>
              <div className="flex gap-3 rounded-lg border border-border p-3">
                <Landmark className="h-5 w-5 shrink-0 text-primary" />
                <div><p className="text-sm font-semibold">Payout account</p><p className="text-xs text-muted-foreground">{finalSettlement.account}</p></div>
              </div>
              <div className="flex gap-3 rounded-lg border border-border p-3">
                <ShieldCheck className="h-5 w-5 shrink-0 text-success" />
                <div><p className="text-sm font-semibold">Risk checks</p><p className="text-xs text-muted-foreground">No open exception</p></div>
              </div>
            </div>

            {stage === "holding" && (
              <div className="rounded-xl border border-warning/40 bg-warning/10 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div><p className="font-semibold">Funds are still protected</p><p className="mt-1 text-sm text-muted-foreground">Use the button to simulate the refund window finishing.</p></div>
                  <Button onClick={() => setStage("ready")}><Clock3 className="mr-2 h-4 w-4" />Simulate hold complete</Button>
                </div>
              </div>
            )}

            {stage === "ready" && (
              <div className="flex flex-col gap-4 rounded-xl border border-success/30 bg-success/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div><p className="font-semibold">Payout is eligible</p><p className="mt-1 text-sm text-muted-foreground">The event ended, the hold expired, and no exception blocks payment.</p></div>
                <Button onClick={() => setStage("review")}><FileCheck2 className="mr-2 h-4 w-4" />Review transfer</Button>
              </div>
            )}

            {stage === "review" && (
              <div className="grid gap-4 rounded-xl border border-primary/30 bg-primary/5 p-4 lg:grid-cols-[1fr_auto] lg:items-end">
                <div>
                  <Label htmlFor="final-transfer-reference">Bank transfer reference</Label>
                  <Input
                    id="final-transfer-reference"
                    className="mt-2"
                    value={reference}
                    onChange={(event) => setReference(event.target.value)}
                    placeholder="e.g. SCB-041026-1842"
                  />
                  <p className="mt-2 text-xs text-muted-foreground">Required evidence before the prototype can mark this payout Paid.</p>
                </div>
                <Button disabled={!reference.trim()} onClick={() => setStage("paid")}>
                  <Banknote className="mr-2 h-4 w-4" />Confirm final payout
                </Button>
              </div>
            )}

            {stage === "paid" && (
              <div className="rounded-xl border border-success/30 bg-success/10 p-5">
                <div className="flex gap-3">
                  <CheckCircle2 className="h-6 w-6 shrink-0 text-success" />
                  <div>
                    <p className="font-semibold">Final payout recorded</p>
                    <p className="mt-1 text-sm text-muted-foreground">{formatMoney(finalPayout)} · Reference {reference} · 4 Oct 2026, 14:32</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader><CardTitle className="text-lg">Release checks</CardTitle><CardDescription>All must pass before Finance can transfer.</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <GuardRow>Event end date passed</GuardRow>
              <GuardRow>Refund hold completed</GuardRow>
              <GuardRow>Bank account verified</GuardRow>
              <GuardRow>No unresolved refund or dispute</GuardRow>
            </CardContent>
          </Card>

          <Card className={stage === "paid" ? "border-success/30 bg-success/10" : "opacity-60"}>
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><ReceiptText className="h-5 w-5" />Organizer receipt</CardTitle><CardDescription>{stage === "paid" ? "Visible after Finance confirms the transfer." : "Locked until the payout is confirmed."}</CardDescription></CardHeader>
            <CardContent>
              {stage === "paid" ? <><p className="text-2xl font-bold">{formatMoney(finalPayout)}</p><p className="mt-1 text-sm text-muted-foreground">Paid to {finalSettlement.account} · 4 Oct 2026</p></> : <div className="flex items-center gap-2 text-sm text-muted-foreground"><LockKeyhole className="h-4 w-4" />Receipt not available</div>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MonthlyPrototype({
  stage,
  setStage,
  reserveRate,
  setReserveRate,
  reference,
  setReference,
}: {
  stage: MonthlyStage;
  setStage: (stage: MonthlyStage) => void;
  reserveRate: number;
  setReserveRate: (rate: number) => void;
  reference: string;
  setReference: (reference: string) => void;
}) {
  const available = monthlyCycle.gross - monthlyCycle.refunds - monthlyCycle.provisionalFees;
  const reserve = Math.round(available * (reserveRate / 100));
  const advance = available - reserve;
  const finalBalance = monthlyCycle.finalNetPayout - advance;
  const stageIndex = { collecting: 0, ready: 1, review: 2, advanced: 3, settled: 4 }[stage];
  const stepState = (index: number) => index < stageIndex ? "done" : index === stageIndex ? "active" : "upcoming";

  return (
    <div className="space-y-6">
      <div className="grid gap-3 lg:grid-cols-5">
        <Step number={1} label="Month closes" state={stepState(0)} />
        <Step number={2} label="Batch ready" state={stepState(1)} />
        <Step number={3} label="Finance review" state={stepState(2)} />
        <Step number={4} label="Advance paid" state={stepState(3)} />
        <Step number={5} label="Final true-up" state={stepState(4)} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><CardTitle>September payout batch</CardTitle><CardDescription className="mt-1">{monthlyCycle.event} · Sales period {monthlyCycle.period}</CardDescription></div>
              <Badge className={stage === "settled" ? "bg-success text-success-foreground" : stage === "advanced" ? "bg-primary text-primary-foreground" : "bg-warning text-warning-foreground"}>
                {stage === "collecting" ? "Collecting sales" : stage === "ready" ? "Batch ready" : stage === "review" ? "Awaiting confirmation" : stage === "advanced" ? "Advance paid" : "Final settled"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-[720px] text-left text-sm">
                <caption className="sr-only">Proposed monthly payout calculation</caption>
                <thead className="bg-muted/50 text-xs text-muted-foreground"><tr><th className="px-4 py-3 font-medium">Cleared sales</th><th className="px-4 py-3 text-right font-medium">Refunds</th><th className="px-4 py-3 text-right font-medium">Provisional fees</th><th className="px-4 py-3 text-right font-medium">{reserveRate}% reserve</th><th className="px-4 py-3 text-right font-medium">Monthly advance</th></tr></thead>
                <tbody><tr><td className="px-4 py-4 font-semibold">{formatMoney(monthlyCycle.gross)}</td><td className="px-4 py-4 text-right text-muted-foreground">−{formatMoney(monthlyCycle.refunds)}</td><td className="px-4 py-4 text-right text-muted-foreground">−{formatMoney(monthlyCycle.provisionalFees)}</td><td className="px-4 py-4 text-right text-warning-foreground">−{formatMoney(reserve)}</td><td className="px-4 py-4 text-right font-bold">{formatMoney(advance)}</td></tr></tbody>
              </table>
            </div>

            {stage === "collecting" && (
              <div className="flex flex-col gap-4 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div><p className="font-semibold">August cycle is still open</p><p className="mt-1 text-sm text-muted-foreground">Close the mock cycle to calculate settled sales and deductions.</p></div>
                <Button onClick={() => setStage("ready")}><CalendarClock className="mr-2 h-4 w-4" />Close August cycle</Button>
              </div>
            )}

            {stage === "ready" && (
              <div className="flex flex-col gap-4 rounded-xl border border-success/30 bg-success/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div><p className="font-semibold">Monthly batch is ready</p><p className="mt-1 text-sm text-muted-foreground">Cleared balance, provisional deductions, and reserve have been calculated.</p></div>
                <Button onClick={() => setStage("review")}><FileCheck2 className="mr-2 h-4 w-4" />Review advance</Button>
              </div>
            )}

            {stage === "review" && (
              <div className="grid gap-4 rounded-xl border border-primary/30 bg-primary/5 p-4 lg:grid-cols-[1fr_auto] lg:items-end">
                <div><Label htmlFor="monthly-transfer-reference">Bank transfer reference</Label><Input id="monthly-transfer-reference" className="mt-2" value={reference} onChange={(event) => setReference(event.target.value)} placeholder="e.g. SCB-050926-0721" /><p className="mt-2 text-xs text-muted-foreground">This records an advance, not the event's final settlement.</p></div>
                <Button disabled={!reference.trim()} onClick={() => setStage("advanced")}><CircleDollarSign className="mr-2 h-4 w-4" />Confirm monthly advance</Button>
              </div>
            )}

            {stage === "advanced" && (
              <div className="space-y-4 rounded-xl border border-success/30 bg-success/10 p-4">
                <div className="flex gap-3"><CheckCircle2 className="h-5 w-5 shrink-0 text-success" /><div><p className="font-semibold">Monthly advance recorded</p><p className="mt-1 text-sm text-muted-foreground">{formatMoney(advance)} · Reference {reference}. The event remains open for final reconciliation.</p></div></div>
                <Button onClick={() => setStage("settled")} variant="outline"><RefreshCcw className="mr-2 h-4 w-4" />Simulate event end + final true-up</Button>
              </div>
            )}

            {stage === "settled" && (
              <div className="grid gap-3 rounded-xl border border-success/30 bg-success/10 p-4 sm:grid-cols-3">
                <div><p className="text-xs text-muted-foreground">Final net payout</p><p className="mt-1 font-bold">{formatMoney(monthlyCycle.finalNetPayout)}</p></div>
                <div><p className="text-xs text-muted-foreground">Advance already paid</p><p className="mt-1 font-bold">−{formatMoney(advance)}</p></div>
                <div><p className="text-xs text-muted-foreground">Final payment due</p><p className="mt-1 font-bold text-success">{formatMoney(finalBalance)}</p></div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader><CardTitle className="text-lg">Reserve simulator</CardTitle><CardDescription>Proposal only. Change the rate to see the monthly advance update.</CardDescription></CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-end justify-between"><div><p className="text-xs text-muted-foreground">Retain for refunds and risk</p><p className="mt-1 text-2xl font-bold">{reserveRate}%</p></div><p className="text-sm font-semibold text-warning-foreground">{formatMoney(reserve)}</p></div>
              <Slider aria-label="Reserve percentage" min={10} max={30} step={5} value={[reserveRate]} onValueChange={([value]) => setReserveRate(value)} disabled={stage === "advanced" || stage === "settled"} />
              <div className="flex justify-between text-xs text-muted-foreground"><span>10%</span><span>20%</span><span>30%</span></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Program eligibility</CardTitle><CardDescription>Required before monthly advances are enabled.</CardDescription></CardHeader>
            <CardContent className="space-y-3"><GuardRow>Verified payout account</GuardRow><GuardRow>At least one completed event</GuardRow><GuardRow>No active risk hold</GuardRow><GuardRow>Advance below approved cap</GuardRow></CardContent>
          </Card>

          <Card className={stage === "advanced" || stage === "settled" ? "border-success/30 bg-success/10" : "opacity-60"}>
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><WalletCards className="h-5 w-5" />Organizer statement</CardTitle></CardHeader>
            <CardContent>{stage === "advanced" || stage === "settled" ? <><p className="text-2xl font-bold">{formatMoney(advance)}</p><p className="mt-1 text-sm text-muted-foreground">Monthly advance to {monthlyCycle.account}</p></> : <p className="text-sm text-muted-foreground">Available after Finance confirms the batch.</p>}</CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function PayoutOptionsPrototype() {
  const [searchParams, setSearchParams] = useSearchParams();
  const mode: PrototypeMode = searchParams.get("option") === "monthly" ? "monthly" : "after-event";
  const setMode = (nextMode: PrototypeMode) => setSearchParams({ option: nextMode }, { replace: true });
  const [finalStage, setFinalStage] = useState<FinalStage>("holding");
  const [finalReference, setFinalReference] = useState("SCB-041026-1842");
  const [monthlyStage, setMonthlyStage] = useState<MonthlyStage>("collecting");
  const [monthlyReference, setMonthlyReference] = useState("SCB-050926-0721");
  const [reserveRate, setReserveRate] = useState(20);

  const reset = () => {
    setFinalStage("holding");
    setFinalReference("SCB-041026-1842");
    setMonthlyStage("collecting");
    setMonthlyReference("SCB-050926-0721");
    setReserveRate(20);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <header className="border-b border-border bg-card px-4 py-3">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3"><Logo size="sm" /><span className="hidden h-6 w-px bg-border sm:block" /><span className="text-sm font-medium text-muted-foreground">Admin payout prototype</span></div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="ghost" size="sm"><a href="/organizer/admin?page=financials">Current Financials</a></Button>
            <Button asChild variant="outline" size="sm"><a href="/journey/payout-options" target="_blank" rel="noreferrer">Decision pack<ExternalLink className="ml-2 h-3.5 w-3.5" /></a></Button>
          </div>
        </div>
      </header>
      <PrototypeNotice />

      <main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-8">
        <div className="flex flex-col gap-5 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2"><Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary"><Sparkles className="mr-1 h-3.5 w-3.5" />Clickable mockup</Badge><span className="text-xs font-medium text-muted-foreground">21 Sep 2026</span></div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Try both organizer payout workflows</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">Walk through each workflow from eligibility to the Organizer-facing receipt. The proposal keeps the production fee model but does not touch production data.</p>
          </div>
          <Button variant="ghost" size="sm" onClick={reset}><RotateCcw className="mr-2 h-4 w-4" />Reset prototype</Button>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <button type="button" onClick={() => setMode("after-event")} className={`rounded-xl border p-4 text-left transition-colors ${mode === "after-event" ? "border-primary bg-primary/10 ring-1 ring-primary" : "border-border bg-card hover:bg-muted/40"}`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="flex min-w-0 gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted"><Banknote className="h-5 w-5" /></span><div className="min-w-0"><p className="font-semibold">Option A · Pay after the event</p><p className="mt-1 text-sm text-muted-foreground">One final payout after the event and refund hold</p></div></div><Badge className="w-fit bg-success text-success-foreground">Recommended MVP</Badge></div>
          </button>
          <button type="button" onClick={() => setMode("monthly")} className={`rounded-xl border p-4 text-left transition-colors ${mode === "monthly" ? "border-primary bg-primary/10 ring-1 ring-primary" : "border-border bg-card hover:bg-muted/40"}`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="flex min-w-0 gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted"><ArrowLeftRight className="h-5 w-5" /></span><div className="min-w-0"><p className="font-semibold">Option B · Monthly advances</p><p className="mt-1 text-sm text-muted-foreground">Recurring advances, retained reserve, and final true-up</p></div></div><Badge className="w-fit bg-warning text-warning-foreground">Higher complexity</Badge></div>
          </button>
        </div>

        {mode === "monthly" && (
          <div className="flex gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4"><TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-warning-foreground" /><div><p className="font-semibold">Monthly payments are advances, not final payouts</p><p className="mt-1 text-sm text-muted-foreground">The final registration bracket, refunds, and cancellation risk are unknown before the event. The prototype therefore retains a reserve and always runs a post-event true-up.</p></div></div>
        )}

        {mode === "after-event" ? (
          <AfterEventPrototype stage={finalStage} setStage={setFinalStage} reference={finalReference} setReference={setFinalReference} />
        ) : (
          <MonthlyPrototype stage={monthlyStage} setStage={setMonthlyStage} reserveRate={reserveRate} setReserveRate={setReserveRate} reference={monthlyReference} setReference={setMonthlyReference} />
        )}

        <footer className="flex flex-col gap-3 border-t border-border py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>Prototype only · No Supabase reads or writes · No transfer API</p>
          <div className="flex items-center gap-2"><WalletCards className="h-4 w-4" /><span>Production Admin Financials remains unchanged</span></div>
        </footer>
      </main>
    </div>
  );
}
