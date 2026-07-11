import type { StoryFn as Story } from "@storybook/react-vite";
import NotFound from "@/pages/NotFound";

// System — screens that belong to no single journey but every build ships.
export default {
  title: "System/Errors",
};

export const NotFound404: Story = () => <NotFound />;
NotFound404.storyName = "404 - Page not found";
