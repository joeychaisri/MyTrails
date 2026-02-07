import { useState } from "react";
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
import { Search, CheckCircle, FileText } from "lucide-react";
import AdminStatusBadge from "@/components/AdminStatusBadge";
import { AdminEvent, PlatformSettings } from "@/data/adminMockData";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface AdminFinancialsProps {
  events: AdminEvent[];
  onMarkPaid: (eventId: string) => void;
  platformSettings: PlatformSettings;
}

const AdminFinancials = ({ events, onMarkPaid, platformSettings }: AdminFinancialsProps) => {
  const { toast } = useToast();
  const [search, setSearch] = useState("");

  const awaitingPayment = events.filter((e) => e.status === "awaiting_payment");

  const filtered = awaitingPayment.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.organizerName.toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", minimumFractionDigits: 0 }).format(amount);

  const handleMarkPaid = (eventId: string) => {
    onMarkPaid(eventId);
    toast({ title: "Payment Confirmed", description: "Event status updated to Ready to Publish." });
  };

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="rounded-xl border border-border bg-card shadow-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event Name</TableHead>
              <TableHead>Organizer</TableHead>
              <TableHead>Fee Amount</TableHead>
              <TableHead>Payment Proof</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  No events awaiting payment
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell>{event.organizerName}</TableCell>
                  <TableCell>{formatCurrency(event.feeAmount || platformSettings.platformFee)}</TableCell>
                  <TableCell>
                    {event.paymentProof ? (
                      <span className="inline-flex items-center gap-1 text-primary text-sm cursor-pointer hover:underline">
                        <FileText className="h-3.5 w-3.5" />
                        View
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell><AdminStatusBadge status={event.status} /></TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" onClick={() => handleMarkPaid(event.id)}>
                      <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                      Mark as Paid
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminFinancials;
