import { OrderStatus, PaymentMethod } from "@/data/mockData";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
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
  pending_slip: "รอตรวจสลิป · PromptPay",
  issue_payment_failed: "มีปัญหา · ชำระเงินไม่สำเร็จ",
  expired: "หมดเวลาชำระเงิน",
  cancelled: "ยกเลิก",
};

export const ORDER_STATUS_COLOR: Record<OrderStatus, string> = {
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
  pending_slip: "bg-warning/10 text-warning",
  issue_payment_failed: "bg-destructive/10 text-destructive",
  expired: "bg-muted text-muted-foreground",
  cancelled: "bg-muted text-muted-foreground",
};

export const ORDER_FILTER: Record<string, (s: OrderStatus) => boolean> = {
  all: () => true,
  completed: (s) => s.includes("issued") || s === "complete_trc_issued" || s === "complete_crn_issued",
  pending: (s) => s.includes("wait") || s.includes("pending") || s === "submitted",
  issues: (s) => s.startsWith("issue_") || s === "edit_trc",
  refunds: (s) => s.startsWith("refunded") || s === "pending_refund" || s === "issue_refund",
  special: (s) => s === "complete_vip" || s === "complete_sponsor" || s.includes("wns"),
};

export const COLLECTED_STATUSES: OrderStatus[] = [
  "complete_trc_issued", "complete_receipt_issued", "complete_crn_issued",
  "complete_stripe_wait_receipt", "complete_wait_receipt", "complete_wait_trc",
  "complete_stripe_wait_trc", "complete_wait_crn", "complete_name_change_new",
  "name_change_receipt_issued", "complete_vip", "complete_sponsor",
  "complete_wns", "complete_wns_receipt", "edit_trc",
];

export const ALL_STATUSES = Object.keys(ORDER_STATUS_LABEL) as OrderStatus[];

export const PAYMENT_METHOD_COLOR: Record<PaymentMethod, string> = {
  Stripe: "bg-blue-500/10 text-blue-500",
  Cash: "bg-amber-500/10 text-amber-600",
  VIP: "bg-purple-500/10 text-purple-500",
  Sponsor: "bg-emerald-500/10 text-emerald-600",
  PromptPay: "bg-success/10 text-success",
};
