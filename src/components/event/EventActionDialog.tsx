import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Event } from "@/data/mockData";

export type EventActionMode = "delete" | "cancel";

interface EventActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event | null;
  mode: EventActionMode;
  onConfirm: (event: Event, reason?: string) => void;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", minimumFractionDigits: 0 }).format(amount);

const EventActionDialog = ({ open, onOpenChange, event, mode, onConfirm }: EventActionDialogProps) => {
  const [reason, setReason] = useState("");
  const isCancel = mode === "cancel";

  // Reset the reason whenever the dialog (re)opens.
  useEffect(() => {
    if (open) setReason("");
  }, [open]);

  if (!event) return null;

  const handleConfirm = () => {
    if (isCancel && !reason.trim()) return;
    onConfirm(event, isCancel ? reason.trim() : undefined);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isCancel ? "Cancel this event?" : "Delete this event?"}</DialogTitle>
          <DialogDescription>
            {isCancel ? (
              <>
                Cancelling <span className="font-medium text-foreground">{event.title}</span> affects{" "}
                <span className="font-medium text-foreground">{event.sold}</span> registered runners
                {" "}({formatCurrency(event.revenue)}). Refunds are issued per the cancellation policy. This request
                is sent to the platform admin for approval before it takes effect.
              </>
            ) : (
              <>
                <span className="font-medium text-foreground">{event.title}</span> will be permanently deleted. This
                can&apos;t be undone.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {isCancel && (
          <div className="space-y-2">
            <Label htmlFor="cancel-reason">Reason for cancellation</Label>
            <Textarea
              id="cancel-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Venue no longer available, insufficient registrations…"
              rows={3}
            />
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Keep event
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isCancel && !reason.trim()}>
            {isCancel ? "Request Cancellation" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EventActionDialog;
