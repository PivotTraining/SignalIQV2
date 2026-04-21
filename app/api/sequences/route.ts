import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { SEQUENCES } from "@/lib/sequences";

const SUPABASE_URL = process.env.SUPABASE_URL      ?? "";
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY ?? "";

export interface Enrollment {
  id: string;
  contactId: string;
  contactName: string;
  contactCompany: string;
  contactState: string;
  contactSignalScore: number;
  sequenceId: string;
  currentStep: number;
  totalSteps: number;
  enrolledAt: string;
  nextTouchDate: string | null;
  status: "active" | "paused" | "completed";
}

export async function GET() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return NextResponse.json({ enrollments: [], needsSetup: false });
  }

  const db = createClient(SUPABASE_URL, SUPABASE_KEY);

  // Fetch enrollments joined with contacts
  const { data, error } = await db
    .from("sequence_enrollments")
    .select(`
      id,
      contact_id,
      sequence_id,
      current_step,
      enrolled_at,
      next_touch_date,
      status,
      contacts (
        id,
        name,
        company,
        state,
        signal_stack
      )
    `)
    .order("created_at", { ascending: false });

  // Table doesn't exist yet — return needsSetup flag
  if (error && (error.code === "42P01" || error.message?.includes("does not exist") || error.message?.includes("relation"))) {
    return NextResponse.json({ enrollments: [], needsSetup: true });
  }

  if (error) {
    return NextResponse.json({ enrollments: [], needsSetup: false, error: error.message });
  }

  const enrollments: Enrollment[] = (data ?? []).map((row: Record<string, unknown>) => {
    const c = row.contacts as Record<string, unknown> | null;
    const seqDef = SEQUENCES.find(s => s.id === row.sequence_id);
    return {
      id:                 row.id as string,
      contactId:          row.contact_id as string,
      contactName:        (c?.name as string) ?? "Unknown",
      contactCompany:     (c?.company as string) ?? "",
      contactState:       (c?.state as string) ?? "dorsal",
      contactSignalScore: (c?.signal_stack as number) ?? 0,
      sequenceId:         row.sequence_id as string,
      currentStep:        row.current_step as number,
      totalSteps:         seqDef?.steps.length ?? 0,
      enrolledAt:         row.enrolled_at as string,
      nextTouchDate:      row.next_touch_date as string | null,
      status:             row.status as "active" | "paused" | "completed",
    };
  });

  return NextResponse.json({ enrollments, needsSetup: false });
}
