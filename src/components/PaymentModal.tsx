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
  { value: "kbank", label: "ธนาคารกสิกรไทย (KBANK)" },
  { value: "scb", label: "ธนาคารไทยพาณิชย์ (SCB)" },
  { value: "bbl", label: "ธนาคารกรุงเทพ (BBL)" },
  { value: "ktb", label: "ธนาคารกรุงไทย (KTB)" },
  { value: "bay", label: "ธนาคารกรุงศรีอยุธยา (BAY)" },
  { value: "tmb", label: "ธนาคารทหารไทยธนชาต (TTB)" },
  { value: "gsb", label: "ธนาคารออมสิน (GSB)" },
  { value: "uob", label: "ธนาคารยูโอบี (UOB)" },
  { value: "cimb", label: "ธนาคารซีไอเอ็มบี (CIMB)" },
  { value: "lh", label: "ธนาคารแลนด์ แอนด์ เฮ้าส์ (LH)" },
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
            กรุณากรอกข้อมูลบัญชีธนาคารสำหรับรับเงินจากการขายบัตร
          </p>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="account-name">ชื่อบัญชีรับเงิน</Label>
              <Input
                id="account-name"
                placeholder="ชื่อบัญชีตามที่ปรากฏในบัญชีธนาคาร"
                value={formData.accountName}
                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank">ธนาคาร</Label>
              <Select
                value={formData.bank}
                onValueChange={(value) => setFormData({ ...formData, bank: value })}
              >
                <SelectTrigger id="bank" className="bg-background">
                  <SelectValue placeholder="เลือกธนาคาร" />
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
              <Label htmlFor="account-number">เลขบัญชี</Label>
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
