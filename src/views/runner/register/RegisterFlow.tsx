import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import { useEvent } from "@/hooks/data/useEvents";
import { useEventsStore } from "@/contexts/EventsContext";
import { Registration, RunnerInfo } from "@/data/mockData";
import RunnerFormStep from "./RunnerFormStep";
import PaymentStep from "./PaymentStep";
import ConfirmationStep from "./ConfirmationStep";

// Reasons createRegistration can refuse — each gets its own inline alert.
export type CreateFailure = "sold_out" | "window_closed" | "duplicate";

export const fmtTHB = (amount: number) =>
  new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", minimumFractionDigits: 0 }).format(amount);

const STEPS = [
  { number: 1, title: "Runner details" },
  { number: 2, title: "Payment" },
  { number: 3, title: "Confirmation" },
] as const;

// Story-pinning props (Storybook catalog only): both optional and defaulting
// to live behavior — the app renders <RegisterFlow /> prop-less and is unchanged.
interface RegisterFlowProps {
  initialStep?: 1 | 2 | 3;
  initialRegistration?: Registration;
}

// Direction-2 registration flow (sibling of OrderTwoView's visual language):
// orchestrator only — each step lives in its own component in this folder.
const RegisterFlow = ({ initialStep, initialRegistration }: RegisterFlowProps = {}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: event } = useEvent(id);
  const { createRegistration, confirmRegistration } = useEventsStore();

  // Selection normally arrives via router state from PublicEventPage's Register
  // button; a direct URL visit gets inline pickers on step 1 instead.
  const routerState = (location.state ?? {}) as { categoryId?: string; ticketId?: string };
  const [showPickers] = useState(!(routerState.categoryId && routerState.ticketId));
  const [categoryId, setCategoryId] = useState(routerState.categoryId ?? initialRegistration?.categoryId ?? "");
  const [ticketId, setTicketId] = useState(routerState.ticketId ?? initialRegistration?.ticketId ?? "");

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(initialStep ?? 1);
  const [registration, setRegistration] = useState<Registration | null>(initialRegistration ?? null);
  const [createError, setCreateError] = useState<CreateFailure | null>(null);
  const [paidMethod, setPaidMethod] = useState<"card" | "promptpay" | null>(
    initialRegistration?.paymentMethod ?? null
  );

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-muted-foreground">Event not found.</p>
        <Button variant="outline" asChild>
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to events
          </Link>
        </Button>
      </div>
    );
  }

  const category = event.categories.find((c) => c.id === categoryId);
  const ticket = category?.tickets.find((t) => t.id === ticketId);

  const handleRunnerSubmit = async (runner: RunnerInfo) => {
    // Sync result in mock mode, a Promise in supabase mode (server-side RPC) —
    // Promise.resolve() handles both without changing the store's signature.
    const result = await Promise.resolve(createRegistration({ eventId: event.id, categoryId, ticketId, runner }));
    if (!result.ok) {
      setCreateError(result.reason);
      return;
    }
    setCreateError(null);
    setRegistration(result.registration);
    setCurrentStep(2);
  };

  const handlePaid = (method: "card" | "promptpay", slipDataUrl?: string) => {
    if (!registration) return;
    confirmRegistration(registration.id, method, slipDataUrl);
    setPaidMethod(method);
    setCurrentStep(3);
  };

  // Hold expired on step 2 — throw away the dead registration and start over.
  const handleRestart = () => {
    setRegistration(null);
    setCreateError(null);
    setPaidMethod(null);
    setCurrentStep(1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Logo size="sm" />
          <Button variant="outline" onClick={() => navigate(`/events/${event.id}/preview`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to event
          </Button>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-1">Register — {event.title}</p>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">{STEPS[currentStep - 1].title}</h1>
        </div>

        {/* Stepper */}
        <div className="mb-6 flex items-center">
          {STEPS.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${
                    currentStep === step.number
                      ? "bg-primary text-primary-foreground"
                      : currentStep > step.number
                      ? "bg-success text-success-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {currentStep > step.number ? <Check className="h-4 w-4" /> : step.number}
                </div>
                <span
                  className={`hidden sm:inline text-sm font-medium ${
                    currentStep === step.number ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {step.title}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div className={`mx-2 sm:mx-3 h-px w-6 sm:w-10 ${currentStep > step.number ? "bg-success" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Order summary (steps 1-2) */}
        {currentStep < 3 && category && ticket && (
          <div className="mb-6 rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Your selection</p>
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <div>
                <p className="font-medium text-foreground">
                  {category.name} ({category.distance}K)
                </p>
                <p className="text-muted-foreground">{ticket.name}</p>
              </div>
              <p className="text-xl font-bold text-primary">{fmtTHB(registration?.amount ?? ticket.price)}</p>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <RunnerFormStep
            event={event}
            categoryId={categoryId}
            ticketId={ticketId}
            onSelectCategory={(id) => {
              setCategoryId(id);
              setTicketId("");
            }}
            onSelectTicket={setTicketId}
            showPickers={showPickers}
            createError={createError}
            onSubmit={handleRunnerSubmit}
          />
        )}

        {currentStep === 2 && registration && (
          <PaymentStep registration={registration} onPaid={handlePaid} onRestart={handleRestart} />
        )}

        {currentStep === 3 && registration && paidMethod && (
          <ConfirmationStep registration={registration} method={paidMethod} event={event} />
        )}
      </main>
    </div>
  );
};

export default RegisterFlow;
