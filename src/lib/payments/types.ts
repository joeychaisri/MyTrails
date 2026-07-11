export interface CardInput {
  number: string;
  exp: string;
  cvc: string;
  name: string;
}

export type PaymentOutcome =
  | { status: "succeeded" }
  | { status: "failed"; message: string };

export interface PaymentProvider {
  id: "card" | "promptpay";
  confirmCard?(input: CardInput): Promise<PaymentOutcome>;
}
