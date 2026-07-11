import type { StoryFn as Story } from "@storybook/react-vite";
import RunnerLandingPage from "@/views/runner/RunnerLandingPage";

// Journey 1 · Runner — Browse & Discover Events
// The public platform home: hero, event grid, region filter, list/calendar
// toggle, EN/TH. Each export below is one PINNED state — no clicking to reach it.
export default {
  title: "Runner/Browse & Discover",
};

export const Default: Story = () => <RunnerLandingPage />;
Default.storyName = "Grid (default)";

export const ListView: Story = () => <RunnerLandingPage initialView="list" />;
ListView.storyName = "List view";

export const CalendarView: Story = () => <RunnerLandingPage initialView="calendar" />;
CalendarView.storyName = "Calendar view";

export const FilteredNorth: Story = () => (
  <RunnerLandingPage initialView="grid" initialRegion="north" />
);
FilteredNorth.storyName = "Filtered - North region";
