import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ChangeEmailFlow from "./ChangeEmailFlow";
import ChangePasswordForm from "./ChangePasswordForm";

interface AccountSecurityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  onEmailChange: (email: string) => void;
}

const AccountSecurityModal = ({ open, onOpenChange, email, onEmailChange }: AccountSecurityModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Account &amp; Security</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
          </TabsList>
          <TabsContent value="email" className="mt-4">
            <ChangeEmailFlow currentEmail={email} onEmailChanged={onEmailChange} />
          </TabsContent>
          <TabsContent value="password" className="mt-4">
            <ChangePasswordForm />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AccountSecurityModal;
