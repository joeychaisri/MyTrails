import type { StoryFn as Story } from "@storybook/react-vite";
import { Routes, Route } from "react-router-dom";
import DashboardView from "@/views/organizer/DashboardView";
import EventWizard from "@/views/organizer/EventWizard";
import OutboxPage from "@/views/organizer/OutboxPage";

// Journey 6 · Organizer — Approval Outcomes
// The approval state machine from the organizer's seat:
//   draft → pending_review → live (ASAP) / scheduled (auto-promotes at publishAt)
//                          → rejected → fix in wizard → resubmit → pending_review
// Editing a live/scheduled event also drops it back to pending_review (re-approval).
// Seed events cover every state: "2" pending, "4" scheduled, "5" rejected (with
// reason), "1"/"6" live — so each tab below is populated out of the box.
export default {
  title: "Organizer/6 · Approval Outcomes",
};

export const InReview: Story = () => <DashboardView initialTab="review" />;
InReview.storyName = "Dashboard - In Review (pending + scheduled)";

export const ActionNeeded: Story = () => <DashboardView initialTab="action" />;
ActionNeeded.storyName = "Dashboard - Action Needed (rejected)";

export const LiveTab: Story = () => <DashboardView initialTab="live" />;
LiveTab.storyName = "Dashboard - Live";

export const RejectedEdit: Story = () => (
  <Routes location="/organizer/events/5/edit">
    <Route path="/organizer/events/:id/edit" element={<EventWizard />} />
  </Routes>
);
RejectedEdit.storyName = "Edit rejected event (reason banner + resubmit)";

// Every approval outcome also lands in the header bell (in-app notification
// center, derived from the store) and as a mock email on /organizer/outbox.
export const NotificationCenter: Story = () => <DashboardView initialNotificationsOpen />;
NotificationCenter.storyName = "Notification center (open)";

// OutboxPage falls back to the demo organizer (org1) when the auth context has
// no organizerId — same behavior as the dashboard — so it renders directly.
export const EmailOutbox: Story = () => <OutboxPage />;
EmailOutbox.storyName = "Email outbox";
