import type { SupabaseClient } from "@supabase/supabase-js";
import { Category, Event, Registration, RunnerInfo, Ticket } from "@/data/mockData";
import { AdminOrganizer, CommissionBracket, PlatformSettings, mockPlatformSettings } from "@/data/adminMockData";

// ---------------------------------------------------------------------------
// Row ↔ client-type mapping for supabase mode. The authoritative mapping is
// scripts/seed-supabase.ts: events table columns + `extra` jsonb (titleTh,
// description, descriptionTh, latitude, longitude, socialLinks, organizerName);
// categories = {id, event_id, position, data} where data = Category minus
// tickets; tickets carry sales_start/sales_end timestamptz ↔ the client's
// datetime-local strings. Kept in its own module so EventsContext stays
// readable — the context only calls fetchAll + the push/delete helpers.
// ---------------------------------------------------------------------------

// --- row shapes (loose: PostgREST may deliver numerics as number or string) ---

type Numeric = number | string;

interface EventRow {
  id: string;
  organizer_id: string;
  status: Event["status"];
  title: string;
  date: string | null;
  end_date: string | null;
  province: string;
  cover_image: string;
  publish_mode: Event["publishMode"] | null;
  publish_at: string | null;
  rejection_reason: string | null;
  commission_override: Numeric | null;
  service_fee_override: Numeric | null;
  sold: number;
  capacity: number;
  revenue: Numeric;
  gross_sales: Numeric | null;
  refunded_amount: Numeric | null;
  payout_status: Event["payoutStatus"] | null;
  payout_date: string | null;
  submitted_date: string | null;
  extra: Partial<EventExtra> | null;
}

interface EventExtra {
  titleTh: string;
  description: string;
  descriptionTh: string;
  latitude: string;
  longitude: string;
  socialLinks: Event["socialLinks"];
  organizerName: string;
}

interface CategoryRow {
  id: string;
  event_id: string;
  position: number;
  data: Omit<Category, "tickets">;
}

interface TicketRow {
  id: string;
  category_id: string;
  event_id: string;
  name: string;
  price: Numeric;
  quantity: number;
  sold: number;
  sales_start: string | null;
  sales_end: string | null;
}

interface OrganizerRow {
  id: string;
  email: string;
  organization_name: string;
  contact_name: string;
  phone: string;
  status: AdminOrganizer["status"];
  payout_account: string | null;
  created_at: string;
  account: AdminOrganizer["account"] | null;
}

export interface RegistrationRow {
  id: string;
  code: string;
  event_id: string;
  category_id: string;
  ticket_id: string;
  amount: Numeric;
  status: Registration["status"];
  payment_method: Registration["paymentMethod"] | null;
  slip_path: string | null;
  runner: RunnerInfo;
  created_at: string;
  expires_at: string | null;
}

// --- small conversion helpers ---

const pad = (n: number) => String(n).padStart(2, "0");

