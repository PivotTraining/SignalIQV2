/**
 * Airtable cloud sync layer — Signal IQ v2
 * Schema per Signal-IQ-v2-Cloud-Sync-Plan.docx §5
 */
import Airtable from "airtable";
import type { Prospect, Interaction } from "./types";
import { inferState } from "./nss";
import { calcSignalScore, signalBand } from "./scoring";

export { calcSignalScore, signalBand };

const TOKEN   = process.env.AIRTABLE_API_TOKEN   ?? "";
const BASE_ID = process.env.AIRTABLE_BASE_ID     ?? "";
const C_TABLE = process.env.AIRTABLE_CONTACTS_TABLE     ?? "Contacts";
const I_TABLE = process.env.AIRTABLE_INTERACTIONS_TABLE ?? "Interactions";

export const airtableEnabled =
  Boolean(TOKEN && BASE_ID && process.env.NEXT_PUBLIC_AIRTABLE_ENABLED !== "false");

let _base: ReturnType<typeof Airtable.prototype.base> | null = null;
function base() {
  if (!_base) {
    Airtable.configure({ apiKey: TOKEN });
    _base = new Airtable().base(BASE_ID);
  }
  return _base;
}

// ─────────────────────────────────────────────
// Map Airtable records → Prospect shape
// ─────────────────────────────────────────────
function initials(name: string): string {
  return name.split(" ").filter(Boolean).map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRecord(rec: any, interactions: Interaction[]): Prospect {
  const f = rec.fields;
  const name       = (f["Name"] ?? f["Contact Name"] ?? "Unknown") as string;
  const lastTouch  = f["Last Touch"] as string | undefined;
  const daysSince  = lastTouch
    ? Math.floor((Date.now() - new Date(lastTouch).getTime()) / 86_400_000)
    : 999;

  const i90 = interactions.filter(i => {
    const d = new Date(i.at);
    return Date.now() - d.getTime() < 90 * 86_400_000;
  }).length;

  const avgDepth = interactions.length
    ? interactions.reduce((s, i) => s + (i as any).depth ?? 3, 0) / interactions.length
    : 3;

  const intentRaw = Number(f["Intent"] ?? 50);
  const score     = calcSignalScore({ lastTouchDaysAgo: daysSince, interactions90d: i90, avgDepth, intent: intentRaw });

  // NSS inference from interaction history
  const { state, confidence } = inferState(interactions);

  // R-Score fields — map from Airtable or estimate
  const signalStack         = Number(f["Signal Stack"]        ?? score);
  const intentVelocity      = Number(f["Intent Velocity"]     ?? intentRaw);
  const budgetIndicator     = Number(f["Budget Indicator"]    ?? 60);
  const authorityMatch      = Number(f["Authority Match"]     ?? 70);
  const timingWindow        = Number(f["Timing Window"]       ?? 60);
  const socialProofAlign    = Number(f["Social Proof"]        ?? 55);

  return {
    id:               rec.id,
    name,
    title:            (f["Title"] ?? "") as string,
    company:          (f["Organization"] ?? f["Org"] ?? "") as string,
    email:            (f["Email"] ?? null) as string | null,
    phone:            (f["Phone"] ?? null) as string | null,
    headcount:        Number(f["Headcount"] ?? 0),
    initials:         initials(name),
    industry:         (f["Industry"] ?? "") as string,
    stack:            (f["Stack"] ?? []) as string[],
    signalStack,
    intentVelocity,
    budgetIndicator,
    authorityMatch,
    timingWindow,
    socialProofAlignment: socialProofAlign,
    state,
    stateConfidence: confidence,
    nextMove:        (f["Next Move"] ?? "") as string,
    signals: [
      { label: "Signal Score", value: String(score) },
      { label: "Last touch",   value: `${daysSince}d ago` },
      { label: "Intent",       value: `${intentRaw}/100` },
      { label: "Band",         value: signalBand(score) },
    ],
    interactions,
    lastTouchDaysAgo: daysSince,
  };
}

// ─────────────────────────────────────────────
// Fetch interactions for a list of contact IDs
// ─────────────────────────────────────────────
async function fetchInteractions(contactIds: string[]): Promise<Record<string, Interaction[]>> {
  if (!contactIds.length) return {};
  const map: Record<string, Interaction[]> = {};
  const formula = `OR(${contactIds.map(id => `RECORD_ID()="${id}"`).join(",")})`;
  // Airtable doesn't let us filter by linked field directly — fetch all and filter client-side
  const recs = await base()(I_TABLE).select({ maxRecords: 5000 }).all();
  for (const r of recs) {
    const linked = (r.fields["Contact"] ?? []) as string[];
    for (const cid of linked) {
      if (!map[cid]) map[cid] = [];
      map[cid].push({
        id:            r.id,
        channel:       ((r.fields["Channel"] ?? "email") as string).toLowerCase() as "email" | "linkedin" | "call",
        direction:     (r.fields["Direction"] ?? "out") as "in" | "out",
        at:            (r.fields["Date"] ?? new Date().toISOString().slice(0, 10)) as string,
        body:          (r.fields["Notes"] ?? "") as string,
        latencyHours:  r.fields["Latency Hours"] ? Number(r.fields["Latency Hours"]) : undefined,
      });
    }
  }
  void formula; // Airtable linked-record filter not directly supported without formula field
  return map;
}

// ─────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────
export async function fetchProspects(): Promise<Prospect[]> {
  const recs = await base()(C_TABLE).select({ maxRecords: 500, view: "Grid view" }).all();
  const ids   = recs.map(r => r.id);
  const iMap  = await fetchInteractions(ids);
  return recs.map(r => mapRecord(r, iMap[r.id] ?? []));
}

export async function fetchProspect(id: string): Promise<Prospect | null> {
  try {
    const rec  = await base()(C_TABLE).find(id);
    const iMap = await fetchInteractions([id]);
    return mapRecord(rec, iMap[id] ?? []);
  } catch {
    return null;
  }
}

export async function logInteraction(payload: {
  contactId: string;
  channel:   string;
  direction: "in" | "out";
  body:      string;
  depth:     number;
  intent:    number;
}): Promise<string> {
  const rec = await base()(I_TABLE).create({
    "Contact":   [payload.contactId],
    "Date":      new Date().toISOString().slice(0, 10),
    "Channel":   payload.channel,
    "Direction": payload.direction,
    "Notes":     payload.body,
    "Depth":     payload.depth,
    "Intent":    payload.intent,
  });
  return rec.id;
}

export async function updateContactNextMove(contactId: string, nextMove: string): Promise<void> {
  await base()(C_TABLE).update(contactId, { "Next Move": nextMove });
}
