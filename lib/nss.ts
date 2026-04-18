import type { Interaction, NSS, StateConfidence } from "./types";

// Very small heuristic classifier for demo-grade NSS inference.
// Not a real model — it pattern-matches linguistic markers from the spec.

const ventralMarkers = [
  /\bwhen\b/i, /\bhow do we\b/i, /\bnext step/i, /\blet'?s\b/i,
  /\bsounds good\b/i, /\bhappy to\b/i, /\bbook\b/i, /\bcalendly\b/i,
];
const sympatheticMarkers = [
  /\balready have\b/i, /\bnot interested\b/i, /\btoo expensive\b/i,
  /\bno time\b/i, /\bASAP\b/i, /\bwhy would\b/i, /\bprove\b/i, /!!+/,
];
const dorsalMarkers = [
  /\bmaybe later\b/i, /\bcircling back\b/i, /\bno thanks\b/i,
  /\bunsubscribe\b/i, /^\s*ok\.?\s*$/i, /^\s*k\.?\s*$/i,
];

export function inferState(interactions: Interaction[]): {
  state: NSS;
  confidence: StateConfidence;
} {
  const scores: StateConfidence = { ventral: 0.1, sympathetic: 0.1, dorsal: 0.1 };
  const inbound = interactions.filter(i => i.direction === "in");

  if (inbound.length === 0) {
    // No replies at all tilts toward dorsal shutdown
    scores.dorsal += 0.5;
  }

  for (const i of inbound) {
    const text = i.body;
    const wordCount = text.trim().split(/\s+/).length;

    for (const rx of ventralMarkers) if (rx.test(text)) scores.ventral += 0.25;
    for (const rx of sympatheticMarkers) if (rx.test(text)) scores.sympathetic += 0.28;
    for (const rx of dorsalMarkers) if (rx.test(text)) scores.dorsal += 0.3;

    if (wordCount <= 3) scores.dorsal += 0.15;
    if (wordCount >= 25) scores.ventral += 0.15;

    if (i.latencyHours != null) {
      if (i.latencyHours < 6) scores.sympathetic += 0.08;
      if (i.latencyHours > 120) scores.dorsal += 0.2;
      if (i.latencyHours >= 6 && i.latencyHours <= 72) scores.ventral += 0.1;
    }
  }

  const total = scores.ventral + scores.sympathetic + scores.dorsal || 1;
  const confidence: StateConfidence = {
    ventral: round(scores.ventral / total),
    sympathetic: round(scores.sympathetic / total),
    dorsal: round(scores.dorsal / total),
  };
  const state: NSS =
    confidence.ventral >= confidence.sympathetic && confidence.ventral >= confidence.dorsal
      ? "ventral"
      : confidence.sympathetic >= confidence.dorsal
        ? "sympathetic"
        : "dorsal";
  return { state, confidence };
}

function round(n: number) { return Math.round(n * 100) / 100; }

export const stateLabel: Record<NSS, string> = {
  ventral: "Ventral Vagal",
  sympathetic: "Sympathetic",
  dorsal: "Dorsal Vagal",
};

export const stateShort: Record<NSS, string> = {
  ventral: "Ventral",
  sympathetic: "Sympathetic",
  dorsal: "Dorsal",
};

export const stateCode: Record<NSS, "v" | "s" | "d"> = {
  ventral: "v",
  sympathetic: "s",
  dorsal: "d",
};

export const nextMoveFor: Record<NSS, string> = {
  ventral: "Direct value ask. Meeting invite. Pricing conversation.",
  sympathetic: "Pattern interrupt. Curiosity hook. Zero-pressure acknowledgment.",
  dorsal: "Permission-to-reconnect message. No ask. Low-stakes re-entry.",
};

export const forbiddenFor: Record<NSS, string> = {
  ventral: "Over-nurturing. Redundant check-ins.",
  sympathetic: "Pitch decks. Feature lists. Hard CTAs.",
  dorsal: "Any ask. Any urgency. Any 'just checking in'.",
};
