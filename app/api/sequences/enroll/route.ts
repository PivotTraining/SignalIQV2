import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { SEQUENCE_MAP } from "@/lib/sequences";

const SUPABASE_URL = process.env.SUPABASE_URL      ?? "";
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY ?? "";

export async function POST(req: Request) {
  const { contactId, sequenceId } = await req.json() as {
    contactId: string;
    sequenceId: string;
  };

  if (!contactId || !sequenceId) {
    return NextResponse.json({ error: "contactId and sequenceId required" }, { status: 400 });
  }

  const seq = SEQUENCE_MAP[sequenceId];
  if (!seq) {
    return NextResponse.json({ error: "Unknown sequence" }, { status: 400 });
  }

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return NextResponse.json({ error: "No Supabase connection" }, { status: 503 });
  }

  const db = createClient(SUPABASE_URL, SUPABASE_KEY);

  // Calculate next touch date = today + step[0].day (usually 0, so today)
  const today = new Date();
  const firstStepDay = seq.steps[0]?.day ?? 0;
  const nextTouch = new Date(today.getTime() + firstStepDay * 86_400_000)
    .toISOString().slice(0, 10);

  // Upsert: if already enrolled in this sequence, update status to active
  const { data, error } = await db
    .from("sequence_enrollments")
    .upsert(
      {
        contact_id:      contactId,
        sequence_id:     sequenceId,
        current_step:    0,
        enrolled_at:     today.toISOString().slice(0, 10),
        next_touch_date: nextTouch,
        status:          "active",
      },
      { onConflict: "contact_id,sequence_id" }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ enrollment: data });
}
