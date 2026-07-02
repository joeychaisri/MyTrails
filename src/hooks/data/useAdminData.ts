import {
  AdminEvent,
  AdminOrganizer,
  PlatformSettings,
  mockAdminEvents,
  mockAdminOrganizers,
  mockPlatformSettings,
  mockPlatformRevenue,
} from "@/data/adminMockData";
import { DataResult, mockResult } from "./result";

export function useAdminData(): DataResult<{
  events: AdminEvent[];
  organizers: AdminOrganizer[];
  platformSettings: PlatformSettings;
  platformRevenue: typeof mockPlatformRevenue;
}> {
  return mockResult({
    events: mockAdminEvents,
    organizers: mockAdminOrganizers,
    platformSettings: mockPlatformSettings,
    platformRevenue: mockPlatformRevenue,
  });
}
