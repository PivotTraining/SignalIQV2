import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { logInteraction, backendSource } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      contactId: string;
      channel:   string;
      direction: "in" | "out";
      body:      string;
      depth:     number;
      intent:    number;
    };

    if (!body.contactId || !body.body) {
      return NextResponse.json({ error: "contactId and body are required" }, { status: 400 });
    }

    const id = await logInteraction(body);

    // ── Immediately recalculate signal_stack for this contact ──────────────
    // This ensures scores update as soon as an interaction is logged,
    // without waiting for the next manual signal sweep.
    if (backendSource === "supabase") {
      const SUPABASE_URL = process.env.SUPABASE_URL      ?? "";
      const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY ?? "";
      if (SUPABASE_URL && SUPABASE_KEY) {
        try {
          const db = createClient(SUPABASE_URL, SUPABASE_KEY);

          const { data: c } = await db
            .from("contacts")
            .select("intent, social_proof, authority_match")
            .eq("id", body.contactId)
            .single();

          if (c) {
            const now       = new Date().toISOString();
            const recency   = 100; // just touched — recency is max
            const social    = Math.min(100, Math.max(0, c.social_proof    ?? 40));
            // Intent: take the higher of the existing value or what was just logged
            const intentVal = Math.min(100, Math.max(body.intent, c.intent ?? 30));
            const authority = Math.min(100, Math.max(0, c.authority_match ?? 50));

            const signal_stack = Math.min(100, Math.max(1, Math.round(
              recency * 0.35 + social * 0.30 + intentVal * 0.20 + authority * 0.15,
            )));

            await db.from("contacts").update({
              signal_stack,
              last_touch: now,
              // Lift intent only if this interaction signals higher engagement
              ...(body.intent > (c.intent ?? 0) ? { intent: body.intent } : {}),
            }).eq("id", body.contactId);
          }
        } catch (e) {
          // Non-fatal — score will update on next signal sweep
          console.warn("[interactions] inline recalc failed:", e);
        }
      }
    }

    return NextResponse.json({ ok: true, id, source: backendSource });
  } catch (err) {
    console.error("[interactions]", err);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
