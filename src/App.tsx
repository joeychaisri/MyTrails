import { ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthView from "./views/AuthView";
import DashboardView from "./views/DashboardView";
import EventManagerHub from "./views/EventManagerHub";
import EventWizard from "./views/EventWizard";
import PublicEventPage from "./views/PublicEventPage";
import AdminDashboard from "./views/AdminDashboard";

const queryClient = new QueryClient();

const ProtectedRoute = ({
  children,
  allowedRole,
}: {
  children: ReactNode;
  allowedRole?: "organizer" | "admin";
}) => {
  const { role } = useAuth();
  if (!role) return <Navigate to="/login" replace />;
  if (allowedRole === "admin" && role !== "admin") return <Navigate to="/dashboard" replace />;
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
                <Route path="/login" element={<AuthView />} />
                <Route path="/dashboard" element={<ProtectedRoute><DashboardView /></ProtectedRoute>} />
                <Route path="/events/new" element={<ProtectedRoute><EventWizard /></ProtectedRoute>} />
                <Route path="/events/:id/edit" element={<ProtectedRoute><EventWizard /></ProtectedRoute>} />
                <Route path="/events/:id/preview" element={<PublicEventPage />} />
                <Route path="/events/:id/:section" element={<ProtectedRoute><EventManagerHub /></ProtectedRoute>} />
                <Route path="/events/:id" element={<Navigate to="overview" replace />} />
                <Route path="/admin" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />
                <Route path="/" element={<Index />} />
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
