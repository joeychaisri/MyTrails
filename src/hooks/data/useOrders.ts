import { useMemo } from "react";
import {
  Event,
  Order,
  OrderStatus,
  Registration,
  RegistrationStatus,
  mockOrders,
} from "@/data/mockData";
import { useEventsStore } from "@/contexts/EventsContext";
import { DataResult } from "./result";

// RegistrationStatus → OrderStatus. "confirmed" is handled separately because
// it depends on the payment method (both map into COLLECTED_STATUSES).
const REG_STATUS_TO_ORDER_STATUS: Record<Exclude<RegistrationStatus, "confirmed">, OrderStatus> = {
  pending_payment: "submitted",
  awaiting_verification: "pending_slip",
  payment_failed: "issue_payment_failed",
  expired: "expired",
  cancelled: "cancelled",
  refunded: "refunded",
};

// Legacy mock orders use "YYYY-MM-DD HH:mm:ss" (local time) — match it.
const formatTimestamp = (iso: string): string => {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};

// Map a store registration (any status) onto the row shape OrdersSection renders.
const registrationToOrder = (reg: Registration, event?: Event): Order => {
  const category = event?.categories.find((c) => c.id === reg.categoryId);
  const ticket = category?.tickets.find((t) => t.id === reg.ticketId);
  const status: OrderStatus =
    reg.status === "confirmed"
      ? reg.paymentMethod === "promptpay"
        ? "complete_wait_receipt"
        : "complete_stripe_wait_receipt"
      : REG_STATUS_TO_ORDER_STATUS[reg.status];
  return {
    id: reg.code, // MT-XXXXXX doubles as the visible order id
    registrationId: reg.id, // marks the row as live store data
    buyerName: `${reg.runner.firstName} ${reg.runner.lastName}`,
    buyerEmail: reg.runner.email,
    amount: reg.amount,
    status,
    paymentMethod: reg.paymentMethod === "promptpay" ? "PromptPay" : "Stripe",
    timestamp: formatTimestamp(reg.createdAt),
    ticketType: ticket?.name ?? "",
    category: category?.name ?? "",
    note: "",
    slipUrl: reg.slipDataUrl,
    log: [
      {
        timestamp: formatTimestamp(reg.createdAt),
        type: "registration",
        description: `ลงทะเบียน ${category?.name ?? ""} (${ticket?.name ?? ""})`.trim(),
      },
    ],
  };
};

// Registrations of the event (any status) come first (live, from the store);
// legacy mock rows follow so existing screens/stories stay populated.
export function useOrders(eventId?: string): DataResult<Order[]> {
  const { registrations, events } = useEventsStore();
  const data = useMemo(() => {
    const event = events.find((e) => e.id === eventId);
    const derived = registrations
      .filter((r) => r.eventId === eventId)
      .map((r) => registrationToOrder(r, event));
    return [...derived, ...mockOrders];
  }, [registrations, events, eventId]);
  return { data, isLoading: false, error: null };
}
