import type { Story } from "@ladle/react";
import AdminOverview from "@/views/admin/AdminOverview";
import AdminEventApprovals from "@/views/admin/AdminEventApprovals";
import AdminFinancials from "@/views/admin/AdminFinancials";
import AdminUserManagement from "@/views/admin/AdminUserManagement";
import AdminSettings from "@/views/admin/AdminSettings";
import {
  mockAdminEvents,
  mockAdminOrganizers,
  mockPlatformSettings,
} from "@/data/adminMockData";

// Journey 8 · Admin — Console
// The platform-admin console, storied one sub-page at a time with props seeded
// straight from adminMockData (mutating callbacks are no-ops here). Event
// Approvals gets the full event set so pending_review AND cancellation_requested
// rows are both visible — it's the key moderation flow.
export default {
  title: "Admin/Console",
};

const noop = () => {};

export const Overview: Story = () => (
  <div className="min-h-screen bg-background p-6">
    <AdminOverview
      events={mockAdminEvents}
      organizers={mockAdminOrganizers}
      platformSettings={mockPlatformSettings}
    />
  </div>
);
Overview.storyName = "Overview";

export const EventApprovals: Story = () => (
  <div className="min-h-screen bg-background p-6">
    <AdminEventApprovals
      events={mockAdminEvents}
      onApprove={noop}
      onReject={noop}
      onForceUnpublish={noop}
      onApproveCancellation={noop}
      onRejectCancellation={noop}
    />
  </div>
);
EventApprovals.storyName = "Event Approvals";

export const Financials: Story = () => (
  <div className="min-h-screen bg-background p-6">
    <AdminFinancials
      events={mockAdminEvents}
      onMarkPaid={noop}
      platformSettings={mockPlatformSettings}
    />
  </div>
);
Financials.storyName = "Financials";

export const UserManagement: Story = () => (
  <div className="min-h-screen bg-background p-6">
    <AdminUserManagement
      organizers={mockAdminOrganizers}
      onCreateOrganizer={noop}
      onSuspendOrganizer={noop}
    />
  </div>
);
UserManagement.storyName = "User Management";

export const AdminSettingsStory: Story = () => (
  <div className="min-h-screen bg-background p-6">
    <AdminSettings settings={mockPlatformSettings} onSave={noop} />
  </div>
);
AdminSettingsStory.storyName = "Settings";
