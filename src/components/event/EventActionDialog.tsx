import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Event } from "@/data/mockData";

// The cancellation flow was removed — the only destructive organizer action left
// is deleting an unsold event.
export type EventActionMode = "delete";

interface EventActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event | null;
  mode?: EventActionMode;
  onConfirm: (event: Event) => void;
}

const EventActionDialog = ({ open, onOpenChange, event, onConfirm }: EventActionDialogProps) => {
  if (!event) return null;

  const handleConfirm = () => {
    onConfirm(event);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete this event?</DialogTitle>
          <DialogDescription>
            <span className="font-medium text-foreground">{event.title}</span> will be permanently deleted. This
            can&apos;t be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Keep event
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EventActionDialog;
