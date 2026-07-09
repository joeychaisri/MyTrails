import type { GlobalProvider } from "@ladle/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/views/runner/i18n";
import "@/index.css";

// Global decorator — mirrors App.tsx providers so any story (runner or organizer)
// renders with the same context the real app gives it. Routing uses MemoryRouter
// so stories never touch the URL bar.
const queryClient = new QueryClient();

export const Provider: GlobalProvider = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <LanguageProvider>
          <MemoryRouter initialEntries={["/"]}>{children}</MemoryRouter>
        </LanguageProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);
