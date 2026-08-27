import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { EventsProvider } from "@/contexts/EventsContext";
import AdminEventReview from "@/views/admin/AdminEventReview";

const renderAt = (id: string) =>
  render(
    <MemoryRouter initialEntries={[`/organizer/admin/review/${id}`]}>
      <EventsProvider>
        <Routes>
          <Route path="/organizer/admin/review/:id" element={<AdminEventReview />} />
        </Routes>
      </EventsProvider>
    </MemoryRouter>
  );

describe("AdminEventReview page", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => cleanup());

  it("renders full event detail + organizer panel for an event with categories", () => {
    // Event "2" = Khao Yai Night Trail (pending_review, org1, has a 25K category).
    renderAt("2");
    expect(screen.getByRole("heading", { name: "Khao Yai Night Trail" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "25K Night Run" })).toBeTruthy();
    // Cover-photo state is surfaced (seed events ship with a cover image).
    expect(screen.getByRole("img", { name: "Khao Yai Night Trail" })).toBeTruthy();
    // Organizer side panel.
    expect(screen.getByText("Trail Events Co.")).toBeTruthy();
    // Fee estimate must not collapse to ฿0 for a pending event (regression).
    expect(screen.getByText("Platform fees (estimate)")).toBeTruthy();
    expect(screen.queryAllByText("฿0").length).toBe(0);
  });

  it("shows the reason for a previously rejected event", () => {
    // Event "5" = Krabi Jungle Trail, status rejected with a reason.
    renderAt("5");
    expect(screen.getByRole("heading", { name: "Krabi Jungle Trail" })).toBeTruthy();
    expect(screen.getByText(/Previously sent back/i)).toBeTruthy();
    expect(screen.getByText(/missing ticket prices/i)).toBeTruthy();
  });

  it("shows a not-found state for an unknown id", () => {
    renderAt("does-not-exist");
    expect(screen.getByText(/Event not found/i)).toBeTruthy();
  });
});
