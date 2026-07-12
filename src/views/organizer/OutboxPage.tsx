import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Logo from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { EMAIL_FROM, notificationEmail, useNotifications } from "@/hooks/data/useNotifications";
import { useOrganizerProfile } from "@/hooks/data/useOrganizerProfile";

// Mock email outbox: every in-app notification (useNotifications) doubles as an
// email — this page previews exactly what would land in the organizer's inbox.
// Pure derivation from the store; nothing is actually sent (prototype).
const OutboxPage = () => {
  const navigate = useNavigate();
  const { organizerId } = useAuth();
  // Same demo fallback as DashboardView: direct navigation without an explicit
  // login still shows the demo organizer's (org1) outbox.
  const notifications = useNotifications(organizerId ?? "org1");
  const { data: organizerAccount } = useOrganizerProfile();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fmtDate = (s?: string) =>
    s ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(s)) : "";

  return (
    <div className="min-h-screen bg-background">
      {/* Header — same shell as the event manager pages */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/organizer/dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <div className="hidden h-6 w-px bg-border sm:block" />
            <div className="hidden sm:block">
              <Logo size="sm" />
            </div>
          </div>
          <h1 className="text-lg font-semibold text-foreground">Email outbox</h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        <p className="mb-6 text-sm text-muted-foreground">
          Every notification also goes out as an email from {EMAIL_FROM}. This outbox previews what we send you.
        </p>

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16">
            <Mail className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-medium text-foreground">No emails yet</h3>
            <p className="text-muted-foreground">You're all caught up</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => {
              const email = notificationEmail(n);
              const open = expandedId === n.id;
              return (
                <Card key={n.id} className="overflow-hidden">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-4 p-4 text-left"
                    onClick={() => setExpandedId(open ? null : n.id)}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{email.subject}</p>
                      <p className="truncate text-sm text-muted-foreground">{email.preheader}</p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">{fmtDate(n.at)}</span>
                  </button>

                  {open && (
                    <div className="border-t border-border p-4">
                      {/* The email preview itself */}
                      <div className="rounded-lg border border-border bg-card p-4">
                        <div className="mb-4 space-y-1 border-b border-border pb-3 text-xs text-muted-foreground">
                          <p>From: {EMAIL_FROM}</p>
                          <p>
                            To: {organizerAccount.profile.name} &lt;{organizerAccount.profile.email}&gt;
                          </p>
                          <p>Subject: {email.subject}</p>
                        </div>
                        <div className="space-y-3">
                          {email.bodyLines.map((line, i) => (
                            <p key={i} className="text-sm text-foreground">
                              {line}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default OutboxPage;
