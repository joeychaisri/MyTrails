import type { Story } from "@ladle/react";
import EventWizard from "@/views/organizer/EventWizard";
import { mockEvents } from "@/data/mockData";

// Journey 5 · Organizer — Create & Edit Event (4-step wizard)
// Each export lands the wizard on a specific step with seeded data — no clicking
// through prior steps. Wizard state still lives in EventWizard; the app renders
// <EventWizard /> prop-less, so runtime is unchanged.
const seed = mockEvents[0];

export default {
  title: "Organizer/Create & Edit Event",
};

export const Step1EventInfo: Story = () => <EventWizard initialStep={1} />;
Step1EventInfo.storyName = "Step 1 - Event Information";

export const Step2RaceConfig: Story = () => (
  <EventWizard initialStep={2} initialScenario={{ categories: seed.categories }} />
);
Step2RaceConfig.storyName = "Step 2 - Race Configuration";

export const Step3Tickets: Story = () => (
  <EventWizard initialStep={3} initialScenario={{ categories: seed.categories }} />
);
Step3Tickets.storyName = "Step 3 - Tickets (filled)";

export const Step4Review: Story = () => (
  <EventWizard
    initialStep={4}
    initialScenario={{
      basicInfo: {
        title: seed.title,
        titleTh: seed.titleTh,
        description: seed.description,
        province: seed.province,
        date: seed.date,
      },
      categories: seed.categories,
    }}
  />
);
Step4Review.storyName = "Step 4 - Review & Submit";
