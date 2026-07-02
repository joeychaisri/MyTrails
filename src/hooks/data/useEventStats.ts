import {
  mockCategoryFillRate,
  mockRecentActivity,
  revenueData,
  revenueWeeklyData,
  revenueMonthlyData,
  ticketSalesData,
  shirtSizeBreakdown,
  finisherShirtSizeBreakdown,
} from "@/data/mockData";
import { DataResult, mockResult } from "./result";

export function useEventStats(): DataResult<{
  categoryFillRate: typeof mockCategoryFillRate;
  recentActivity: typeof mockRecentActivity;
  revenue: typeof revenueData;
  revenueWeekly: typeof revenueWeeklyData;
  revenueMonthly: typeof revenueMonthlyData;
  ticketSales: typeof ticketSalesData;
  shirtSizes: typeof shirtSizeBreakdown;
  finisherShirtSizes: typeof finisherShirtSizeBreakdown;
}> {
  return mockResult({
    categoryFillRate: mockCategoryFillRate,
    recentActivity: mockRecentActivity,
    revenue: revenueData,
    revenueWeekly: revenueWeeklyData,
    revenueMonthly: revenueMonthlyData,
    ticketSales: ticketSalesData,
    shirtSizes: shirtSizeBreakdown,
    finisherShirtSizes: finisherShirtSizeBreakdown,
  });
}
