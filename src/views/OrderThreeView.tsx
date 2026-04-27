import { useState } from "react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import {
  Download, Search, MoreHorizontal,
  Receipt, RotateCcw, ArrowRightLeft, User, Mail, Phone,
  Hash, Tag, Shirt, CheckCircle2, RefreshCw, FileText,
  Image, Upload, ZoomIn, AlertCircle, Info, ArrowUp, ArrowDown,
  Clock, StickyNote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Order, OrderLogEntry, OrderSlip, OrderStatus, Participant, PaymentMethod } from "@/data/mockData";
import { calculateRefund, REFUND_POLICY } from "@/lib/refundPolicy";
import { calculateDistanceChange, CATEGORY_PRICES, DISTANCE_CHANGE_POLICY } from "@/lib/distanceChangePolicy";

// ── constants ────────────────────────────────────────────────────────────────

const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  submitted: "Submitted",
  complete_stripe_wait_receipt: "Complete Stripe · รอใบรับมัดจำ",
  complete_wait_receipt: "Complete · รอใบรับมัดจำ",
  complete_receipt_issued: "Complete · เปิดใบรับมัดจำแล้ว",
  complete_name_change_new: "Complete เปลี่ยนชื่อ · ใบรับมัดจำแล้ว (คนใหม่)",
  name_change_receipt_issued: "เปลี่ยนชื่อ · เปิดใบรับมัดจำแล้ว (คนเก่า)",
  complete_stripe_wait_trc: "Complete Stripe · รอออก TRC",
  complete_wait_trc: "Complete · รอออก TRC",
  complete_trc_issued: "Complete · ออก TRC แล้ว",
  complete_sponsor: "Complete Sponsor",
  complete_vip: "Complete VIP",
  issue_cash: "มีปัญหา · เงินสด",
  pending_cash: "รอตรวจ · เงินสด",
  refunded: "Refunded",
  refunded_receipt_issued: "Refunded · เปิดใบรับมัดจำแล้ว",
  complete_wns: "Complete Will not Start",
  complete_wns_receipt: "Complete WNS · เปิดใบรับมัดจำแล้ว",
  complete_wait_crn: "Complete · รอออก CrN",
  complete_crn_issued: "Complete · ออก CrN แล้ว",
  issue_refund: "มีปัญหา · คืนเงิน",
  pending_refund: "รอคืนเงิน",
  edit_trc: "แก้ไข TRC",
};

const ORDER_STATUS_COLOR: Record<OrderStatus, string> = {
  submitted: "bg-muted text-muted-foreground",
  complete_stripe_wait_receipt: "bg-blue-500/10 text-blue-500",
  complete_wait_receipt: "bg-blue-500/10 text-blue-500",
  complete_receipt_issued: "bg-success/10 text-success",
  complete_name_change_new: "bg-success/10 text-success",
  name_change_receipt_issued: "bg-success/10 text-success",
  complete_stripe_wait_trc: "bg-blue-500/10 text-blue-500",
  complete_wait_trc: "bg-blue-500/10 text-blue-500",
  complete_trc_issued: "bg-success/10 text-success",
  complete_sponsor: "bg-purple-500/10 text-purple-500",
  complete_vip: "bg-purple-500/10 text-purple-500",
  issue_cash: "bg-destructive/10 text-destructive",
  pending_cash: "bg-warning/10 text-warning",
  refunded: "bg-destructive/10 text-destructive",
  refunded_receipt_issued: "bg-destructive/10 text-destructive",
  complete_wns: "bg-muted text-muted-foreground",
  complete_wns_receipt: "bg-muted text-muted-foreground",
  complete_wait_crn: "bg-blue-500/10 text-blue-500",
  complete_crn_issued: "bg-success/10 text-success",
  issue_refund: "bg-destructive/10 text-destructive",
  pending_refund: "bg-warning/10 text-warning",
  edit_trc: "bg-warning/10 text-warning",
};

const ORDER_FILTER: Record<string, (s: OrderStatus) => boolean> = {
  all: () => true,
  completed: (s) => s.includes("issued") || s === "complete_trc_issued" || s === "complete_crn_issued",
  pending: (s) => s.includes("wait") || s.includes("pending") || s === "submitted",
  issues: (s) => s.startsWith("issue_") || s === "edit_trc",
  refunds: (s) => s.startsWith("refunded") || s === "pending_refund" || s === "issue_refund",
  special: (s) => s === "complete_vip" || s === "complete_sponsor" || s.includes("wns"),
};

const PAYMENT_METHOD_COLOR: Record<PaymentMethod, string> = {
  Stripe: "bg-blue-500/10 text-blue-500",
  Cash: "bg-amber-500/10 text-amber-600",
  VIP: "bg-purple-500/10 text-purple-500",
  Sponsor: "bg-emerald-500/10 text-emerald-600",
};

const ALL_STATUSES = Object.keys(ORDER_STATUS_LABEL) as OrderStatus[];

const COLLECTED_STATUSES: OrderStatus[] = [
  "complete_trc_issued", "complete_receipt_issued", "complete_crn_issued",
  "complete_stripe_wait_receipt", "complete_wait_receipt", "complete_wait_trc",
  "complete_stripe_wait_trc", "complete_wait_crn", "complete_name_change_new",
  "name_change_receipt_issued", "complete_vip", "complete_sponsor",
  "complete_wns", "complete_wns_receipt", "edit_trc",
];

function fmt(amount: number) {
  return new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", minimumFractionDigits: 0 }).format(amount);
}

// ── log styling ───────────────────────────────────────────────────────────────

