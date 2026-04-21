import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { SEQUENCE_MAP } from "@/lib/sequences";

const SUPABASE_URL = process.env.SUPABASE_URL      ?? "";
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY ?? "";

export async function POST(req: Request) {
  const { enrollmentId, action } = await req.json() as {
    enrollmentId: string;
    action: "advance" | "pause" | "resume" | "complete";
  };

  if (!enrollmentId) {
    return NextResponse.json({ error: "enrollmentId required" }, { status: 400 });
  }

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return NextResponse.json({ error: "No Supabase connection" }, { status: 503 });
  }

  const db = createClient(SUPABASE_URL, SUPABASE_KEY);

  // Fetch current enrollment
  const { data: enrollment, error: fetchErr } = await db
    .from("sequence_enrollments")
    .select("*")
    .eq("id", enrollmentId)
    .single();

  if (fetchErr || !enrollment) {
    return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
  }

  const seq = SEQUENCE_MAP[enrollment.sequence_id as string];
  if (!seq) {
    return NextResponse.json({ error: "Unknown sequence" }, { status: 400 });
  }

  let updates: Record<string, unknown> = {};

  if (action === "advance") {
    const nextStep = (enrollment.current_step as number) + 1;
    const isComplete = nextStep >= seq.steps.length;

    if (isComplete) {
      updates = { current_step: nextStep, status: "completed", next_touch_date: null };
    } else {
      // Calculate next touch date from enrolled_at + next step's day offset
      const enrolledAt = new Date(enrollment.enrolled_at as string);
      const dayOffset  = seq.steps[nextStep]?.day ?? 0;
      const nextTouch  = new Date(enrolledAt.getTime() + dayOffset * 86_400_000)
        .toISOString().slice(0, 10);
      updates = { current_step: nextStep, status: "active", next_touch_date: nextTouch };
    }
  } else if (action === "pause") {
    updates = { status: "paused" };
  } else if (action === "resume") {
    // Recalculate next touch from today
    const currentStep = enrollment.current_step as number;
    const today = new Date().toISOString().slice(0, 10);
    updates = { status: "active", next_touch_date: today };
  } else if (action === "complete") {
    updates = { status: "completed", next_touch_date: null };
  }

  const { data, error } = await db
    .from("sequence_enrollments")
    .update(updates)
    .eq("id", enrollmentId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ enrollment: data });
}
