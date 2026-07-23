import { Badge } from "@/components/ui/badge";
import { ROLE_META, TicketRole } from "@/lib/board/boardTypes";

const RoleChip = ({ role }: { role: TicketRole }) => {
  const meta = ROLE_META[role];
  return (
    <Badge variant="outline" className={meta.className}>
      {meta.label}
    </Badge>
  );
};

export default RoleChip;
