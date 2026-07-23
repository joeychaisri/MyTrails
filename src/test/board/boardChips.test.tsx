import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StatusChip from "@/components/board/StatusChip";
import RoleChip from "@/components/board/RoleChip";

describe("board chips", () => {
  it("renders the status label", () => {
    render(<StatusChip status="waiting_po" />);
    expect(screen.getByText("Waiting on PO")).toBeInTheDocument();
  });

  it("renders the role label", () => {
    render(<RoleChip role="ux" />);
    expect(screen.getByText("UX")).toBeInTheDocument();
  });
});
