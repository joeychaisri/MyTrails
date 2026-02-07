import { useState } from "react";
import {
  LayoutDashboard,
  ClipboardCheck,
  Banknote,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Logo from "@/components/Logo";
import AdminOverview from "@/views/admin/AdminOverview";
import AdminEventApprovals from "@/views/admin/AdminEventApprovals";
import AdminFinancials from "@/views/admin/AdminFinancials";
import AdminUserManagement from "@/views/admin/AdminUserManagement";
import AdminSettings from "@/views/admin/AdminSettings";
import {
  mockAdminEvents,
  mockAdminOrganizers,
  mockPlatformSettings,
  AdminEvent,
  AdminOrganizer,
  PlatformSettings,
} from "@/data/adminMockData";
import { cn } from "@/lib/utils";

type AdminPage = "overview" | "approvals" | "financials" | "users" | "settings";

interface AdminDashboardProps {
  onLogout: () => void;
}

const sidebarItems: { id: AdminPage; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard },
  { id: "approvals", label: "Event Approvals", icon: ClipboardCheck },
  { id: "financials", label: "Financials", icon: Banknote },
  { id: "users", label: "User Management", icon: Users },
  { id: "settings", label: "Settings", icon: Settings },
];

const breadcrumbLabels: Record<AdminPage, string> = {
  overview: "Dashboard Overview",
  approvals: "Event Approvals",
  financials: "Financials",
  users: "User Management",
  settings: "Settings",
};

const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const [activePage, setActivePage] = useState<AdminPage>("overview");
  const [events, setEvents] = useState<AdminEvent[]>(mockAdminEvents);
  const [organizers, setOrganizers] = useState<AdminOrganizer[]>(mockAdminOrganizers);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(mockPlatformSettings);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleApprove = (eventId: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, status: "awaiting_payment" as const } : e))
    );
  };

  const handleReject = (eventId: string, _reason: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, status: "draft" as const } : e))
    );
  };

  const handleMarkPaid = (eventId: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, status: "ready_to_publish" as const } : e))
    );
  };

  const handleForceUnpublish = (eventId: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, status: "draft" as const } : e))
    );
  };

  const handleCreateOrganizer = (org: Omit<AdminOrganizer, "id" | "createdAt" | "eventsCount">) => {
    const newOrg: AdminOrganizer = {
      ...org,
      id: `org${Date.now()}`,
      createdAt: new Date().toISOString().split("T")[0],
      eventsCount: 0,
    };
    setOrganizers((prev) => [newOrg, ...prev]);
  };

  const handleSuspendOrganizer = (orgId: string) => {
    setOrganizers((prev) =>
      prev.map((o) =>
        o.id === orgId
          ? { ...o, status: o.status === "active" ? ("suspended" as const) : ("active" as const) }
          : o
      )
    );
  };

  const renderPage = () => {
    switch (activePage) {
      case "overview":
        return <AdminOverview events={events} organizers={organizers} platformSettings={platformSettings} />;
      case "approvals":
        return (
          <AdminEventApprovals
            events={events}
            onApprove={handleApprove}
            onReject={handleReject}
            onForceUnpublish={handleForceUnpublish}
          />
        );
      case "financials":
        return <AdminFinancials events={events} onMarkPaid={handleMarkPaid} platformSettings={platformSettings} />;
      case "users":
        return (
          <AdminUserManagement
            organizers={organizers}
            onCreateOrganizer={handleCreateOrganizer}
            onSuspendOrganizer={handleSuspendOrganizer}
          />
        );
      case "settings":
        return <AdminSettings settings={platformSettings} onSave={setPlatformSettings} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-border bg-card transition-transform lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <Logo size="sm" />
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActivePage(item.id);
                setSidebarOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                activePage === item.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Area */}
      <div className="flex flex-1 flex-col">
        {/* Top Nav */}
        <nav className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
              <div className="hidden items-center gap-2 lg:flex">
                <Logo size="sm" />
                <span className="rounded bg-foreground px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-background">
                  System Admin
                </span>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-foreground text-background text-xs">A</AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-sm">Admin</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-popover">
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>

        {/* Context Header */}
        <div className="border-b border-border bg-card px-4 py-4 sm:px-6">
          <p className="text-xs text-muted-foreground">
            Admin Panel &gt; {breadcrumbLabels[activePage]}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-foreground">{breadcrumbLabels[activePage]}</h1>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6">{renderPage()}</main>
      </div>
    </div>
  );
};

export default AdminDashboard;
