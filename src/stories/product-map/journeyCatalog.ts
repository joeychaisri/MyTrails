export type ProductRole = "runner" | "organizer" | "admin";
export type UxStatus = "locked" | "tentative" | "draft" | "unclassified";
export type BuildStatus = "done" | "partial" | "planned";
export type VerificationStatus = "verified" | "needs-retest" | "untested";

export interface JourneyScreen {
  name: string;
  purpose: string;
  route?: string;
  storyId: string;
  buildStatus: BuildStatus;
}

export interface ProductJourney {
  id: number;
  role: ProductRole;
  name: string;
  goal: string;
  entry: string;
  outcome: string;
  uxStatus: UxStatus;
  verification: VerificationStatus;
  verifiedDate?: string;
  updatedDate: string;
  note: string;
  screens: JourneyScreen[];
}

const screen = (
  name: string,
  purpose: string,
  storyId: string,
  route?: string,
  buildStatus: BuildStatus = "done",
): JourneyScreen => ({ name, purpose, storyId, route, buildStatus });

/**
 * Product-map source of truth.
 *
 * UX and verification statuses are copied from BuildStatus.mdx. Do not promote a
 * status here without Joey's sign-off. Build status means a pinned Storybook
 * state exists; it does not mean the UX is final.
 */
export const journeys: ProductJourney[] = [
  {
    id: 1,
    role: "runner",
    name: "Discover Events",
    goal: "Find a trail event by view or region.",
    entry: "Public platform home",
    outcome: "Runner chooses an event to explore",
    uxStatus: "draft",
    verification: "untested",
    updatedDate: "14 Jul 2026",
    note: "Runner experience is waiting for a full redesign after Admin work.",
    screens: [
      screen("Event grid", "Browse the default event grid", "runner-1-·-discover-events--default", "/"),
      screen("Event list", "Compare events in a compact list", "runner-1-·-discover-events--list-view", "/"),
      screen("Calendar", "Browse events by date", "runner-1-·-discover-events--calendar-view", "/"),
      screen("North filter", "See a populated region-filter state", "runner-1-·-discover-events--filtered-north", "/"),
    ],
  },
  {
    id: 2,
    role: "runner",
    name: "Explore an Event",
    goal: "Understand an event and choose a race category.",
    entry: "Event selected from discovery",
    outcome: "Runner continues to registration",
    uxStatus: "draft",
    verification: "untested",
    updatedDate: "14 Jul 2026",
    note: "Both the bespoke event microsite and the generic template are documented.",
    screens: [
      screen(
        "PYT event landing",
        "Explore the bespoke Pong Yaeng Trail microsite",
        "runner-2-·-explore-an-event--pyt-landing",
        "/events/pong-yaeng-trail-2026",
      ),
      screen(
        "Generic event preview",
        "Preview an event created by an organizer",
        "runner-2-·-explore-an-event--generic-event-preview",
        "/events/1/preview",
      ),
    ],
  },
  {
    id: 3,
    role: "runner",
    name: "Register & Pay",
    goal: "Register as a guest and receive a confirmation code.",
    entry: "Live event with an open ticket window",
    outcome: "Order and participant data reach the organizer",
    uxStatus: "draft",
    verification: "untested",
    updatedDate: "14 Jul 2026",
    note: "Card and PromptPay are simulated; the registration record is real on the deployed Supabase demo.",
    screens: [
      screen("Runner form", "Enter runner, emergency and PDPA details", "runner-3-·-register-pay--runner-form", "/events/1/register"),
      screen("Payment methods", "Choose card or PromptPay", "runner-3-·-register-pay--payment-methods", "/events/1/register"),
      screen("Confirmation", "Receive the MT-XXXXXX registration code", "runner-3-·-register-pay--confirmation", "/events/1/register"),
      screen("PDPA notice", "Read the bilingual consent notice", "runner-3-·-register-pay--pdpa-notice", "/pdpa"),
      screen("Registration lookup", "Look up a guest registration by email and code", "runner-3-·-register-pay--lookup", "/registration/lookup"),
    ],
  },
  {
    id: 4,
    role: "organizer",
    name: "Get Started",
    goal: "Enter the organizer portal and understand the portfolio.",
    entry: "Organizer login",
    outcome: "Organizer can create or manage an event",
    uxStatus: "locked",
    verification: "verified",
    verifiedDate: "15 Jul 2026",
    updatedDate: "15 Jul 2026",
    note: "Login, dashboard and profile persistence were verified against Supabase.",
    screens: [
      screen("Login", "Authenticate as an organizer", "organizer-4-·-get-started--login-default", "/organizer/login"),
      screen("Login loading", "See the submitting state", "organizer-4-·-get-started--login-loading", "/organizer/login"),
      screen("Dashboard", "Review the event portfolio and next actions", "organizer-4-·-get-started--dashboard-first-look", "/organizer/dashboard"),
      screen("Profile", "Review and edit organizer profile data", "organizer-4-·-get-started--profile-modal", "/organizer/dashboard"),
      screen("Security", "Choose an account-security action", "organizer-4-·-get-started--security-menu", "/organizer/dashboard"),
      screen("Change email", "Update the account email", "organizer-4-·-get-started--change-email", "/organizer/dashboard"),
      screen("Change password", "Update the account password", "organizer-4-·-get-started--change-password", "/organizer/dashboard"),
    ],
  },
  {
    id: 5,
    role: "organizer",
    name: "Create & Submit Event",
    goal: "Create an event and submit it for platform review.",
    entry: "Dashboard create-event action or saved draft",
    outcome: "Event enters pending review",
    uxStatus: "tentative",
    verification: "verified",
    verifiedDate: "15 Jul 2026",
    updatedDate: "27 Aug 2026",
    note: "Platform-fee wording changed after the last UX verification and needs a fresh sign-off.",
    screens: [
      screen("Step 1 · Event info", "Set identity, venue and dates", "organizer-5-·-create-submit-event--step-1-event-info", "/organizer/events/new"),
      screen("Step 2 · Race config", "Configure categories and capacity", "organizer-5-·-create-submit-event--step-2-race-config", "/organizer/events/new"),
      screen("Step 3 · Tickets", "Configure ticket types and sale windows", "organizer-5-·-create-submit-event--step-3-tickets", "/organizer/events/new"),
      screen("Step 4 · Publish ASAP", "Choose immediate publication after approval", "organizer-5-·-create-submit-event--step-4-publishing-asap", "/organizer/events/new"),
      screen("Step 4 · Schedule", "Choose scheduled publication", "organizer-5-·-create-submit-event--step-4-publishing-scheduled", "/organizer/events/new"),
      screen("Step 5 · Review", "Review event data and platform-fee estimate", "organizer-5-·-create-submit-event--step-5-review", "/organizer/events/new"),
      screen("Drafts", "Resume an event that has not been submitted", "organizer-5-·-create-submit-event--drafts-tab", "/organizer/dashboard"),
    ],
  },
  {
    id: 6,
    role: "organizer",
    name: "Approval Outcomes",
    goal: "Understand and act on the result of platform review.",
    entry: "Submitted event or platform notification",
    outcome: "Event is live, scheduled, or corrected and resubmitted",
    uxStatus: "draft",
    verification: "verified",
    verifiedDate: "15 Jul 2026",
    updatedDate: "15 Jul 2026",
    note: "The flow works end to end but still awaits product sign-off.",
    screens: [
      screen("In review", "Track pending and scheduled events", "organizer-6-·-approval-outcomes--in-review", "/organizer/dashboard"),
      screen("Action needed", "Find rejected events that need changes", "organizer-6-·-approval-outcomes--action-needed", "/organizer/dashboard"),
      screen("Live events", "See approved public events", "organizer-6-·-approval-outcomes--live-tab", "/organizer/dashboard"),
      screen("Rejected event edit", "Read the rejection reason and resubmit", "organizer-6-·-approval-outcomes--rejected-edit", "/organizer/events/5/edit"),
      screen("Notification center", "Review event, registration and payout activity", "organizer-6-·-approval-outcomes--notification-center", "/organizer/dashboard"),
      screen("Email outbox", "Preview system-generated organizer emails", "organizer-6-·-approval-outcomes--email-outbox", "/organizer/outbox"),
    ],
  },
  {
    id: 7,
    role: "organizer",
    name: "Run the Event",
    goal: "Operate a live event and communicate with runners.",
    entry: "Live event selected from the dashboard",
    outcome: "Race operations and runner records stay current",
    uxStatus: "draft",
    verification: "verified",
    verifiedDate: "15 Jul 2026",
    updatedDate: "15 Jul 2026",
    note: "All sections load and work, but the overall experience is not signed off.",
    screens: [
      screen("Race operations", "Review KPIs and event activity", "organizer-7-·-run-the-event--race-operations", "/organizer/events/1/overview3"),
      screen("Participants", "Search, edit and export confirmed runners", "organizer-7-·-run-the-event--participants", "/organizer/events/1/participants"),
      screen("BIB assignment", "Assign and import BIB numbers", "organizer-7-·-run-the-event--bib", "/organizer/events/1/bib"),
      screen("Promotions", "Create and manage discount codes", "organizer-7-·-run-the-event--promotions", "/organizer/events/1/promotions"),
      screen("Broadcast", "Send segmented email or SMS messages", "organizer-7-·-run-the-event--broadcast", "/organizer/events/1/broadcast"),
      screen("Event settings", "Review operational event settings", "organizer-7-·-run-the-event--settings", "/organizer/events/1/settings"),
    ],
  },
  {
    id: 8,
    role: "organizer",
    name: "Get Paid",
    goal: "Reconcile registrations and receive the event payout.",
    entry: "Organizer dashboard or a live event",
    outcome: "Orders are verified and payout reaches the organizer",
    uxStatus: "draft",
    verification: "verified",
    verifiedDate: "15 Jul 2026",
    updatedDate: "15 Jul 2026",
    note: "Payout account persistence works; UX still awaits sign-off.",
    screens: [
      screen("Payout account", "Configure the organizer bank account", "organizer-8-·-get-paid--payout-account", "/organizer/dashboard"),
      screen("Orders / Finance", "Review event revenue, refunds and order activity", "organizer-8-·-get-paid--orders-finance", "/organizer/events/1/orders"),
      screen("Slip queue", "Approve or reject uploaded PromptPay slips", "organizer-8-·-get-paid--slip-queue", "/organizer/events/1/orders"),
    ],
  },
  {
    id: 9,
    role: "admin",
    name: "Moderate Events",
    goal: "Review submitted events and decide whether they may publish.",
    entry: "Admin approval queue",
    outcome: "Event is approved, scheduled, rejected, or unpublished",
    uxStatus: "tentative",
    verification: "needs-retest",
    verifiedDate: "14 Jul 2026",
    updatedDate: "20 Sep 2026",
    note: "Moderation states are pinned; fee overrides, confirmation copy and deep links need Joey's re-check.",
    screens: [
      screen("Approvals queue", "Prioritize submitted events", "admin-9-·-moderate-events--approvals-queue", "/organizer/admin?page=approvals"),
      screen("Scheduled events", "Monitor approved events waiting to publish", "admin-9-·-moderate-events--scheduled-events", "/organizer/admin?page=approvals"),
      screen("Live events", "Monitor published events and emergency takedowns", "admin-9-·-moderate-events--live-events", "/organizer/admin?page=approvals"),
      screen("Force unpublish", "Confirm an emergency event takedown", "admin-9-·-moderate-events--force-unpublish-confirmation", "/organizer/admin?page=approvals"),
      screen("Pending review", "Inspect an event, override fees and approve or reject", "admin-9-·-moderate-events--review-pending", "/organizer/admin/review/2"),
      screen("Request changes", "Record a rejection reason for the organizer", "admin-9-·-moderate-events--reject-confirmation", "/organizer/admin/review/2"),
      screen("Previously rejected", "Review an event with its earlier rejection reason", "admin-9-·-moderate-events--review-previously-rejected", "/organizer/admin/review/5"),
      screen("Event not found", "Recover from a stale or invalid review link", "admin-9-·-moderate-events--event-not-found", "/organizer/admin/review/does-not-exist"),
    ],
  },
  {
    id: 10,
    role: "admin",
    name: "Platform Finance",
    goal: "Release organizer payouts after platform fees.",
    entry: "Admin Financials tab",
    outcome: "Payout moves from held to payable to paid",
    uxStatus: "draft",
    verification: "needs-retest",
    verifiedDate: "15 Jul 2026",
    updatedDate: "20 Sep 2026",
    note: "Queue, confirmation, paid, refund and empty states are pinned; the finance UI still awaits sign-off.",
    screens: [
      screen("Payout queue", "Review held, payable and paid payouts", "admin-10-·-platform-finance--payout-queue", "/organizer/admin?page=financials"),
      screen("Transfer confirmation", "Confirm an irreversible organizer payout", "admin-10-·-platform-finance--transfer-confirmation", "/organizer/admin?page=financials"),
      screen("Paid history", "Audit completed organizer payouts", "admin-10-·-platform-finance--paid-history", "/organizer/admin?page=financials"),
      screen("Refund ledger", "Review events with refunded registration money", "admin-10-·-platform-finance--refund-ledger", "/organizer/admin?page=financials"),
      screen("Empty queue", "Understand the no-payouts-due state", "admin-10-·-platform-finance--empty-queue", "/organizer/admin?page=financials"),
    ],
  },
  {
    id: 11,
    role: "admin",
    name: "Platform Administration",
    goal: "Operate the marketplace and tune platform fees.",
    entry: "Admin portal",
    outcome: "Platform accounts and commercial settings stay current",
    uxStatus: "tentative",
    verification: "needs-retest",
    verifiedDate: "14 Jul 2026",
    updatedDate: "20 Sep 2026",
    note: "Account and settings states are pinned; the post-tier fee model and confirmations need a fresh UX check.",
    screens: [
      screen("Platform overview", "Monitor platform-level activity", "admin-11-·-platform-administration--overview", "/organizer/admin?page=overview"),
      screen("User management", "Review organizer accounts", "admin-11-·-platform-administration--user-management", "/organizer/admin?page=users"),
      screen("Create organizer", "Provision a new organizer account", "admin-11-·-platform-administration--create-organizer", "/organizer/admin?page=users"),
      screen("Temporary password", "Hand off a generated credential securely", "admin-11-·-platform-administration--password-reset-result", "/organizer/admin?page=users"),
      screen("Suspend organizer", "Confirm an organizer access change", "admin-11-·-platform-administration--suspend-confirmation", "/organizer/admin?page=users"),
      screen("Platform settings", "Edit service fee and commission brackets", "admin-11-·-platform-administration--settings", "/organizer/admin?page=settings"),
      screen("Reset demo data", "Confirm replacing browser-side demo changes", "admin-11-·-platform-administration--reset-demo-confirmation", "/organizer/admin?page=settings"),
    ],
  },
];

