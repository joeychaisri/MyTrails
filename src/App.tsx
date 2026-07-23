import { ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { EventsProvider } from "@/contexts/EventsContext";
import NotFound from "./pages/NotFound";
import AuthView from "./views/organizer/AuthView";
import DashboardView from "./views/organizer/DashboardView";
import EventManagerHub from "./views/organizer/EventManagerHub";
import EventWizard from "./views/organizer/EventWizard";
import OutboxPage from "./views/organizer/OutboxPage";
import PublicEventPage from "./views/organizer/PublicEventPage";
import AdminDashboard from "./views/AdminDashboard";
import AdminEventReview from "./views/admin/AdminEventReview";
import RunnerLandingPage from "./views/runner/RunnerLandingPage";
import PongYaengTrailPage from "./views/runner/pyt-landing/PongYaengTrailPage";
import RegisterFlow from "./views/runner/register/RegisterFlow";
import LookupPage from "./views/runner/register/LookupPage";
import PdpaPage from "./views/runner/register/PdpaPage";
import BoardListView from "./views/board/BoardListView";

const queryClient = new QueryClient();

const ProtectedRoute = ({
  children,
  allowedRole,
}: {
  children: ReactNode;
  allowedRole?: "organizer" | "admin";
}) => {
  const { role, authReady } = useAuth();
  // Supabase restores the session async — don't bounce a deep link before we know.
  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }
  const effectiveRole = role ?? "organizer";
  if (allowedRole === "admin" && effectiveRole !== "admin") return <Navigate to="/organizer/dashboard" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <EventsProvider>
        <div className="min-h-screen flex flex-col">
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="flex-grow flex flex-col">
              <Routes>
                {/* Runner (public) */}
                <Route path="/" element={<RunnerLandingPage />} />
                <Route path="/events/pong-yaeng-trail-2026" element={<PongYaengTrailPage />} />
                <Route path="/events/:id/preview" element={<PublicEventPage />} />
                <Route path="/events/:id/register" element={<RegisterFlow />} />
                <Route path="/registration/lookup" element={<LookupPage />} />
                <Route path="/pdpa" element={<PdpaPage />} />
                <Route path="/board" element={<BoardListView />} />

                {/* Organizer portal */}
                <Route path="/organizer/login" element={<AuthView />} />
                <Route path="/organizer/dashboard" element={<ProtectedRoute><DashboardView /></ProtectedRoute>} />
                <Route path="/organizer/outbox" element={<ProtectedRoute><OutboxPage /></ProtectedRoute>} />
                <Route path="/organizer/events/new" element={<ProtectedRoute><EventWizard /></ProtectedRoute>} />
                <Route path="/organizer/events/:id/edit" element={<ProtectedRoute><EventWizard /></ProtectedRoute>} />
                <Route path="/organizer/events/:id/:section" element={<ProtectedRoute><EventManagerHub /></ProtectedRoute>} />
                <Route path="/organizer/events/:id" element={<Navigate to="overview" replace />} />
                <Route path="/organizer/admin" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />
                <Route path="/organizer/admin/review/:id" element={<ProtectedRoute allowedRole="admin"><AdminEventReview /></ProtectedRoute>} />

                {/* Organizer events index → dashboard */}
                <Route path="/organizer/events" element={<Navigate to="/organizer/dashboard" replace />} />

                {/* Legacy redirects */}
                <Route path="/login" element={<Navigate to="/organizer/login" replace />} />
                <Route path="/dashboard" element={<Navigate to="/organizer/dashboard" replace />} />
                <Route path="/events/*" element={<Navigate to="/organizer/dashboard" replace />} />
                <Route path="/admin" element={<Navigate to="/organizer/admin" replace />} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </BrowserRouter>
        </div>
        </EventsProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
