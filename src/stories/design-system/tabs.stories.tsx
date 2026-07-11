import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// shadcn Tabs — the dashboard's All/Live/Action/Review/Drafts filter is the
// canonical usage; this story mirrors that shape.
const meta: Meta<typeof Tabs> = {
  title: "Design System/Components/Tabs",
  component: Tabs,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Tabs>;

export const DashboardFilter: Story = {
  render: () => (
    <div className="p-6">
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="live">Live</TabsTrigger>
          <TabsTrigger value="action">Action Needed</TabsTrigger>
          <TabsTrigger value="review">In Review</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="pt-4 text-sm text-muted-foreground">
          Tab content renders here.
        </TabsContent>
      </Tabs>
    </div>
  ),
};
