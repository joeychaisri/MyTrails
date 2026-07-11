import type { Meta, StoryObj } from "@storybook/react-vite";
import StatusBadge from "@/components/StatusBadge";

// StatusBadge — THE canonical mapping of the 5 event statuses to colors.
// Never rebuild a status pill from raw Badge + colors; use this component.
const meta: Meta<typeof StatusBadge> = {
  title: "Design System/Components/StatusBadge",
  component: StatusBadge,
  tags: ["autodocs"],
  argTypes: {
    status: {
      control: "select",
      options: ["draft", "pending_review", "rejected", "scheduled", "live"],
    },
  },
  args: {
    status: "live",
  },
};
export default meta;

type Story = StoryObj<typeof StatusBadge>;

export const Playground: Story = {};

export const AllStatuses: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-wrap items-center gap-3 p-6">
      <StatusBadge status="draft" />
      <StatusBadge status="pending_review" />
      <StatusBadge status="rejected" />
      <StatusBadge status="scheduled" />
      <StatusBadge status="live" />
    </div>
  ),
};
