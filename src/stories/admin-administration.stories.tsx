import type { StoryFn as Story } from "@storybook/react-vite";
import AdminOverview from "@/views/admin/AdminOverview";
import AdminUserManagement from "@/views/admin/AdminUserManagement";
import AdminSettings from "@/views/admin/AdminSettings";
import { useEventsStore } from "@/contexts/EventsContext";

// Journey 11 · Admin — Platform Administration
// Running the platform itself: the health overview, organizer accounts
// (create / suspend), and settings — the flat service fee and the event
// commission scale are both editable here (bracket CRUD; the scale must keep at
// least one bracket) plus the "Reset demo data" escape hatch.
// AdminSettings reads/writes the store itself (no props).
export default {
  title: "Admin/11 · Platform Administration",
};

const noop = () => {};

const OverviewFromStore = () => {
  const { events, organizers, settings } = useEventsStore();
  return (
    <div className="min-h-screen bg-background p-6">
      <AdminOverview events={events} organizers={organizers} platformSettings={settings} />
    </div>
  );
};
export const Overview: Story = () => <OverviewFromStore />;
Overview.storyName = "Platform overview";

const UsersFromStore = () => {
  const { organizers } = useEventsStore();
  return (
    <div className="min-h-screen bg-background p-6">
      <AdminUserManagement organizers={organizers} onCreateOrganizer={noop} onSuspendOrganizer={noop} />
    </div>
  );
};
export const UserManagement: Story = () => <UsersFromStore />;
UserManagement.storyName = "User management";

export const Settings: Story = () => (
  <div className="min-h-screen bg-background p-6">
    <AdminSettings />
  </div>
);
Settings.storyName = "Settings (service fee + commission scale + reset demo data)";
