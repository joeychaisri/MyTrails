import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, KeyRound, ShieldBan, ShieldCheck, RefreshCw } from "lucide-react";
import { AdminOrganizer } from "@/data/adminMockData";
import { useEventsStore } from "@/contexts/EventsContext";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface AdminUserManagementProps {
  organizers: AdminOrganizer[];
  onCreateOrganizer: (org: Omit<AdminOrganizer, "id" | "createdAt" | "eventsCount">) => void;
  onSuspendOrganizer: (orgId: string) => void;
}

// Strong random password for admin-provisioned accounts.
const generatePassword = (len = 14) => {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const digits = "23456789";
  const symbols = "!@#$%^&*-_";
  const all = upper + lower + digits + symbols;
  const pick = (set: string) => set[Math.floor(Math.random() * set.length)];
  // Guarantee at least one of each class, then fill the rest.
  const chars = [pick(upper), pick(lower), pick(digits), pick(symbols)];
  for (let i = chars.length; i < len; i++) chars.push(pick(all));
  // Fisher–Yates shuffle so the guaranteed chars aren't always in front.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
};

const AdminUserManagement = ({ organizers, onCreateOrganizer, onSuspendOrganizer }: AdminUserManagementProps) => {
  const { toast } = useToast();
  const { settings } = useEventsStore();
  const tiers = settings.tiers;
  const defaultTierId = tiers[0]?.id ?? "";
  const tierName = (tierId: string) => tiers.find((t) => t.id === tierId)?.name ?? "—";
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ organizationName: "", contactName: "", email: "", phone: "", password: "", tierId: defaultTierId });

  const filtered = organizers.filter(
    (o) =>
      o.organizationName.toLowerCase().includes(search.toLowerCase()) ||
      o.email.toLowerCase().includes(search.toLowerCase()) ||
      o.contactName.toLowerCase().includes(search.toLowerCase())
  );

  const handleGeneratePassword = () => {
    const pwd = generatePassword();
    setForm((f) => ({ ...f, password: pwd }));
    toast({ title: "Password generated", description: "Copy it and share it securely with the organizer." });
  };

  const handleCreate = () => {
    if (!form.organizationName || !form.email || !form.password) return;
    onCreateOrganizer({ ...form, status: "active" });
    setForm({ organizationName: "", contactName: "", email: "", phone: "", password: "", tierId: defaultTierId });
    setCreateOpen(false);
    toast({ title: "Organizer Created", description: `Account for ${form.organizationName} created successfully.` });
  };

  const handleResetPassword = (org: AdminOrganizer) => {
    toast({ title: "Password Reset", description: `Temporary password generated for ${org.email}.` });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search organizers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Organizer
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Organization</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((org) => (
              <TableRow key={org.id}>
                <TableCell className="font-medium">{org.organizationName}</TableCell>
                <TableCell>{org.contactName}</TableCell>
                <TableCell className="text-muted-foreground">{org.email}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    {tierName(org.tierId)}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                      org.status === "active" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
                    )}
                  >
                    {org.status === "active" ? "Active" : "Suspended"}
                  </span>
                </TableCell>
                <TableCell>{format(new Date(org.createdAt), "MMM d, yyyy")}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button size="sm" variant="ghost" onClick={() => handleResetPassword(org)} title="Reset Password">
                      <KeyRound className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        onSuspendOrganizer(org.id);
                        toast({
                          title: org.status === "active" ? "User Suspended" : "User Reactivated",
                          description: `${org.organizationName} has been ${org.status === "active" ? "suspended" : "reactivated"}.`,
                        });
                      }}
                      title={org.status === "active" ? "Suspend" : "Reactivate"}
                    >
                      {org.status === "active" ? (
                        <ShieldBan className="h-4 w-4 text-destructive" />
                      ) : (
                        <ShieldCheck className="h-4 w-4 text-success" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Create Organizer Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Organizer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Organization Name *</Label>
              <Input value={form.organizationName} onChange={(e) => setForm({ ...form, organizationName: e.target.value })} placeholder="Trail Events Co." />
            </div>
            <div className="space-y-2">
              <Label>Contact Name</Label>
              <Input value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} placeholder="Somchai Rattana" />
            </div>
            <div className="space-y-2">
              <Label>Contact Email (Username) *</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="organizer@example.com" />
            </div>
            <div className="space-y-2">
              <Label>Temporary Password *</Label>
              <div className="flex gap-2">
                <Input type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Generate or type a password" className="font-mono" />
                <Button type="button" variant="outline" onClick={handleGeneratePassword} title="Generate a strong password">
                  <RefreshCw className="mr-1.5 h-4 w-4" />
                  Generate
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+66 89 123 4567" />
            </div>
            <div className="space-y-2">
              <Label>Account Tier</Label>
              <Select value={form.tierId} onValueChange={(v) => setForm({ ...form, tierId: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tiers.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name} — {t.commissionRate}% commission
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!form.organizationName || !form.email || !form.password}>Create Account</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUserManagement;
