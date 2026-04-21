import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { fetchProspect, updateContactNextMove, backendSource } from "@/lib/db";
import { getProspect } from "@/lib/data";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    if (backendSource !== "seed") {
      const p = await fetchProspect(params.id);
      if (!p) return NextResponse.json({ error: "not found" }, { status: 404 });
      return NextResponse.json(p);
    }
    const p = getProspect(params.id);
    if (!p) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json(p);
  } catch (err) {
    console.error("[contact detail]", err);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json() as { nextMove?: string };
    if (backendSource !== "seed" && body.nextMove) {
      await updateContactNextMove(params.id, body.nextMove);
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ ok: true, note: "seed mode — no write" });
  } catch (err) {
    console.error("[contact patch]", err);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const SUPABASE_URL = process.env.SUPABASE_URL      ?? "";
  const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY ?? "";

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  try {
    const db = createClient(SUPABASE_URL, SUPABASE_KEY);

    // Remove interactions first to avoid FK constraint errors
    await db.from("interactions").delete().eq("contact_id", params.id);

    const { error } = await db.from("contacts").delete().eq("id", params.id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact delete]", err);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
