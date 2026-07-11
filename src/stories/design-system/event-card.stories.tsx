import type { Meta, StoryObj } from "@storybook/react-vite";
import EventCard from "@/components/EventCard";
import { mockEvents } from "@/data/mockData";

// EventCard — the organizer dashboard's core unit. One card per seed event below,
// which happens to cover every status (live, pending, draft, scheduled, rejected).
// Anatomy: cover area → StatusBadge → title/date/province → sold progress → actions.
const meta: Meta<typeof EventCard> = {
  title: "Design System/Components/EventCard",
  component: EventCard,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof EventCard>;

const noop = () => {};

export const Single: Story = {
  render: () => (
    <div className="max-w-sm p-6">
      <EventCard event={mockEvents[0]} onEdit={noop} onPreview={noop} onManage={noop} />
    </div>
  ),
};

export const EveryStatus: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid max-w-5xl grid-cols-1 gap-4 p-6 md:grid-cols-2">
      {mockEvents.map((e) => (
        <EventCard key={e.id} event={e} onEdit={noop} onPreview={noop} onManage={noop} />
      ))}
    </div>
  ),
};
