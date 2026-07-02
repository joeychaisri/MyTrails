import { PaymentInfo, UserProfile, mockPaymentInfo, mockProfile } from "@/data/mockData";
import { DataResult, mockResult } from "./result";

export function useOrganizerProfile(): DataResult<{ profile: UserProfile; paymentInfo: PaymentInfo }> {
  return mockResult({ profile: mockProfile, paymentInfo: mockPaymentInfo });
}
