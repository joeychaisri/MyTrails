export interface RefundPeriod {
  from: Date;
  to: Date;
  rate: number;
  processingFee: number;
  label: string;
}

export interface RefundCalculation {
  paymentFee: number;
  processingFee: number;
  refundRate: number;
  refundAmount: number;
  period: RefundPeriod | null;
  canRefund: boolean;
  nextDeadline: Date | null;
  nextRate: number | null;
}

export const REFUND_POLICY: RefundPeriod[] = [
  {
    from: new Date(2026, 3, 3),   // Apr 3
    to:   new Date(2026, 3, 12),  // Apr 12
    rate: 1.0,
    processingFee: 250,
    label: "3–12 เม.ย. 2026",
  },
  {
    from: new Date(2026, 3, 13),  // Apr 13
    to:   new Date(2026, 6, 31),  // Jul 31
    rate: 0.7,
    processingFee: 0,
    label: "13 เม.ย.–31 ก.ค. 2026",
  },
  {
    from: new Date(2026, 7, 1),   // Aug 1
    to:   new Date(2026, 8, 30),  // Sep 30
    rate: 0.5,
    processingFee: 0,
    label: "1 ส.ค.–30 ก.ย. 2026",
  },
];

export function getRefundPeriod(requestDate: Date): RefundPeriod | null {
  const d = new Date(requestDate.getFullYear(), requestDate.getMonth(), requestDate.getDate());
  return REFUND_POLICY.find((p) => d >= p.from && d <= p.to) ?? null;
}

export function calculateRefund(amount: number, requestDate: Date): RefundCalculation {
  const paymentFee = Math.round(amount * 0.05);
  const base = amount - paymentFee;
  const period = getRefundPeriod(requestDate);

  if (!period) {
    const nextDeadlineInfo = getNextDeadline(requestDate);
    return {
      paymentFee,
      processingFee: 0,
      refundRate: 0,
      refundAmount: 0,
      period: null,
      canRefund: false,
      nextDeadline: nextDeadlineInfo?.date ?? null,
      nextRate: nextDeadlineInfo?.rate ?? null,
    };
  }

  const processingFee = period.processingFee;
  const refundAmount = Math.max(0, Math.round((base - processingFee) * period.rate));
  const nextDeadlineInfo = getNextDeadline(requestDate);

  return {
    paymentFee,
    processingFee,
    refundRate: period.rate,
    refundAmount,
    period,
    canRefund: true,
    nextDeadline: nextDeadlineInfo?.date ?? null,
    nextRate: nextDeadlineInfo?.rate ?? null,
  };
}

function getNextDeadline(requestDate: Date): { date: Date; rate: number } | null {
  const d = new Date(requestDate.getFullYear(), requestDate.getMonth(), requestDate.getDate());
  for (let i = 0; i < REFUND_POLICY.length - 1; i++) {
    if (d >= REFUND_POLICY[i].from && d <= REFUND_POLICY[i].to) {
      const nextPeriod = REFUND_POLICY[i + 1];
      return { date: nextPeriod.from, rate: nextPeriod.rate };
    }
  }
  return null;
}
