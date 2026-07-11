import type { StoryFn as Story } from "@storybook/react-vite";
import EventWizard from "@/views/organizer/EventWizard";
import { mockEvents } from "@/data/mockData";

// Journey 5 · Organizer — Create & Edit Event (5-step wizard)
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

export const Step4PublishingAsap: Story = () => (
  <EventWizard initialStep={4} initialScenario={{ categories: seed.categories }} />
);
Step4PublishingAsap.storyName = "Step 4 - Publishing (ASAP)";

export const Step4PublishingScheduled: Story = () => (
  <EventWizard
    initialStep={4}
    initialScenario={{
      categories: seed.categories,
      publishMode: "scheduled",
      publishAt: "2026-09-01T09:00",
    }}
  />
);
Step4PublishingScheduled.storyName = "Step 4 - Publishing (scheduled)";

export const Step5Review: Story = () => (
  <EventWizard
    initialStep={5}
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
Step5Review.storyName = "Step 5 - Review & Submit (commission estimate)";
