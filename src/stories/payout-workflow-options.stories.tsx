import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  PayoutAfterEventOption,
  PayoutDecisionOverview,
  PayoutMonthlyOption,
} from "./payout-workflow/PayoutWorkflowOptions";

const meta = {
  title: "Experiments (not for build)/Payout Workflow Options",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const DecisionOverview: Story = {
  render: () => <PayoutDecisionOverview />,
};

export const OptionAAfterEvent: Story = {
  render: () => <PayoutAfterEventOption />,
};

export const OptionBMonthly: Story = {
  render: () => <PayoutMonthlyOption />,
};
