import { DiscountCode, mockDiscountCodes } from "@/data/mockData";
import { DataResult, mockResult } from "./result";

export function useDiscountCodes(): DataResult<DiscountCode[]> {
  return mockResult(mockDiscountCodes);
}
