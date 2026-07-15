import { PaymentInfo, UserProfile, mockPaymentInfo, mockProfile } from "@/data/mockData";
import { dataSource } from "@/lib/dataSource";
import { useAuth } from "@/contexts/AuthContext";
import { useEventsStore } from "@/contexts/EventsContext";
import { DataResult, mockResult } from "./result";

export function useOrganizerProfile(): DataResult<{ profile: UserProfile; paymentInfo: PaymentInfo }> {
  // Hooks must run unconditionally; these values are only used in supabase mode.
  const { organizerId } = useAuth();
  const { organizers } = useEventsStore();

  if (dataSource !== "supabase") {
    return mockResult({ profile: mockProfile, paymentInfo: mockPaymentInfo });
  }

  // Read the logged-in organizer's own account from the store (persisted to the
  // organizers table). Falls back to mock defaults before hydration / for
  // organizers seeded without an account.
  const account = organizers.find((o) => o.id === (organizerId ?? "org1"))?.account;
  return mockResult({
    profile: account?.profile ?? mockProfile,
    paymentInfo: account?.paymentInfo ?? mockPaymentInfo,
  });
}
