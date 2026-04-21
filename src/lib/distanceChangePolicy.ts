export const CATEGORY_PRICES: Record<string, number> = {
  "100K Ultra": 3000,
  "50K Trail": 1800,
  "25K Fun Run": 1200,
};

export interface DistanceChangePeriod {
  from: Date;
  to: Date;
  fee: number;
  downgradeRefund: boolean;
  upgradeAllowed: boolean;
}

export interface DistanceChangeResult {
  type: "upgrade" | "downgrade" | "same";
  allowed: boolean;
  fee: number;
  priceDiff: number;
  refundAmount: number;
  netAmount: number;
  documentType: "tax_invoice" | "credit_note" | null;
  periodLabel: string;
  reason?: string;
}

export const DISTANCE_CHANGE_POLICY: DistanceChangePeriod[] = [
  {
    from: new Date(2026, 3, 3),   // Apr 3
    to:   new Date(2026, 3, 12),  // Apr 12
    fee: 0,
    downgradeRefund: true,
    upgradeAllowed: true,
  },
  {
    from: new Date(2026, 3, 13),  // Apr 13
    to:   new Date(2026, 6, 31),  // Jul 31
    fee: 250,
    downgradeRefund: true,
    upgradeAllowed: true,
  },
  {
    from: new Date(2026, 7, 1),   // Aug 1
    to:   new Date(2026, 8, 30),  // Sep 30
    fee: 250,
    downgradeRefund: false,
    upgradeAllowed: true,
  },
  {
    from: new Date(2026, 9, 1),   // Oct 1
    to:   new Date(9999, 0, 1),
    fee: 500,
    downgradeRefund: false,
    upgradeAllowed: false,
  },
];

const PERIOD_LABELS = [
  "3–12 เม.ย. 2026",
  "13 เม.ย.–31 ก.ค. 2026",
  "1 ส.ค.–30 ก.ย. 2026",
  "ตั้งแต่ 1 ต.ค. 2026",
];

function getDistancePeriodIndex(requestDate: Date): number {
  const d = new Date(requestDate.getFullYear(), requestDate.getMonth(), requestDate.getDate());
  return DISTANCE_CHANGE_POLICY.findIndex((p) => d >= p.from && d <= p.to);
}

export function calculateDistanceChange(
  currentCategory: string,
  newCategory: string,
  requestDate: Date
): DistanceChangeResult {
  if (currentCategory === newCategory) {
    return { type: "same", allowed: false, fee: 0, priceDiff: 0, refundAmount: 0, netAmount: 0, documentType: null, periodLabel: "" };
  }

  const periodIndex = getDistancePeriodIndex(requestDate);
  if (periodIndex === -1) {
    return { type: "upgrade", allowed: false, fee: 0, priceDiff: 0, refundAmount: 0, netAmount: 0, documentType: null, periodLabel: "ไม่อยู่ในช่วงที่กำหนด" };
  }

  const period = DISTANCE_CHANGE_POLICY[periodIndex];
  const periodLabel = PERIOD_LABELS[periodIndex];
  const currentPrice = CATEGORY_PRICES[currentCategory] ?? 0;
  const newPrice = CATEGORY_PRICES[newCategory] ?? 0;
  const priceDiff = newPrice - currentPrice;

  if (priceDiff > 0) {
    // Upgrade
    if (!period.upgradeAllowed) {
      return { type: "upgrade", allowed: false, fee: period.fee, priceDiff, refundAmount: 0, netAmount: 0, documentType: null, periodLabel, reason: "ไม่อนุญาตให้ Upgrade ในช่วงเวลานี้" };
    }
    return {
      type: "upgrade",
      allowed: true,
      fee: period.fee,
      priceDiff,
      refundAmount: 0,
      netAmount: priceDiff + period.fee,
      documentType: "tax_invoice",
      periodLabel,
    };
  } else {
    // Downgrade
    const absDiff = Math.abs(priceDiff);
    const refundAmount = period.downgradeRefund ? absDiff : 0;
    const netAmount = Math.max(0, refundAmount - period.fee);
    return {
      type: "downgrade",
      allowed: true,
      fee: period.fee,
      priceDiff: absDiff,
      refundAmount,
      netAmount,
      documentType: "credit_note",
      periodLabel,
    };
  }
}
