/**
 * Supabase cloud sync layer — Signal IQ v2
 * Mirrors the lib/airtable.ts interface exactly so API routes need zero changes.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Prospect, Interaction } from "./types";
import { inferState } from "./nss";
import { calcSignalScore, signalBand } from "./scoring";

export { calcSignalScore, signalBand };

const SUPABASE_URL  = process.env.SUPABASE_URL        ?? "";
const SUPABASE_KEY  = process.env.SUPABASE_ANON_KEY   ?? "";

export const supabaseEnabled =
  Boolean(SUPABASE_URL && SUPABASE_KEY &&
          process.env.NEXT_PUBLIC_SUPABASE_ENABLED !== "false");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _client: SupabaseClient<any> | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function db(): SupabaseClient<any> {
  if (!_client) _client = createClient(SUPABASE_URL, SUPABASE_KEY);
  return _client;
}

// ─────────────────────────────────────────────
// Map DB row → Prospect shape
// ─────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any, interactions: Interaction[]): Prospect {
  const lastTouch = row.last_touch as string | null;
  const daysSince = lastTouch
    ? Math.floor((Date.now() - new Date(lastTouch).getTime()) / 86_400_000)
    : 999;

  const i90 = interactions.filter(i => {
    return Date.now() - new Date(i.at).getTime() < 90 * 86_400_000;
  }).length;

  const avgDepth = interactions.length
    ? interactions.reduce((s, i) => s + ((i as any).depth ?? 3), 0) / interactions.length
    : 3;

  const intent = Number(row.intent ?? 50);
  const score  = calcSignalScore({
    lastTouchDaysAgo: daysSince,
    interactions90d:  i90,
    avgDepth,
    intent,
  });

  const { state, confidence } = inferState(interactions);

  return {
    id:                   row.id as string,
    name:                 (row.name          ?? "Unknown")  as string,
    title:                (row.title         ?? "")         as string,
    company:              (row.company       ?? "")         as string,
    email:                (row.email         ?? null)       as string | null,
    phone:                (row.phone         ?? null)       as string | null,
    headcount:            Number(row.headcount ?? 0),
    initials:             (row.name ?? "??").split(" ").filter(Boolean).map((w: string) => w[0]).join("").slice(0, 2).toUpperCase(),
    industry:             (row.industry      ?? "")         as string,
    stack:                [],
    signalStack:          Number(row.signal_stack     ?? score),
    intentVelocity:       Number(row.intent_velocity  ?? intent),
    budgetIndicator:      Number(row.budget_indicator ?? 60),
    authorityMatch:       Number(row.authority_match  ?? 70),
    timingWindow:         Number(row.timing_window    ?? 60),
    socialProofAlignment: Number(row.social_proof     ?? 55),
    state,
    stateConfidence: confidence,
    nextMove:        (row.next_move ?? "") as string,
    signals: [
      { label: "Signal Score", value: String(score) },
      { label: "Last touch",   value: `${daysSince}d ago` },
      { label: "Intent",       value: `${intent}/100` },
      { label: "Band",         value: signalBand(score) },
    ],
    interactions,
    lastTouchDaysAgo: daysSince,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapInteraction(row: any): Interaction & { depth: number } {
  return {
    id:           row.id        as string,
    channel:      (row.channel  ?? "email") as "email" | "linkedin" | "call",
    direction:    (row.direction ?? "out")  as "in" | "out",
    at:           (row.date     ?? "")      as string,
    body:         (row.notes    ?? "")      as string,
    latencyHours: row.latency_hours ? Number(row.latency_hours) : undefined,
    depth:        Number(row.depth ?? 3),
  };
}

// ─────────────────────────────────────────────
// Public API  (matches lib/airtable.ts exports)
// ─────────────────────────────────────────────
export async function fetchProspects(): Promise<Prospect[]> {
  const { data: contacts, error: ce } = await db()
    .from("contacts")
    .select("*, email, phone")
    .order("last_touch", { ascending: false });

  if (ce) throw ce;

  const ids = (contacts ?? []).map((c: any) => c.id);
  const { data: ixns, error: ie } = await db()
    .from("interactions")
    .select("*")
    .in("contact_id", ids)
    .order("date", { ascending: false });

  if (ie) throw ie;

  // Group interactions by contact_id
  const iMap: Record<string, Interaction[]> = {};
  for (const row of (ixns ?? [])) {
    const cid = row.contact_id as string;
    if (!iMap[cid]) iMap[cid] = [];
    iMap[cid].push(mapInteraction(row));
  }

  return (contacts ?? []).map((row: any) => mapRow(row, iMap[row.id] ?? []));
}

export async function fetchProspect(id: string): Promise<Prospect | null> {
  const { data: row, error: ce } = await db()
    .from("contacts")
    .select("*")
    .eq("id", id)
    .single();

  if (ce || !row) return null;

  const { data: ixns } = await db()
    .from("interactions")
    .select("*")
    .eq("contact_id", id)
    .order("date", { ascending: false });

  return mapRow(row, (ixns ?? []).map(mapInteraction));
}

export async function logInteraction(payload: {
  contactId: string;
  channel:   string;
  direction: "in" | "out";
  body:      string;
  depth:     number;
  intent:    number;
}): Promise<string> {
  const { data, error } = await db()
    .from("interactions")
    .insert({
      contact_id:    payload.contactId,
      date:          new Date().toISOString().slice(0, 10),
      channel:       payload.channel,
      direction:     payload.direction,
      notes:         payload.body,
      depth:         payload.depth,
      intent:        payload.intent,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id as string;
}

export async function updateContactNextMove(contactId: string, nextMove: string): Promise<void> {
  const { error } = await db()
    .from("contacts")
    .update({ next_move: nextMove })
    .eq("id", contactId);

  if (error) throw error;
}
