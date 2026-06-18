import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import PasswordInput from "./PasswordInput";

const RULES = [
  { label: "At least 8 characters", test: (pw: string) => pw.length >= 8 },
  { label: "Contains a number", test: (pw: string) => /\d/.test(pw) },
  { label: "Contains an uppercase letter", test: (pw: string) => /[A-Z]/.test(pw) },
];

const ChangePasswordForm = () => {
  const { toast } = useToast();
  const [current, setCurrent] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirm, setConfirm] = useState("");

  const score = newPw ? RULES.filter((r) => r.test(newPw)).length : 0;
  const strength =
    score <= 1
      ? { label: "Weak", color: "bg-destructive", text: "text-destructive" }
      : score === 2
        ? { label: "Medium", color: "bg-warning", text: "text-warning" }
        : { label: "Strong", color: "bg-success", text: "text-success" };

  const checks = [
    ...RULES.map((r) => ({ label: r.label, ok: r.test(newPw) })),
    { label: "Passwords match", ok: newPw !== "" && newPw === confirm },
  ];

  const canSubmit = current.length > 0 && score === RULES.length && newPw === confirm;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    toast({ title: "Password updated", description: "Your password has been changed." });
    setCurrent("");
    setNewPw("");
    setConfirm("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="current-password">Current password</Label>
        <PasswordInput
          id="current-password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="new-password">New password</Label>
        <PasswordInput
          id="new-password"
          value={newPw}
          onChange={(e) => setNewPw(e.target.value)}
          placeholder="••••••••"
          autoComplete="new-password"
        />

        {newPw && (
          <div className="space-y-2 pt-1">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-colors",
                    i < score ? strength.color : "bg-muted",
                  )}
                />
              ))}
            </div>
            <p className={cn("text-xs font-medium", strength.text)}>{strength.label}</p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirm new password</Label>
        <PasswordInput
          id="confirm-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="••••••••"
          autoComplete="new-password"
        />
      </div>

      <ul className="space-y-1.5">
        {checks.map((c) => (
          <li
            key={c.label}
            className={cn("flex items-center gap-2 text-xs", c.ok ? "text-success" : "text-muted-foreground")}
          >
            {c.ok ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
            {c.label}
          </li>
        ))}
      </ul>

      <Button type="submit" className="w-full" disabled={!canSubmit}>
        Update password
      </Button>
    </form>
  );
};

export default ChangePasswordForm;
