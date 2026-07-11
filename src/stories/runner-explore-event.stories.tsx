import type { StoryFn as Story } from "@storybook/react-vite";
import { Routes, Route } from "react-router-dom";
import PongYaengTrailPage from "@/views/runner/pyt-landing/PongYaengTrailPage";
import PublicEventPage from "@/views/organizer/PublicEventPage";

// Journey 2 · Runner — Explore an Event
// The two per-event pages a runner can land on:
//  • PYT Landing — the bespoke, pixel-crafted Pong Yaeng Trail 2026 microsite.
//  • Generic Event Preview — the data-driven template every other event renders
//    through. It reads useEvent(:id) off the URL, so it uses <Routes location>
//    (the global provider already supplies the Router) pinned to a real mock
//    event id ("1" = Doi Inthanon). Nesting a second <Router> here would throw.
// Journey 3 (Register & Pay) is reserved — no registration flow in the product yet;
// the Experiments order-flow directions graduate here once a direction is chosen.
export default {
  title: "Runner/2 · Explore an Event",
};

export const PytLanding: Story = () => <PongYaengTrailPage />;
PytLanding.storyName = "PYT Landing";

export const GenericEventPreview: Story = () => (
  <Routes location="/events/1/preview">
    <Route path="/events/:id/preview" element={<PublicEventPage />} />
  </Routes>
);
GenericEventPreview.storyName = "Generic Event Preview";
