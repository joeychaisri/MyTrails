import { describe, it, expect, beforeAll } from "vitest";
import { render } from "@testing-library/react";
import { composeStories, setProjectAnnotations } from "@storybook/react-vite";
import preview from "../../.storybook/preview";
import * as getStartedStories from "@/stories/organizer-get-started.stories";
import * as discoverStories from "@/stories/runner-discover.stories";
import * as moderationStories from "@/stories/admin-moderation.stories";
import * as approvalStories from "@/stories/organizer-approval-outcomes.stories";
import * as registerStories from "@/stories/runner-register.stories";

// Smoke test: stories render through the .storybook/preview decorator chain
// (QueryClient → Tooltip → Auth → Language → MemoryRouter) without throwing.
beforeAll(() => {
  // jsdom lacks ResizeObserver; recharts' ResponsiveContainer needs it
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as never;
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
