import { cn } from "@/lib/utils";
import { EventStatus } from "@/data/mockData";

interface StatusBadgeProps {
  status: EventStatus;
}

// Organizer-facing labels for the shared event lifecycle.
const StatusBadge = ({ status }: StatusBadgeProps) => {
  const styles: Record<EventStatus, string> = {
    draft: "bg-muted text-muted-foreground",
    pending_review: "bg-warning text-warning-foreground",
    rejected: "bg-destructive text-destructive-foreground",
    ready_to_publish: "bg-primary text-primary-foreground",
    live: "bg-success text-success-foreground",
    cancellation_requested: "bg-warning text-warning-foreground",
    cancelled: "bg-muted text-muted-foreground",
  };

  const labels: Record<EventStatus, string> = {
    draft: "Draft",
    pending_review: "Pending Review",
    rejected: "Changes Requested",
    ready_to_publish: "Approved · Pending Go-Live",
    live: "Live",
    cancellation_requested: "Cancellation Pending",
    cancelled: "Cancelled",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        styles[status]
      )}
    >
      {labels[status]}
    </span>
  );
};

export default StatusBadge;
