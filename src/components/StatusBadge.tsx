import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "live" | "pending" | "draft";
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const styles = {
    live: "bg-success text-success-foreground",
    pending: "bg-warning text-warning-foreground",
    draft: "bg-muted text-muted-foreground",
  };

  const labels = {
    live: "Live",
    pending: "Pending Review",
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

export default StatusBadge;
