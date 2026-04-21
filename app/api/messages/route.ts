import { NextResponse } from "next/server";
import { fetchProspect, backendSource } from "@/lib/db";
import { getProspect } from "@/lib/data";
import { generateMessages } from "@/lib/generate";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "missing id", candidates: [] }, { status: 400 });

  try {
    // Use Supabase / Airtable when a live backend is configured
    const p = backendSource !== "seed"
      ? await fetchProspect(id)
      : getProspect(id) ?? null;

    if (!p) return NextResponse.json({ error: "not found", candidates: [] }, { status: 404 });

    return NextResponse.json({
      state:      p.state,
      candidates: generateMessages(p),
    });
  } catch (err) {
    console.error("[messages]", err);
    return NextResponse.json({ error: "server error", candidates: [] }, { status: 500 });
  }
}
