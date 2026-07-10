import { Event } from "@/data/mockData";
import { useEventsStore } from "@/contexts/EventsContext";
import { DataResult, mockResult } from "./result";

// Reads now come from the shared EventsProvider store (was: static mock array),
// so organizer/admin/runner all see the same live event list.
export function useEvents(): DataResult<Event[]> {
  const { events } = useEventsStore();
  return mockResult(events);
}

export function useEvent(id: string | undefined): DataResult<Event | undefined> {
  const { getEvent } = useEventsStore();
  return mockResult(getEvent(id));
}
