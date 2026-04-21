import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { fetchProspects, backendSource } from "@/lib/db";
import { prospects as seedProspects } from "@/lib/data";

export const revalidate = 120;

export async function GET() {
  try {
    if (backendSource !== "seed") {
      const data = await fetchProspects();
      return NextResponse.json({ source: backendSource, data });
    }
    return NextResponse.json({ source: "seed", data: seedProspects });
  } catch (err) {
    console.error("[contacts]", err);
    return NextResponse.json({ source: "seed", data: seedProspects });
  }
}

export async function POST(req: Request) {
  const SUPABASE_URL = process.env.SUPABASE_URL      ?? "";
  const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY ?? "";

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const body = await req.json() as {
    name:       string;
    title?:     string;
    company?:   string;
    email?:     string;
    phone?:     string;
    industry?:  string;
    headcount?: number;
    next_move?: string;
  };

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const db = createClient(SUPABASE_URL, SUPABASE_KEY);

  // Build insert with only user-provided fields + known-safe defaults
  // Score columns are populated by the signal sweep after creation
  const insert: Record<string, unknown> = {
    name:     body.name.trim(),
    title:    body.title?.trim()    || null,
    company:  body.company?.trim()  || null,
    email:    body.email?.trim()    || null,
    phone:    body.phone?.trim()    || null,
    industry: body.industry?.trim() || null,
    next_move: body.next_move?.trim() || null,
  };
  if (body.headcount) insert.headcount = body.headcount;

  // Default scores — supabase columns may vary; only set what's safe
  const scoreDefaults: Record<string, number> = {
    signal_stack: 50, intent: 50, timing_window: 50,
    budget_indicator: 50, authority_match: 50, social_proof: 50,
  };
  Object.assign(insert, scoreDefaults);

  const { data, error } = await db
    .from("contacts")
    .insert(insert)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ contact: data }, { status: 201 });
}