// timestamptz ISO → the "YYYY-MM-DDTHH:mm" datetime-local string the wizard's
// inputs and ticketWindowState/publish logic already work with (local time).
const isoToLocalInput = (iso: string | null | undefined): string | undefined => {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return undefined;
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const localInputToIso = (v: string | undefined): string | null => {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

const num = (v: Numeric): number => Number(v);
const optNum = (v: Numeric | null): number | undefined => (v === null || v === undefined ? undefined : Number(v));

// Throw on PostgREST errors so fire-and-forget writes surface in the console.
export const must = <T extends { error: { message: string } | null }>(res: T): T => {
  if (res.error) throw new Error(res.error.message);
  return res;
};

// --- row → client ---

const ticketRowToTicket = (t: TicketRow): Ticket => ({
  id: t.id,
  name: t.name,
  price: num(t.price),
  quantity: t.quantity,
  sold: t.sold,
  salesStart: isoToLocalInput(t.sales_start),
  salesEnd: isoToLocalInput(t.sales_end),
});

export function eventRowToEvent(row: EventRow, catRows: CategoryRow[], ticketRows: TicketRow[]): Event {
  const extra = row.extra ?? {};
  const categories: Category[] = catRows
    .filter((c) => c.event_id === row.id)
    .sort((a, b) => a.position - b.position)
    .map((c) => ({
      ...c.data,
      id: c.id,
      tickets: ticketRows.filter((t) => t.category_id === c.id).map(ticketRowToTicket),
    }));
  return {
    id: row.id,
    organizerId: row.organizer_id,
    organizerName: extra.organizerName ?? "",
    status: row.status,
    title: row.title,
    titleTh: extra.titleTh ?? "",
    coverImage: row.cover_image,
    date: row.date ?? "",
    endDate: row.end_date ?? "",
    province: row.province,
    publishMode: row.publish_mode ?? undefined,
    publishAt: isoToLocalInput(row.publish_at),
    rejectionReason: row.rejection_reason ?? undefined,
    eventCommissionOverride: optNum(row.commission_override),
    serviceFeeOverride: optNum(row.service_fee_override),
    sold: row.sold,
    capacity: row.capacity,
    revenue: num(row.revenue),
    grossSales: optNum(row.gross_sales),
    refundedAmount: optNum(row.refunded_amount),
    payoutStatus: row.payout_status ?? undefined,
    payoutDate: row.payout_date ?? undefined,
    submittedDate: row.submitted_date ?? undefined,
    categories,
    description: extra.description ?? "",
    descriptionTh: extra.descriptionTh ?? "",
    latitude: extra.latitude ?? "",
    longitude: extra.longitude ?? "",
    socialLinks: extra.socialLinks ?? {},
  };
}

export const registrationRowToRegistration = (row: RegistrationRow): Registration => ({
  id: row.id,
  code: row.code,
  eventId: row.event_id,
  categoryId: row.category_id,
  ticketId: row.ticket_id,
  amount: num(row.amount),
  status: row.status,
  createdAt: row.created_at,
  expiresAt: row.expires_at ?? undefined,
  paymentMethod: row.payment_method ?? undefined,
  // slip_path stores the slip dataURL directly (text column; fine for demo).
  slipDataUrl: row.slip_path ?? undefined,
  runner: row.runner,
});

const organizerRowToAdminOrganizer = (o: OrganizerRow, eventsCount: number): AdminOrganizer => ({
  id: o.id,
  organizationName: o.organization_name,
  contactName: o.contact_name,
  email: o.email,
  phone: o.phone,
  status: o.status,
  createdAt: (o.created_at ?? "").slice(0, 10),
  eventsCount,
  payoutAccount: o.payout_account ?? undefined,
  account: o.account ?? undefined,
});

// --- client → row ---

export function eventToRow(e: Event) {
  return {
    id: e.id,
    organizer_id: e.organizerId,
    status: e.status,
    title: e.title,
    date: e.date || null,
    end_date: e.endDate || null,
    province: e.province,
    cover_image: e.coverImage,
    publish_mode: e.publishMode ?? null,
    publish_at: localInputToIso(e.publishAt),
    rejection_reason: e.rejectionReason ?? null,
    commission_override: e.eventCommissionOverride ?? null,
    service_fee_override: e.serviceFeeOverride ?? null,
    sold: e.sold,
    capacity: e.capacity,
    revenue: e.revenue,
    gross_sales: e.grossSales ?? null,
    refunded_amount: e.refundedAmount ?? null,
    payout_status: e.payoutStatus ?? null,
    payout_date: e.payoutDate || null,
    submitted_date: e.submittedDate || null,
    extra: {
      titleTh: e.titleTh,
      description: e.description,
      descriptionTh: e.descriptionTh,
      latitude: e.latitude,
      longitude: e.longitude,
      socialLinks: e.socialLinks,
      organizerName: e.organizerName,
    },
  };
}

function eventChildRows(e: Event) {
  const categories = e.categories.map((c, i) => {
    const { tickets: _tickets, ...data } = c;
    return { id: c.id, event_id: e.id, position: i, data };
  });
  const tickets = e.categories.flatMap((c) =>
    c.tickets.map((t) => ({
      id: t.id,
      category_id: c.id,
      event_id: e.id,
      name: t.name,
      price: t.price,
      quantity: t.quantity,
      sold: t.sold,
      sales_start: localInputToIso(t.salesStart),
      sales_end: localInputToIso(t.salesEnd),
    }))
  );
  return { categories, tickets };
}

const organizerToRow = (o: AdminOrganizer) => ({
  id: o.id,
  email: o.email,
  organization_name: o.organizationName,
  contact_name: o.contactName,
  phone: o.phone,
  status: o.status,
  payout_account: o.payoutAccount ?? null,
  created_at: o.createdAt,
  account: o.account ?? {},
});

// Quoted PostgREST "in" list, e.g. ("id1","id2").
const inList = (ids: string[]) => `(${ids.map((id) => `"${id}"`).join(",")})`;

// --- writes (all throw on error; callers are fire-and-forget + refetch) ---

// Upsert an event row plus its whole categories/tickets tree (wizard edits
// replace the tree). Children dropped by an edit are removed best-effort —
// a ticket that already has registrations is FK-protected and just stays.
export async function pushEventTree(client: SupabaseClient, e: Event): Promise<void> {
  must(await client.from("events").upsert(eventToRow(e)));
  const { categories, tickets } = eventChildRows(e);
  if (categories.length) must(await client.from("categories").upsert(categories));
  if (tickets.length) must(await client.from("tickets").upsert(tickets));
  if (tickets.length)
    await client.from("tickets").delete().eq("event_id", e.id).not("id", "in", inList(tickets.map((t) => t.id)));
  if (categories.length)
    await client
      .from("categories")
      .delete()
      .eq("event_id", e.id)
      .not("id", "in", inList(categories.map((c) => c.id)));
}

// Children first (FKs are RESTRICT, not CASCADE); child deletes are
// best-effort so an orphan history row can't strand the local delete silently.
export async function deleteEventTree(client: SupabaseClient, id: string): Promise<void> {
  for (const table of ["registrations", "event_status_history", "tickets", "categories"]) {
    await client.from(table).delete().eq("event_id", id);
  }
  must(await client.from("events").delete().eq("id", id));
}

export async function upsertOrganizer(client: SupabaseClient, o: AdminOrganizer): Promise<void> {
  must(await client.from("organizers").upsert(organizerToRow(o)));
}

// An organizer editing their OWN account can only UPDATE (RLS grants inserts to
// admins only) — upsert would trip the insert policy. Update just the account.
export async function updateOrganizerAccount(
  client: SupabaseClient,
  id: string,
  account: AdminOrganizer["account"]
): Promise<void> {
  must(await client.from("organizers").update({ account: account ?? {} }).eq("id", id));
}

export async function pushSettings(client: SupabaseClient, s: PlatformSettings): Promise<void> {
  must(
    await client.from("platform_settings").upsert({
      id: 1,
      payout_hold_days: s.payoutHoldDays,
      service_fee: s.serviceFee,
      commission_brackets: s.commissionBrackets,
    })
  );
}

// --- reads ---

export interface RemoteStore {
  events: Event[];
  organizers: AdminOrganizer[];
  settings: PlatformSettings;
  registrations: Registration[];
}

export interface FetchAllScope {
  isAdmin: boolean;
  organizerId: string | null;
}

// One shot of the whole store, shaped exactly like EventsContext state.
// RLS does the real scoping: anon only receives live events (+ their
// categories/tickets), no organizers and no registrations — the runner-facing
// pages still work off that. Settings/tiers fall back to the mock seed values
// if the selects are denied or empty.
export async function fetchAll(client: SupabaseClient, scope: FetchAllScope): Promise<RemoteStore> {
  // Force the client to finish restoring its persisted session BEFORE issuing any
  // query. supabase-js attaches the auth token from its in-memory session; right
  // after a page reload that session is still being read from localStorage, so
  // queries can otherwise fire as `anon` and RLS-guarded tables (organizers,
  // registrations) come back empty. Awaiting getSession() closes that window.
  await client.auth.getSession();
  // Always query every table and let RLS decide what comes back: anonymous
  // visitors get [] for organizers/registrations (no policy grants them), while
  // organizers/admins get their rows. Gating these on the JS `role` instead used
  // to race page load — the query got skipped before the auth state settled, so
  // admins saw an empty User Management / "organizer not found" on reload.
  const [evRes, catRes, tixRes, setRes, orgRes, regRes] = await Promise.all([
    client.from("events").select("*").order("created_at", { ascending: false }),
    client.from("categories").select("*"),
    client.from("tickets").select("*"),
    client.from("platform_settings").select("*").eq("id", 1).maybeSingle(),
    client.from("organizers").select("*"),
    client.from("registrations").select("*").order("created_at", { ascending: false }),
  ]);

  const eventRows = (evRes.data ?? []) as EventRow[];
  const catRows = (catRes.data ?? []) as CategoryRow[];
  const tixRows = (tixRes.data ?? []) as TicketRow[];
  const events = eventRows.map((row) => eventRowToEvent(row, catRows, tixRows));

  const orgRows = (orgRes.data ?? []) as OrganizerRow[];
  const organizers = orgRows.map((o) =>
    organizerRowToAdminOrganizer(o, events.filter((e) => e.organizerId === o.id).length)
  );

  const settingsRow = setRes.data as {
    payout_hold_days: number;
    service_fee: Numeric | null;
    commission_brackets: CommissionBracket[] | null;
  } | null;
  const brackets = settingsRow?.commission_brackets;
  const settings: PlatformSettings = {
    serviceFee: settingsRow?.service_fee != null ? num(settingsRow.service_fee) : mockPlatformSettings.serviceFee,
    commissionBrackets: brackets?.length ? brackets : mockPlatformSettings.commissionBrackets,
    payoutHoldDays: settingsRow?.payout_hold_days ?? mockPlatformSettings.payoutHoldDays,
  };

  const registrations = ((regRes.data ?? []) as RegistrationRow[]).map(registrationRowToRegistration);

  return { events, organizers, settings, registrations };
}

// Guest lookup goes through the security-definer RPC (anon can't select
// registrations); returns the event title too since anon may not see the event.
export async function rpcLookupRegistration(
  client: SupabaseClient,
  email: string,
  code: string
): Promise<{ registration: Registration; eventTitle: string } | null> {
  const { data, error } = await client.rpc("lookup_registration", { p_email: email, p_code: code });
  if (error || !data) return null;
  const payload = data as { registration: RegistrationRow; event_title: string };
  return { registration: registrationRowToRegistration(payload.registration), eventTitle: payload.event_title };
}
