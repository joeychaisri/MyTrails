import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlatformSettings } from "@/data/adminMockData";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

interface AdminSettingsProps {
  settings: PlatformSettings;
  onSave: (settings: PlatformSettings) => void;
}

const AdminSettings = ({ settings, onSave }: AdminSettingsProps) => {
  const { toast } = useToast();
  const [fee, setFee] = useState(settings.platformFee.toString());

  const handleSave = () => {
    const parsed = parseInt(fee, 10);
    if (isNaN(parsed) || parsed < 0) return;
    onSave({ ...settings, platformFee: parsed });
    toast({ title: "Settings Saved", description: `Platform fee updated to ฿${parsed.toLocaleString()}.` });
  };

  return (
    <div className="max-w-md">
      <div className="rounded-xl border border-border bg-card p-6 shadow-card space-y-4">
        <h3 className="text-lg font-semibold text-card-foreground">Platform Fee Configuration</h3>
        <div className="space-y-2">
          <Label htmlFor="platform-fee">Standard Platform Fee (THB)</Label>
          <Input
            id="platform-fee"
            type="number"
            value={fee}
            onChange={(e) => setFee(e.target.value)}
            min={0}
          />
          <p className="text-xs text-muted-foreground">
            This fee is charged to organizers before their event can be published.
          </p>
        </div>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default AdminSettings;
