import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Search, ShieldAlert, Eye } from "lucide-react";
import AdminStatusBadge from "@/components/AdminStatusBadge";
import { Event } from "@/data/mockData";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface AdminEventApprovalsProps {
  events: Event[];
  onForceUnpublish: (eventId: string) => void;
}

const fmtDate = (d?: string) => (d ? format(new Date(d), "MMM d, yyyy") : "—");

const AdminEventApprovals = ({ events, onForceUnpublish }: AdminEventApprovalsProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [unpublishEvent, setUnpublishEvent] = useState<Event | null>(null);

  const pendingEvents = events.filter((e) => e.status === "pending_review");
  const scheduledEvents = events.filter((e) => e.status === "scheduled");
  const liveEvents = events.filter((e) => e.status === "live");

  const filterBySearch = (list: Event[]) =>
    list.filter(
      (e) =>
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.organizerName.toLowerCase().includes(search.toLowerCase())
    );

  const handleForceUnpublish = () => {
    if (unpublishEvent) {
      onForceUnpublish(unpublishEvent.id);
      setUnpublishEvent(null);
      toast({ title: "Event Unpublished", description: "Emergency takedown completed.", variant: "destructive" });
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
          <TabsTrigger value="scheduled">Scheduled ({scheduledEvents.length})</TabsTrigger>
          <TabsTrigger value="live">Live Events ({liveEvents.length})</TabsTrigger>
        </TabsList>

        {/* Tab 1: Submission Queue — the only place admin decides */}
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
                      <TableCell>{fmtDate(event.submittedDate)}</TableCell>
                      <TableCell><AdminStatusBadge status={event.status} /></TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => navigate(`/organizer/admin/review/${event.id}`)}>
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

        {/* Tab 2: Scheduled — approved & waiting for their go-live date (informational) */}
        <TabsContent value="scheduled">
          <div className="rounded-xl border border-border bg-card shadow-card overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Name</TableHead>
                  <TableHead>Organizer</TableHead>
                  <TableHead>Goes Live</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filterBySearch(scheduledEvents).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                      No scheduled events
                    </TableCell>
                  </TableRow>
                ) : (
                  filterBySearch(scheduledEvents).map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.title}</TableCell>
                      <TableCell>{event.organizerName}</TableCell>
                      <TableCell>{event.publishAt ? format(new Date(event.publishAt), "MMM d, yyyy HH:mm") : "—"}</TableCell>
                      <TableCell><AdminStatusBadge status={event.status} /></TableCell>
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

        {/* Tab 3: Live Events */}
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
                      <TableCell>{fmtDate(event.date)}</TableCell>
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
      </Tabs>

      {/* Force Unpublish Modal — the only takedown mechanism (cancellation flow removed) */}
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
    </div>
  );
};

export default AdminEventApprovals;
