import { NextResponse } from "next/server";
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
    return NextResponse.json({ ok: true, id, source: backendSource });
  } catch (err) {
    console.error("[interactions]", err);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
