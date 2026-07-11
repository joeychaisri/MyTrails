import type { StoryFn as Story } from "@storybook/react-vite";
import AuthView from "@/views/organizer/AuthView";

// Journey 3 · Organizer — Login
// The organizer auth screen (Log In / Sign Up tabs). AuthView has no error UI,
// so the only pinnable variant beyond the empty form is the in-flight loading
// state (seeded via the optional initialLoading prop, default = idle).
export default {
  title: "Organizer/Login",
};

export const Default: Story = () => <AuthView />;
Default.storyName = "Default (empty form)";

export const Loading: Story = () => <AuthView initialLoading />;
Loading.storyName = "Submitting (loading)";
