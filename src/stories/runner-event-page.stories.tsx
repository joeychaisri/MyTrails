import type { Story } from "@ladle/react";
import { Routes, Route } from "react-router-dom";
import PongYaengTrailPage from "@/views/runner/pyt-landing/PongYaengTrailPage";
import PublicEventPage from "@/views/organizer/PublicEventPage";

// Journey 2 · Runner — Event Page
// The two per-event pages a runner can land on:
//  • PYT Landing — the bespoke, pixel-crafted Pong Yaeng Trail 2026 microsite.
//  • Generic Event Preview — the data-driven template every other event renders
//    through. It reads useEvent(:id) off the URL, so it uses <Routes location>
//    (the global provider already supplies the Router) pinned to a real mock
//    event id ("1" = Doi Inthanon). Nesting a second <Router> here would throw.
export default {
  title: "Runner/Event Page",
};

export const PytLanding: Story = () => <PongYaengTrailPage />;
PytLanding.storyName = "PYT Landing";

export const GenericEventPreview: Story = () => (
  <Routes location="/events/1/preview">
    <Route path="/events/:id/preview" element={<PublicEventPage />} />
  </Routes>
);
GenericEventPreview.storyName = "Generic Event Preview";
