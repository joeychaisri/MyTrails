import { Order, mockOrders } from "@/data/mockData";
import { DataResult, mockResult } from "./result";

export function useOrders(): DataResult<Order[]> {
  return mockResult(mockOrders);
}
