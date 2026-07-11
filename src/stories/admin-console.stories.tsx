import type { StoryFn as Story } from "@storybook/react-vite";
import AdminOverview from "@/views/admin/AdminOverview";
import AdminEventApprovals from "@/views/admin/AdminEventApprovals";
import AdminFinancials from "@/views/admin/AdminFinancials";
import AdminUserManagement from "@/views/admin/AdminUserManagement";
import AdminSettings from "@/views/admin/AdminSettings";
import { useEventsStore } from "@/contexts/EventsContext";

// Journey 8 · Admin — Console
// The platform-admin console, storied one sub-page at a time. Data comes from the
// shared EventsProvider store (seeded from mockData + adminMockData), exactly how
// the real AdminDashboard wires these pages; mutating callbacks are no-ops so the
// stories stay pinned. AdminSettings reads/writes the store itself (no props).
export default {
  title: "Admin/Console",
};

const noop = () => {};

const Shell = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-background p-6">{children}</div>
);

const OverviewFromStore = () => {
  const { events, organizers, settings } = useEventsStore();
  return (
    <Shell>
      <AdminOverview events={events} organizers={organizers} platformSettings={settings} />
    </Shell>
  );
};
export const Overview: Story = () => <OverviewFromStore />;
Overview.storyName = "Overview";

const ApprovalsFromStore = () => {
  const { events } = useEventsStore();
  return (
    <Shell>
      <AdminEventApprovals events={events} onForceUnpublish={noop} />
    </Shell>
  );
};
export const EventApprovals: Story = () => <ApprovalsFromStore />;
EventApprovals.storyName = "Event Approvals";

const FinancialsFromStore = () => {
  const { events, organizers, settings } = useEventsStore();
  return (
    <Shell>
      <AdminFinancials events={events} organizers={organizers} settings={settings} onMarkPaid={noop} />
    </Shell>
  );
};
export const Financials: Story = () => <FinancialsFromStore />;
Financials.storyName = "Financials";

const UsersFromStore = () => {
  const { organizers } = useEventsStore();
  return (
    <Shell>
      <AdminUserManagement organizers={organizers} onCreateOrganizer={noop} onSuspendOrganizer={noop} />
    </Shell>
  );
};
export const UserManagement: Story = () => <UsersFromStore />;
UserManagement.storyName = "User Management";

export const AdminSettingsStory: Story = () => (
  <Shell>
    <AdminSettings />
  </Shell>
);
AdminSettingsStory.storyName = "Settings";
