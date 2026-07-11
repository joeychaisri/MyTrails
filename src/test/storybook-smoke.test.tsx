import { describe, it, expect, beforeAll } from "vitest";
import { render } from "@testing-library/react";
import { composeStories, setProjectAnnotations } from "@storybook/react-vite";
import preview from "../../.storybook/preview";
import * as loginStories from "@/stories/organizer-login.stories";
import * as browseStories from "@/stories/runner-browse.stories";
import * as adminStories from "@/stories/admin-console.stories";

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
  it("renders Organizer/Login default story", () => {
    const { Default } = composeStories(loginStories);
    const { container } = render(<Default />);
    expect(container.textContent).not.toBe("");
  });

  it("renders Runner/Browse & Discover stories", () => {
    const stories = composeStories(browseStories);
    for (const Story of Object.values(stories)) {
      const { container, unmount } = render(<Story />);
      expect(container.textContent).not.toBe("");
      unmount();
    }
  });

  it("renders Admin/Console stories", () => {
    const stories = composeStories(adminStories);
    for (const Story of Object.values(stories)) {
      const { container, unmount } = render(<Story />);
      expect(container.textContent).not.toBe("");
      unmount();
    }
  });
});
