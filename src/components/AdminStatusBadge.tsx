import { cn } from "@/lib/utils";
import { EventStatus } from "@/data/mockData";

interface AdminStatusBadgeProps {
  status: EventStatus;
}

const AdminStatusBadge = ({ status }: AdminStatusBadgeProps) => {
  const styles: Record<EventStatus, string> = {
    draft: "bg-muted text-muted-foreground",
    pending_review: "bg-warning text-warning-foreground",
    rejected: "bg-destructive/15 text-destructive",
    ready_to_publish: "bg-primary/15 text-primary",
    live: "bg-success text-success-foreground",
    cancellation_requested: "bg-warning text-warning-foreground",
    cancelled: "bg-muted text-muted-foreground",
  };

  const labels: Record<EventStatus, string> = {
    draft: "Draft",
    pending_review: "Pending Review",
    rejected: "Rejected",
    ready_to_publish: "Ready to Publish",
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

export default AdminStatusBadge;
