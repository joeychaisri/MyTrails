import type { Story } from "@ladle/react";
import { Routes, Route } from "react-router-dom";
import EventManagerHub from "@/views/organizer/EventManagerHub";

// Journey 6 · Organizer — Manage Event
// The whole EventManagerHub storied at each of its section routes. The hub reads
// :id and :section off the URL, so every export uses <Routes location> (the
// global provider already supplies the Router — nesting a second one throws)
// pinned to a real mock event id ("1" = Doi Inthanon) plus the section id.
// Obsolete/experimental sections (overview2, orders2, orders3) live under Experiments.
export default {
  title: "Organizer/Manage Event",
};

const hubAt = (section: string) => (
  <Routes location={`/organizer/events/1/${section}`}>
    <Route path="/organizer/events/:id/:section" element={<EventManagerHub />} />
  </Routes>
);

export const RaceOperations: Story = () => hubAt("overview3");
RaceOperations.storyName = "Race Operations (overview3)";

export const Orders: Story = () => hubAt("orders");
Orders.storyName = "Orders / Finance";

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
