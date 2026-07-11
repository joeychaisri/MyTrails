import type { StoryFn as Story } from "@storybook/react-vite";
import StatusBadge from "@/components/StatusBadge";
import EventCard from "@/components/EventCard";
import { mockEvents, EventStatus } from "@/data/mockData";

// Foundations — the shared primitives every organizer/admin screen composes.
// For developer hand-off these are the source of truth for status colors and
// event-card anatomy: if a screen looks off, compare against these first.
// (PO can skip this group — it's implementation reference, not a user flow.)
export default {
  title: "Foundations/Components",
};

const noop = () => {};

const statuses: EventStatus[] = ["draft", "pending_review", "rejected", "scheduled", "live"];

export const StatusBadges: Story = () => (
  <div className="flex flex-wrap items-center gap-3 p-6">
    {statuses.map((s) => (
      <StatusBadge key={s} status={s} />
    ))}
  </div>
);
StatusBadges.storyName = "Status badges (all 5 states)";

export const EventCards: Story = () => (
  <div className="grid max-w-5xl grid-cols-1 gap-4 p-6 md:grid-cols-2">
    {mockEvents.map((e) => (
      <EventCard key={e.id} event={e} onEdit={noop} onPreview={noop} onManage={noop} />
    ))}
  </div>
);
EventCards.storyName = "Event cards (one per status)";
