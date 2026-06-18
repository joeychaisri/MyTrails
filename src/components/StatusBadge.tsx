import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "live" | "pending" | "draft" | "cancellation_requested" | "cancelled";
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const styles: Record<StatusBadgeProps["status"], string> = {
    live: "bg-success text-success-foreground",
    pending: "bg-warning text-warning-foreground",
    draft: "bg-muted text-muted-foreground",
    cancellation_requested: "bg-warning text-warning-foreground",
    cancelled: "bg-muted text-muted-foreground",
  };

  const labels: Record<StatusBadgeProps["status"], string> = {
    live: "Live",
    pending: "Pending Review",
    draft: "Draft",
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
