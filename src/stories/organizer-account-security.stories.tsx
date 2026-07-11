import type { StoryFn as Story } from "@storybook/react-vite";
import AccountSecurityModal from "@/components/account/AccountSecurityModal";
import ChangeEmailFlow from "@/components/account/ChangeEmailFlow";
import ChangePasswordForm from "@/components/account/ChangePasswordForm";

// Journey 7 · Organizer — Account & Security
// The account-security surfaces reached from the dashboard avatar menu. The full
// modal is storied open (open=true); its two inner flows are also storied bare so
// the email OTP flow and password-strength form can be reviewed in isolation.
export default {
  title: "Organizer/Account & Security",
};

const noop = () => {};

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
