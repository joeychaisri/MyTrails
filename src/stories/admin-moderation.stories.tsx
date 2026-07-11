import type { StoryFn as Story } from "@storybook/react-vite";
import { Routes, Route } from "react-router-dom";
import AdminEventApprovals from "@/views/admin/AdminEventApprovals";
import AdminEventReview from "@/views/admin/AdminEventReview";
import { useEventsStore } from "@/contexts/EventsContext";

// Journey 9 · Admin — Moderate Events
// The platform's quality gate: the approvals queue plus the full-page event
// review where admin approves, rejects (with a reason the organizer sees in the
// edit wizard), overrides the event commission, or force-unpublishes. Data comes
// from the shared EventsProvider store, same as the real pages.
export default {
  title: "Admin/9 · Moderate Events",
};

const noop = () => {};

const QueueFromStore = () => {
  const { events } = useEventsStore();
  return (
    <div className="min-h-screen bg-background p-6">
      <AdminEventApprovals events={events} onForceUnpublish={noop} />
    </div>
  );
};
export const ApprovalsQueue: Story = () => <QueueFromStore />;
ApprovalsQueue.storyName = "Approvals queue";

const reviewAt = (id: string) => (
  <Routes location={`/organizer/admin/review/${id}`}>
    <Route path="/organizer/admin/review/:id" element={<AdminEventReview />} />
  </Routes>
);

export const ReviewPending: Story = () => reviewAt("2");
ReviewPending.storyName = "Event review - pending (approve / reject / commission override)";

export const ReviewPreviouslyRejected: Story = () => reviewAt("5");
ReviewPreviouslyRejected.storyName = "Event review - previously rejected (reason shown)";
