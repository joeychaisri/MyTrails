import { ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import NotFound from "./pages/NotFound";
import AuthView from "./views/AuthView";
import DashboardView from "./views/DashboardView";
import EventManagerHub from "./views/EventManagerHub";
import EventWizard from "./views/EventWizard";
import PublicEventPage from "./views/PublicEventPage";
import AdminDashboard from "./views/AdminDashboard";
import RunnerLandingPage from "./views/runner/RunnerLandingPage";
import PongYaengTrailPage from "./views/runner/pyt-landing/PongYaengTrailPage";

const queryClient = new QueryClient();

const ProtectedRoute = ({
  children,
  allowedRole,
}: {
  children: ReactNode;
  allowedRole?: "organizer" | "admin";
}) => {
  const { role } = useAuth();
  if (!role) return <Navigate to="/organizer/login" replace />;
  if (allowedRole === "admin" && role !== "admin") return <Navigate to="/organizer/dashboard" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
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

                {/* Organizer portal */}
                <Route path="/organizer/login" element={<AuthView />} />
                <Route path="/organizer/dashboard" element={<ProtectedRoute><DashboardView /></ProtectedRoute>} />
                <Route path="/organizer/events/new" element={<ProtectedRoute><EventWizard /></ProtectedRoute>} />
                <Route path="/organizer/events/:id/edit" element={<ProtectedRoute><EventWizard /></ProtectedRoute>} />
                <Route path="/organizer/events/:id/:section" element={<ProtectedRoute><EventManagerHub /></ProtectedRoute>} />
                <Route path="/organizer/events/:id" element={<Navigate to="overview" replace />} />
                <Route path="/organizer/admin" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />

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
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
