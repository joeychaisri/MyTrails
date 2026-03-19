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
import { Search, Plus, KeyRound, ShieldBan, ShieldCheck } from "lucide-react";
import { AdminOrganizer } from "@/data/adminMockData";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface AdminUserManagementProps {
  organizers: AdminOrganizer[];
  onCreateOrganizer: (org: Omit<AdminOrganizer, "id" | "createdAt" | "eventsCount">) => void;
  onSuspendOrganizer: (orgId: string) => void;
}

const AdminUserManagement = ({ organizers, onCreateOrganizer, onSuspendOrganizer }: AdminUserManagementProps) => {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ organizationName: "", contactName: "", email: "", phone: "", password: "" });

  const filtered = organizers.filter(
    (o) =>
      o.organizationName.toLowerCase().includes(search.toLowerCase()) ||
      o.email.toLowerCase().includes(search.toLowerCase()) ||
      o.contactName.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    if (!form.organizationName || !form.email || !form.password) return;
    onCreateOrganizer({ ...form, status: "active" });
    setForm({ organizationName: "", contactName: "", email: "", phone: "", password: "" });
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
              <Input type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Set a temporary password" />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+66 89 123 4567" />
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
