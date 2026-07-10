import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlatformSettings } from "@/data/adminMockData";
import { useToast } from "@/hooks/use-toast";
import { Save, RotateCcw } from "lucide-react";

interface AdminSettingsProps {
  settings: PlatformSettings;
  onSave: (settings: PlatformSettings) => void;
  onReset: () => void;
}

const AdminSettings = ({ settings, onSave, onReset }: AdminSettingsProps) => {
  const { toast } = useToast();
  const [commissionRate, setCommissionRate] = useState(settings.commissionRate.toString());
  const [vipCommissionRate, setVipCommissionRate] = useState(settings.vipCommissionRate.toString());
  const [payoutHoldDays, setPayoutHoldDays] = useState(settings.payoutHoldDays.toString());

  const handleSave = () => {
    const commission = parseFloat(commissionRate);
    const vip = parseFloat(vipCommissionRate);
    const hold = parseInt(payoutHoldDays, 10);
    if (isNaN(commission) || commission < 0 || isNaN(vip) || vip < 0 || isNaN(hold) || hold < 0) return;
    onSave({ commissionRate: commission, vipCommissionRate: vip, payoutHoldDays: hold });
    toast({ title: "Settings Saved", description: `Standard commission set to ${commission}%.` });
  };

  return (
    <div className="max-w-md space-y-6">
      <div className="rounded-xl border border-border bg-card p-6 shadow-card space-y-5">
        <div>
          <h3 className="text-lg font-semibold text-card-foreground">Platform Economics</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            The platform earns a commission on each registration, deducted from the organizer's payout after the event.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="commission">Standard Commission (%)</Label>
          <Input
            id="commission"
            type="number"
            value={commissionRate}
            onChange={(e) => setCommissionRate(e.target.value)}
            min={0}
            step={0.5}
          />
          <p className="text-xs text-muted-foreground">Applied to Standard-tier organizers.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="vip-commission">VIP Commission (%)</Label>
          <Input
            id="vip-commission"
            type="number"
            value={vipCommissionRate}
            onChange={(e) => setVipCommissionRate(e.target.value)}
            min={0}
            step={0.5}
          />
          <p className="text-xs text-muted-foreground">Applied to VIP-tier organizers (commission-exempt = 0).</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="hold">Payout Hold (days after event)</Label>
          <Input
            id="hold"
            type="number"
            value={payoutHoldDays}
            onChange={(e) => setPayoutHoldDays(e.target.value)}
            min={0}
          />
          <p className="text-xs text-muted-foreground">
            Funds are held in escrow this many days after the event ends before becoming payable — covers late refunds and chargebacks.
          </p>
        </div>

        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </div>

      {/* Demo utilities */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-card space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-card-foreground">Demo Data</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            This prototype keeps changes in your browser. Reset to reload the original sample events, organizers and settings.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            onReset();
            toast({ title: "Demo data reset", description: "Sample events and organizers restored." });
          }}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset demo data
        </Button>
      </div>
    </div>
  );
};

export default AdminSettings;
