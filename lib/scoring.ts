/**
 * Shared Signal Score formulas — used by both Airtable and Supabase layers.
 * Score = Recency×0.45 + Frequency×0.25 + Depth×0.20 + Intent×0.10
 */

export function calcSignalScore(fields: {
  lastTouchDaysAgo: number;
  interactions90d:  number;
  avgDepth:         number; // 1–5
  intent:           number; // 0–100
}): number {
  const recency   = Math.round(100 * Math.exp(-0.023 * fields.lastTouchDaysAgo));
  const frequency = Math.min(100, Math.round((fields.interactions90d / 12) * 100));
  const depth     = Math.round(Math.min(5, Math.max(1, fields.avgDepth)) * 20);
  const intent    = Math.round(Math.min(100, Math.max(0, fields.intent)));
  return Math.round(recency * 0.45 + frequency * 0.25 + depth * 0.20 + intent * 0.10);
}

export function signalBand(score: number): "hot" | "warm" | "cooling" | "cold" | "dormant" {
  if (score >= 80) return "hot";
  if (score >= 60) return "warm";
  if (score >= 40) return "cooling";
  if (score >= 20) return "cold";
  return "dormant";
}
