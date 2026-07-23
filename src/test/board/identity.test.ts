import { describe, it, expect, beforeEach } from "vitest";
import { getIdentity, setIdentity } from "@/lib/board/identity";

describe("board identity", () => {
  beforeEach(() => localStorage.clear());

  it("returns null before anything is stored", () => {
    expect(getIdentity()).toBeNull();
  });

  it("round-trips name + role", () => {
    setIdentity({ name: "Dao", role: "dev" });
    expect(getIdentity()).toEqual({ name: "Dao", role: "dev" });
  });

  it("returns null for a corrupt payload", () => {
    localStorage.setItem("mytrails.board.identity", "not json");
    expect(getIdentity()).toBeNull();
  });

  it("returns null when the stored role is invalid", () => {
    localStorage.setItem("mytrails.board.identity", JSON.stringify({ name: "X", role: "boss" }));
    expect(getIdentity()).toBeNull();
  });
});
