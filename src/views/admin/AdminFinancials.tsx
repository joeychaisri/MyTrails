import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Banknote, Landmark, Wallet, Receipt } from "lucide-react";
import StatsCard from "@/components/StatsCard";
import { Event } from "@/data/mockData";
import { AdminOrganizer, PlatformSettings } from "@/data/adminMockData";
import { eventFinance } from "@/contexts/EventsContext";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface AdminFinancialsProps {
  events: Event[];
  organizers: AdminOrganizer[];
  settings: PlatformSettings;
  onMarkPaid: (eventId: string) => void;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", minimumFractionDigits: 0 }).format(amount);

const fmtDate = (d?: string) => (d ? format(new Date(d), "MMM d, yyyy") : "—");

const AdminFinancials = ({ events, organizers, settings, onMarkPaid }: AdminFinancialsProps) => {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  // Marking a payout transferred records that real money was sent and can't be
  // undone in-app — so confirm first (same pattern as Force Unpublish).
  const [confirmEvent, setConfirmEvent] = useState<Event | null>(null);

  const payoutAccountFor = (organizerId: string) =>
    organizers.find((o) => o.id === organizerId)?.payoutAccount ?? "—";

  const matchesSearch = (e: Event) =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.organizerName.toLowerCase().includes(search.toLowerCase());

  // An event carries registration money once it's live and has sales.
  const withMoney = events.filter((e) => (e.grossSales ?? 0) > 0);
  const payableEvents = withMoney.filter((e) => e.payoutStatus === "payable").filter(matchesSearch);
  const paidEvents = withMoney.filter((e) => e.payoutStatus === "paid").filter(matchesSearch);
  const refundEvents = withMoney.filter((e) => (e.refundedAmount ?? 0) > 0).filter(matchesSearch);

  // Escrow rollup across all events (search-independent).
  const sumNet = (list: Event[]) => list.reduce((s, e) => s + eventFinance(e, organizers, settings).netPayout, 0);
  const heldTotal = sumNet(withMoney.filter((e) => e.payoutStatus === "held"));
  const payableTotal = sumNet(withMoney.filter((e) => e.payoutStatus === "payable"));
  const paidTotal = sumNet(withMoney.filter((e) => e.payoutStatus === "paid"));
  const commissionTotal = withMoney
    .filter((e) => e.payoutStatus !== undefined)
    .reduce((s, e) => s + eventFinance(e, organizers, settings).totalCommission, 0);

  const handleMarkPaid = () => {
    if (!confirmEvent) return;
    const event = confirmEvent;
    onMarkPaid(event.id);
    const { netPayout } = eventFinance(event, organizers, settings);
    toast({ title: "Payout Transferred", description: `${formatCurrency(netPayout)} marked as sent to ${event.organizerName}.` });
    setConfirmEvent(null);
  };

  return (
    <div className="space-y-6">
      {/* Escrow rollup */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Held in Escrow" value={formatCurrency(heldTotal)} icon={Landmark} subtitle="Events in progress" />
        <StatsCard title="Payable Now" value={formatCurrency(payableTotal)} icon={Wallet} subtitle="Ready to transfer" />
        <StatsCard title="Paid Out" value={formatCurrency(paidTotal)} icon={Banknote} subtitle="Transferred to organizers" />
        <StatsCard title="Commission Earned" value={formatCurrency(commissionTotal)} icon={Receipt} subtitle="Platform take" />
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Tabs defaultValue="queue">
        <TabsList>
          <TabsTrigger value="queue">Payout Queue ({payableEvents.length})</TabsTrigger>
          <TabsTrigger value="paid">Paid ({paidEvents.length})</TabsTrigger>
          <TabsTrigger value="refunds">Refunds ({refundEvents.length})</TabsTrigger>
        </TabsList>

        {/* Payout Queue — completed events past their hold window */}
        <TabsContent value="queue">
          <div className="rounded-xl border border-border bg-card shadow-card overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event / Organizer</TableHead>
                  <TableHead className="text-right">Gross</TableHead>
                  <TableHead className="text-right">Refunds</TableHead>
                  <TableHead className="text-right">Commission</TableHead>
                  <TableHead className="text-right">Net Payout</TableHead>
                  <TableHead>Payout To</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payableEvents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                      No payouts due
                    </TableCell>
                  </TableRow>
                ) : (
                  payableEvents.map((event) => {
                    const f = eventFinance(event, organizers, settings);
                    return (
                      <TableRow key={event.id}>
                        <TableCell>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-xs text-muted-foreground">{event.organizerName} · {fmtDate(event.date)}</p>
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(f.gross)}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{f.refunded ? `−${formatCurrency(f.refunded)}` : "—"}</TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          −{formatCurrency(f.totalCommission)}
                          <span className="block text-[10px]">evt {formatCurrency(f.eventCommission)} · service {formatCurrency(f.serviceFee)}</span>
                        </TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(f.netPayout)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{payoutAccountFor(event.organizerId)}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" onClick={() => setConfirmEvent(event)}>
                            <Banknote className="mr-1.5 h-3.5 w-3.5" />
                            Mark Transferred
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Paid history */}
        <TabsContent value="paid">
          <div className="rounded-xl border border-border bg-card shadow-card overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event / Organizer</TableHead>
                  <TableHead className="text-right">Net Payout</TableHead>
                  <TableHead className="text-right">Commission</TableHead>
                  <TableHead>Paid On</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paidEvents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                      No payouts transferred yet
                    </TableCell>
                  </TableRow>
                ) : (
                  paidEvents.map((event) => {
                    const f = eventFinance(event, organizers, settings);
                    return (
                      <TableRow key={event.id}>
                        <TableCell>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-xs text-muted-foreground">{event.organizerName}</p>
                        </TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(f.netPayout)}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{formatCurrency(f.totalCommission)}</TableCell>
                        <TableCell>{fmtDate(event.payoutDate)}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Refund ledger */}
        <TabsContent value="refunds">
          <div className="rounded-xl border border-border bg-card shadow-card overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event / Organizer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Runners</TableHead>
                  <TableHead className="text-right">Refunded</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {refundEvents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                      No refunds on record
                    </TableCell>
                  </TableRow>
                ) : (
                  refundEvents.map((event) => {
                    const refunded = event.refundedAmount ?? 0;
                    return (
                      <TableRow key={event.id}>
                        <TableCell>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-xs text-muted-foreground">{event.organizerName}</p>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">Partial refunds</TableCell>
                        <TableCell className="text-right">{event.sold}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{formatCurrency(refunded)}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Confirm before recording a transfer — it's an irreversible money action. */}
      <Dialog open={!!confirmEvent} onOpenChange={() => setConfirmEvent(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Mark payout as transferred?</DialogTitle>
            <DialogDescription>
              {confirmEvent
                ? `Confirm you've sent ${formatCurrency(eventFinance(confirmEvent, organizers, settings).netPayout)} to ${confirmEvent.organizerName} (${payoutAccountFor(confirmEvent.organizerId)}) for "${confirmEvent.title}". This records the payout as paid and can't be undone here.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmEvent(null)}>Cancel</Button>
            <Button onClick={handleMarkPaid}>Confirm Transfer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminFinancials;
