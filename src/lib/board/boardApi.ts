import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabaseClient";
import type { Ticket, TicketMessage, TicketRole, TicketStatus } from "./boardTypes";

// Board always talks to Supabase directly (the deployed site builds with
// VITE_DATA_SOURCE=supabase), independent of the app-wide mock/supabase flag.
export function getBoardClient(): SupabaseClient {
  return getSupabase();
}

// --- row → client-type mappers (exported for tests) ---

export function rowToTicket(row: any): Ticket {
  const agg = Array.isArray(row.support_ticket_messages) ? row.support_ticket_messages[0] : undefined;
  return {
    id: row.id,
    title: row.title,
    status: row.status,
    screenRefJourney: row.screen_ref_journey ?? null,
    screenRefNote: row.screen_ref_note ?? null,
    createdByName: row.created_by_name,
    createdByRole: row.created_by_role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    replyCount: agg?.count ?? 0,
  };
}

export function rowToMessage(row: any): TicketMessage {
  return {
    id: row.id,
    ticketId: row.ticket_id,
    authorName: row.author_name,
    authorRole: row.author_role,
    body: row.body,
    createdAt: row.created_at,
  };
}

// --- queries ---

export async function fetchTickets(client: SupabaseClient): Promise<Ticket[]> {
  const { data, error } = await client
    .from("support_tickets")
    .select("*, support_ticket_messages(count)")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToTicket);
}

export async function fetchThread(
  client: SupabaseClient,
  ticketId: string
): Promise<{ ticket: Ticket; messages: TicketMessage[] }> {
  const { data: ticketRow, error: tErr } = await client
    .from("support_tickets")
    .select("*")
    .eq("id", ticketId)
    .single();
  if (tErr) throw tErr;
  const { data: msgRows, error: mErr } = await client
    .from("support_ticket_messages")
    .select("*")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });
  if (mErr) throw mErr;
  return { ticket: rowToTicket(ticketRow), messages: (msgRows ?? []).map(rowToMessage) };
}

export interface CreateTicketInput {
  title: string;
  createdByName: string;
  createdByRole: TicketRole;
  screenRefJourney: string | null;
  screenRefNote: string | null;
  firstMessage: string;
}

export async function createTicket(client: SupabaseClient, input: CreateTicketInput): Promise<string> {
  const { data, error } = await client
    .from("support_tickets")
    .insert({
      title: input.title,
      created_by_name: input.createdByName,
      created_by_role: input.createdByRole,
      screen_ref_journey: input.screenRefJourney,
      screen_ref_note: input.screenRefNote,
    })
    .select("id")
    .single();
  if (error) throw error;
  const ticketId = data.id as string;
  await postMessage(client, {
    ticketId,
    authorName: input.createdByName,
    authorRole: input.createdByRole,
    body: input.firstMessage,
  });
  return ticketId;
}

export interface PostMessageInput {
  ticketId: string;
  authorName: string;
  authorRole: TicketRole;
  body: string;
}

export async function postMessage(client: SupabaseClient, input: PostMessageInput): Promise<void> {
  const { error } = await client.from("support_ticket_messages").insert({
    ticket_id: input.ticketId,
    author_name: input.authorName,
    author_role: input.authorRole,
    body: input.body,
  });
  if (error) throw error;
  const { error: bumpErr } = await client
    .from("support_tickets")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", input.ticketId);
  if (bumpErr) throw bumpErr;
}

export async function updateStatus(
  client: SupabaseClient,
  ticketId: string,
  status: TicketStatus
): Promise<void> {
  const { error } = await client
    .from("support_tickets")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", ticketId);
  if (error) throw error;
}
