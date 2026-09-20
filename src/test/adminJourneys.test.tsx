import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { EventsProvider, useEventsStore } from "@/contexts/EventsContext";
import AdminDashboard from "@/views/AdminDashboard";
import AdminEventApprovals from "@/views/admin/AdminEventApprovals";
import AdminFinancials from "@/views/admin/AdminFinancials";
import AdminSettings from "@/views/admin/AdminSettings";
import AdminUserManagement from "@/views/admin/AdminUserManagement";
import { mockAdminOrganizers } from "@/data/adminMockData";

const LocationProbe = () => {
  const location = useLocation();
  return <output data-testid="location-search">{location.search}</output>;
};

const StoreApprovals = ({ onForceUnpublish }: { onForceUnpublish: (id: string) => void }) => {
  const { events } = useEventsStore();
  return (
    <AdminEventApprovals
      events={events}
      onForceUnpublish={onForceUnpublish}
      initialTab="live"
      initialUnpublishEventId="1"
    />
  );
};

const StoreFinancials = ({ onMarkPaid }: { onMarkPaid: (id: string) => void }) => {
  const { events, organizers, settings } = useEventsStore();
  return (
    <AdminFinancials
      events={events}
      organizers={organizers}
      settings={settings}
      onMarkPaid={onMarkPaid}
      initialConfirmEventId="1"
    />
  );
};

describe("Admin handoff journeys", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => cleanup());

  it("deep-links to an Admin section and keeps sidebar navigation in the URL", () => {
    render(
      <MemoryRouter initialEntries={["/organizer/admin?page=financials"]}>
        <EventsProvider>
          <AdminDashboard />
          <LocationProbe />
        </EventsProvider>
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: "Financials" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Event Approvals" }));
    expect(screen.getByTestId("location-search")).toHaveTextContent("page=approvals");
    expect(screen.getByRole("heading", { name: "Event Approvals" })).toBeInTheDocument();
  });

  it("pins and confirms the force-unpublish state", () => {
    const onForceUnpublish = vi.fn();
    render(
      <MemoryRouter>
        <EventsProvider>
          <StoreApprovals onForceUnpublish={onForceUnpublish} />
        </EventsProvider>
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: "Force Unpublish" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Confirm Unpublish" }));
    expect(onForceUnpublish).toHaveBeenCalledWith("1");
  });

  it("pins and confirms an organizer payout transfer", () => {
    const onMarkPaid = vi.fn();
    render(
      <EventsProvider>
        <StoreFinancials onMarkPaid={onMarkPaid} />
      </EventsProvider>
    );

    expect(screen.getByRole("heading", { name: "Mark payout as transferred?" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Confirm Transfer" }));
    expect(onMarkPaid).toHaveBeenCalledWith("1");
  });

  it("shows the prototype temporary-password handoff", () => {
    render(
      <AdminUserManagement
        organizers={mockAdminOrganizers}
        onCreateOrganizer={vi.fn()}
        onSuspendOrganizer={vi.fn()}
        initialResetOrganizerId="org1"
      />
    );

    expect(screen.getByRole("heading", { name: "Temporary password generated" })).toBeInTheDocument();
    expect(screen.getByDisplayValue("somchai@trailevents.co.th")).toBeInTheDocument();
    expect(screen.getByText(/does not change Supabase Auth yet/i)).toBeInTheDocument();
  });

  it("confirms account access changes before applying them", () => {
    const onSuspendOrganizer = vi.fn();
    render(
      <AdminUserManagement
        organizers={mockAdminOrganizers}
        onCreateOrganizer={vi.fn()}
        onSuspendOrganizer={onSuspendOrganizer}
        initialStatusOrganizerId="org1"
      />
    );

    expect(screen.getByRole("heading", { name: "Suspend organizer?" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Confirm Suspension" }));
    expect(onSuspendOrganizer).toHaveBeenCalledWith("org1");
  });

  it("confirms before replacing demo data", () => {
    render(
      <EventsProvider>
        <AdminSettings initialResetOpen />
      </EventsProvider>
    );

    expect(screen.getByRole("heading", { name: "Reset demo data?" })).toBeInTheDocument();
    expect(screen.getByText(/replaces all browser-side demo changes/i)).toBeInTheDocument();
  });
});
