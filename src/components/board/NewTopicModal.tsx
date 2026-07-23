import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { JOURNEY_OPTIONS, ROLE_META, TicketRole } from "@/lib/board/boardTypes";
import { getIdentity, setIdentity } from "@/lib/board/identity";
import type { CreateTicketInput } from "@/lib/board/boardApi";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (input: CreateTicketInput) => Promise<void>;
}

const NONE = "__none__";

const NewTopicModal = ({ open, onOpenChange, onCreate }: Props) => {
  const [name, setName] = useState("");
  const [role, setRole] = useState<TicketRole>("dev");
  const [title, setTitle] = useState("");
  const [firstMessage, setFirstMessage] = useState("");
  const [journey, setJourney] = useState<string>(NONE);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Pre-fill identity from localStorage whenever the modal opens.
  useEffect(() => {
    if (!open) return;
    const id = getIdentity();
    if (id) {
      setName(id.name);
      setRole(id.role);
    }
  }, [open]);

  const canSubmit = title.trim() && name.trim() && firstMessage.trim() && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      setIdentity({ name: name.trim(), role });
      await onCreate({
        title: title.trim(),
        createdByName: name.trim(),
        createdByRole: role,
        screenRefJourney: journey === NONE ? null : journey,
        screenRefNote: note.trim() || null,
        firstMessage: firstMessage.trim(),
      });
      // reset topic fields (keep identity)
      setTitle("");
      setFirstMessage("");
      setJourney(NONE);
      setNote("");
      onOpenChange(false);
    } catch {
      // Parent already surfaced the error via toast; keep the draft and modal open.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New topic</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topic-title">Title</Label>
            <Input id="topic-title" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="What do you want to discuss?" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="topic-name">Your name</Label>
              <Input id="topic-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="topic-role">Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as TicketRole)}>
                <SelectTrigger id="topic-role" className="bg-background"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover">
                  {(Object.keys(ROLE_META) as TicketRole[]).map((r) => (
                    <SelectItem key={r} value={r}>{ROLE_META[r].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="topic-message">Message</Label>
            <Textarea id="topic-message" value={firstMessage} rows={4}
              onChange={(e) => setFirstMessage(e.target.value)} placeholder="Describe the question or issue" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="topic-journey">Screen (optional)</Label>
              <Select value={journey} onValueChange={setJourney}>
                <SelectTrigger id="topic-journey" className="bg-background">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value={NONE}>None</SelectItem>
                  {JOURNEY_OPTIONS.map((j) => (
                    <SelectItem key={j} value={j}>{j}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="topic-note">Ref note (optional)</Label>
              <Input id="topic-note" value={note} onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. specific button / free text" />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={!canSubmit}>Create topic</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewTopicModal;
