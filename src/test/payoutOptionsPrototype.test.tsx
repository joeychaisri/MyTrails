import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PayoutOptionsPrototype from "@/views/admin/PayoutOptionsPrototype";

const renderPrototype = () => render(<MemoryRouter><PayoutOptionsPrototype /></MemoryRouter>);

beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as never;
});

describe("interactive payout options prototype", () => {
  afterEach(() => cleanup());

  it("walks Option A from hold through the organizer receipt", () => {
    renderPrototype();

    fireEvent.click(screen.getByRole("button", { name: /simulate hold complete/i }));
    fireEvent.click(screen.getByRole("button", { name: /review transfer/i }));
    fireEvent.click(screen.getByRole("button", { name: /confirm final payout/i }));

    expect(screen.getByText("Final payout recorded")).toBeInTheDocument();
    expect(screen.getByText(/Paid to SCB/i)).toBeInTheDocument();
  });

  it("walks Option B through a monthly advance and final true-up", () => {
    renderPrototype();

    fireEvent.click(screen.getByRole("button", { name: /Option B · Monthly advances/i }));
    fireEvent.click(screen.getByRole("button", { name: /close august cycle/i }));
    fireEvent.click(screen.getByRole("button", { name: /review advance/i }));
    fireEvent.click(screen.getByRole("button", { name: /confirm monthly advance/i }));

    expect(screen.getByText("Monthly advance recorded")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /simulate event end/i }));
    expect(screen.getByText("Final payment due")).toBeInTheDocument();
  });

  it("labels the page as isolated from production data", () => {
    renderPrototype();
    expect(screen.getByText(/no real money moves and nothing is saved/i)).toBeInTheDocument();
    expect(screen.getByText(/No Supabase reads or writes/i)).toBeInTheDocument();
  });
});
