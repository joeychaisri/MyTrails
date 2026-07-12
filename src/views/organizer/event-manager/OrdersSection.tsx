import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
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
  Check,
  Download,
  RefreshCw,
  Search,
  ChevronDown,
  MoreHorizontal,
  Phone,
  Mail,
  User,
  Hash,
  Receipt,
  RotateCcw,
  ArrowRightLeft,
  Shirt,
  Tag,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Order, Participant, OrderStatus, PaymentMethod } from "@/data/mockData";
import { useEventsStore } from "@/contexts/EventsContext";
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_COLOR,
  ORDER_FILTER,
  COLLECTED_STATUSES,
  ALL_STATUSES,
  PAYMENT_METHOD_COLOR,
} from "./orderConstants";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
  }).format(amount);
};

export function useOrdersSectionState() {
  const [orderFilter, setOrderFilter] = useState("all");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderDateFilter, setOrderDateFilter] = useState<"all" | "today" | "7days" | "month" | "custom">("all");
  const [orderCustomRange, setOrderCustomRange] = useState<DateRange | undefined>();
  const [orderCustomPickerOpen, setOrderCustomPickerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderPaymentFilter, setOrderPaymentFilter] = useState<"all" | PaymentMethod>("all");
  const [orderCategoryFilter, setOrderCategoryFilter] = useState("all");
  const [orderTicketFilter, setOrderTicketFilter] = useState("all");
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());
  return {
    orderFilter, setOrderFilter,
    orderSearch, setOrderSearch,
    orderDateFilter, setOrderDateFilter,
    orderCustomRange, setOrderCustomRange,
    orderCustomPickerOpen, setOrderCustomPickerOpen,
    selectedOrder, setSelectedOrder,
    orderPaymentFilter, setOrderPaymentFilter,
    orderCategoryFilter, setOrderCategoryFilter,
    orderTicketFilter, setOrderTicketFilter,
    selectedOrderIds, setSelectedOrderIds,
  };
}

export type OrdersSectionState = ReturnType<typeof useOrdersSectionState>;

// Data URLs can't be opened as a top-level tab in Chromium; convert to a blob
// URL first so the slip opens full-size in a new tab.
const openSlip = async (dataUrl: string) => {
  try {
    const blob = await (await fetch(dataUrl)).blob();
    window.open(URL.createObjectURL(blob), "_blank", "noopener");
  } catch {
    window.open(dataUrl, "_blank", "noopener");
  }
};

interface OrdersSectionProps {
  eventId: string;
  orders: Order[];
  setOrders: Dispatch<SetStateAction<Order[]>>;
  participants: Participant[];
  state: OrdersSectionState;
}

