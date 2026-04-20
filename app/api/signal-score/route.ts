import { NextResponse } from "next/server";
import { calcSignalScore, signalBand } from "@/lib/airtable";

// GET /api/signal-score?lastTouch=14&interactions90d=4&avgDepth=3.5&intent=70
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lastTouchDaysAgo = Number(searchParams.get("lastTouch") ?? 30);
  const interactions90d  = Number(searchParams.get("interactions90d") ?? 2);
  const avgDepth         = Number(searchParams.get("avgDepth") ?? 3);
  const intent           = Number(searchParams.get("intent") ?? 50);

  const score = calcSignalScore({ lastTouchDaysAgo, interactions90d, avgDepth, intent });
  const band  = signalBand(score);

  return NextResponse.json({
    score,
    band,
    components: {
      recency:   Math.round(100 * Math.exp(-0.023 * lastTouchDaysAgo)),
      frequency: Math.min(100, Math.round((interactions90d / 12) * 100)),
      depth:     Math.round(Math.min(5, Math.max(1, avgDepth)) * 20),
      intent:    Math.round(Math.min(100, Math.max(0, intent))),
    },
    weights: { recency: 0.45, frequency: 0.25, depth: 0.20, intent: 0.10 },
  });
}
