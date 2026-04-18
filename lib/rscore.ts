import type { Prospect } from "./types";

// R-Score = 0.25*SignalStack + 0.20*IntentVelocity + 0.15*BudgetIndicator
//         + 0.15*AuthorityMatch + 0.15*TimingWindow + 0.10*SocialProofAlignment
export function rScore(p: Pick<Prospect,
  "signalStack" | "intentVelocity" | "budgetIndicator"
  | "authorityMatch" | "timingWindow" | "socialProofAlignment">): number {
  const r =
    0.25 * p.signalStack +
    0.20 * p.intentVelocity +
    0.15 * p.budgetIndicator +
    0.15 * p.authorityMatch +
    0.15 * p.timingWindow +
    0.10 * p.socialProofAlignment;
  return Math.round(r * 10) / 10;
}

export function rBand(r: number): "high" | "mid" | "low" {
  if (r >= 71) return "high";
  if (r >= 40) return "mid";
  return "low";
}

export function rBandLabel(r: number): string {
  if (r >= 85) return "Human-review alert";
  if (r >= 71) return "Active sequence";
  if (r >= 40) return "Nurture";
  return "Deprioritized";
}
