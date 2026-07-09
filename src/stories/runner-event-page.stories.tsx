import type { Story } from "@ladle/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import PongYaengTrailPage from "@/views/runner/pyt-landing/PongYaengTrailPage";
import PublicEventPage from "@/views/organizer/PublicEventPage";

// Journey 2 · Runner — Event Page
// The two per-event pages a runner can land on:
//  • PYT Landing — the bespoke, pixel-crafted Pong Yaeng Trail 2026 microsite.
//  • Generic Event Preview — the data-driven template every other event renders
//    through. It reads useEvent(:id) off the URL, so it's wrapped in its own
//    MemoryRouter pinned to a real mock event id ("1" = Doi Inthanon).
export default {
  title: "Runner/Event Page",
};

export const PytLanding: Story = () => <PongYaengTrailPage />;
PytLanding.storyName = "PYT Landing";

export const GenericEventPreview: Story = () => (
  <MemoryRouter initialEntries={["/events/1/preview"]}>
    <Routes>
      <Route path="/events/:id/preview" element={<PublicEventPage />} />
    </Routes>
  </MemoryRouter>
);
GenericEventPreview.storyName = "Generic Event Preview";
