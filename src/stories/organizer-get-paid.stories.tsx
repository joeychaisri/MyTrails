import type { StoryFn as Story } from "@storybook/react-vite";
import { Routes, Route } from "react-router-dom";
import DashboardView from "@/views/organizer/DashboardView";
import EventManagerHub from "@/views/organizer/EventManagerHub";

// Journey 8 · Organizer — Get Paid
// The money side from the organizer's seat: the payout account they must set up
// (payment modal) and the per-event Orders/Finance section where revenue and the
// 2-part commission (event tier + account tier) become visible. The payout queue
// itself is admin-side — see Journey 10 (Platform Finance).
export default {
  title: "Organizer/8 · Get Paid",
};

export const PayoutAccount: Story = () => <DashboardView initialPaymentModalOpen />;
PayoutAccount.storyName = "Payout account (payment modal)";

export const OrdersFinance: Story = () => (
  <Routes location="/organizer/events/1/orders">
    <Route path="/organizer/events/:id/:section" element={<EventManagerHub />} />
  </Routes>
);
OrdersFinance.storyName = "Orders / Finance (event revenue)";
