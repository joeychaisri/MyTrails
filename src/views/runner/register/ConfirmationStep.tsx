import { Link } from "react-router-dom";
import { CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Event, Registration } from "@/data/mockData";
import { fmtTHB } from "./RegisterFlow";

interface Props {
  registration: Registration;
  method: "card" | "promptpay";
  event: Event;
}

const ConfirmationStep = ({ registration, method, event }: Props) => {
  const category = event.categories.find((c) => c.id === registration.categoryId);
  const ticket = category?.tickets.find((t) => t.id === registration.ticketId);
  const confirmed = method === "card";

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-8 text-center space-y-4">
        {confirmed ? (
          <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
        ) : (
          <Clock className="mx-auto h-10 w-10 text-warning" />
        )}

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            Your registration code
          </p>
          <p className="font-mono text-4xl font-bold tracking-widest text-foreground">{registration.code}</p>
        </div>

        {confirmed ? (
          <div>
            <p className="text-lg font-semibold text-success">Payment confirmed</p>
            <p className="mt-1 text-sm text-muted-foreground">See you at the start line.</p>
          </div>
        ) : (
          <div>
            <p className="text-lg font-semibold text-warning">Awaiting slip verification</p>
            <p className="mt-1 text-sm text-muted-foreground">
              The organizer will verify your payment slip. Check your status anytime with your code and email.
            </p>
          </div>
        )}

        {/* Registration summary */}
        <div className="mx-auto max-w-sm rounded-lg border border-border bg-muted/30 p-4 text-left text-sm space-y-1">
          <p className="font-medium text-foreground">{event.title}</p>
          {category && ticket && (
            <p className="text-muted-foreground">
              {category.name} ({category.distance}K) · {ticket.name}
            </p>
          )}
          <p className="text-muted-foreground">
            {registration.runner.firstName} {registration.runner.lastName} · {registration.runner.email}
          </p>
          <p className="font-semibold text-foreground">{fmtTHB(registration.amount)}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
          <Button variant="outline" asChild>
            <Link to="/registration/lookup">Look up my registration</Link>
          </Button>
          <Button asChild>
            <Link to={`/events/${event.id}/preview`}>Back to event</Link>
          </Button>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Keep your code safe — you'll need it together with your email to look up this registration.
      </p>
    </div>
  );
};

export default ConfirmationStep;
