import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Logo from "@/components/Logo";
import StatusChip from "@/components/board/StatusChip";
import RoleChip from "@/components/board/RoleChip";
import NewTopicModal from "@/components/board/NewTopicModal";
import { fetchTickets, createTicket, getBoardClient, CreateTicketInput } from "@/lib/board/boardApi";
import { STATUS_META, STATUS_ORDER, Ticket, TicketStatus } from "@/lib/board/boardTypes";
import { useToast } from "@/hooks/use-toast";

const fmt = (s: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(s));

const BoardListView = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TicketStatus | "all">("all");
  const [modalOpen, setModalOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setTickets(await fetchTickets(getBoardClient()));
    } catch (e) {
      toast({ title: "Could not load the board", description: String(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (input: CreateTicketInput) => {
    const id = await createTicket(getBoardClient(), input);
    navigate(`/board/${id}`);
  };

  const shown = filter === "all" ? tickets : tickets.filter((t) => t.status === filter);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Logo size="sm" />
            <div className="hidden h-6 w-px bg-border sm:block" />
            <h1 className="text-lg font-semibold text-foreground">Support board</h1>
          </div>
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New topic
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 flex flex-wrap gap-2">
          <FilterChip label="All" active={filter === "all"} onClick={() => setFilter("all")} />
          {STATUS_ORDER.map((s) => (
            <FilterChip key={s} label={STATUS_META[s].label} active={filter === s} onClick={() => setFilter(s)} />
          ))}
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : shown.length === 0 ? (
          <p className="text-sm text-muted-foreground">No topics yet. Start one with “New topic”.</p>
        ) : (
          <div className="space-y-3">
            {shown.map((t) => (
              <Card key={t.id} className="cursor-pointer p-4 transition-colors hover:bg-accent"
                onClick={() => navigate(`/board/${t.id}`)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="mb-1 flex items-center gap-2">
                      <StatusChip status={t.status} />
                      <RoleChip role={t.createdByRole} />
                    </div>
                    <p className="truncate font-medium text-foreground">{t.title}</p>
                    <p className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" /> {t.replyCount ?? 0}
                      </span>
                      <span>Updated {fmt(t.updatedAt)}</span>
                      {(t.screenRefJourney || t.screenRefNote) && (
                        <span className="truncate">· {t.screenRefJourney ?? t.screenRefNote}</span>
                      )}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <NewTopicModal open={modalOpen} onOpenChange={setModalOpen} onCreate={handleCreate} />
    </div>
  );
};

const FilterChip = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
  <button type="button" onClick={onClick}
    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
      active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground hover:bg-accent"
    }`}>
    {label}
  </button>
);

export default BoardListView;
