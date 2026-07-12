import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Clock, CreditCard, Loader2, QrCode, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Registration } from "@/data/mockData";
import { stripeMock, promptpayQR } from "@/lib/payments";
import { fmtTHB } from "./RegisterFlow";

// Card number → "4242 4242 4242 4242" (digits only, grouped by 4, max 19 digits).
const formatCardNumber = (raw: string) =>
  raw
    .replace(/\D/g, "")
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, "$1 ");

// Expiry → "MM/YY" with the slash inserted automatically.
const formatExp = (raw: string) => {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
};

const secondsLeft = (expiresAt: string | undefined): number => {
  if (!expiresAt) return Infinity;
  return Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
};

interface Props {
  registration: Registration;
  onPaid: (method: "card" | "promptpay", slipDataUrl?: string) => void;
  onRestart: () => void;
}

const PaymentStep = ({ registration, onPaid, onRestart }: Props) => {
  // Hold countdown — the seat is only held until registration.expiresAt.
  const [remaining, setRemaining] = useState(() => secondsLeft(registration.expiresAt));
  useEffect(() => {
    const timer = setInterval(() => setRemaining(secondsLeft(registration.expiresAt)), 1000);
    return () => clearInterval(timer);
  }, [registration.expiresAt]);
  const expired = remaining <= 0;

  // Card form
  const [cardNumber, setCardNumber] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");
  const [cardName, setCardName] = useState("");
  const [processing, setProcessing] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  // PromptPay
  const [slipDataUrl, setSlipDataUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cardComplete =
    cardNumber.replace(/\s/g, "").length >= 12 && /^\d{2}\/\d{2}$/.test(exp) && /^\d{3,4}$/.test(cvc) && cardName.trim().length > 0;

  const handlePayCard = async () => {
    if (processing || expired) return;
    setProcessing(true);
    setCardError(null);
    const outcome = await stripeMock.confirmCard!({ number: cardNumber, exp, cvc, name: cardName });
    setProcessing(false);
    if (secondsLeft(registration.expiresAt) <= 0) return; // hold died mid-charge — expired alert takes over
    if (outcome.status === "succeeded") {
      onPaid("card");
    } else {
      // Declines don't kill the registration (no failRegistration) — runner can retry.
      setCardError(outcome.message);
    }
  };

  const handleSlipFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setSlipDataUrl(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  };

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  return (
    <div className="space-y-4">
      {/* Hold countdown chip */}
      {registration.expiresAt && !expired && (
        <div className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          Seat held for {mm}:{ss}
        </div>
      )}

      {/* Hold expired */}
      {expired && (
        <div className="flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <div>
            <p className="text-sm font-semibold text-destructive">Your seat hold has expired</p>
            <p className="mt-0.5 text-sm text-destructive">
              Seats are held for 15 minutes.{" "}
              <button onClick={onRestart} className="underline font-medium">
                Start again
              </button>{" "}
              to grab a new seat.
            </p>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-6">
        <Tabs defaultValue="card">
          <TabsList className="w-full grid grid-cols-2 mb-4">
            <TabsTrigger value="card">
              <CreditCard className="mr-2 h-4 w-4" />
              Card
            </TabsTrigger>
            <TabsTrigger value="promptpay">
              <QrCode className="mr-2 h-4 w-4" />
              PromptPay
            </TabsTrigger>
          </TabsList>

          {/* Card — Stripe-checkout look */}
          <TabsContent value="card" className="space-y-4">
            {cardError && (
              <div className="flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                <p className="text-sm text-destructive">{cardError}</p>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="pay-card-number">Card number</Label>
              <Input
                id="pay-card-number"
                inputMode="numeric"
                autoComplete="cc-number"
                placeholder="1234 1234 1234 1234"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                disabled={processing || expired}
                className="bg-background font-mono"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="pay-exp">Expiry</Label>
                <Input
                  id="pay-exp"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  placeholder="MM/YY"
                  value={exp}
                  onChange={(e) => setExp(formatExp(e.target.value))}
                  disabled={processing || expired}
                  className="bg-background font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pay-cvc">CVC</Label>
                <Input
                  id="pay-cvc"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  placeholder="CVC"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  disabled={processing || expired}
                  className="bg-background font-mono"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pay-name">Name on card</Label>
              <Input
                id="pay-name"
                autoComplete="cc-name"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                disabled={processing || expired}
                className="bg-background"
              />
            </div>
            <p className="text-xs text-muted-foreground">Demo: 4242 4242 4242 4242 · any future exp · any CVC</p>
            <Button className="w-full" size="lg" disabled={!cardComplete || processing || expired} onClick={handlePayCard}>
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay ${fmtTHB(registration.amount)}`
              )}
            </Button>
          </TabsContent>

          {/* PromptPay — QR + slip upload */}
          <TabsContent value="promptpay" className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Scan to pay {fmtTHB(registration.amount)}
              </p>
              <div className="rounded-lg border border-border bg-background p-4">
                <p className="font-mono text-xs break-all text-muted-foreground leading-relaxed">
                  {promptpayQR(registration.amount, registration.code)}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Mock QR payload — in production this renders as a scannable PromptPay QR.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pay-slip">Upload payment slip</Label>
              <input
                ref={fileInputRef}
                id="pay-slip"
                type="file"
                accept="image/*"
                onChange={(e) => handleSlipFile(e.target.files?.[0])}
                disabled={expired}
                className="block w-full cursor-pointer rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1 file:text-xs file:font-medium file:text-foreground"
              />
              {slipDataUrl && (
                <div className="flex items-center gap-3">
                  <img
                    src={slipDataUrl}
                    alt="Payment slip"
                    className="h-24 w-24 rounded-lg border border-border object-cover"
                  />
                  <button
                    onClick={() => {
                      setSlipDataUrl(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="text-xs text-muted-foreground underline hover:text-foreground"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            <Button
              className="w-full"
              size="lg"
              disabled={!slipDataUrl || expired}
              onClick={() => slipDataUrl && onPaid("promptpay", slipDataUrl)}
            >
              <Upload className="mr-2 h-4 w-4" />
              I've paid — submit slip
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PaymentStep;
