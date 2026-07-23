export type TicketStatus = "asked_ux" | "in_progress" | "waiting_po" | "answered" | "closed";
export type TicketRole = "dev" | "ux" | "po";

export interface Ticket {
  id: string;
  title: string;
  status: TicketStatus;
  screenRefJourney: string | null;
  screenRefNote: string | null;
  createdByName: string;
  createdByRole: TicketRole;
  createdAt: string;
  updatedAt: string;
  replyCount?: number;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  authorName: string;
  authorRole: TicketRole;
  body: string;
  createdAt: string;
}

// Workflow order — drives the filter row and the status dropdown.
export const STATUS_ORDER: TicketStatus[] = [
  "asked_ux",
  "in_progress",
  "waiting_po",
  "answered",
  "closed",
];

export const STATUS_META: Record<TicketStatus, { label: string; className: string }> = {
  asked_ux: { label: "Asked UX", className: "bg-blue-100 text-blue-800 border-blue-200" },
  in_progress: { label: "In progress", className: "bg-amber-100 text-amber-800 border-amber-200" },
  waiting_po: { label: "Waiting on PO", className: "bg-purple-100 text-purple-800 border-purple-200" },
  answered: { label: "Answered", className: "bg-green-100 text-green-800 border-green-200" },
  closed: { label: "Closed", className: "bg-gray-100 text-gray-700 border-gray-200" },
};

export const ROLE_META: Record<TicketRole, { label: string; className: string }> = {
  dev: { label: "Dev", className: "bg-slate-100 text-slate-700 border-slate-200" },
  ux: { label: "UX", className: "bg-pink-100 text-pink-800 border-pink-200" },
  po: { label: "PO", className: "bg-indigo-100 text-indigo-800 border-indigo-200" },
};

// Labels for the optional screen-ref dropdown (the 12-journey hand-off map).
export const JOURNEY_OPTIONS: string[] = [
  "Runner · Discover Events",
  "Runner · Explore an Event",
  "Runner · Register & Pay",
  "Organizer · Get Started",
  "Organizer · Create & Submit Event",
  "Organizer · Approval Outcomes",
  "Organizer · Manage Live Event",
  "Organizer · Get Paid",
  "Organizer · Notifications & Outbox",
  "Admin · Approve Events",
  "Admin · Platform Finance",
  "Admin · Platform Settings",
  "Design System",
];
