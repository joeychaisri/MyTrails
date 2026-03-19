import { cn } from "@/lib/utils";
import { AdminEventStatus } from "@/data/adminMockData";

interface AdminStatusBadgeProps {
  status: AdminEventStatus;
}

const AdminStatusBadge = ({ status }: AdminStatusBadgeProps) => {
  const styles: Record<AdminEventStatus, string> = {
    pending_review: "bg-warning text-warning-foreground",
    awaiting_payment: "bg-primary/15 text-primary",
    ready_to_publish: "bg-success/15 text-success",
    live: "bg-success text-success-foreground",
    draft: "bg-muted text-muted-foreground",
  };

  const labels: Record<AdminEventStatus, string> = {
    pending_review: "Pending Review",
    awaiting_payment: "Awaiting Payment",
    ready_to_publish: "Ready to Publish",
    live: "Live",
    draft: "Draft",
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
