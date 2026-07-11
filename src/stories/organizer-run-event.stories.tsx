import type { StoryFn as Story } from "@storybook/react-vite";
import { Routes, Route } from "react-router-dom";
import EventManagerHub from "@/views/organizer/EventManagerHub";

// Journey 7 · Organizer — Run the Event
// Day-to-day operations on a live event, storied at each EventManagerHub section
// route. The hub reads :id and :section off the URL, so every export uses
// <Routes location> (the global provider already supplies the Router — nesting a
// second one throws) pinned to a real mock event id ("1" = Doi Inthanon).
// Orders/Finance lives in Journey 8 (Get Paid); obsolete sections in Experiments.
export default {
  title: "Organizer/7 · Run the Event",
};

const hubAt = (section: string) => (
  <Routes location={`/organizer/events/1/${section}`}>
    <Route path="/organizer/events/:id/:section" element={<EventManagerHub />} />
  </Routes>
);

export const RaceOperations: Story = () => hubAt("overview3");
RaceOperations.storyName = "Race Operations (overview3)";

export const Participants: Story = () => hubAt("participants");
Participants.storyName = "Participants";

export const Bib: Story = () => hubAt("bib");
Bib.storyName = "BIB Assignment";

export const Promotions: Story = () => hubAt("promotions");
Promotions.storyName = "Promotions";

export const Broadcast: Story = () => hubAt("broadcast");
Broadcast.storyName = "Broadcast";

export const Settings: Story = () => hubAt("settings");
Settings.storyName = "Settings";
