import { NextResponse } from "next/server";
import { airtableEnabled, fetchProspect, updateContactNextMove } from "@/lib/airtable";
import { getProspect } from "@/lib/data";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    if (airtableEnabled) {
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
    if (airtableEnabled && body.nextMove) {
      await updateContactNextMove(params.id, body.nextMove);
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ ok: true, note: "seed mode — no write" });
  } catch (err) {
    console.error("[contact patch]", err);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
