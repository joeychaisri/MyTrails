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
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useEventsStore } from "@/contexts/EventsContext";
import type { CommissionBracket } from "@/data/adminMockData";
import { dataSource } from "@/lib/dataSource";
import { useToast } from "@/hooks/use-toast";
import { Save, RotateCcw, Plus, Trash2 } from "lucide-react";

const AdminSettings = () => {
  const { toast } = useToast();
  const { settings, addBracket, updateBracket, deleteBracket, saveSettings, resetStore } = useEventsStore();
  const [payoutHoldDays, setPayoutHoldDays] = useState(settings.payoutHoldDays.toString());
  const [serviceFee, setServiceFee] = useState(settings.serviceFee.toString());
  const [newBracketMin, setNewBracketMin] = useState("");
  const [newBracketType, setNewBracketType] = useState<CommissionBracket["type"]>("flat");
  const [newBracketValue, setNewBracketValue] = useState("");

  const sortedBrackets = [...settings.commissionBrackets].sort((a, b) => a.minCount - b.minCount);

  const bracketRange = (index: number) => {
    const from = sortedBrackets[index].minCount;
    const next = sortedBrackets[index + 1];
    if (!next) return `${from.toLocaleString()}+`;
    return `${from.toLocaleString()}–${(next.minCount - 1).toLocaleString()}`;
  };

  const handleSaveHold = () => {
    const hold = parseInt(payoutHoldDays, 10);
    if (isNaN(hold) || hold < 0) return;
    saveSettings({ ...settings, payoutHoldDays: hold });
    toast({ title: "Settings Saved", description: `Payout hold set to ${hold} days.` });
  };

  const handleSaveServiceFee = () => {
    const fee = parseFloat(serviceFee);
    if (isNaN(fee) || fee < 0) return;
    saveSettings({ ...settings, serviceFee: fee });
    toast({ title: "Settings Saved", description: `Service fee set to ฿${fee.toLocaleString()}.` });
  };

  const handleAddBracket = () => {
    const min = parseInt(newBracketMin, 10);
    const value = parseFloat(newBracketValue);
    if (isNaN(min) || min < 0 || isNaN(value) || value < 0) return;
    addBracket({ minCount: min, type: newBracketType, value });
    setNewBracketMin("");
    setNewBracketType("flat");
    setNewBracketValue("");
    toast({ title: "Bracket added", description: `New bracket from ${min.toLocaleString()} registrations created.` });
  };

  const handleDeleteBracket = (id: string) => {
    if (settings.commissionBrackets.length <= 1) return;
    deleteBracket(id);
    toast({ title: "Bracket deleted", description: "Commission bracket removed." });
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Service fee */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-card space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-card-foreground">Service Fee</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            A flat fee every event pays regardless of size, deducted from the organizer's payout. An admin can override it per event during review.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="serviceFee">Service Fee (THB)</Label>
          <Input id="serviceFee" type="number" value={serviceFee} onChange={(e) => setServiceFee(e.target.value)} min={0} className="max-w-[160px]" />
        </div>
        <Button onClick={handleSaveServiceFee}>
          <Save className="mr-2 h-4 w-4" />
          Save
        </Button>
      </div>

      {/* Commission bracket scale */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-card space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-card-foreground">Event Commission Scale</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Priced by the bracket the event's final registration count falls into — the whole event is charged at that one bracket's rate, not in progressive steps.
          </p>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>From (registrations)</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount / Rate</TableHead>
                <TableHead>Applies to</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedBrackets.map((bracket, index) => (
                <TableRow key={bracket.id}>
                  <TableCell>
                    <Input
                      type="number"
                      min={0}
                      value={bracket.minCount}
                      onChange={(e) => updateBracket(bracket.id, { minCount: parseInt(e.target.value, 10) || 0 })}
                      className="h-8 max-w-[100px]"
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={bracket.type}
                      onValueChange={(v) => updateBracket(bracket.id, { type: v as CommissionBracket["type"] })}
                    >
                      <SelectTrigger className="h-8 w-32 bg-background"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-popover">
                        <SelectItem value="flat">Flat (฿)</SelectItem>
                        <SelectItem value="percent">Percent (%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={0}
                      step={0.5}
                      value={bracket.value}
                      onChange={(e) => updateBracket(bracket.id, { value: parseFloat(e.target.value) || 0 })}
                      className="h-8 max-w-[100px]"
                    />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{bracketRange(index)} runners</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={settings.commissionBrackets.length <= 1}
                      title={settings.commissionBrackets.length <= 1 ? "The scale needs at least one bracket" : "Delete bracket"}
                      onClick={() => handleDeleteBracket(bracket.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Add bracket */}
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <Label className="text-xs">From (registrations)</Label>
            <Input type="number" min={0} value={newBracketMin} onChange={(e) => setNewBracketMin(e.target.value)} placeholder="0" className="max-w-[140px]" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Type</Label>
            <Select value={newBracketType} onValueChange={(v) => setNewBracketType(v as CommissionBracket["type"])}>
              <SelectTrigger className="h-9 w-32 bg-background"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="flat">Flat (฿)</SelectItem>
                <SelectItem value="percent">Percent (%)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Amount / Rate</Label>
            <Input type="number" min={0} step={0.5} value={newBracketValue} onChange={(e) => setNewBracketValue(e.target.value)} placeholder="0" className="max-w-[100px]" />
          </div>
          <Button variant="outline" onClick={handleAddBracket} disabled={newBracketMin === "" || newBracketValue === ""}>
            <Plus className="mr-2 h-4 w-4" />
            Add Bracket
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
                : { title: "Demo data reset", description: "Sample events, organizers and settings restored." }
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
