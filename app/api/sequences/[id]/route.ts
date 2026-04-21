import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL      ?? "";
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY ?? "";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return NextResponse.json({ error: "No Supabase connection" }, { status: 503 });
  }

  const db = createClient(SUPABASE_URL, SUPABASE_KEY);

  const { error } = await db
    .from("sequence_enrollments")
    .delete()
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
