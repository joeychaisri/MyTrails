import type { Meta, StoryObj } from "@storybook/react-vite";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

// shadcn Button — the only button in the product. Use the Controls panel to flip
// variant/size live; AllVariants is the at-a-glance reference grid.
const meta: Meta<typeof Button> = {
  title: "Design System/Components/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive", "outline", "secondary", "ghost", "link"],
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon"],
    },
    disabled: { control: "boolean" },
    asChild: { table: { disable: true } },
  },
  args: {
    variant: "default",
    size: "default",
    disabled: false,
    children: "Create Event",
  },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Playground: Story = {};

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button>Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="link">Link</Button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button size="lg">Large</Button>
        <Button size="default">Default</Button>
        <Button size="sm">Small</Button>
        <Button size="icon" aria-label="Add">
          <Plus />
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button disabled>Disabled</Button>
        <Button variant="outline" disabled>
          Disabled outline
        </Button>
      </div>
    </div>
  ),
};
