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
import { useEventsStore } from "@/contexts/EventsContext";
import { dataSource } from "@/lib/dataSource";
import { useToast } from "@/hooks/use-toast";
import { Save, RotateCcw, Plus, Trash2 } from "lucide-react";

const AdminSettings = () => {
  const { toast } = useToast();
  const { settings, organizers, addTier, updateTier, deleteTier, saveSettings, resetStore } = useEventsStore();
  const [payoutHoldDays, setPayoutHoldDays] = useState(settings.payoutHoldDays.toString());
  const [newTierName, setNewTierName] = useState("");
  const [newTierRate, setNewTierRate] = useState("");

  const tierUsage = (tierId: string) => organizers.filter((o) => o.tierId === tierId).length;

  const handleSaveHold = () => {
    const hold = parseInt(payoutHoldDays, 10);
    if (isNaN(hold) || hold < 0) return;
    saveSettings({ ...settings, payoutHoldDays: hold });
    toast({ title: "Settings Saved", description: `Payout hold set to ${hold} days.` });
  };

  const handleAddTier = () => {
    const rate = parseFloat(newTierRate);
    if (!newTierName.trim() || isNaN(rate) || rate < 0) return;
    addTier(newTierName.trim(), rate);
    setNewTierName("");
    setNewTierRate("");
    toast({ title: "Tier added", description: `${newTierName.trim()} created.` });
  };

  const handleDeleteTier = (id: string, name: string) => {
    if (tierUsage(id) > 0) return;
    deleteTier(id);
    toast({ title: "Tier deleted", description: `${name} removed.` });
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Commission model overview */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-card space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-card-foreground">Platform Commission</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            The platform takes commission in two parts, deducted from the organizer's payout after the event.
          </p>
        </div>
        <div className="rounded-lg bg-muted/50 p-4 text-sm">
          <p className="font-medium">1. Event commission — by number of registrations</p>
          <ul className="mt-1 list-disc pl-5 text-muted-foreground">
            <li>Under 300 registrations → ฿1,000 flat</li>
            <li>300–999 registrations → 8% of registration revenue</li>
            <li>1,000+ registrations → 6% (volume discount)</li>
          </ul>
          <p className="mt-2 text-xs text-muted-foreground">An admin can override the event commission per event during review.</p>
          <p className="mt-3 font-medium">2. Tier commission — by the organizer's account tier (below)</p>
        </div>
      </div>

      {/* Tier management */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-card space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-card-foreground">Account Tiers</h3>
          <p className="mt-1 text-xs text-muted-foreground">Each organizer account is assigned a tier that carries its own commission rate.</p>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tier Name</TableHead>
                <TableHead>Commission (%)</TableHead>
                <TableHead>In use by</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {settings.tiers.map((tier) => {
                const usage = tierUsage(tier.id);
                return (
                  <TableRow key={tier.id}>
                    <TableCell>
                      <Input
                        value={tier.name}
                        onChange={(e) => updateTier(tier.id, { name: e.target.value })}
                        className="h-8 max-w-[180px]"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        step={0.5}
                        value={tier.commissionRate}
                        onChange={(e) => updateTier(tier.id, { commissionRate: parseFloat(e.target.value) || 0 })}
                        className="h-8 max-w-[100px]"
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{usage} organizer{usage === 1 ? "" : "s"}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={usage > 0}
                        title={usage > 0 ? "Reassign organizers before deleting" : "Delete tier"}
                        onClick={() => handleDeleteTier(tier.id, tier.name)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Add tier */}
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <Label className="text-xs">New tier name</Label>
            <Input value={newTierName} onChange={(e) => setNewTierName(e.target.value)} placeholder="e.g. Elite" className="max-w-[180px]" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Commission (%)</Label>
            <Input type="number" min={0} step={0.5} value={newTierRate} onChange={(e) => setNewTierRate(e.target.value)} placeholder="0" className="max-w-[100px]" />
          </div>
          <Button variant="outline" onClick={handleAddTier} disabled={!newTierName.trim() || newTierRate === ""}>
            <Plus className="mr-2 h-4 w-4" />
            Add Tier
          </Button>
        </div>
      </div>

      {/* Payout hold */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-card space-y-4">
        <h3 className="text-lg font-semibold text-card-foreground">Payout</h3>
        <div className="space-y-2">
          <Label htmlFor="hold">Payout Hold (days after event)</Label>
          <Input id="hold" type="number" value={payoutHoldDays} onChange={(e) => setPayoutHoldDays(e.target.value)} min={0} className="max-w-[160px]" />
          <p className="text-xs text-muted-foreground">
            Funds are held in escrow this many days after the event ends before becoming payable.
          </p>
        </div>
        <Button onClick={handleSaveHold}>
          <Save className="mr-2 h-4 w-4" />
          Save
        </Button>
      </div>

      {/* Demo utilities */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-card space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-card-foreground">Demo Data</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {dataSource === "supabase"
              ? "Data lives on the server (Supabase). This reloads the latest data from the server. A full reseed is run from the command line (scripts/seed-supabase.ts)."
              : "This prototype keeps changes in your browser. Reset to reload the original sample data."}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            resetStore();
            toast(
              dataSource === "supabase"
                ? { title: "Data refreshed", description: "Reloaded the latest data from the server." }
                : { title: "Demo data reset", description: "Sample events, organizers and tiers restored." }
            );
          }}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          {dataSource === "supabase" ? "Refresh from server" : "Reset demo data"}
        </Button>
      </div>
    </div>
  );
};

export default AdminSettings;