const OrdersSection = ({ eventId, orders, setOrders, participants, state }: OrdersSectionProps) => {
  const { registrations, verifySlip } = useEventsStore();
  const slipQueue = useMemo(
    () => registrations.filter((r) => r.eventId === eventId && r.status === "awaiting_verification"),
    [registrations, eventId]
  );
  const {
    orderFilter, setOrderFilter,
    orderSearch, setOrderSearch,
    orderDateFilter, setOrderDateFilter,
    orderCustomRange, setOrderCustomRange,
    orderCustomPickerOpen, setOrderCustomPickerOpen,
    selectedOrder, setSelectedOrder,
    orderPaymentFilter, setOrderPaymentFilter,
    orderCategoryFilter, setOrderCategoryFilter,
    orderTicketFilter, setOrderTicketFilter,
    selectedOrderIds, setSelectedOrderIds,
  } = state;

        const { totalCollected, pendingCount, issuesCount, refundedTotal } = useMemo(() => {
          const totalCollected = orders
            .filter((o) => COLLECTED_STATUSES.includes(o.status))
            .reduce((sum, o) => sum + o.amount, 0);
          const pendingCount = orders.filter((o) =>
            ORDER_FILTER["pending"](o.status) || o.status === "pending_cash"
          ).length;
          const issuesCount = orders.filter((o) => ORDER_FILTER["issues"](o.status)).length;
          const refundedTotal = orders
            .filter((o) => o.status === "refunded" || o.status === "refunded_receipt_issued")
            .reduce((sum, o) => sum + o.amount, 0);
          return { totalCollected, pendingCount, issuesCount, refundedTotal };
        }, [orders]);

        const updateOrderStatus = (id: string, newStatus: OrderStatus) => {
          setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: newStatus } : o));
        };
        const updateOrderNote = (id: string, note: string) => {
          setOrders((prev) => prev.map((o) => o.id === id ? { ...o, note } : o));
        };

        const uniqueCategories = useMemo(() => [...new Set(orders.map((o) => o.category))].sort(), [orders]);
        const uniqueTicketTypes = useMemo(() => [...new Set(orders.map((o) => o.ticketType))].sort(), [orders]);

        const filteredOrders = useMemo(() => {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOf7Days = new Date(startOfToday); startOf7Days.setDate(startOf7Days.getDate() - 6);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        return orders.filter((o) => {
          const matchesFilter = ORDER_FILTER[orderFilter]?.(o.status) ?? true;
          const q = orderSearch.toLowerCase();
          const matchesSearch = !q ||
            o.buyerName.toLowerCase().includes(q) ||
            o.buyerEmail.toLowerCase().includes(q) ||
            o.id.toLowerCase().includes(q);
          const orderDate = new Date(o.timestamp.replace(" ", "T"));
          let matchesDate = true;
          if (orderDateFilter === "today") {
            matchesDate = orderDate >= startOfToday;
          } else if (orderDateFilter === "7days") {
            matchesDate = orderDate >= startOf7Days;
          } else if (orderDateFilter === "month") {
            matchesDate = orderDate >= startOfMonth;
          } else if (orderDateFilter === "custom" && orderCustomRange?.from) {
            const from = new Date(orderCustomRange.from.getFullYear(), orderCustomRange.from.getMonth(), orderCustomRange.from.getDate());
            const to = orderCustomRange.to
              ? new Date(orderCustomRange.to.getFullYear(), orderCustomRange.to.getMonth(), orderCustomRange.to.getDate() + 1)
              : new Date(from.getTime() + 86400000);
            matchesDate = orderDate >= from && orderDate < to;
          }
          const matchesPayment = orderPaymentFilter === "all" || o.paymentMethod === orderPaymentFilter;
          const matchesCategory = orderCategoryFilter === "all" || o.category === orderCategoryFilter;
          const matchesTicket = orderTicketFilter === "all" || o.ticketType === orderTicketFilter;
          return matchesFilter && matchesSearch && matchesDate && matchesPayment && matchesCategory && matchesTicket;
        });
        }, [orders, orderFilter, orderSearch, orderDateFilter, orderCustomRange, orderPaymentFilter, orderCategoryFilter, orderTicketFilter]);

        const allFilteredSelected = filteredOrders.length > 0 && filteredOrders.every((o) => selectedOrderIds.has(o.id));
        const someFilteredSelected = filteredOrders.some((o) => selectedOrderIds.has(o.id));

        const toggleSelectAll = () => {
          setSelectedOrderIds((prev) => {
            const next = new Set(prev);
            if (allFilteredSelected) {
              filteredOrders.forEach((o) => next.delete(o.id));
            } else {
              filteredOrders.forEach((o) => next.add(o.id));
            }
            return next;
          });
        };

        const toggleSelectOrder = (id: string) => {
          setSelectedOrderIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
          });
        };

        const bulkUpdateStatus = (newStatus: OrderStatus) => {
          setOrders((prev) => prev.map((o) => selectedOrderIds.has(o.id) ? { ...o, status: newStatus } : o));
          setSelectedOrderIds(new Set());
        };

        const exportCSV = () => {
          const headers = ["Order ID", "Buyer Name", "Email", "Category", "Ticket Type", "Payment Method", "Amount (THB)", "Status", "Timestamp", "Note"];
          const rows = filteredOrders.map((o) => [
            o.id,
            o.buyerName,
            o.buyerEmail,
            o.category,
            o.ticketType,
            o.paymentMethod,
            o.amount,
            ORDER_STATUS_LABEL[o.status],
            o.timestamp,
            o.note,
          ]);
          const csv = [headers, ...rows]
            .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
            .join("\n");
          const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
          a.click();
          URL.revokeObjectURL(url);
        };

        return (
          <div className="space-y-4">
            {/* Slip verification queue — PromptPay registrations awaiting review */}
            {slipQueue.length > 0 && (
              <div className="rounded-xl border border-border bg-card shadow-card">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <h3 className="text-lg font-semibold text-foreground">Slip verification</h3>
                  <span className="inline-flex rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-medium text-warning">
                    {slipQueue.length} รอตรวจ
                  </span>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Runner</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Slip</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {slipQueue.map((reg) => (
                      <TableRow key={reg.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{reg.runner.firstName} {reg.runner.lastName}</p>
                            <p className="text-sm text-muted-foreground">{reg.runner.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(reg.amount)}</TableCell>
                        <TableCell>
                          {reg.slipDataUrl ? (
                            <button
                              type="button"
                              onClick={() => openSlip(reg.slipDataUrl!)}
                              title="เปิดสลิปเต็มขนาด"
                              className="rounded border border-border transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary/50"
                            >
                              <img
                                src={reg.slipDataUrl}
                                alt={`Payment slip ${reg.code}`}
                                className="h-12 w-9 rounded object-cover"
                              />
                            </button>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" onClick={() => verifySlip(reg.id, true)}>
                              <Check className="mr-1.5 h-3.5 w-3.5" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => verifySlip(reg.id, false)}
                            >
                              <X className="mr-1.5 h-3.5 w-3.5" />
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Transaction History</h3>
              <Button variant="outline" size="sm" onClick={exportCSV}>
                <Download className="mr-2 h-4 w-4" />
                Export {filteredOrders.length > 0 && `(${filteredOrders.length})`}
              </Button>
            </div>

            {/* Date Filter */}
            <div className="flex flex-wrap items-center gap-2">
              {(["all", "today", "7days", "month", "custom"] as const).map((val) => {
                const labels = { all: "ทั้งหมด", today: "วันนี้", "7days": "7 วันล่าสุด", month: "เดือนนี้", custom: "กำหนดเอง" };
                if (val === "custom") {
                  return (
                    <Popover key="custom" open={orderCustomPickerOpen} onOpenChange={setOrderCustomPickerOpen}>
                      <PopoverTrigger asChild>
                        <button
                          onClick={() => setOrderDateFilter("custom")}
                          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                            orderDateFilter === "custom"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          {orderDateFilter === "custom" && orderCustomRange?.from
                            ? orderCustomRange.to
                              ? `${format(orderCustomRange.from, "d MMM")} – ${format(orderCustomRange.to, "d MMM")}`
                              : format(orderCustomRange.from, "d MMM yyyy")
                            : "กำหนดเอง"}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-popover" align="start">
                        <Calendar
                          mode="range"
                          selected={orderCustomRange}
                          onSelect={(range) => {
                            setOrderCustomRange(range);
                            setOrderDateFilter("custom");
                            if (range?.from && range?.to) setOrderCustomPickerOpen(false);
                          }}
                          numberOfMonths={2}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  );
                }
                return (
                  <button
                    key={val}
                    onClick={() => setOrderDateFilter(val)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      orderDateFilter === val
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {labels[val]}
                  </button>
                );
              })}
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <div className="rounded-xl border border-border bg-card p-4 shadow-card">
                <p className="text-xs text-muted-foreground">Total Collected</p>
                <p className="mt-1 text-xl font-bold text-success">{formatCurrency(totalCollected)}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 shadow-card">
                <p className="text-xs text-muted-foreground">Pending Review</p>
                <p className="mt-1 text-xl font-bold text-warning">{pendingCount} orders</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 shadow-card">
                <p className="text-xs text-muted-foreground">Issues</p>
                <p className="mt-1 text-xl font-bold text-destructive">{issuesCount} orders</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 shadow-card">
                <p className="text-xs text-muted-foreground">Refunded</p>
                <p className="mt-1 text-xl font-bold text-muted-foreground">{formatCurrency(refundedTotal)}</p>
              </div>
            </div>

            {/* Secondary Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <Select value={orderPaymentFilter} onValueChange={(v) => setOrderPaymentFilter(v as "all" | PaymentMethod)}>
                <SelectTrigger className="h-8 w-[130px] bg-card text-xs">
                  <SelectValue placeholder="Payment" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="Stripe">Stripe</SelectItem>
                  <SelectItem value="PromptPay">PromptPay</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="VIP">VIP</SelectItem>
                  <SelectItem value="Sponsor">Sponsor</SelectItem>
                </SelectContent>
              </Select>
              <Select value={orderCategoryFilter} onValueChange={setOrderCategoryFilter}>
                <SelectTrigger className="h-8 w-[140px] bg-card text-xs">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">All Categories</SelectItem>
                  {uniqueCategories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={orderTicketFilter} onValueChange={setOrderTicketFilter}>
                <SelectTrigger className="h-8 w-[140px] bg-card text-xs">
                  <SelectValue placeholder="Ticket Type" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">All Tickets</SelectItem>
                  {uniqueTicketTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
              {(orderPaymentFilter !== "all" || orderCategoryFilter !== "all" || orderTicketFilter !== "all") && (
                <button
                  onClick={() => { setOrderPaymentFilter("all"); setOrderCategoryFilter("all"); setOrderTicketFilter("all"); }}
                  className="h-8 rounded-lg px-2.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>

            {/* Filter Tabs + Search */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Tabs value={orderFilter} onValueChange={setOrderFilter}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="issues">Issues</TabsTrigger>
                  <TabsTrigger value="refunds">Refunds</TabsTrigger>
                  <TabsTrigger value="special">Special</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search name, email, order ID..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            {/* Order Detail Modal */}
            {selectedOrder && (() => {
              const o = selectedOrder;
              const linkedParticipant = participants.find(
                (p) => p.email.toLowerCase() === o.buyerEmail.toLowerCase()
              );
              return (
                <Dialog open={!!selectedOrder} onOpenChange={(open) => { if (!open) setSelectedOrder(null); }}>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <DialogTitle className="font-mono text-lg">{o.id}</DialogTitle>
                          <p className="mt-0.5 text-sm text-muted-foreground">{o.timestamp}</p>
                        </div>
                        <span className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-medium ${ORDER_STATUS_COLOR[o.status]}`}>
                          {ORDER_STATUS_LABEL[o.status]}
                        </span>
                      </div>
                    </DialogHeader>

                    <div className="mt-4 space-y-5">
                      {/* Buyer + Participant */}
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {/* Buyer */}
                        <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2.5">
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">ผู้ซื้อ</p>
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="font-medium">{o.buyerName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="text-muted-foreground break-all">{o.buyerEmail}</span>
                          </div>
                          {linkedParticipant && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <span className="text-muted-foreground">{linkedParticipant.phone}</span>
                            </div>
                          )}
                        </div>

                        {/* Order Info */}
                        <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2.5">
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">รายละเอียดการสมัคร</p>
                          <div className="flex items-center gap-2 text-sm">
                            <Hash className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span>
                              {linkedParticipant?.bibNo
                                ? <span className="font-mono font-medium">BIB #{linkedParticipant.bibNo}</span>
                                : <span className="text-muted-foreground">ยังไม่มี BIB</span>}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="h-3.5 w-3.5 text-muted-foreground text-xs font-bold shrink-0">🏃</span>
                            <span>{o.category}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Tag className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="text-muted-foreground">{o.ticketType}</span>
                          </div>
                          {linkedParticipant && (
                            <div className="flex items-center gap-2 text-sm">
                              <Shirt className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <span className="text-muted-foreground">Shirt: {linkedParticipant.shirtSize}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Payment */}
                      <div className="rounded-lg border border-border bg-muted/30 p-4">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">การชำระเงิน</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${PAYMENT_METHOD_COLOR[o.paymentMethod]}`}>
                              {o.paymentMethod}
                            </span>
                          </div>
                          <span className="text-xl font-bold text-foreground">{formatCurrency(o.amount)}</span>
                        </div>
                      </div>

                      {/* Status Change */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">เปลี่ยนสถานะ</Label>
                        <Select
                          value={o.status}
                          onValueChange={(val) => {
                            updateOrderStatus(o.id, val as OrderStatus);
                            setSelectedOrder({ ...o, status: val as OrderStatus });
                          }}
                        >
                          <SelectTrigger className="bg-background">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${ORDER_STATUS_COLOR[o.status]}`}>
                              {ORDER_STATUS_LABEL[o.status]}
                            </span>
                          </SelectTrigger>
                          <SelectContent className="bg-popover max-h-64 overflow-y-auto">
                            {ALL_STATUSES.map((s) => (
                              <SelectItem key={s} value={s} className="text-xs">
                                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${ORDER_STATUS_COLOR[s]}`}>
                                  {ORDER_STATUS_LABEL[s]}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Note */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Note (internal)</Label>
                        <Textarea
                          value={o.note}
                          onChange={(e) => {
                            updateOrderNote(o.id, e.target.value);
                            setSelectedOrder({ ...o, note: e.target.value });
                          }}
                          placeholder="เพิ่ม note สำหรับ order นี้..."
                          rows={2}
                          className="bg-background text-sm"
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 pt-1 border-t border-border">
                        <Button variant="outline" size="sm" className="gap-2">
                          <RotateCcw className="h-3.5 w-3.5" />
                          Refund
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                          <ArrowRightLeft className="h-3.5 w-3.5" />
                          เปลี่ยนระยะวิ่ง
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Receipt className="h-3.5 w-3.5" />
                          Issue Tax Invoice
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-auto text-muted-foreground"
                          onClick={() => setSelectedOrder(null)}
                        >
                          ปิด
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              );
            })()}

            {/* Table */}
            <div className="rounded-xl border border-border bg-card shadow-card overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <input
                        type="checkbox"
                        checked={allFilteredSelected}
                        ref={(el) => { if (el) el.indeterminate = someFilteredSelected && !allFilteredSelected; }}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
                      />
                    </TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <td colSpan={10} className="py-8 text-center text-sm text-muted-foreground">No orders found</td>
                    </TableRow>
                  ) : filteredOrders.map((order) => (
                    <TableRow
                      key={order.id}
                      className={`cursor-pointer transition-colors ${selectedOrderIds.has(order.id) ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/30"}`}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedOrderIds.has(order.id)}
                          onChange={() => toggleSelectOrder(order.id)}
                          className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
                        />
                      </TableCell>
                      <TableCell className="font-mono text-sm">{order.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.buyerName}</p>
                          <p className="text-sm text-muted-foreground">{order.buyerEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>{order.category}</TableCell>
                      <TableCell>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${PAYMENT_METHOD_COLOR[order.paymentMethod]}`}>
                          {order.paymentMethod}
                        </span>
                      </TableCell>
                      <TableCell>{formatCurrency(order.amount)}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Select
                          value={order.status}
                          onValueChange={(val) => updateOrderStatus(order.id, val as OrderStatus)}
                        >
                          <SelectTrigger className="h-auto border-0 bg-transparent p-0 shadow-none focus:ring-0 [&>svg]:ml-1 [&>svg]:h-3 [&>svg]:w-3">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${ORDER_STATUS_COLOR[order.status]}`}>
                              {ORDER_STATUS_LABEL[order.status]}
                            </span>
                          </SelectTrigger>
                          <SelectContent className="bg-popover max-h-72 overflow-y-auto">
                            {ALL_STATUSES.map((s) => (
                              <SelectItem key={s} value={s} className="text-xs">
                                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${ORDER_STATUS_COLOR[s]}`}>
                                  {ORDER_STATUS_LABEL[s]}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{order.timestamp}</TableCell>
                      <TableCell className="min-w-[160px]" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={order.note}
                          onChange={(e) => updateOrderNote(order.id, e.target.value)}
                          placeholder="Add note..."
                          className="w-full rounded border border-transparent bg-transparent px-1 py-0.5 text-xs text-foreground placeholder:text-muted-foreground/50 hover:border-border focus:border-border focus:outline-none focus:ring-1 focus:ring-primary/50"
                        />
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover">
                            <DropdownMenuItem>
                              <RefreshCw className="mr-2 h-3.5 w-3.5" />
                              Refund
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <ChevronDown className="mr-2 h-3.5 w-3.5" />
                              เปลี่ยนแปลงระยะวิ่ง
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-3.5 w-3.5" />
                              Issue Tax Invoice
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Bulk Action Bar */}
            {selectedOrderIds.size > 0 && (
              <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-xl">
                <span className="text-sm font-medium text-foreground whitespace-nowrap">
                  เลือก {selectedOrderIds.size} orders
                </span>
                <div className="h-4 w-px bg-border" />
                <Select onValueChange={(val) => bulkUpdateStatus(val as OrderStatus)}>
                  <SelectTrigger className="h-8 w-[200px] bg-background text-xs">
                    <SelectValue placeholder="เปลี่ยนสถานะ..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover max-h-64 overflow-y-auto">
                    {ALL_STATUSES.map((s) => (
                      <SelectItem key={s} value={s} className="text-xs">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${ORDER_STATUS_COLOR[s]}`}>
                          {ORDER_STATUS_LABEL[s]}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setSelectedOrderIds(new Set())}
                >
                  ยกเลิก
                </Button>
              </div>
            )}
          </div>
        );
};

export default OrdersSection;
