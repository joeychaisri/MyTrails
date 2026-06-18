import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Search, CheckCircle, XCircle, ShieldAlert, Eye, Ban } from "lucide-react";
import AdminStatusBadge from "@/components/AdminStatusBadge";
import { AdminEvent } from "@/data/adminMockData";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface AdminEventApprovalsProps {
  events: AdminEvent[];
  onApprove: (eventId: string) => void;
  onReject: (eventId: string, reason: string) => void;
  onForceUnpublish: (eventId: string) => void;
  onApproveCancellation: (eventId: string) => void;
  onRejectCancellation: (eventId: string) => void;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", minimumFractionDigits: 0 }).format(amount);

const AdminEventApprovals = ({
  events,
  onApprove,
  onReject,
  onForceUnpublish,
  onApproveCancellation,
  onRejectCancellation,
}: AdminEventApprovalsProps) => {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [reviewEvent, setReviewEvent] = useState<AdminEvent | null>(null);
  const [rejectEvent, setRejectEvent] = useState<AdminEvent | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [unpublishEvent, setUnpublishEvent] = useState<AdminEvent | null>(null);
  const [cancelReviewEvent, setCancelReviewEvent] = useState<AdminEvent | null>(null);

  const pendingEvents = events.filter((e) => e.status === "pending_review");
  const liveEvents = events.filter((e) => e.status === "live");
  const cancellationEvents = events.filter((e) => e.status === "cancellation_requested");

  const filterBySearch = (list: AdminEvent[]) =>
    list.filter(
      (e) =>
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.organizerName.toLowerCase().includes(search.toLowerCase())
    );

  const handleApprove = (eventId: string) => {
    onApprove(eventId);
    setReviewEvent(null);
    toast({ title: "Event Approved", description: "Status changed to Awaiting Payment." });
  };

  const handleReject = () => {
    if (rejectEvent && rejectReason.trim()) {
      onReject(rejectEvent.id, rejectReason);
      setRejectEvent(null);
      setRejectReason("");
      toast({ title: "Event Rejected", description: "Status reverted to Draft." });
    }
  };

  const handleForceUnpublish = () => {
    if (unpublishEvent) {
      onForceUnpublish(unpublishEvent.id);
      setUnpublishEvent(null);
      toast({ title: "Event Unpublished", description: "Emergency takedown completed.", variant: "destructive" });
    }
  };

  const handleApproveCancellation = () => {
    if (cancelReviewEvent) {
      onApproveCancellation(cancelReviewEvent.id);
      setCancelReviewEvent(null);
      toast({ title: "Cancellation Approved", description: "Event cancelled and refunds initiated for all runners." });
    }
  };

  const handleRejectCancellation = () => {
    if (cancelReviewEvent) {
      onRejectCancellation(cancelReviewEvent.id);
      setCancelReviewEvent(null);
      toast({ title: "Cancellation Rejected", description: "The event remains live.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Tabs defaultValue="queue">
        <TabsList>
          <TabsTrigger value="queue">Submission Queue ({pendingEvents.length})</TabsTrigger>
          <TabsTrigger value="live">Live Events ({liveEvents.length})</TabsTrigger>
          <TabsTrigger value="cancellations">Cancellation Requests ({cancellationEvents.length})</TabsTrigger>
        </TabsList>

        {/* Tab 1: Submission Queue */}
        <TabsContent value="queue">
          <div className="rounded-xl border border-border bg-card shadow-card overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Name</TableHead>
                  <TableHead>Organizer</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filterBySearch(pendingEvents).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                      No events pending review
                    </TableCell>
                  </TableRow>
                ) : (
                  filterBySearch(pendingEvents).map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.title}</TableCell>
                      <TableCell>{event.organizerName}</TableCell>
                      <TableCell>{format(new Date(event.submittedDate), "MMM d, yyyy")}</TableCell>
                      <TableCell><AdminStatusBadge status={event.status} /></TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => setReviewEvent(event)}>
                          <Eye className="mr-1.5 h-3.5 w-3.5" />
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Tab 2: Live Events */}
        <TabsContent value="live">
          <div className="rounded-xl border border-border bg-card shadow-card overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Name</TableHead>
                  <TableHead>Organizer</TableHead>
                  <TableHead>Event Date</TableHead>
                  <TableHead>Sold / Cap</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filterBySearch(liveEvents).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                      No live events
                    </TableCell>
                  </TableRow>
                ) : (
                  filterBySearch(liveEvents).map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.title}</TableCell>
                      <TableCell>{event.organizerName}</TableCell>
                      <TableCell>{format(new Date(event.date), "MMM d, yyyy")}</TableCell>
                      <TableCell>{event.sold} / {event.capacity}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="destructive" onClick={() => setUnpublishEvent(event)}>
                          <ShieldAlert className="mr-1.5 h-3.5 w-3.5" />
                          Force Unpublish
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Tab 3: Cancellation Requests */}
        <TabsContent value="cancellations">
          <div className="rounded-xl border border-border bg-card shadow-card overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Name</TableHead>
                  <TableHead>Organizer</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Runners / Refund</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filterBySearch(cancellationEvents).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                      No cancellation requests
                    </TableCell>
                  </TableRow>
                ) : (
                  filterBySearch(cancellationEvents).map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.title}</TableCell>
                      <TableCell>{event.organizerName}</TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground">{event.cancellationReason}</TableCell>
                      <TableCell>
                        {event.sold}
                        {event.refundAmount ? ` · ${formatCurrency(event.refundAmount)}` : ""}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => setCancelReviewEvent(event)}>
                          <Eye className="mr-1.5 h-3.5 w-3.5" />
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Review Modal */}
      <Dialog open={!!reviewEvent} onOpenChange={() => setReviewEvent(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Event</DialogTitle>
            <DialogDescription>Review the event details before approving or rejecting.</DialogDescription>
          </DialogHeader>
          {reviewEvent && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-muted-foreground">Event Name</p>
                  <p className="font-medium">{reviewEvent.title}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Organizer</p>
                  <p className="font-medium">{reviewEvent.organizerName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Province</p>
                  <p className="font-medium">{reviewEvent.province}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Event Date</p>
                  <p className="font-medium">{format(new Date(reviewEvent.date), "MMM d, yyyy")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Capacity</p>
                  <p className="font-medium">{reviewEvent.capacity}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Submitted</p>
                  <p className="font-medium">{format(new Date(reviewEvent.submittedDate), "MMM d, yyyy")}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="destructive" onClick={() => { setRejectEvent(reviewEvent); setReviewEvent(null); }}>
              <XCircle className="mr-1.5 h-4 w-4" />
              Reject
            </Button>
            <Button onClick={() => reviewEvent && handleApprove(reviewEvent.id)}>
              <CheckCircle className="mr-1.5 h-4 w-4" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={!!rejectEvent} onOpenChange={() => { setRejectEvent(null); setRejectReason(""); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Event</DialogTitle>
            <DialogDescription>Provide a reason for rejecting "{rejectEvent?.title}".</DialogDescription>
          </DialogHeader>
          <Textarea placeholder="Enter rejection reason..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3} />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRejectEvent(null); setRejectReason(""); }}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectReason.trim()}>Confirm Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Force Unpublish Modal */}
      <Dialog open={!!unpublishEvent} onOpenChange={() => setUnpublishEvent(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Force Unpublish</DialogTitle>
            <DialogDescription>
              This will immediately take down "{unpublishEvent?.title}" and revert it to Draft status. This action cannot be undone easily.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUnpublishEvent(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleForceUnpublish}>Confirm Unpublish</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancellation Review Modal */}
      <Dialog open={!!cancelReviewEvent} onOpenChange={() => setCancelReviewEvent(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Review Cancellation Request</DialogTitle>
            <DialogDescription>
              Approving cancels the event and refunds all registered runners. Rejecting keeps it live.
            </DialogDescription>
          </DialogHeader>
          {cancelReviewEvent && (
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Event</p>
                <p className="font-medium">{cancelReviewEvent.title}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Organizer</p>
                <p className="font-medium">{cancelReviewEvent.organizerName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Reason</p>
                <p className="font-medium">{cancelReviewEvent.cancellationReason}</p>
              </div>
              <div className="rounded-lg bg-muted p-3">
                <p className="text-muted-foreground">Refund impact</p>
                <p className="font-medium">
                  {cancelReviewEvent.sold} runners
                  {cancelReviewEvent.refundAmount ? ` · ${formatCurrency(cancelReviewEvent.refundAmount)}` : ""}
                </p>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleRejectCancellation}>
              <XCircle className="mr-1.5 h-4 w-4" />
              Reject (keep live)
            </Button>
            <Button variant="destructive" onClick={handleApproveCancellation}>
              <Ban className="mr-1.5 h-4 w-4" />
              Approve Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminEventApprovals;