export const roleMeta: Record<
  ProductRole,
  { label: string; description: string; order: number }
> = {
  runner: {
    label: "Runner",
    description: "Discover, evaluate and register for a race without an account.",
    order: 1,
  },
  organizer: {
    label: "Organizer",
    description: "Create, publish and operate an event, then reconcile and get paid.",
    order: 2,
  },
  admin: {
    label: "Admin",
    description: "Moderate events, release payouts and operate the platform.",
    order: 3,
  },
};

export const uxStatusMeta: Record<UxStatus, { label: string; short: string }> = {
  locked: { label: "Locked", short: "UX confirmed; build against it." },
  tentative: { label: "Tentative", short: "Direction is likely; details may move." },
  draft: { label: "Draft", short: "Do not treat as final; ask Joey first." },
  unclassified: { label: "Unclassified", short: "No UX decision has been recorded." },
};

export const buildStatusMeta: Record<BuildStatus, { label: string; short: string }> = {
  done: { label: "Built", short: "A pinned Storybook state exists." },
  partial: { label: "Partial", short: "Some important states are still missing." },
  planned: { label: "Not started", short: "No buildable screen exists yet." },
};

export const verificationMeta: Record<VerificationStatus, { label: string; short: string }> = {
  verified: { label: "Flow verified", short: "The end-to-end UX flow was exercised." },
  "needs-retest": { label: "Needs retest", short: "The flow changed after its last verification." },
  untested: { label: "Not tested", short: "No end-to-end UX verification is recorded." },
};

export const allScreens = journeys.flatMap((journey) =>
  journey.screens.map((item) => ({ ...item, journey })),
);
