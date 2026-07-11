import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Text inputs as the wizard/forms use them: always paired with a <Label>.
const meta: Meta<typeof Input> = {
  title: "Design System/Components/Input",
  component: Input,
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
    placeholder: { control: "text" },
  },
  args: {
    placeholder: "Doi Inthanon Trail 2026",
    disabled: false,
  },
};
export default meta;

type Story = StoryObj<typeof Input>;

export const Playground: Story = {
  render: (args) => (
    <div className="max-w-sm space-y-2 p-6">
      <Label htmlFor="event-title">Event title</Label>
      <Input id="event-title" {...args} />
    </div>
  ),
};

export const FormStates: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="max-w-sm space-y-6 p-6">
      <div className="space-y-2">
        <Label htmlFor="a">Default</Label>
        <Input id="a" placeholder="Placeholder text" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="b">Filled</Label>
        <Input id="b" defaultValue="Pong Yaeng Trail 2026" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="c">Disabled</Label>
        <Input id="c" disabled placeholder="Can't touch this" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="d">Textarea</Label>
        <Textarea id="d" placeholder="Describe the event…" rows={3} />
      </div>
    </div>
  ),
};
