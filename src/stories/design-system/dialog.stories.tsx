import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// shadcn Dialog — confirm/detail modals (event actions, profile, payment).
// Storied open so the overlay + layout is reviewable without clicking.
const meta: Meta<typeof Dialog> = {
  title: "Design System/Components/Dialog",
  component: Dialog,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Dialog>;

export const ConfirmPattern: Story = {
  render: () => (
    <Dialog open>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit for review?</DialogTitle>
          <DialogDescription>
            The event will be locked while the MyTrails team reviews it. You can
            still withdraw it back to draft before a decision is made.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button>Submit for Review</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
