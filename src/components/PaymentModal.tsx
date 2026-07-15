import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaymentInfo } from "@/data/mockData";
import { Landmark } from "lucide-react";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentInfo: PaymentInfo;
  onSave: (paymentInfo: PaymentInfo) => void;
}

const banks = [
  { value: "kbank", label: "Kasikornbank (KBank)" },
  { value: "scb", label: "Siam Commercial Bank (SCB)" },
  { value: "bbl", label: "Bangkok Bank (BBL)" },
  { value: "ktb", label: "Krungthai Bank (KTB)" },
  { value: "bay", label: "Krungsri (BAY)" },
  { value: "tmb", label: "TMBThanachart (TTB)" },
  { value: "gsb", label: "Government Savings Bank (GSB)" },
  { value: "uob", label: "UOB Thailand (UOB)" },
  { value: "cimb", label: "CIMB Thai (CIMB)" },
  { value: "lh", label: "Land and Houses Bank (LH)" },
];

const PaymentModal = ({ open, onOpenChange, paymentInfo, onSave }: PaymentModalProps) => {
  const [formData, setFormData] = useState(paymentInfo);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Payment Settings</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Landmark className="h-10 w-10 text-primary" />
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Enter the bank account where you'll receive ticket-sale payouts.
          </p>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="account-name">Account name</Label>
              <Input
                id="account-name"
                placeholder="Name as it appears on your bank account"
                value={formData.accountName}
                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank">Bank</Label>
              <Select
                value={formData.bank}
                onValueChange={(value) => setFormData({ ...formData, bank: value })}
              >
                <SelectTrigger id="bank" className="bg-background">
                  <SelectValue placeholder="Select bank" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {banks.map((bank) => (
                    <SelectItem key={bank.value} value={bank.value}>
                      {bank.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-number">Account number</Label>
              <Input
                id="account-number"
                placeholder="xxx-x-xxxxx-x"
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
