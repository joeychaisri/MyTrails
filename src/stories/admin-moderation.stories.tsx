import type { StoryFn as Story } from "@storybook/react-vite";
import { Routes, Route } from "react-router-dom";
import AdminEventApprovals from "@/views/admin/AdminEventApprovals";
import AdminEventReview from "@/views/admin/AdminEventReview";
import { useEventsStore } from "@/contexts/EventsContext";

// Journey 9 · Admin — Moderate Events
// The platform's quality gate: the approvals queue plus the full-page event
// review where admin approves, rejects (with a reason the organizer sees in the
// edit wizard), overrides the service fee and/or event commission independently,
// or force-unpublishes. Data comes from the shared EventsProvider store, same as
// the real pages.
export default {
  title: "Admin/9 · Moderate Events",
};

const noop = () => {};

const QueueFromStore = ({
  initialTab = "queue",
  initialUnpublishEventId,
}: {
  initialTab?: "queue" | "scheduled" | "live";
  initialUnpublishEventId?: string;
}) => {
  const { events } = useEventsStore();
  return (
    <div className="min-h-screen bg-background p-6">
      <AdminEventApprovals
        events={events}
        onForceUnpublish={noop}
        initialTab={initialTab}
        initialUnpublishEventId={initialUnpublishEventId}
      />
    </div>
  );
};
export const ApprovalsQueue: Story = () => <QueueFromStore />;
ApprovalsQueue.storyName = "Approvals queue";

export const ScheduledEvents: Story = () => <QueueFromStore initialTab="scheduled" />;
ScheduledEvents.storyName = "Scheduled events";

export const LiveEvents: Story = () => <QueueFromStore initialTab="live" />;
LiveEvents.storyName = "Live events";

export const ForceUnpublishConfirmation: Story = () => (
  <QueueFromStore initialTab="live" initialUnpublishEventId="1" />
);
ForceUnpublishConfirmation.storyName = "Force unpublish - confirmation";

const reviewAt = (id: string, initialRejectOpen = false) => (
  <Routes location={`/organizer/admin/review/${id}`}>
    <Route path="/organizer/admin/review/:id" element={<AdminEventReview initialRejectOpen={initialRejectOpen} />} />
  </Routes>
);

export const ReviewPending: Story = () => reviewAt("2");
ReviewPending.storyName = "Event review - pending (approve / reject / fee overrides)";

export const ReviewPreviouslyRejected: Story = () => reviewAt("5");
ReviewPreviouslyRejected.storyName = "Event review - previously rejected (reason shown)";

export const RejectConfirmation: Story = () => reviewAt("2", true);
RejectConfirmation.storyName = "Event review - request changes dialog";

export const EventNotFound: Story = () => reviewAt("does-not-exist");
EventNotFound.storyName = "Event review - not found";
