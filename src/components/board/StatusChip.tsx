import { Badge } from "@/components/ui/badge";
import { STATUS_META, TicketStatus } from "@/lib/board/boardTypes";

const StatusChip = ({ status }: { status: TicketStatus }) => {
  const meta = STATUS_META[status];
  return (
    <Badge variant="outline" className={meta.className}>
      {meta.label}
    </Badge>
  );
};

export default StatusChip;
