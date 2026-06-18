import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PasswordInput from "./PasswordInput";

const DEMO_CODE = "123456";
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

interface ChangeEmailFlowProps {
  currentEmail: string;
  onEmailChanged: (email: string) => void;
}

type Step = "form" | "otp" | "done";

const ChangeEmailFlow = ({ currentEmail, onEmailChanged }: ChangeEmailFlowProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("form");
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState(false);

  const canContinue =
    isEmail(newEmail) && newEmail.toLowerCase() !== currentEmail.toLowerCase() && password.length > 0;

  const goToOtp = () => {
    setOtp("");
    setOtpError(false);
    setStep("otp");
  };

  const handleVerify = () => {
    if (otp === DEMO_CODE) {
      onEmailChanged(newEmail);
      toast({ title: "Email updated", description: `Your email is now ${newEmail}.` });
      setStep("done");
    } else {
      setOtpError(true);
    }
  };

  const reset = () => {
    setNewEmail("");
    setPassword("");
    setOtp("");
    setOtpError(false);
    setStep("form");
  };

  if (step === "otp") {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setStep("form")}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="space-y-1 text-center">
          <p className="text-sm text-muted-foreground">We sent a 6-digit code to</p>
          <p className="font-medium text-foreground">{newEmail}</p>
        </div>

        <div className="flex justify-center">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={(v) => {
              setOtp(v);
              setOtpError(false);
            }}
          >
            <InputOTPGroup>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <InputOTPSlot key={i} index={i} />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        {otpError && <p className="text-center text-sm text-destructive">Incorrect code. Please try again.</p>}

        <p className="text-center text-xs text-muted-foreground">
          Demo: enter <span className="font-mono font-medium">123456</span>
        </p>

        <Button className="w-full" disabled={otp.length < 6} onClick={handleVerify}>
          Verify
        </Button>
        <Button
          variant="link"
          className="w-full"
          onClick={() => toast({ title: "Code resent", description: `A new code was sent to ${newEmail}.` })}
        >
          Resend code
        </Button>
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className="space-y-4 py-4 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
        <div className="space-y-1">
          <p className="font-medium text-foreground">Email updated</p>
          <p className="text-sm text-muted-foreground">{newEmail}</p>
        </div>
        <Button className="w-full" onClick={reset}>
          Done
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="current-email">Current email</Label>
        <Input id="current-email" value={currentEmail} disabled />
      </div>
      <div className="space-y-2">
        <Label htmlFor="new-email">New email</Label>
        <Input
          id="new-email"
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          placeholder="new@email.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email-password">Current password</Label>
        <PasswordInput
          id="email-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
        />
      </div>
      <Button className="w-full" disabled={!canContinue} onClick={goToOtp}>
        Continue
      </Button>
    </div>
  );
};

export default ChangeEmailFlow;
