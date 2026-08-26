/**
 * One-shot seeder for the mytrails Supabase project.
 * Ports the mock-store seeds (mockData + adminMockData) into Postgres and
 * creates the two demo auth users (admin + org1 organizer).
 *
 * Run:  set -a; source ~/.env.secrets; set +a; npx -y tsx scripts/seed-supabase.ts
 * Idempotent-ish: wipes and re-inserts domain tables (NOT auth users) each run.
 * Cover images stay as local /covers/*.jpg paths — the site serves them statically;
 * the storage bucket is for future organizer uploads.
 */
import { createClient } from "@supabase/supabase-js";
import { mockEvents, Event, mockProfile, mockPaymentInfo } from "../src/data/mockData";
import { mockOtherEvents, mockAdminOrganizers, mockPlatformSettings } from "../src/data/adminMockData";

const url = process.env.MYTRAILS_SUPABASE_URL;
const key = process.env.MYTRAILS_SUPABASE_SERVICE_ROLE;
if (!url || !key) throw new Error("source ~/.env.secrets first (MYTRAILS_SUPABASE_URL / _SERVICE_ROLE)");

const db = createClient(url, key, { auth: { persistSession: false } });

const die = (label: string) => (res: { error: unknown }) => {
  if (res.error) throw new Error(`${label}: ${JSON.stringify(res.error)}`);
  return res;
};

async function ensureUser(email: string, password: string, appMeta: Record<string, unknown>) {
  const { data } = await db.auth.admin.listUsers({ perPage: 200 });
  const existing = data?.users?.find((u) => u.email === email);
  if (existing) return existing.id;
  const created = await db.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: appMeta,
  });
  if (created.error) throw new Error(`createUser ${email}: ${created.error.message}`);
  return created.data.user.id;
}

async function main() {
  // 1. auth users
  const adminId = await ensureUser("admin@mytrails.com", process.env.MYTRAILS_ADMIN_PASSWORD!, { role: "admin" });
  const orgUserId = await ensureUser(
    "somchai@trailevents.co.th",
    process.env.MYTRAILS_DEMO_ORGANIZER_PASSWORD!,
    { role: "organizer" },
  );
  console.log("users ok", { adminId, orgUserId });

  // 2. wipe domain tables (order matters for FKs)
  const intIdTables = new Set(["event_status_history", "platform_settings"]);
  for (const t of ["registrations", "event_status_history", "tickets", "categories", "events", "organizers", "platform_settings"]) {
    const q = db.from(t).delete();
    die(`wipe ${t}`)(await (intIdTables.has(t) ? q.gte("id", 0) : q.neq("id", "")));
  }

  // 3. platform settings (service fee + commission scale live in this one row)
  die("settings")(await db.from("platform_settings").insert({
    id: 1,
    payout_hold_days: mockPlatformSettings.payoutHoldDays,
    service_fee: mockPlatformSettings.serviceFee,
    commission_brackets: mockPlatformSettings.commissionBrackets,
  }));

  // 4. organizers (org1 linked to the demo auth user)
  die("organizers")(await db.from("organizers").insert(
    mockAdminOrganizers.map((o) => ({
      id: o.id,
      user_id: o.id === "org1" ? orgUserId : null,
      email: o.email,
      organization_name: o.organizationName,
      contact_name: o.contactName,
      phone: o.phone,
      status: o.status,
      payout_account: o.payoutAccount ?? null,
      created_at: o.createdAt,
      // Editable account: org1 (the demo login) gets the full mock profile +
      // payout details; others get a profile derived from their own fields so
      // every organizer has a consistent, self-referential account.
      account:
        o.id === "org1"
          ? { profile: mockProfile, paymentInfo: mockPaymentInfo }
          : {
              profile: { name: o.organizationName, email: o.email, phone: o.phone, avatar: "" },
              paymentInfo: { accountName: o.organizationName, bank: "kbank", accountNumber: "" },
            },
    })),
  ));

  // 5. events tree
  const allEvents: Event[] = [...mockEvents, ...mockOtherEvents];
  die("events")(await db.from("events").insert(
    allEvents.map((e) => ({
      id: e.id,
      organizer_id: e.organizerId,
      status: e.status,
      title: e.title,
      date: e.date || null,
      end_date: e.endDate || null,
      province: e.province,
      cover_image: e.coverImage,
      publish_mode: e.publishMode ?? null,
      publish_at: e.publishAt ? new Date(e.publishAt).toISOString() : null,
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
    })),
  ));

  const cats = allEvents.flatMap((e) =>
    e.categories.map((c, i) => {
      const { tickets, ...data } = c;
      return { id: c.id, event_id: e.id, position: i, data };
    }),
  );
  die("categories")(await db.from("categories").insert(cats));

  const tix = allEvents.flatMap((e) =>
    e.categories.flatMap((c) =>
      c.tickets.map((t) => ({
        id: t.id,
        category_id: c.id,
        event_id: e.id,
        name: t.name,
        price: t.price,
        quantity: t.quantity,
        sold: t.sold,
        sales_start: t.salesStart ? new Date(t.salesStart).toISOString() : null,
        sales_end: t.salesEnd ? new Date(t.salesEnd).toISOString() : null,
      })),
    ),
  );
  die("tickets")(await db.from("tickets").insert(tix));

  const counts = await Promise.all(
    ["organizers", "events", "categories", "tickets"].map(async (t) => {
      const { count } = await db.from(t).select("*", { count: "exact", head: true });
      return `${t}=${count}`;
    }),
  );
  console.log("seeded:", counts.join(" "));
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
