import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Pencil,
  MoreHorizontal,
  Eye,
  Trash2,
  Copy,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DiscountCode } from "@/data/mockData";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
  }).format(amount);
};

const emptyPromoForm = { code: "", discount: "", type: "percentage", usageLimit: "", validUntil: "", categories: [] as string[], isActive: true };
const emptyBulkGenForm = { prefix: "CODE", count: "10", discount: "", type: "percentage", usageLimit: "1", validUntil: "", categories: [] as string[] };

export function usePromotionsSectionState() {
  const [promoSearch, setPromoSearch] = useState("");
  const [createPromoOpen, setCreatePromoOpen] = useState(false);
  const [editPromoOpen, setEditPromoOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<DiscountCode | null>(null);
  const [usageDetailOpen, setUsageDetailOpen] = useState(false);
  const [usageDetailCode, setUsageDetailCode] = useState<DiscountCode | null>(null);
  const [bulkGenOpen, setBulkGenOpen] = useState(false);
  const [deletePromoId, setDeletePromoId] = useState<string | null>(null);
  const [promoForm, setPromoForm] = useState(emptyPromoForm);
  const [bulkGenForm, setBulkGenForm] = useState(emptyBulkGenForm);
  return {
    promoSearch, setPromoSearch,
    createPromoOpen, setCreatePromoOpen,
    editPromoOpen, setEditPromoOpen,
    editingPromo, setEditingPromo,
    usageDetailOpen, setUsageDetailOpen,
    usageDetailCode, setUsageDetailCode,
    bulkGenOpen, setBulkGenOpen,
    deletePromoId, setDeletePromoId,
    promoForm, setPromoForm,
    bulkGenForm, setBulkGenForm,
  };
}

export type PromotionsSectionState = ReturnType<typeof usePromotionsSectionState>;

interface PromotionsSectionProps {
  discountCodes: DiscountCode[];
  setDiscountCodes: Dispatch<SetStateAction<DiscountCode[]>>;
  state: PromotionsSectionState;
}

const PromotionsSection = ({ discountCodes, setDiscountCodes, state }: PromotionsSectionProps) => {
  const {
    promoSearch, setPromoSearch,
    createPromoOpen, setCreatePromoOpen,
    editPromoOpen, setEditPromoOpen,
    editingPromo, setEditingPromo,
    usageDetailOpen, setUsageDetailOpen,
    usageDetailCode, setUsageDetailCode,
    bulkGenOpen, setBulkGenOpen,
    deletePromoId, setDeletePromoId,
    promoForm, setPromoForm,
    bulkGenForm, setBulkGenForm,
  } = state;

        const RACE_CATS = ["100K", "50K", "25K"];

        const filteredCodes = useMemo(() => discountCodes.filter(
          (c) => promoSearch === "" || c.code.toLowerCase().includes(promoSearch.toLowerCase())
        ), [discountCodes, promoSearch]);
        const activeCount = discountCodes.filter((c) => c.isActive && new Date(c.validUntil) > new Date()).length;
        const totalUsage = discountCodes.reduce((s, c) => s + c.used, 0);

        const handleSavePromo = (editing: boolean) => {
          if (!promoForm.code || !promoForm.discount) return;
          if (editing && editingPromo) {
            setDiscountCodes((prev) =>
              prev.map((c) =>
                c.id === editingPromo.id
                  ? { ...c, code: promoForm.code.toUpperCase(), discount: Number(promoForm.discount), type: promoForm.type as "percentage" | "fixed", usageLimit: Number(promoForm.usageLimit), validUntil: promoForm.validUntil, categories: promoForm.categories, isActive: promoForm.isActive }
                  : c
              )
            );
            setEditPromoOpen(false);
          } else {
            setDiscountCodes((prev) => [
              ...prev,
              { id: `dc${Date.now()}`, code: promoForm.code.toUpperCase(), discount: Number(promoForm.discount), type: promoForm.type as "percentage" | "fixed", usageLimit: Number(promoForm.usageLimit), used: 0, validUntil: promoForm.validUntil, categories: promoForm.categories, isActive: true, usages: [] },
            ]);
            setCreatePromoOpen(false);
          }
          setPromoForm(emptyPromoForm);
        };

        const handleToggleActive = (codeId: string) =>
          setDiscountCodes((prev) => prev.map((c) => (c.id === codeId ? { ...c, isActive: !c.isActive } : c)));

        const handleDeletePromo = () => {
          setDiscountCodes((prev) => prev.filter((c) => c.id !== deletePromoId));
          setDeletePromoId(null);
        };

        const handleBulkGenerate = () => {
          if (!bulkGenForm.discount || !bulkGenForm.validUntil) return;
          const count = Math.min(Math.max(Number(bulkGenForm.count) || 1, 1), 100);
          const newCodes: DiscountCode[] = Array.from({ length: count }, (_, i) => ({
            id: `dc${Date.now()}-${i}`,
            code: `${bulkGenForm.prefix || "CODE"}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
            discount: Number(bulkGenForm.discount),
            type: bulkGenForm.type as "percentage" | "fixed",
            usageLimit: Number(bulkGenForm.usageLimit) || 1,
            used: 0,
            validUntil: bulkGenForm.validUntil,
            categories: bulkGenForm.categories,
            isActive: true,
            usages: [],
          }));
          setDiscountCodes((prev) => [...prev, ...newCodes]);
          setBulkGenOpen(false);
          setBulkGenForm(emptyBulkGenForm);
        };

        const renderPromoFormFields = (form: typeof promoForm, setForm: (f: typeof promoForm) => void) => (
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Code</Label>
              <Input
                placeholder="SUMMER2025"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="font-mono"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Discount</Label>
                <Input type="number" placeholder="20" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed (THB)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Usage Limit</Label>
                <Input type="number" placeholder="100" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Valid Until</Label>
                <Input type="date" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>
                Categories{" "}
                <span className="font-normal text-muted-foreground">(empty = all)</span>
              </Label>
              <div className="flex gap-2">
                {RACE_CATS.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        categories: form.categories.includes(cat)
                          ? form.categories.filter((c) => c !== cat)
                          : [...form.categories, cat],
                      })
                    }
                    className={`rounded-md border px-3 py-1 text-sm font-medium transition-colors ${
                      form.categories.includes(cat)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

        return (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-foreground">Discount Codes</h3>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => { setBulkGenForm(emptyBulkGenForm); setBulkGenOpen(true); }}>
                  <Copy className="mr-2 h-4 w-4" />
                  Bulk Generate
                </Button>
                <Button onClick={() => { setPromoForm(emptyPromoForm); setCreatePromoOpen(true); }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Code
                </Button>
              </div>
            </div>

            {/* Summary cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-card p-5 shadow-card">
                <p className="text-sm text-muted-foreground">Total Codes</p>
                <p className="text-2xl font-bold text-card-foreground">{discountCodes.length}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5 shadow-card">
                <p className="text-sm text-muted-foreground">Active Codes</p>
                <p className="text-2xl font-bold text-success">{activeCount}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5 shadow-card">
                <p className="text-sm text-muted-foreground">Total Uses</p>
                <p className="text-2xl font-bold text-card-foreground">{totalUsage}</p>
              </div>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search codes..." value={promoSearch} onChange={(e) => setPromoSearch(e.target.value)} />
            </div>

            {/* Table */}
            <div className="rounded-xl border border-border bg-card shadow-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Categories</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Valid Until</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCodes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                        No discount codes found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCodes.map((code) => {
                      const isExpired = new Date(code.validUntil) <= new Date();
                      const effectivelyActive = code.isActive && !isExpired;
                      return (
                        <TableRow key={code.id}>
                          <TableCell className="font-mono font-medium">{code.code}</TableCell>
                          <TableCell>
                            {code.type === "percentage" ? `${code.discount}%` : formatCurrency(code.discount)}
                          </TableCell>
                          <TableCell>
                            {code.categories.length === 0 ? (
                              <span className="text-sm text-muted-foreground">All</span>
                            ) : (
                              <div className="flex flex-wrap gap-1">
                                {code.categories.map((cat) => (
                                  <span key={cat} className="rounded-md bg-muted px-1.5 py-0.5 text-xs">{cat}</span>
                                ))}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex min-w-[88px] flex-col gap-1">
                              <span className="text-sm">{code.used} / {code.usageLimit}</span>
                              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                  className="h-full rounded-full bg-primary transition-all"
                                  style={{ width: `${Math.min((code.used / code.usageLimit) * 100, 100)}%` }}
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{code.validUntil}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                isExpired
                                  ? "bg-muted text-muted-foreground"
                                  : effectivelyActive
                                  ? "bg-success/10 text-success"
                                  : "bg-warning/10 text-warning"
                              }`}
                            >
                              {isExpired ? "Expired" : effectivelyActive ? "Active" : "Inactive"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-popover">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditingPromo(code);
                                    setPromoForm({ code: code.code, discount: String(code.discount), type: code.type, usageLimit: String(code.usageLimit), validUntil: code.validUntil, categories: [...code.categories], isActive: code.isActive });
                                    setEditPromoOpen(true);
                                  }}
                                >
                                  <Pencil className="mr-2 h-4 w-4" />Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => { setUsageDetailCode(code); setUsageDetailOpen(true); }}
                                >
                                  <Eye className="mr-2 h-4 w-4" />View Usage ({code.used})
                                </DropdownMenuItem>
                                {!isExpired && (
                                  <DropdownMenuItem onClick={() => handleToggleActive(code.id)}>
                                    {code.isActive
                                      ? <XCircle className="mr-2 h-4 w-4" />
                                      : <CheckCircle2 className="mr-2 h-4 w-4" />}
                                    {code.isActive ? "Deactivate" : "Activate"}
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() => setDeletePromoId(code.id)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Create Dialog */}
            <Dialog open={createPromoOpen} onOpenChange={setCreatePromoOpen}>
              <DialogContent>
                <DialogHeader><DialogTitle>Create Discount Code</DialogTitle></DialogHeader>
                {renderPromoFormFields(promoForm, setPromoForm)}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => setCreatePromoOpen(false)}>Cancel</Button>
                  <Button className="flex-1" onClick={() => handleSavePromo(false)}>Create Code</Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={editPromoOpen} onOpenChange={setEditPromoOpen}>
              <DialogContent>
                <DialogHeader><DialogTitle>Edit — {editingPromo?.code}</DialogTitle></DialogHeader>
                {renderPromoFormFields(promoForm, setPromoForm)}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => setEditPromoOpen(false)}>Cancel</Button>
                  <Button className="flex-1" onClick={() => handleSavePromo(true)}>Save Changes</Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Usage Detail Dialog */}
            <Dialog open={usageDetailOpen} onOpenChange={setUsageDetailOpen}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Usage Detail — {usageDetailCode?.code}</DialogTitle>
                </DialogHeader>
                <div className="pt-2">
                  {!usageDetailCode || usageDetailCode.usages.length === 0 ? (
                    <p className="py-8 text-center text-muted-foreground">No usages recorded yet.</p>
                  ) : (
                    <div className="max-h-80 space-y-2 overflow-y-auto">
                      {usageDetailCode.usages.map((usage, i) => (
                        <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3">
                          <div>
                            <p className="text-sm font-medium text-foreground">{usage.name}</p>
                            <p className="text-xs text-muted-foreground">{usage.email}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-mono text-xs text-muted-foreground">{usage.orderId}</p>
                            <p className="text-xs text-muted-foreground">{usage.usedAt}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {/* Bulk Generate Dialog */}
            <Dialog open={bulkGenOpen} onOpenChange={setBulkGenOpen}>
              <DialogContent>
                <DialogHeader><DialogTitle>Bulk Generate Codes</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Prefix</Label>
                      <Input
                        placeholder="CODE"
                        value={bulkGenForm.prefix}
                        onChange={(e) => setBulkGenForm({ ...bulkGenForm, prefix: e.target.value.toUpperCase() })}
                        className="font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Count (max 100)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        placeholder="10"
                        value={bulkGenForm.count}
                        onChange={(e) => setBulkGenForm({ ...bulkGenForm, count: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Discount</Label>
                      <Input type="number" placeholder="20" value={bulkGenForm.discount} onChange={(e) => setBulkGenForm({ ...bulkGenForm, discount: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select value={bulkGenForm.type} onValueChange={(v) => setBulkGenForm({ ...bulkGenForm, type: v })}>
                        <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-popover">
                          <SelectItem value="percentage">Percentage (%)</SelectItem>
                          <SelectItem value="fixed">Fixed (THB)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Usage Limit / code</Label>
                      <Input type="number" placeholder="1" value={bulkGenForm.usageLimit} onChange={(e) => setBulkGenForm({ ...bulkGenForm, usageLimit: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Valid Until</Label>
                      <Input type="date" value={bulkGenForm.validUntil} onChange={(e) => setBulkGenForm({ ...bulkGenForm, validUntil: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Categories{" "}
                      <span className="font-normal text-muted-foreground">(empty = all)</span>
                    </Label>
                    <div className="flex gap-2">
                      {RACE_CATS.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() =>
                            setBulkGenForm({
                              ...bulkGenForm,
                              categories: bulkGenForm.categories.includes(cat)
                                ? bulkGenForm.categories.filter((c) => c !== cat)
                                : [...bulkGenForm.categories, cat],
                            })
                          }
                          className={`rounded-md border px-3 py-1 text-sm font-medium transition-colors ${
                            bulkGenForm.categories.includes(cat)
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:border-primary/50"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => setBulkGenOpen(false)}>Cancel</Button>
                  <Button className="flex-1" onClick={handleBulkGenerate}>
                    Generate {bulkGenForm.count || "0"} Codes
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={!!deletePromoId} onOpenChange={(open) => { if (!open) setDeletePromoId(null); }}>
              <DialogContent className="max-w-sm">
                <DialogHeader><DialogTitle>Delete Discount Code</DialogTitle></DialogHeader>
                <p className="pt-2 text-sm text-muted-foreground">
                  Are you sure you want to delete{" "}
                  <span className="font-mono font-medium text-foreground">
                    {discountCodes.find((c) => c.id === deletePromoId)?.code}
                  </span>
                  ? This action cannot be undone.
                </p>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => setDeletePromoId(null)}>Cancel</Button>
                  <Button variant="destructive" className="flex-1" onClick={handleDeletePromo}>Delete</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        );
};

export default PromotionsSection;
