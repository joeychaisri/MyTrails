import type { StoryFn as Story } from "@storybook/react-vite";
import AdminFinancials from "@/views/admin/AdminFinancials";
import { useEventsStore } from "@/contexts/EventsContext";

// Journey 10 · Admin — Platform Finance
// The payout queue: per-event commission (2 parts: event size + organizer tier)
// computed on actual sold tickets, with the payout lifecycle held → payable → paid.
// Data comes from the shared EventsProvider store; Mark paid is a no-op here.
export default {
  title: "Admin/10 · Platform Finance",
};

const noop = () => {};

const FinancialsFromStore = () => {
  const { events, organizers, settings } = useEventsStore();
  return (
    <div className="min-h-screen bg-background p-6">
      <AdminFinancials events={events} organizers={organizers} settings={settings} onMarkPaid={noop} />
    </div>
  );
};
export const Financials: Story = () => <FinancialsFromStore />;
Financials.storyName = "Payout queue";
