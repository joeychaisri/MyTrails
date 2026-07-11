import type { StoryFn as Story } from "@storybook/react-vite";
import AuthView from "@/views/organizer/AuthView";
import DashboardView from "@/views/organizer/DashboardView";
import AccountSecurityModal from "@/components/account/AccountSecurityModal";
import ChangeEmailFlow from "@/components/account/ChangeEmailFlow";
import ChangePasswordForm from "@/components/account/ChangePasswordForm";

// Journey 4 · Organizer — Get Started
// Everything an organizer touches to exist on the platform: the auth screen,
// the first look at the dashboard after login, and the account surfaces reached
// from the avatar menu (profile, security, email/password).
export default {
  title: "Organizer/4 · Get Started",
};

const noop = () => {};

export const LoginDefault: Story = () => <AuthView />;
LoginDefault.storyName = "Login (empty form)";

export const LoginLoading: Story = () => <AuthView initialLoading />;
LoginLoading.storyName = "Login - submitting (loading)";

export const DashboardFirstLook: Story = () => <DashboardView />;
DashboardFirstLook.storyName = "Dashboard - first look (all events)";

export const ProfileModal: Story = () => <DashboardView initialProfileModalOpen />;
ProfileModal.storyName = "Profile modal open";

export const SecurityMenu: Story = () => (
  <AccountSecurityModal
    open
    onOpenChange={noop}
    email="organizer@trailevents.co.th"
    onEmailChange={noop}
  />
);
SecurityMenu.storyName = "Security menu (modal)";

export const ChangeEmail: Story = () => (
  <div className="mx-auto max-w-md p-6">
    <ChangeEmailFlow currentEmail="organizer@trailevents.co.th" onEmailChanged={noop} />
  </div>
);
ChangeEmail.storyName = "Change email";

export const ChangePassword: Story = () => (
  <div className="mx-auto max-w-md p-6">
    <ChangePasswordForm />
  </div>
);
ChangePassword.storyName = "Change password";
