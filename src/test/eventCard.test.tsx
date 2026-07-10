import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import EventCard from "@/components/EventCard";
import { Event } from "@/data/mockData";

const baseEvent: Event = {
  id: "x1",
  title: "Test Trail",
  titleTh: "เทสเทรล",
  coverImage: "",
  date: "2026-12-01",
  endDate: "2026-12-01",
  province: "Chiang Mai",
  status: "rejected",
  organizerId: "org1",
  organizerName: "Trail Events Co.",
  rejectionReason: "Missing ticket prices for the 30K.",
  sold: 0,
  capacity: 100,
  revenue: 0,
  categories: [],
  description: "",
  descriptionTh: "",
  latitude: "",
  longitude: "",
  socialLinks: {},
};

const noop = () => {};
const renderCard = (event: Event) =>
  render(
    <MemoryRouter>
      <EventCard event={event} onEdit={noop} onPreview={noop} onManage={noop} onDelete={noop} onCancel={noop} />
    </MemoryRouter>
  );

describe("EventCard — rejected event", () => {
  afterEach(() => cleanup());

  it("keeps the card compact — the (long) rejection reason is NOT shown here (it lives in the edit wizard)", () => {
    renderCard(baseEvent);
    // The status is still conveyed by the badge, but the reason text stays off the card
    // so every card keeps the same height.
    expect(screen.getByText("Changes Requested")).toBeTruthy();
    expect(screen.queryByText(/Missing ticket prices/i)).toBeNull();
  });
});
