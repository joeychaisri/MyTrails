import { Participant, mockParticipants } from "@/data/mockData";
import { DataResult, mockResult } from "./result";

export function useParticipants(): DataResult<Participant[]> {
  return mockResult(mockParticipants);
}
