import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import Logo from "@/components/Logo";
import RoleChip from "@/components/board/RoleChip";
import { fetchThread, postMessage, updateStatus, getBoardClient } from "@/lib/board/boardApi";
import {
  ROLE_META, STATUS_META, STATUS_ORDER, Ticket, TicketMessage, TicketRole, TicketStatus,
} from "@/lib/board/boardTypes";
import { getIdentity, setIdentity } from "@/lib/board/identity";
import { useToast } from "@/hooks/use-toast";

const fmt = (s: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(s));

const BoardThreadView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [role, setRole] = useState<TicketRole>("dev");
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { ticket, messages } = await fetchThread(getBoardClient(), id);
      setTicket(ticket);
      setMessages(messages);
    } catch (e) {
      toast({ title: "Could not load this topic", description: String(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  useEffect(() => {
    const stored = getIdentity();
    if (stored) { setName(stored.name); setRole(stored.role); }
  }, []);

  const handleStatus = async (next: TicketStatus) => {
    if (!ticket) return;
    const prev = ticket.status;
    setTicket({ ...ticket, status: next });
    try {
      await updateStatus(getBoardClient(), ticket.id, next);
    } catch (e) {
      setTicket({ ...ticket, status: prev });
      toast({ title: "Could not change status", description: String(e), variant: "destructive" });
    }
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !name.trim() || !body.trim() || posting) return;
    setPosting(true);
    try {
      setIdentity({ name: name.trim(), role });
      await postMessage(getBoardClient(), { ticketId: id, authorName: name.trim(), authorRole: role, body: body.trim() });
      setBody("");
      await load();
    } catch (err) {
      toast({ title: "Could not post", description: String(err), variant: "destructive" });
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/board")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Board
            </Button>
            <div className="hidden h-6 w-px bg-border sm:block" />
            <div className="hidden sm:block"><Logo size="sm" /></div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : !ticket ? (
          <p className="text-sm text-muted-foreground">Topic not found.</p>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="mb-2 text-xl font-semibold text-foreground">{ticket.title}</h1>
              <div className="flex flex-wrap items-center gap-3">
                <Select value={ticket.status} onValueChange={(v) => handleStatus(v as TicketStatus)}>
                  <SelectTrigger className="h-8 w-44 bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-popover">
                    {STATUS_ORDER.map((s) => (
                      <SelectItem key={s} value={s}>{STATUS_META[s].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(ticket.screenRefJourney || ticket.screenRefNote) && (
                  <span className="text-xs text-muted-foreground">
                    {ticket.screenRefJourney}{ticket.screenRefJourney && ticket.screenRefNote ? " · " : ""}{ticket.screenRefNote}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {messages.map((m) => (
                <Card key={m.id} className="p-4">
                  <div className="mb-1 flex items-center gap-2 text-sm">
                    <span className="font-medium text-foreground">{m.authorName}</span>
                    <RoleChip role={m.authorRole} />
                    <span className="text-xs text-muted-foreground">{fmt(m.createdAt)}</span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-foreground">{m.body}</p>
                </Card>
              ))}
            </div>

            <form onSubmit={handlePost} className="mt-6 space-y-3 border-t border-border pt-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="reply-name">Your name</Label>
                  <Input id="reply-name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reply-role">Role</Label>
                  <Select value={role} onValueChange={(v) => setRole(v as TicketRole)}>
                    <SelectTrigger id="reply-role" className="bg-background"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-popover">
                      {(Object.keys(ROLE_META) as TicketRole[]).map((r) => (
                        <SelectItem key={r} value={r}>{ROLE_META[r].label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Textarea value={body} rows={3} onChange={(e) => setBody(e.target.value)} placeholder="Write a reply…" />
              <div className="flex justify-end">
                <Button type="submit" disabled={!name.trim() || !body.trim() || posting}>Post reply</Button>
              </div>
            </form>
          </>
        )}
      </main>
    </div>
  );
};

export default BoardThreadView;
