import { NextResponse } from "next/server";
import { fetchProspects, backendSource } from "@/lib/db";
import { prospects as seedProspects } from "@/lib/data";

export const revalidate = 120; // cache for 2 minutes

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
