import { NextResponse } from "next/server";
import { getProspect } from "@/lib/data";
import { generateMessages } from "@/lib/generate";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });
  const p = getProspect(id);
  if (!p) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({
    state: p.state,
    candidates: generateMessages(p),
  });
}
