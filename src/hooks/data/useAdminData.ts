import { AdminEvent, AdminOrganizer, PlatformSettings, mockPlatformRevenue } from "@/data/adminMockData";
import { useEventsStore } from "@/contexts/EventsContext";
import { DataResult, mockResult } from "./result";

// Admin reads the same shared store as everyone else. platformRevenue (the
// monthly chart series) stays a static mock — it's illustrative history.
export function useAdminData(): DataResult<{
  events: AdminEvent[];
  organizers: AdminOrganizer[];
  platformSettings: PlatformSettings;
  platformRevenue: typeof mockPlatformRevenue;
}> {
  const { events, organizers, settings } = useEventsStore();
  return mockResult({
    events,
    organizers,
    platformSettings: settings,
    platformRevenue: mockPlatformRevenue,
  });
}
