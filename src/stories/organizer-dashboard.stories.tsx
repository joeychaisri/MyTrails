import type { StoryFn as Story } from "@storybook/react-vite";
import DashboardView from "@/views/organizer/DashboardView";

// Journey 4 · Organizer — Dashboard
// The organizer home: performance stats + event list with All/Live/Drafts/
// Pending tabs and Profile/Payment account modals. Each export pins one state
// via the optional initialTab / initialProfileModalOpen / initialPaymentModalOpen
// seed props (all default to the live app's behavior).
export default {
  title: "Organizer/Dashboard",
};

export const AllEvents: Story = () => <DashboardView />;
AllEvents.storyName = "All events (default)";

export const PendingTab: Story = () => <DashboardView initialTab="pending" />;
PendingTab.storyName = "Filtered - Pending Review";

export const DraftsTab: Story = () => <DashboardView initialTab="drafts" />;
DraftsTab.storyName = "Filtered - Drafts";

export const ProfileModal: Story = () => <DashboardView initialProfileModalOpen />;
ProfileModal.storyName = "Profile modal open";

export const PaymentModal: Story = () => <DashboardView initialPaymentModalOpen />;
PaymentModal.storyName = "Payment modal open";
