import type { StoryFn as Story } from "@storybook/react-vite";
import AdminFinancials from "@/views/admin/AdminFinancials";
import { useEventsStore } from "@/contexts/EventsContext";

// Journey 10 · Admin — Platform Finance
// The payout queue: per-event charges (2 parts: flat service fee + event commission)
// computed on actual sold tickets, with the payout lifecycle held → payable → paid.
// Data comes from the shared EventsProvider store; mutations are no-ops in the
// pinned stories so viewing one state never contaminates another.
export default {
  title: "Admin/10 · Platform Finance",
};

const noop = () => {};

const FinancialsFromStore = ({
  initialTab = "queue",
  initialConfirmEventId,
  emptyQueue = false,
}: {
  initialTab?: "queue" | "paid" | "refunds";
  initialConfirmEventId?: string;
  emptyQueue?: boolean;
}) => {
  const { events, organizers, settings } = useEventsStore();
  const storyEvents = emptyQueue
    ? events.map((event) => event.payoutStatus === "payable" ? { ...event, payoutStatus: "held" as const } : event)
    : events;
  return (
    <div className="min-h-screen bg-background p-6">
      <AdminFinancials
        events={storyEvents}
        organizers={organizers}
        settings={settings}
        onMarkPaid={noop}
        initialTab={initialTab}
        initialConfirmEventId={initialConfirmEventId}
      />
    </div>
  );
};
export const PayoutQueue: Story = () => <FinancialsFromStore />;
PayoutQueue.storyName = "Payout queue";

export const TransferConfirmation: Story = () => <FinancialsFromStore initialConfirmEventId="1" />;
TransferConfirmation.storyName = "Payout queue - transfer confirmation";

export const PaidHistory: Story = () => <FinancialsFromStore initialTab="paid" />;
PaidHistory.storyName = "Paid history";

export const RefundLedger: Story = () => <FinancialsFromStore initialTab="refunds" />;
RefundLedger.storyName = "Refund ledger";

export const EmptyQueue: Story = () => <FinancialsFromStore emptyQueue />;
EmptyQueue.storyName = "Payout queue - empty";
