import type { StoryFn as Story } from "@storybook/react-vite";
import { useEffect, useRef } from "react";
import { Routes, Route } from "react-router-dom";
import DashboardView from "@/views/organizer/DashboardView";
import EventManagerHub from "@/views/organizer/EventManagerHub";
import { useEventsStore } from "@/contexts/EventsContext";
import { RunnerInfo } from "@/data/mockData";

// Journey 8 · Organizer — Get Paid
// The money side from the organizer's seat: the payout account they must set up
// (payment modal) and the per-event Orders/Finance section where revenue and the
// 2 platform charges (service fee + event commission) become visible. The payout queue
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

// Journey 3 hand-off from the organizer's seat: a PromptPay runner has
// submitted a slip, so Orders shows the "Slip verification" queue with
// Approve / Reject (verifySlip). The store seeds no registrations, so the
// harness creates one awaiting_verification registration on mount (ref-guarded;
// a remount hits the duplicate check and seeds nothing — the queue persists).
const slipRunner: RunnerInfo = {
  firstName: "Kanya",
  lastName: "Phromma",
  dob: "1995-11-02",
  gender: "female",
  nationality: "Thai",
  idNumber: "1103700987654",
  phone: "086-555-1122",
  email: "kanya.p@example.com",
  emergencyName: "Preecha Phromma",
  emergencyPhone: "081-777-3344",
  bloodGroup: "B",
  shirtSize: "S",
  pdpaConsentAt: "2026-07-01T10:00:00.000Z",
};

// 1-pixel gray PNG — enough for the slip thumbnail without bloating the story.
const tinySlipDataUrl =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOsqan5DwAFCAJS0Qk1vAAAAABJRU5ErkJggg==";

const SlipQueueHarness = () => {
  const { createRegistration, confirmRegistration } = useEventsStore();
  const seeded = useRef(false);
  useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;
    const result = createRegistration({ eventId: "1", categoryId: "1b", ticketId: "t5", runner: slipRunner });
    if (result.ok) confirmRegistration(result.registration.id, "promptpay", tinySlipDataUrl);
  }, [createRegistration, confirmRegistration]);
  return (
    <Routes location="/organizer/events/1/orders">
      <Route path="/organizer/events/:id/:section" element={<EventManagerHub />} />
    </Routes>
  );
};

export const SlipQueue: Story = () => <SlipQueueHarness />;
SlipQueue.storyName = "Slip verification queue";
