import { describe, it, expect, beforeAll, vi } from "vitest";
import { render } from "@testing-library/react";
import { composeStories, setProjectAnnotations } from "@storybook/react-vite";
import preview from "../../.storybook/preview";
import * as getStartedStories from "@/stories/organizer-get-started.stories";
import * as discoverStories from "@/stories/runner-discover.stories";
import * as moderationStories from "@/stories/admin-moderation.stories";
import * as financeStories from "@/stories/admin-finance.stories";
import * as administrationStories from "@/stories/admin-administration.stories";
import * as approvalStories from "@/stories/organizer-approval-outcomes.stories";
import * as registerStories from "@/stories/runner-register.stories";
import * as payoutOptionStories from "@/stories/payout-workflow-options.stories";

// Smoke test: stories render through the .storybook/preview decorator chain
// (QueryClient → Tooltip → Auth → Language → MemoryRouter) without throwing.
beforeAll(() => {
  // jsdom lacks ResizeObserver; recharts' ResponsiveContainer needs it
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as never;
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    x: 0,
    y: 0,
    width: 1024,
    height: 768,
    top: 0,
    right: 1024,
    bottom: 768,
    left: 0,
    toJSON: () => ({}),
  } as DOMRect);
  setProjectAnnotations(preview);
});

describe("storybook portable stories", () => {
  it("renders Get Started stories", () => {
    const stories = composeStories(getStartedStories);
    for (const Story of Object.values(stories)) {
      const { unmount } = render(<Story />);
      // Portal-based stories (dialogs) render into document.body, not the container
      expect(document.body.textContent).not.toBe("");
      unmount();
    }
  });

  it("renders Discover Events stories", () => {
    const stories = composeStories(discoverStories);
    for (const Story of Object.values(stories)) {
      const { unmount } = render(<Story />);
      // Portal-based stories (dialogs) render into document.body, not the container
      expect(document.body.textContent).not.toBe("");
      unmount();
    }
  });

  it("renders Moderate Events stories (store + route params)", () => {
    const stories = composeStories(moderationStories);
    for (const Story of Object.values(stories)) {
      const { unmount } = render(<Story />);
      // Portal-based stories (dialogs) render into document.body, not the container
      expect(document.body.textContent).not.toBe("");
      unmount();
    }
  });

  it("renders Platform Finance stories", () => {
    const stories = composeStories(financeStories);
    for (const Story of Object.values(stories)) {
      const { unmount } = render(<Story />);
      expect(document.body.textContent).not.toBe("");
      unmount();
    }
  });

  it("renders payout workflow decision stories", () => {
    const stories = composeStories(payoutOptionStories);
    for (const Story of Object.values(stories)) {
      const { unmount } = render(<Story />);
      expect(document.body.textContent).not.toBe("");
      unmount();
    }
  });

  it("renders Platform Administration stories", () => {
    const stories = composeStories(administrationStories);
    for (const Story of Object.values(stories)) {
      const { unmount } = render(<Story />);
      expect(document.body.textContent).not.toBe("");
      unmount();
    }
  });

  it("renders Approval Outcomes stories", () => {
    const stories = composeStories(approvalStories);
    for (const Story of Object.values(stories)) {
      const { unmount } = render(<Story />);
      // Portal-based stories (dialogs) render into document.body, not the container
      expect(document.body.textContent).not.toBe("");
      unmount();
    }
  });

  it("renders Register & Pay stories (route params + pinned steps)", () => {
    const stories = composeStories(registerStories);
    for (const Story of Object.values(stories)) {
      const { unmount } = render(<Story />);
      // Portal-based stories (dialogs) render into document.body, not the container
      expect(document.body.textContent).not.toBe("");
      unmount();
    }
  });
});
