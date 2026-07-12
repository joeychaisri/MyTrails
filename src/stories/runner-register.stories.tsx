import type { StoryFn as Story } from "@storybook/react-vite";
import { ReactElement } from "react";
import { Routes, Route } from "react-router-dom";
import RegisterFlow from "@/views/runner/register/RegisterFlow";
import LookupPage from "@/views/runner/register/LookupPage";
import PdpaPage from "@/views/runner/register/PdpaPage";
import { Registration, RunnerInfo } from "@/data/mockData";

// Journey 3 · Runner — Register & Pay
// The Direction-2 registration flow on a live store event (event "1", Doi
// Inthanon): runner form → payment (Stripe-shaped card mock | PromptPay QR +
// slip) → MT-XXXXXX confirmation code, plus the PDPA notice and the public
// lookup page. Steps 2-3 are pinned via RegisterFlow's optional initialStep /
// initialRegistration props (default = live flow); the flow reads :id from the
// URL, so every flow story pins the route with <Routes location>.
export default {
  title: "Runner/3 · Register & Pay",
};

const flowAt = (element: ReactElement) => (
  <Routes location="/events/1/register">
    <Route path="/events/:id/register" element={element} />
  </Routes>
);

// Plausible runner + registration literals against seed event "1",
// category "1b" (50K Trail) ticket "t5" (Regular, ฿1,800).
const storyRunner: RunnerInfo = {
  firstName: "Anong",
  lastName: "Srisuwan",
  firstNameTh: "อนงค์",
  lastNameTh: "ศรีสุวรรณ",
  dob: "1992-04-18",
  gender: "female",
  nationality: "Thai",
  idNumber: "1103700123456",
  phone: "081-234-5678",
  email: "anong.s@example.com",
  emergencyName: "Somchai Srisuwan",
  emergencyPhone: "089-876-5432",
  bloodGroup: "O",
  shirtSize: "M",
  pdpaConsentAt: "2026-07-01T09:00:00.000Z",
};

// Built at render time so the hold countdown always shows ~14 minutes left
// instead of expiring while the story sits open.
const pendingRegistration = (): Registration => ({
  id: "reg-story-pending",
  code: "MT-4K7QZ2",
  eventId: "1",
  categoryId: "1b",
  ticketId: "t5",
  amount: 1800,
  status: "pending_payment",
  createdAt: new Date(Date.now() - 60 * 1000).toISOString(),
  expiresAt: new Date(Date.now() + 14 * 60 * 1000).toISOString(),
  runner: storyRunner,
});

const confirmedRegistration: Registration = {
  id: "reg-story-confirmed",
  code: "MT-4K7QZ2",
  eventId: "1",
  categoryId: "1b",
  ticketId: "t5",
  amount: 1800,
  status: "confirmed",
  createdAt: "2026-07-01T09:05:00.000Z",
  paymentMethod: "card",
  runner: storyRunner,
};

export const RunnerForm: Story = () => flowAt(<RegisterFlow />);
RunnerForm.storyName = "Step 1 - Runner form";

// PaymentStep hardcodes the card tab as the Tabs default (no prop to pin it),
// so both methods share one story — click the PromptPay tab for the QR + slip
// upload variant.
const PaymentHarness = () => flowAt(<RegisterFlow initialStep={2} initialRegistration={pendingRegistration()} />);
export const PaymentMethods: Story = () => <PaymentHarness />;
PaymentMethods.storyName = "Step 2 - Payment (methods)";

export const Confirmation: Story = () =>
  flowAt(<RegisterFlow initialStep={3} initialRegistration={confirmedRegistration} />);
Confirmation.storyName = "Confirmation (code issued)";

export const PdpaNotice: Story = () => <PdpaPage />;
PdpaNotice.storyName = "PDPA consent notice";

export const Lookup: Story = () => <LookupPage />;
Lookup.storyName = "Lookup (empty form)";