const LOG_DOT_STYLE: Record<string, string> = {
  registration: "bg-primary/10 text-primary",
  payment: "bg-primary/10 text-primary",
  status_change: "bg-muted text-muted-foreground",
  refund_request: "bg-purple-500/10 text-purple-500",
  distance_change: "bg-primary/10 text-primary",
  document_issued: "bg-success/10 text-success",
  slip_uploaded: "bg-success/10 text-success",
  note: "bg-amber-500/10 text-amber-600",
};

function LogDotIcon({ type }: { type: string }) {
  const cls = "h-3 w-3";
  switch (type) {
    case "registration": return <CheckCircle2 className={cls} />;
    case "payment": return <FileText className={cls} />;
    case "status_change": return <RefreshCw className={cls} />;
    case "refund_request": return <RotateCcw className={cls} />;
    case "distance_change": return <ArrowRightLeft className={cls} />;
    case "document_issued": return <Receipt className={cls} />;
    case "slip_uploaded": return <Image className={cls} />;
    case "note": return <StickyNote className={cls} />;
    default: return <Clock className={cls} />;
  }
}

// ── props ─────────────────────────────────────────────────────────────────────

interface Props {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  participants: Participant[];
}

// ── component ─────────────────────────────────────────────────────────────────

export default function OrderThreeView({ orders, setOrders, participants }: Props) {
  const [orderFilter, setOrderFilter] = useState("all");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderDateFilter, setOrderDateFilter] = useState<"all" | "today" | "7days" | "month" | "custom">("all");
  const [orderCustomRange, setOrderCustomRange] = useState<DateRange | undefined>();
  const [orderCustomPickerOpen, setOrderCustomPickerOpen] = useState(false);
  const [orderPaymentFilter, setOrderPaymentFilter] = useState<"all" | PaymentMethod>("all");
  const [orderCategoryFilter, setOrderCategoryFilter] = useState("all");
  const [orderTicketFilter, setOrderTicketFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());
  const [refundModalOrder, setRefundModalOrder] = useState<Order | null>(null);
  const [distanceChangeModalOrder, setDistanceChangeModalOrder] = useState<Order | null>(null);

  // ── derived data ──────────────────────────────────────────────────────────

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

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOf7Days = new Date(startOfToday); startOf7Days.setDate(startOf7Days.getDate() - 6);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const uniqueCategories = [...new Set(orders.map((o) => o.category))].sort();
  const uniqueTicketTypes = [...new Set(orders.map((o) => o.ticketType))].sort();

  const filteredOrders = orders.filter((o) => {
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

  const allFilteredSelected = filteredOrders.length > 0 && filteredOrders.every((o) => selectedOrderIds.has(o.id));

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

  const updateOrderStatus = (id: string, newStatus: OrderStatus) => {
    setOrders((prev) => prev.map((o) => {
      if (o.id !== id) return o;
      return {
        ...o,
        status: newStatus,
        log: [...o.log, {
          timestamp: new Date().toISOString().slice(0, 16).replace("T", " "),
          type: "status_change" as const,
          description: `สถานะเปลี่ยนเป็น: ${ORDER_STATUS_LABEL[newStatus]}`,
          actor: "admin",
        }],
      };
    }));
  };

  const updateOrderNote = (id: string, note: string) => {
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, note } : o));
  };

  const bulkUpdateStatus = (newStatus: OrderStatus) => {
    setOrders((prev) => prev.map((o) => {
      if (!selectedOrderIds.has(o.id)) return o;
      return {
        ...o,
        status: newStatus,
        log: [...o.log, {
          timestamp: new Date().toISOString().slice(0, 16).replace("T", " "),
          type: "status_change" as const,
          description: `สถานะเปลี่ยนเป็น: ${ORDER_STATUS_LABEL[newStatus]} (bulk)`,
          actor: "admin",
        }],
      };
    }));
    setSelectedOrderIds(new Set());
  };

  const exportCSV = () => {
    const headers = ["Order ID", "Buyer Name", "Email", "Category", "Ticket Type", "Payment Method", "Amount (THB)", "Status", "Timestamp", "Note"];
    const rows = filteredOrders.map((o) => [
      o.id, o.buyerName, o.buyerEmail, o.category, o.ticketType,
      o.paymentMethod, o.amount, ORDER_STATUS_LABEL[o.status], o.timestamp, o.note,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders3-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Order (Direction 3)</h3>
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
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${orderDateFilter === "custom" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                  >
                    {orderDateFilter === "custom" && orderCustomRange?.from && orderCustomRange?.to
                      ? `${format(orderCustomRange.from, "d MMM")} – ${format(orderCustomRange.to, "d MMM")}`
                      : labels.custom}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-popover" align="start">
                  <Calendar
                    initialFocus mode="range" defaultMonth={orderCustomRange?.from}
                    selected={orderCustomRange}
                    onSelect={(range) => {
                      setOrderCustomRange(range);
                      setOrderDateFilter("custom");
                      if (range?.from && range?.to) setOrderCustomPickerOpen(false);
                    }}
                    numberOfMonths={2} className="p-3"
                  />
                </PopoverContent>
              </Popover>
            );
          }
          return (
            <button
              key={val}
              onClick={() => setOrderDateFilter(val)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${orderDateFilter === val ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
            >
              {labels[val]}
            </button>
          );
        })}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total Collected</p>
          <p className="mt-1 text-2xl font-bold text-success">{fmt(totalCollected)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Pending Review</p>
          <p className="mt-1 text-2xl font-bold text-warning">{pendingCount} orders</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Issues</p>
          <p className="mt-1 text-2xl font-bold text-destructive">{issuesCount} orders</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Refunded</p>
          <p className="mt-1 text-2xl font-bold">{fmt(refundedTotal)}</p>
        </div>
      </div>

      {/* Dropdown Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Select value={orderPaymentFilter} onValueChange={(v) => setOrderPaymentFilter(v as "all" | PaymentMethod)}>
          <SelectTrigger className="h-8 w-[140px] text-xs bg-background">
            <SelectValue placeholder="All Payments" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="all">All Payments</SelectItem>
            {(["Stripe", "Cash", "VIP", "Sponsor"] as PaymentMethod[]).map((m) => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={orderCategoryFilter} onValueChange={setOrderCategoryFilter}>
          <SelectTrigger className="h-8 w-[150px] text-xs bg-background">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="all">All Categories</SelectItem>
            {uniqueCategories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={orderTicketFilter} onValueChange={setOrderTicketFilter}>
          <SelectTrigger className="h-8 w-[140px] text-xs bg-background">
            <SelectValue placeholder="All Tickets" />
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

      {/* Tab Filters + Search */}
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
      {selectedOrder && (
        <OrderDetailModal3
          order={selectedOrder}
          participants={participants}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={(id, status) => {
            updateOrderStatus(id, status);
            setSelectedOrder((prev) => prev ? {
              ...prev,
              status,
              log: [...prev.log, {
                timestamp: new Date().toISOString().slice(0, 16).replace("T", " "),
                type: "status_change" as const,
                description: `สถานะเปลี่ยนเป็น: ${ORDER_STATUS_LABEL[status]}`,
                actor: "admin",
              }],
            } : null);
          }}
          onNoteChange={(id, note) => {
            updateOrderNote(id, note);
            setSelectedOrder((prev) => prev ? { ...prev, note } : null);
          }}
          onRefund={(order) => { setSelectedOrder(null); setRefundModalOrder(order); }}
          onDistanceChange={(order) => { setSelectedOrder(null); setDistanceChangeModalOrder(order); }}
          onSlipUpload={(id, slip) => {
            setOrders((prev) => prev.map((o) => {
              if (o.id !== id) return o;
              return {
                ...o,
                slip,
                log: [...o.log, {
                  timestamp: new Date().toISOString().slice(0, 16).replace("T", " "),
                  type: "slip_uploaded" as const,
                  description: "อัปโหลดสลิปโอนเงิน",
                  actor: "admin",
                }],
              };
            }));
            setSelectedOrder((prev) => prev ? {
              ...prev,
              slip,
              log: [...prev.log, {
                timestamp: new Date().toISOString().slice(0, 16).replace("T", " "),
                type: "slip_uploaded" as const,
                description: "อัปโหลดสลิปโอนเงิน",
                actor: "admin",
              }],
            } : null);
          }}
        />
      )}

      {/* Refund Modal */}
      {refundModalOrder && (
        <RefundModal3
          order={refundModalOrder}
          onClose={() => setRefundModalOrder(null)}
          onConfirm={(id, refundAmount, requestDate, rate) => {
            updateOrderStatus(id, "pending_refund");
            setOrders((prev) => prev.map((o) => {
              if (o.id !== id) return o;
              return {
                ...o,
                status: "pending_refund",
                log: [...o.log, {
                  timestamp: new Date().toISOString().slice(0, 16).replace("T", " "),
                  type: "refund_request" as const,
                  description: `ยื่นคำขอคืนเงิน ${fmt(refundAmount)} (${Math.round(rate * 100)}%) — วันที่ขอ ${format(requestDate, "dd/MM/yyyy")}`,
                  amount: -refundAmount,
                  actor: "admin",
                }],
              };
            }));
            setRefundModalOrder(null);
          }}
        />
      )}

      {/* Distance Change Modal */}
      {distanceChangeModalOrder && (
        <ChangeCategoryModal3
          order={distanceChangeModalOrder}
          onClose={() => setDistanceChangeModalOrder(null)}
          onConfirm={(id, newCategory, result, requestDate) => {
            setOrders((prev) => prev.map((o) => {
              if (o.id !== id) return o;
              const desc = result.type === "upgrade"
                ? `เปลี่ยนระยะ ${o.category} → ${newCategory} (Upgrade, จ่ายเพิ่ม ${fmt(result.netAmount)})`
                : `เปลี่ยนระยะ ${o.category} → ${newCategory} (Downgrade, คืน ${fmt(result.netAmount)})`;
              return {
                ...o,
                category: newCategory,
                log: [...o.log, {
                  timestamp: new Date().toISOString().slice(0, 16).replace("T", " "),
                  type: "distance_change" as const,
                  description: desc,
                  amount: result.type === "upgrade" ? result.netAmount : -result.netAmount,
                  actor: "admin",
                }],
              };
            }));
            setDistanceChangeModalOrder(null);
          }}
        />
      )}

      {/* Orders Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <input
                  type="checkbox"
                  checked={allFilteredSelected}
                  onChange={toggleSelectAll}
                  className="cursor-pointer"
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
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow
                key={order.id}
                className={`cursor-pointer transition-colors ${selectedOrderIds.has(order.id) ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/30"}`}
                onClick={() => setSelectedOrder(order)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedOrderIds.has(order.id)}
                    onChange={() => {
                      setSelectedOrderIds((prev) => {
                        const next = new Set(prev);
                        if (next.has(order.id)) next.delete(order.id); else next.add(order.id);
                        return next;
                      });
                    }}
                  />
                </TableCell>
                <TableCell className="font-mono text-xs">{order.id}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-sm">{order.buyerName}</p>
                    <p className="text-xs text-muted-foreground">{order.buyerEmail}</p>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{order.category}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${PAYMENT_METHOD_COLOR[order.paymentMethod]}`}>
                    {order.paymentMethod}
                  </span>
                  {order.paymentMethod === "Cash" && !order.slip?.uploaded && (
                    <span className="ml-1 inline-flex rounded-full bg-warning/10 px-1.5 py-0.5 text-[10px] font-medium text-warning">รอสลิป</span>
                  )}
                </TableCell>
                <TableCell className="text-sm">{fmt(order.amount)}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Select value={order.status} onValueChange={(val) => updateOrderStatus(order.id, val as OrderStatus)}>
                    <SelectTrigger className="h-7 w-auto border-0 bg-transparent p-0 text-xs shadow-none focus:ring-0">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${ORDER_STATUS_COLOR[order.status]}`}>
                        {ORDER_STATUS_LABEL[order.status]}
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
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{order.timestamp}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
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
                      <DropdownMenuItem onClick={() => setRefundModalOrder(order)}>
                        <RotateCcw className="mr-2 h-3.5 w-3.5" />
                        Refund
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDistanceChangeModalOrder(order)}>
                        <ArrowRightLeft className="mr-2 h-3.5 w-3.5" />
                        เปลี่ยนแปลงระยะวิ่ง
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Receipt className="mr-2 h-3.5 w-3.5" />
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
          <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-foreground" onClick={() => setSelectedOrderIds(new Set())}>
            ยกเลิก
          </Button>
        </div>
      )}
    </div>
  );
}

// ── OrderDetailModal3 ─────────────────────────────────────────────────────────

interface OrderDetailModal3Props {
  order: Order;
  participants: Participant[];
  onClose: () => void;
  onStatusChange: (id: string, status: OrderStatus) => void;
  onNoteChange: (id: string, note: string) => void;
  onRefund: (order: Order) => void;
  onDistanceChange: (order: Order) => void;
  onSlipUpload: (id: string, slip: OrderSlip) => void;
}

function OrderDetailModal3({
  order, participants, onClose, onStatusChange, onNoteChange,
  onRefund, onDistanceChange, onSlipUpload,
}: OrderDetailModal3Props) {
  const [detailTab, setDetailTab] = useState<"info" | "log" | "slip">("info");

  const linkedParticipant = participants.find(
    (p) => p.email.toLowerCase() === order.buyerEmail.toLowerCase()
  );

  const isCash = order.paymentMethod === "Cash";
  const slipUploaded = order.slip?.uploaded;
  const slipBadge = isCash && !slipUploaded ? "!" : null;

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-border">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <DialogTitle className="font-mono text-base">{order.id}</DialogTitle>
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${ORDER_STATUS_COLOR[order.status]}`}>
                  {ORDER_STATUS_LABEL[order.status]}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{order.buyerName} · {order.timestamp}</p>
            </div>
          </div>
        </DialogHeader>

        {/* Inner tab bar */}
        <div className="flex border-b border-border bg-card">
          {([
            { key: "info", label: "ข้อมูล" },
            { key: "log", label: "ประวัติ", badge: order.log.length },
            { key: "slip", label: "สลิปโอนเงิน", badge: slipBadge, warn: !!slipBadge },
          ] as const).map((t) => (
            <button
              key={t.key}
              onClick={() => setDetailTab(t.key)}
              className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                detailTab === t.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
              {t.badge !== null && t.badge !== undefined && (
                <span className={`inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold ${
                  t.warn ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                }`}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab: Info */}
        {detailTab === "info" && (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">ผู้ซื้อ</p>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="font-medium">{order.buyerName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground break-all">{order.buyerEmail}</span>
                </div>
                {linkedParticipant && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">{linkedParticipant.phone}</span>
                  </div>
                )}
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">รายละเอียดการสมัคร</p>
                <div className="flex items-center gap-2 text-sm">
                  <Hash className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  {linkedParticipant?.bibNo
                    ? <span className="font-mono font-medium">BIB #{linkedParticipant.bibNo}</span>
                    : <span className="text-muted-foreground">ยังไม่มี BIB</span>}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">{order.category}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Tag className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">{order.ticketType}</span>
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
                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${PAYMENT_METHOD_COLOR[order.paymentMethod]}`}>
                  {order.paymentMethod}
                </span>
                <span className="text-xl font-bold text-foreground">{fmt(order.amount)}</span>
              </div>
            </div>

            {/* Status Change */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">เปลี่ยนสถานะ</Label>
              <Select value={order.status} onValueChange={(val) => onStatusChange(order.id, val as OrderStatus)}>
                <SelectTrigger className="bg-background">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${ORDER_STATUS_COLOR[order.status]}`}>
                    {ORDER_STATUS_LABEL[order.status]}
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
                value={order.note}
                onChange={(e) => onNoteChange(order.id, e.target.value)}
                placeholder="เพิ่ม note สำหรับ order นี้..."
                rows={2}
                className="bg-background text-sm"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-1 border-t border-border">
              <Button variant="outline" size="sm" className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/5" onClick={() => onRefund(order)}>
                <RotateCcw className="h-3.5 w-3.5" />
                คืนเงิน
              </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => onDistanceChange(order)}>
                <ArrowRightLeft className="h-3.5 w-3.5" />
                เปลี่ยนระยะวิ่ง
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Receipt className="h-3.5 w-3.5" />
                Issue Tax Invoice
              </Button>
              <Button variant="ghost" size="sm" className="ml-auto text-muted-foreground" onClick={onClose}>
                ปิด
              </Button>
            </div>
          </div>
        )}

        {/* Tab: Log */}
        {detailTab === "log" && (
          <div className="p-6">
            {order.log.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">ยังไม่มีประวัติ</p>
            ) : (
              <div className="space-y-0">
                {[...order.log].reverse().map((entry, i) => {
                  const dotCls = LOG_DOT_STYLE[entry.type] ?? "bg-muted text-muted-foreground";
                  const isLast = i === order.log.length - 1;
                  return (
                    <div key={entry.timestamp + entry.type + i} className="relative flex gap-3 pb-4">
                      {!isLast && (
                        <div className="absolute left-[13px] top-7 bottom-0 w-px bg-border" />
                      )}
                      <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5 ${dotCls}`}>
                        <LogDotIcon type={entry.type} />
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className="text-sm text-foreground leading-snug">{entry.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {entry.actor && (
                            <span className="text-xs font-medium text-muted-foreground">{entry.actor}</span>
                          )}
                          <span className="text-xs text-muted-foreground">{entry.timestamp}</span>
                          {entry.amount !== undefined && (
                            <span className={`text-xs font-semibold ${entry.amount >= 0 ? "text-success" : "text-destructive"}`}>
                              {entry.amount >= 0 ? "+" : ""}{fmt(entry.amount)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab: Slip */}
        {detailTab === "slip" && (
          <SlipTab order={order} onSlipUpload={onSlipUpload} />
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── SlipTab ───────────────────────────────────────────────────────────────────

function SlipTab({ order, onSlipUpload }: { order: Order; onSlipUpload: (id: string, slip: OrderSlip) => void }) {
  const [lightbox, setLightbox] = useState(false);
  const isCash = order.paymentMethod === "Cash";

  if (!isCash) {
    return (
      <div className="p-6">
        <div className="flex gap-3 rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 text-xs text-blue-600">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <span>ออเดอร์นี้ชำระผ่าน <strong>{order.paymentMethod}</strong> — ไม่ต้องใช้สลิปโอนเงิน ระบบบันทึกการชำระเงินอัตโนมัติ</span>
        </div>
      </div>
    );
  }

  const slip = order.slip;

  if (!slip?.uploaded) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>ยังไม่มีสลิปโอนเงิน กรุณาขอสลิปจากผู้สมัครก่อนยืนยันการชำระเงิน</span>
        </div>
        <div
          className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
          onClick={() => {
            const mockSlip: OrderSlip = {
              uploaded: true,
              ts: new Date().toISOString().slice(0, 16).replace("T", " "),
              bank: "ธนาคารกสิกรไทย (KBANK)",
              ref: `REF${Date.now()}`,
              declaredAmt: order.amount,
            };
            onSlipUpload(order.id, mockSlip);
          }}
        >
          <Upload className="h-7 w-7 text-muted-foreground" />
          <p className="text-sm font-medium">อัปโหลดสลิปโอนเงิน</p>
          <p className="text-xs text-muted-foreground">รองรับ JPG, PNG ขนาดไม่เกิน 5MB</p>
        </div>
      </div>
    );
  }

  const amtMatch = slip.declaredAmt === order.amount;
  const diff = order.amount - slip.declaredAmt;

  return (
    <div className="p-6 space-y-4">
      {!amtMatch && (
        <div className="flex gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span><strong>ยอดไม่ตรง</strong> — สลิปแสดง {fmt(slip.declaredAmt)} แต่ยอดที่ต้องชำระคือ {fmt(order.amount)} (ต่างกัน {fmt(diff)})</span>
        </div>
      )}

      <div className="rounded-xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b border-border">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Image className="h-4 w-4" />
            สลิปโอนเงิน
            {amtMatch
              ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-success/10 text-success">ยอดตรง</span>
              : <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">ยอดไม่ตรง</span>}
          </div>
          <span className="text-xs text-muted-foreground">อัปโหลด {slip.ts}</span>
        </div>
        <div className="p-4 flex gap-4">
          <div
            className="relative w-28 flex-shrink-0 rounded-lg border border-border bg-muted/50 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
            style={{ aspectRatio: "3/4" }}
            onClick={() => setLightbox(true)}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-muted-foreground">
              <Image className="h-7 w-7 opacity-30" />
              <span className="text-[10px]">คลิกเพื่อดู</span>
            </div>
            <div className="absolute bottom-1.5 right-1.5 bg-foreground/60 rounded p-0.5">
              <ZoomIn className="h-2.5 w-2.5 text-white" />
            </div>
          </div>
          <div className="flex-1 space-y-3">
            {[
              { label: "ธนาคาร", value: slip.bank, cls: "" },
              { label: "Reference No.", value: slip.ref, cls: "font-mono text-sm" },
              { label: "ยอดในสลิป", value: fmt(slip.declaredAmt), cls: amtMatch ? "text-success" : "text-destructive" },
              { label: "ยอดที่ต้องชำระ", value: fmt(order.amount), cls: "" },
              { label: "ผลต่าง", value: amtMatch ? "ตรง" : `${fmt(diff)} ขาด`, cls: amtMatch ? "text-success" : "text-destructive" },
            ].map((row) => (
              <div key={row.label}>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{row.label}</p>
                <p className={`text-sm font-semibold ${row.cls}`}>{row.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Button variant="outline" size="sm" className="gap-2">
        <Upload className="h-3.5 w-3.5" />
        อัปโหลดสลิปใหม่
      </Button>

      {lightbox && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85"
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute top-4 right-4 flex items-center justify-center w-9 h-9 rounded-lg bg-white/15 text-white hover:bg-white/25 transition-colors"
            onClick={() => setLightbox(false)}
          >
            ✕
          </button>
          <div
            className="relative bg-card rounded-xl p-6 max-w-sm w-full shadow-elevated mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-4">
              <Image className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold text-sm">สลิปโอนเงิน — {order.id}</span>
            </div>
            <div className="rounded-lg border border-border bg-muted/50 p-5 font-mono text-sm leading-8">
              <div className="text-center font-bold text-base mb-2">ใบโอนเงิน</div>
              <div className="flex justify-between"><span className="text-muted-foreground">จาก</span><span>{order.buyerName}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">ธนาคาร</span><span>{slip.bank}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Ref</span><span>{slip.ref}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">วันที่</span><span>{slip.ts.split(" ")[0]}</span></div>
              <div className="flex justify-between font-bold border-t border-dashed border-border mt-2 pt-2">
                <span>ยอด</span>
                <span className={amtMatch ? "text-success" : "text-destructive"}>{fmt(slip.declaredAmt)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── RefundModal3 ──────────────────────────────────────────────────────────────

interface RefundModal3Props {
  order: Order;
  onClose: () => void;
  onConfirm: (id: string, refundAmount: number, requestDate: Date, rate: number) => void;
}

const TODAY_STR = "2026-04-21";

function RefundModal3({ order, onClose, onConfirm }: RefundModal3Props) {
  const [step, setStep] = useState(1);
  const [refundMethod, setRefundMethod] = useState<"original" | "manual">("original");
  const [requestDateStr, setRequestDateStr] = useState(TODAY_STR);

  const requestDate = new Date(requestDateStr);
  const isBackdated = requestDateStr < TODAY_STR;
  const isFuture = requestDateStr > TODAY_STR;

  const calc = calculateRefund(order.amount, requestDate);
  const canRefund = calc.canRefund && calc.refundAmount > 0;

  const currentPeriodIndex = REFUND_POLICY.findIndex((p) => {
    const d = new Date(requestDate.getFullYear(), requestDate.getMonth(), requestDate.getDate());
    return d >= p.from && d <= p.to;
  });

  function dateBadge() {
    if (isBackdated) return <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 whitespace-nowrap">ย้อนหลัง {format(requestDate, "d MMM yyyy")}</span>;
    if (isFuture) return <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 whitespace-nowrap">ล่วงหน้า {format(requestDate, "d MMM yyyy")}</span>;
    return <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground whitespace-nowrap">วันนี้</span>;
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>คืนเงิน — {order.id}</DialogTitle>
          <p className="text-xs text-muted-foreground">{order.buyerName} · {order.category} · {fmt(order.amount)}</p>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mt-1">
          {["คำนวณยอดคืนเงิน", "ยืนยันการคืนเงิน"].map((label, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step > i + 1 ? "bg-success/15 text-success" :
                step === i + 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {step > i + 1 ? "✓" : i + 1}
              </div>
              <span className={`text-xs font-medium flex-1 ${step === i + 1 ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
              {i < 1 && <div className="h-px flex-1 bg-border" />}
            </div>
          ))}
        </div>

        <div className="space-y-4 mt-2">
          {step === 1 && (
            <>
              {/* Date picker */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">วันที่ยื่นคำขอถอนตัว</p>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={requestDateStr}
                    min="2026-04-03"
                    max="2026-12-31"
                    onChange={(e) => setRequestDateStr(e.target.value)}
                    className="flex-1 h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  {dateBadge()}
                </div>
                {(isBackdated || isFuture) && (
                  <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    {isBackdated ? "ใช้นโยบายของวันที่ระบุ — กรุณาแนบหลักฐานการแจ้งย้อนหลัง" : "ใช้นโยบายของวันที่ระบุในอนาคต"}
                  </p>
                )}
              </div>

              {/* Policy banner */}
              {calc.period ? (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-primary mb-1">
                    นโยบายสำหรับวันที่ {format(requestDate, "d MMM yyyy")}
                    {isBackdated ? " (ย้อนหลัง)" : isFuture ? " (ล่วงหน้า)" : ""}
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-primary">{Math.round(calc.refundRate * 100)}%</span>
                    <div className="text-xs text-muted-foreground">
                      <p>{calc.period.label}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span><strong>ไม่สามารถขอคืนเงินได้</strong> — ขณะนี้อยู่นอกช่วงเวลาที่กำหนด</span>
                </div>
              )}

              {/* Calc breakdown */}
              {canRefund && (
                <div className="rounded-lg border border-border overflow-hidden">
                  <div className="flex justify-between items-center px-3 py-2 text-sm border-b border-border">
                    <span className="text-muted-foreground">ยอดชำระจริง</span>
                    <span>{fmt(order.amount)}</span>
                  </div>
                  <div className="flex justify-between items-center px-3 py-2 text-sm border-b border-border">
                    <span className="text-muted-foreground">ค่าธรรมเนียมระบบ (5%) — ไม่คืน</span>
                    <span className="text-destructive">−{fmt(calc.paymentFee)}</span>
                  </div>
                  {calc.processingFee > 0 && (
                    <div className="flex justify-between items-center px-3 py-2 text-sm border-b border-border">
                      <span className="text-muted-foreground">ค่าดำเนินการ (คืน 100%)</span>
                      <span className="text-destructive">−{fmt(calc.processingFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center px-3 py-2 text-sm border-b border-border">
                    <span className="text-muted-foreground">อัตราคืนเงิน ({Math.round(calc.refundRate * 100)}%)</span>
                    <span>×{calc.refundRate}</span>
                  </div>
                  <div className="flex justify-between items-center px-3 py-2 text-sm font-bold bg-muted/40">
                    <span>ยอดที่จะคืน</span>
                    <span className="text-success text-base">{fmt(calc.refundAmount)}</span>
                  </div>
                </div>
              )}

              {/* Policy table (collapsible) */}
              <details className="text-xs">
                <summary className="text-muted-foreground cursor-pointer mb-2">ดูนโยบายการคืนเงินทั้งหมด (PST 2026)</summary>
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left px-2.5 py-1.5 text-[10px] font-semibold text-muted-foreground">ช่วงเวลา</th>
                      <th className="text-left px-2.5 py-1.5 text-[10px] font-semibold text-muted-foreground">อัตรา</th>
                    </tr>
                  </thead>
                  <tbody>
                    {REFUND_POLICY.map((p, i) => {
                      const isCurrent = i === currentPeriodIndex;
                      return (
                        <tr key={i} className={`border-t border-border ${isCurrent ? "bg-primary/5 font-semibold" : ""}`}>
                          <td className="px-2.5 py-1.5">
                            {isCurrent && <span className="text-primary mr-1">▶</span>}
                            {p.label}
                          </td>
                          <td className={`px-2.5 py-1.5 ${p.rate > 0 ? "text-success" : "text-destructive"}`}>
                            {Math.round(p.rate * 100)}%
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="border-t border-border">
                      <td className="px-2.5 py-1.5">ตั้งแต่ 1 ต.ค. 2026 เป็นต้นไป</td>
                      <td className="px-2.5 py-1.5 text-destructive">0%</td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-muted-foreground mt-1.5">* ค่าธรรมเนียมระบบ 5% ไม่สามารถขอคืนได้ทุกกรณี · เงินคืนภายใน 7 วันทำการ</p>
              </details>
            </>
          )}

          {step === 2 && (
            <>
              {/* Info box */}
              <div className="flex gap-2 rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 text-xs text-blue-600">
                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                <span>กรุณาตรวจสอบข้อมูลก่อนดำเนินการ ยอดคืนเงินจะถูกโอนกลับภายใน <strong>7 วันทำการ</strong></span>
              </div>

              {/* Summary */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">สรุปการคืนเงิน</p>
                <div className="rounded-lg border border-border overflow-hidden">
                  {[
                    { k: "ผู้สมัคร", v: order.buyerName },
                    { k: "ประเภท", v: `${order.category} · ${order.ticketType}` },
                    { k: "วันที่ยื่นคำขอ", v: `${format(requestDate, "d MMM yyyy")}${isBackdated ? " (ย้อนหลัง)" : isFuture ? " (ล่วงหน้า)" : " (วันนี้)"}` },
                    { k: "นโยบายที่ใช้", v: `${calc.period?.label ?? ""} · ${Math.round(calc.refundRate * 100)}%` },
                    { k: "ยอดชำระเดิม", v: fmt(order.amount) },
                  ].map((row) => (
                    <div key={row.k} className="flex justify-between items-center px-3 py-2 text-sm border-b border-border">
                      <span className="text-muted-foreground">{row.k}</span>
                      <span className="font-medium">{row.v}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center px-3 py-2 text-sm font-bold bg-muted/40">
                    <span>ยอดที่จะคืน</span>
                    <span className="text-success text-base">{fmt(calc.refundAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Refund channel */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">ช่องทางคืนเงิน</p>
                <div className="space-y-2">
                  {(["original", "manual"] as const).map((m) => (
                    <label
                      key={m}
                      className={`flex items-start gap-3 p-3 rounded-lg border-[1.5px] cursor-pointer transition-colors ${
                        refundMethod === m ? "border-primary bg-primary/4" : "border-border"
                      }`}
                      onClick={() => setRefundMethod(m)}
                    >
                      <input type="radio" name="refundMethod" value={m} checked={refundMethod === m} onChange={() => setRefundMethod(m)} className="mt-0.5 accent-primary" />
                      <div>
                        <p className="text-sm font-semibold">{m === "original" ? `คืนผ่านช่องทางเดิม (${order.paymentMethod})` : "โอนเงินด้วยตนเอง (Manual)"}</p>
                        <p className="text-xs text-muted-foreground">{m === "original" ? "ระบบดำเนินการอัตโนมัติ ใช้เวลา 5–7 วันทำการ" : "กรอกข้อมูลบัญชีปลายทางแยกต่างหาก"}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 mt-2">
          {step === 1 ? (
            <>
              <Button variant="outline" onClick={onClose}>ยกเลิก</Button>
              <div className="flex-1" />
              <Button
                disabled={!canRefund}
                onClick={() => setStep(2)}
              >
                ถัดไป — ยืนยันยอดคืนเงิน
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setStep(1)}>ย้อนกลับ</Button>
              <div className="flex-1" />
              <Button
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                onClick={() => onConfirm(order.id, calc.refundAmount, requestDate, calc.refundRate)}
              >
                ยืนยันคืนเงิน {fmt(calc.refundAmount)}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── ChangeCategoryModal3 ──────────────────────────────────────────────────────

interface ChangeCategoryModal3Props {
  order: Order;
  onClose: () => void;
  onConfirm: (id: string, newCategory: string, result: ReturnType<typeof calculateDistanceChange>, requestDate: Date) => void;
}

const PERIOD_FEE_LABELS = [
  "3–12 เม.ย. 2026",
  "13 เม.ย.–31 ก.ค. 2026",
  "1 ส.ค.–30 ก.ย. 2026",
  "ตั้งแต่ 1 ต.ค. 2026",
];

function ChangeCategoryModal3({ order, onClose, onConfirm }: ChangeCategoryModal3Props) {
  const [selected, setSelected] = useState(order.category);
  const [requestDateStr, setRequestDateStr] = useState(TODAY_STR);

  const requestDate = new Date(requestDateStr);
  const isBackdated = requestDateStr < TODAY_STR;
  const isFuture = requestDateStr > TODAY_STR;

  const periodIndex = DISTANCE_CHANGE_POLICY.findIndex((p) => {
    const d = new Date(requestDate.getFullYear(), requestDate.getMonth(), requestDate.getDate());
    return d >= p.from && d <= p.to;
  });
  const catPolicy = periodIndex >= 0 ? DISTANCE_CHANGE_POLICY[periodIndex] : null;

  const categories = Object.entries(CATEGORY_PRICES);
  const currentPrice = CATEGORY_PRICES[order.category] ?? 0;
  const result = selected !== order.category ? calculateDistanceChange(order.category, selected, requestDate) : null;

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>เปลี่ยนระยะวิ่ง</DialogTitle>
          <p className="text-xs text-muted-foreground">{order.id} · {order.buyerName}</p>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Date picker */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">วันที่ยื่นคำขอเปลี่ยนระยะ</p>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={requestDateStr}
                min="2026-04-03"
                max="2026-12-31"
                onChange={(e) => setRequestDateStr(e.target.value)}
                className="flex-1 h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              {isBackdated && <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 whitespace-nowrap">ย้อนหลัง</span>}
              {isFuture && <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 whitespace-nowrap">ล่วงหน้า</span>}
              {!isBackdated && !isFuture && <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground whitespace-nowrap">วันนี้</span>}
            </div>
          </div>

          {/* Policy info box */}
          {catPolicy && (
            <div className="flex gap-2 rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 text-xs text-blue-700">
              <Info className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                <strong>นโยบาย: {PERIOD_FEE_LABELS[periodIndex]}</strong><br />
                ค่าธรรมเนียมการเปลี่ยน <strong>฿{catPolicy.fee}</strong>
                {" · "}
                {!catPolicy.upgradeAllowed
                  ? <span className="text-destructive">ไม่อนุญาตให้ Upgrade</span>
                  : catPolicy.downgradeRefund ? "Downgrade: คืนส่วนต่าง" : "Downgrade: ไม่คืนส่วนต่าง"}
              </span>
            </div>
          )}

          {/* Upgrade blocked warning */}
          {catPolicy && !catPolicy.upgradeAllowed && selected !== order.category && (CATEGORY_PRICES[selected] ?? 0) > currentPrice && (
            <div className="flex gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span><strong>ไม่อนุญาตให้เปลี่ยนเป็นระยะที่ยาวกว่า</strong> ในช่วงเวลานี้ ({PERIOD_FEE_LABELS[periodIndex]})</span>
            </div>
          )}

          {/* Category cards */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">เลือกระยะใหม่</p>
            <div className="space-y-2">
              {categories.map(([catName, price]) => {
                const diff = price - currentPrice;
                const isCurrentCat = catName === order.category;
                const isBlocked = diff > 0 && catPolicy && !catPolicy.upgradeAllowed;
                const isSelected = selected === catName;
                return (
                  <div
                    key={catName}
                    onClick={() => !isCurrentCat && !isBlocked && setSelected(catName)}
                    className={`rounded-lg border-[1.5px] p-3 transition-colors ${
                      isCurrentCat || isBlocked ? "opacity-45 cursor-not-allowed" :
                      isSelected ? "border-primary bg-primary/5 cursor-pointer" :
                      "border-border hover:border-primary/40 hover:bg-primary/3 cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">
                          {catName}
                          {isCurrentCat && <span className="ml-2 text-xs font-normal text-muted-foreground">(ระยะปัจจุบัน)</span>}
                          {isBlocked && <span className="ml-2 text-xs font-normal text-destructive">(ไม่อนุญาต)</span>}
                        </p>
                        <p className="text-xs text-muted-foreground">ราคา: {fmt(price)}</p>
                      </div>
                      {!isCurrentCat && (
                        <span className={`text-sm font-bold flex items-center gap-0.5 ${diff > 0 ? "text-destructive" : diff < 0 ? "text-success" : "text-muted-foreground"}`}>
                          {diff > 0 ? <ArrowUp className="h-3.5 w-3.5" /> : diff < 0 ? <ArrowDown className="h-3.5 w-3.5" /> : null}
                          {diff !== 0 ? fmt(Math.abs(diff)) : "ราคาเท่ากัน"}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Calc summary */}
          {result && result.allowed && result.type !== "same" && (
            <div className="rounded-lg border border-border overflow-hidden">
              {[
                { k: "วันที่ยื่นคำขอ", v: `${format(requestDate, "d MMM yyyy")}${isBackdated ? " (ย้อนหลัง)" : isFuture ? " (ล่วงหน้า)" : ""}` },
                { k: "นโยบาย", v: result.periodLabel },
                { k: "ค่าธรรมเนียมการเปลี่ยน", v: `−฿${result.fee}`, cls: "text-destructive" },
                {
                  k: "ส่วนต่างราคา",
                  v: result.type === "downgrade" && !result.refundAmount
                    ? `ไม่คืน (${fmt(result.priceDiff)})`
                    : result.type === "upgrade" ? `ชำระเพิ่ม ${fmt(result.priceDiff)}` : `คืน ${fmt(result.priceDiff)}`,
                  cls: result.type === "upgrade" ? "text-destructive" : result.refundAmount ? "text-success" : "text-muted-foreground",
                },
              ].map((row) => (
                <div key={row.k} className="flex justify-between items-center px-3 py-2 text-sm border-b border-border">
                  <span className="text-muted-foreground">{row.k}</span>
                  <span className={`font-medium ${row.cls ?? ""}`}>{row.v}</span>
                </div>
              ))}
              <div className="flex justify-between items-center px-3 py-2 text-sm font-bold bg-muted/40">
                <span>{result.type === "upgrade" ? "ลูกค้าต้องจ่ายเพิ่ม" : "ยอดที่คืนลูกค้า"}</span>
                <span className={result.type === "upgrade" ? "text-destructive" : "text-success"}>
                  {fmt(result.netAmount)}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-2">
          <Button variant="outline" onClick={onClose}>ยกเลิก</Button>
          <div className="flex-1" />
          <Button
            disabled={!result || !result.allowed || result.type === "same"}
            onClick={() => result && onConfirm(order.id, selected, result, requestDate)}
          >
            ยืนยันการเปลี่ยนระยะ
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
