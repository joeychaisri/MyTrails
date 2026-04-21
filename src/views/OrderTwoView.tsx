import { useState } from "react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import {
  Download, Search, MoreHorizontal,
  Receipt, RotateCcw, ArrowRightLeft, User, Mail, Phone,
  Hash, Tag, Shirt,
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
import { Order, OrderStatus, Participant, PaymentMethod } from "@/data/mockData";
import { calculateRefund, REFUND_POLICY } from "@/lib/refundPolicy";
import { calculateDistanceChange, CATEGORY_PRICES } from "@/lib/distanceChangePolicy";

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

// ── props ─────────────────────────────────────────────────────────────────────

interface Props {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  participants: Participant[];
}

// ── component ─────────────────────────────────────────────────────────────────

export default function OrderTwoView({ orders, setOrders, participants }: Props) {
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
    a.download = `orders2-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Transaction History (Order Two)</h3>
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
        <OrderDetailModal
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
              }],
            } : null);
          }}
          onNoteChange={(id, note) => {
            updateOrderNote(id, note);
            setSelectedOrder((prev) => prev ? { ...prev, note } : null);
          }}
          onRefund={(order) => { setSelectedOrder(null); setRefundModalOrder(order); }}
          onDistanceChange={(order) => { setSelectedOrder(null); setDistanceChangeModalOrder(order); }}
          onSlipUpload={(id, url) => {
            setOrders((prev) => prev.map((o) => {
              if (o.id !== id) return o;
              return {
                ...o,
                slipUrl: url,
                log: [...o.log, {
                  timestamp: new Date().toISOString().slice(0, 16).replace("T", " "),
                  type: "slip_uploaded" as const,
                  description: "อัปโหลดสลิปโอนเงิน",
                }],
              };
            }));
            setSelectedOrder((prev) => prev ? {
              ...prev,
              slipUrl: url,
              log: [...prev.log, {
                timestamp: new Date().toISOString().slice(0, 16).replace("T", " "),
                type: "slip_uploaded" as const,
                description: "อัปโหลดสลิปโอนเงิน",
              }],
            } : null);
          }}
          ORDER_STATUS_LABEL={ORDER_STATUS_LABEL}
          ORDER_STATUS_COLOR={ORDER_STATUS_COLOR}
          ALL_STATUSES={ALL_STATUSES}
          PAYMENT_METHOD_COLOR={PAYMENT_METHOD_COLOR}
          fmt={fmt}
        />
      )}

      {/* Refund Calculator Modal */}
      {refundModalOrder && (
        <RefundCalculatorModal
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
                }],
              };
            }));
            setRefundModalOrder(null);
          }}
          fmt={fmt}
        />
      )}

      {/* Distance Change Modal */}
      {distanceChangeModalOrder && (
        <DistanceChangeModal
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
                }],
              };
            }));
            setDistanceChangeModalOrder(null);
          }}
          fmt={fmt}
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
                  {order.paymentMethod === "Cash" && !order.slipUrl && (
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

// ── sub-components (stubs — will be replaced in later tasks) ────────────────────

interface OrderDetailModalProps {
  order: Order;
  participants: Participant[];
  onClose: () => void;
  onStatusChange: (id: string, status: OrderStatus) => void;
  onNoteChange: (id: string, note: string) => void;
  onRefund: (order: Order) => void;
  onDistanceChange: (order: Order) => void;
  onSlipUpload: (id: string, url: string) => void;
  ORDER_STATUS_LABEL: Record<OrderStatus, string>;
  ORDER_STATUS_COLOR: Record<OrderStatus, string>;
  ALL_STATUSES: OrderStatus[];
  PAYMENT_METHOD_COLOR: Record<PaymentMethod, string>;
  fmt: (n: number) => string;
}

const LOG_TYPE_ICON: Record<string, string> = {
  registration: "📋",
  payment: "💳",
  status_change: "🔄",
  refund_request: "↩️",
  distance_change: "🏃",
  document_issued: "📄",
  slip_uploaded: "📎",
  note: "📝",
};

function OrderDetailModal({
  order, participants, onClose, onStatusChange, onNoteChange,
  onRefund, onDistanceChange, onSlipUpload,
  ORDER_STATUS_LABEL, ORDER_STATUS_COLOR, ALL_STATUSES, PAYMENT_METHOD_COLOR, fmt,
}: OrderDetailModalProps) {
  const [detailTab, setDetailTab] = useState<"info" | "log">("info");
  const [slipInput, setSlipInput] = useState(order.slipUrl ?? "");

  const linkedParticipant = participants.find(
    (p) => p.email.toLowerCase() === order.buyerEmail.toLowerCase()
  );

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="font-mono text-lg">{order.id}</DialogTitle>
              <p className="mt-0.5 text-sm text-muted-foreground">{order.timestamp}</p>
            </div>
            <span className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-medium ${ORDER_STATUS_COLOR[order.status]}`}>
              {ORDER_STATUS_LABEL[order.status]}
            </span>
          </div>
        </DialogHeader>

        {/* Tabs */}
        <Tabs value={detailTab} onValueChange={(v) => setDetailTab(v as "info" | "log")} className="mt-2">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="info">ข้อมูล</TabsTrigger>
            <TabsTrigger value="log">ประวัติ ({order.log.length})</TabsTrigger>
          </TabsList>

          {/* Tab: Info */}
          <TabsContent value="info" className="mt-4 space-y-4">
            {/* Buyer + Order Info */}
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
                  <span className="text-xs">🏃</span>
                  <span>{order.category}</span>
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
              {/* Cash Slip */}
              {order.paymentMethod === "Cash" && (
                <div className="mt-3 space-y-2 border-t border-border pt-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">หลักฐานการโอนเงิน</p>
                  {order.slipUrl ? (
                    <div className="flex items-center gap-2">
                      <a href={order.slipUrl} target="_blank" rel="noreferrer" className="text-xs text-primary underline truncate max-w-[200px]">
                        {order.slipUrl}
                      </a>
                      <Button
                        variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground"
                        onClick={() => { setSlipInput(""); onSlipUpload(order.id, ""); }}
                      >
                        เปลี่ยน
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        value={slipInput}
                        onChange={(e) => setSlipInput(e.target.value)}
                        placeholder="วาง URL สลิป..."
                        className="h-8 text-xs bg-background"
                      />
                      <Button
                        size="sm" className="h-8 text-xs"
                        disabled={!slipInput.trim()}
                        onClick={() => onSlipUpload(order.id, slipInput.trim())}
                      >
                        แนบ
                      </Button>
                    </div>
                  )}
                </div>
              )}
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
              <Button variant="outline" size="sm" className="gap-2" onClick={() => onRefund(order)}>
                <RotateCcw className="h-3.5 w-3.5" />
                Refund
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
          </TabsContent>

          {/* Tab: Log */}
          <TabsContent value="log" className="mt-4">
            {order.log.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">ยังไม่มีประวัติ</p>
            ) : (
              <div className="relative pl-6 space-y-4">
                <div className="absolute left-2 top-2 bottom-2 w-px bg-border" />
                {[...order.log].reverse().map((entry, i) => (
                  <div key={entry.timestamp + entry.type} className="relative">
                    <div className="absolute -left-4 top-1 h-2 w-2 rounded-full bg-primary" />
                    <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">
                          {LOG_TYPE_ICON[entry.type] ?? "•"} {entry.description}
                        </span>
                        {entry.amount !== undefined && (
                          <span className={`text-xs font-semibold ${entry.amount >= 0 ? "text-success" : "text-destructive"}`}>
                            {entry.amount >= 0 ? "+" : ""}{fmt(entry.amount)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{entry.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
interface RefundCalculatorProps {
  order: Order;
  onClose: () => void;
  onConfirm: (id: string, refundAmount: number, requestDate: Date, rate: number) => void;
  fmt: (n: number) => string;
}

function RefundCalculatorModal({ order, onClose, onConfirm, fmt }: RefundCalculatorProps) {
  const [requestDate, setRequestDate] = useState<Date>(new Date());

  const calc = calculateRefund(order.amount, requestDate);

  const currentPeriodIndex = REFUND_POLICY.findIndex(
    (p) => {
      const d = new Date(requestDate.getFullYear(), requestDate.getMonth(), requestDate.getDate());
      return d >= p.from && d <= p.to;
    }
  );
  const nextPeriod = currentPeriodIndex >= 0 && currentPeriodIndex < REFUND_POLICY.length - 1
    ? REFUND_POLICY[currentPeriodIndex + 1]
    : null;

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>คำขอคืนเงิน — {order.id}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          {/* Order summary */}
          <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm space-y-1">
            <p className="font-medium">{order.buyerName}</p>
            <p className="text-muted-foreground text-xs">{order.buyerEmail}</p>
            <p className="text-xs text-muted-foreground">{order.category} · {order.ticketType} · {order.paymentMethod}</p>
          </div>

          {/* Request date picker */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              วันที่ลูกค้ายื่นคำขอ
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="w-full justify-start text-sm font-normal">
                  {format(requestDate, "dd/MM/yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-popover" align="start">
                <Calendar
                  mode="single"
                  selected={requestDate}
                  onSelect={(d) => d && setRequestDate(d)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Calculation breakdown */}
          <div className="rounded-lg border border-border bg-muted/10 p-3 space-y-2 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">การคำนวณ</p>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ยอดที่ชำระจริง</span>
              <span>{fmt(order.amount)}</span>
            </div>
            <div className="flex justify-between text-destructive/80">
              <span>หัก 5% ค่าธรรมเนียมระบบ</span>
              <span>-{fmt(calc.paymentFee)}</span>
            </div>
            {calc.processingFee > 0 && (
              <div className="flex justify-between text-destructive/80">
                <span>หัก ค่าธรรมเนียมดำเนินการ</span>
                <span>-{fmt(calc.processingFee)}</span>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <span>อัตราคืนเงิน ({calc.canRefund ? `${Math.round(calc.refundRate * 100)}%` : "0%"})</span>
              <span>{calc.canRefund ? `× ${Math.round(calc.refundRate * 100)}%` : "—"}</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between font-semibold text-base">
              <span>ยอดที่จะคืน</span>
              <span className={calc.canRefund ? "text-success" : "text-destructive"}>
                {fmt(calc.refundAmount)}
              </span>
            </div>
          </div>

          {/* Period indicator */}
          {calc.canRefund && calc.period ? (
            <div className="rounded-lg bg-success/5 border border-success/20 px-3 py-2 text-xs space-y-0.5">
              <p className="text-success font-medium">ช่วงเวลานี้: {calc.period.label}</p>
              {nextPeriod && (
                <p className="text-muted-foreground">
                  Deadline ถัดไป: {format(nextPeriod.from, "d MMM yyyy")} → ลดเหลือ {Math.round(nextPeriod.rate * 100)}%
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-lg bg-destructive/5 border border-destructive/20 px-3 py-2 text-xs text-destructive">
              ไม่สามารถคืนเงินได้ในช่วงเวลานี้ตามนโยบาย
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1" onClick={onClose}>ยกเลิก</Button>
            <Button
              className="flex-1"
              disabled={!calc.canRefund || calc.refundAmount <= 0}
              onClick={() => onConfirm(order.id, calc.refundAmount, requestDate, calc.refundRate)}
            >
              ยืนยัน → pending_refund
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
interface DistanceChangeModalProps {
  order: Order;
  onClose: () => void;
  onConfirm: (id: string, newCategory: string, result: ReturnType<typeof calculateDistanceChange>, requestDate: Date) => void;
  fmt: (n: number) => string;
}

function DistanceChangeModal({ order, onClose, onConfirm, fmt }: DistanceChangeModalProps) {
  const [newCategory, setNewCategory] = useState("");
  const [requestDate, setRequestDate] = useState<Date>(new Date());

  const categories = Object.keys(CATEGORY_PRICES).filter((c) => c !== order.category);
  const result = newCategory ? calculateDistanceChange(order.category, newCategory, requestDate) : null;

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>เปลี่ยนแปลงระยะวิ่ง — {order.id}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          {/* Current */}
          <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
            <p className="text-xs text-muted-foreground mb-1">ระยะปัจจุบัน</p>
            <p className="font-medium">{order.category} — {fmt(CATEGORY_PRICES[order.category] ?? 0)}</p>
          </div>

          {/* New Category */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">เปลี่ยนเป็น</Label>
            <Select value={newCategory} onValueChange={setNewCategory}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="เลือกระยะใหม่..." />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c} — {fmt(CATEGORY_PRICES[c])}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Request Date */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">วันที่ยื่นคำขอ</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="w-full justify-start text-sm font-normal">
                  {format(requestDate, "dd/MM/yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-popover" align="start">
                <Calendar mode="single" selected={requestDate} onSelect={(d) => d && setRequestDate(d)} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          {/* Calculation Result */}
          {result && (
            <div className={`rounded-lg border p-3 space-y-2 text-sm ${result.allowed ? "border-border bg-muted/10" : "border-destructive/30 bg-destructive/5"}`}>
              {!result.allowed ? (
                <p className="text-destructive text-sm">{result.reason ?? "ไม่อนุญาตในช่วงเวลานี้"}</p>
              ) : (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    {result.type === "upgrade" ? "⬆️ Upgrade" : "⬇️ Downgrade"} — {result.periodLabel}
                  </p>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ส่วนต่างราคา</span>
                    <span>{fmt(result.priceDiff)}</span>
                  </div>
                  {result.fee > 0 && (
                    <div className="flex justify-between text-destructive/80">
                      <span>ค่าธรรมเนียมดำเนินการ</span>
                      <span>{fmt(result.fee)}</span>
                    </div>
                  )}
                  {result.type === "downgrade" && !result.refundAmount && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>คืนส่วนต่าง</span>
                      <span>ไม่คืน (ช่วงเวลานี้)</span>
                    </div>
                  )}
                  <div className="border-t border-border pt-2 flex justify-between font-semibold">
                    <span>{result.type === "upgrade" ? "ลูกค้าต้องจ่ายเพิ่ม" : "ยอดที่คืนลูกค้า"}</span>
                    <span className={result.type === "upgrade" ? "text-warning" : "text-success"}>
                      {fmt(result.netAmount)}
                    </span>
                  </div>
                  <div className={`rounded-md px-2 py-1 text-xs text-center font-medium mt-1 ${result.documentType === "tax_invoice" ? "bg-blue-500/10 text-blue-600" : "bg-amber-500/10 text-amber-600"}`}>
                    เอกสาร: {result.documentType === "tax_invoice" ? "ใบกำกับภาษี (Tax Invoice)" : "ใบลดหนี้ (Credit Note)"}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1" onClick={onClose}>ยกเลิก</Button>
            <Button
              className="flex-1"
              disabled={!result || !result.allowed || result.type === "same"}
              onClick={() => result && onConfirm(order.id, newCategory, result, requestDate)}
            >
              ยืนยัน
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
