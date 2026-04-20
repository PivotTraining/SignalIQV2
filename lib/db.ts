/**
 * Unified backend selector — Signal IQ v2
 *
 * Priority:
 *   1. Supabase  — if SUPABASE_URL + SUPABASE_ANON_KEY are set
 *   2. Airtable  — if AIRTABLE_API_TOKEN + AIRTABLE_BASE_ID are set
 *   3. Seed data — fallback (no env vars required)
 *
 * API routes import from here, not from lib/airtable or lib/supabase directly.
 */

const useSupabase =
  Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY &&
          process.env.NEXT_PUBLIC_SUPABASE_ENABLED !== "false");

const useAirtable =
  !useSupabase &&
  Boolean(process.env.AIRTABLE_API_TOKEN && process.env.AIRTABLE_BASE_ID &&
          process.env.NEXT_PUBLIC_AIRTABLE_ENABLED !== "false");

// ── Re-export the active backend ──────────────────────────────────────────────
export const backendSource: "supabase" | "airtable" | "seed" =
  useSupabase ? "supabase" : useAirtable ? "airtable" : "seed";

export { calcSignalScore, signalBand } from "./scoring";

export const fetchProspects: () => Promise<import("./types").Prospect[]> =
  useSupabase
    ? require("./supabase").fetchProspects
    : useAirtable
    ? require("./airtable").fetchProspects
    : async () => require("./data").prospects;

export const fetchProspect: (id: string) => Promise<import("./types").Prospect | null> =
  useSupabase
    ? require("./supabase").fetchProspect
    : useAirtable
    ? require("./airtable").fetchProspect
    : async (id: string) => require("./data").getProspect(id) ?? null;

export const logInteraction: (payload: {
  contactId: string; channel: string; direction: "in" | "out";
  body: string; depth: number; intent: number;
}) => Promise<string> =
  useSupabase
    ? require("./supabase").logInteraction
    : useAirtable
    ? require("./airtable").logInteraction
    : async () => "seed_" + Date.now();

export const updateContactNextMove: (contactId: string, nextMove: string) => Promise<void> =
  useSupabase
    ? require("./supabase").updateContactNextMove
    : useAirtable
    ? require("./airtable").updateContactNextMove
    : async () => { /* no-op in seed mode */ };
