import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL        ?? "";
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY   ?? "";

function calcRecency(lastTouch: string | null): number {
  if (!lastTouch) return 5;
  const days = Math.floor((Date.now() - new Date(lastTouch).getTime()) / 86_400_000);
  return Math.round(100 * Math.exp(-0.023 * days));
}

function newSignalStack(c: {
  last_touch:      string | null;
  social_proof:    number | null;
  intent:          number | null;
  authority_match: number | null;
}): number {
  const recency   = calcRecency(c.last_touch);
  const social    = Math.min(100, Math.max(0, c.social_proof    ?? 40));
  const intent    = Math.min(100, Math.max(0, c.intent          ?? 30));
  const authority = Math.min(100, Math.max(0, c.authority_match ?? 50));
  const raw = recency * 0.35 + social * 0.30 + intent * 0.20 + authority * 0.15;
  return Math.min(100, Math.max(1, Math.round(raw)));
}

export async function POST() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const db = createClient(SUPABASE_URL, SUPABASE_KEY);

  const { data: contacts, error } = await db
    .from("contacts")
    .select("id, last_touch, intent, social_proof, authority_match");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let updated = 0;
  let errors  = 0;

  const BATCH = 50;
  for (let i = 0; i < (contacts ?? []).length; i += BATCH) {
    const batch = (contacts ?? []).slice(i, i + BATCH);
    for (const c of batch) {
      const newScore = newSignalStack(c);
      const { error: ue } = await db
        .from("contacts")
        .update({ signal_stack: newScore })
        .eq("id", c.id);
      if (ue) errors++;
      else updated++;
    }
  }

  return NextResponse.json({ updated, errors, total: (contacts ?? []).length });
}
