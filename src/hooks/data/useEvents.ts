import { Event, mockEvents } from "@/data/mockData";
import { DataResult, mockResult } from "./result";

export function useEvents(): DataResult<Event[]> {
  return mockResult(mockEvents);
}

export function useEvent(id: string | undefined): DataResult<Event | undefined> {
  return mockResult(id ? mockEvents.find((e) => e.id === id) : undefined);
}
