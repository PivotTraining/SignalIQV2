import type { NSS } from "./types";

export type SequenceChannel = "email" | "call" | "linkedin";

export interface SequenceStep {
  day: number;
  targetState: NSS;       // the NSS state this step is designed for
  archetype: string;
  body: string;           // what to do / say
  channel: SequenceChannel;
  tip?: string;           // tactical note
  adaptations?: Partial<Record<NSS, string>>; // what to do if contact is in a different state
}

export interface SequenceDef {
  id: string;
  name: string;
  description: string;
  targetEntry: NSS;       // ideal contact state to enroll
  color: string;
  icon: string;
  steps: SequenceStep[];
}

export const SEQUENCES: SequenceDef[] = [
  {
    id: "cautious-to-engaged",
    name: "Cautious → Engaged",
    description: "Pattern interrupt first, then space, then a permission-based ask. For contacts in defensive mode.",
    targetEntry: "sympathetic",
    color: "#f97316",
    icon: "⚡",
    steps: [
      {
        day: 0,
        targetState: "sympathetic",
        archetype: "Pattern interrupt",
        body: "One unexpected observation about their world. Not a pitch — just a question that shows you understand their situation.",
        channel: "email",
        tip: "Subject line should be unusual. No 'Following up' or 'Checking in'.",
        adaptations: {
          ventral:     "They're already open — skip this and go straight to a direct value ask or meeting invite.",
          dorsal:      "Too withdrawn for a pattern interrupt. Switch to Quiet Re-entry instead.",
        },
      },
      {
        day: 2,
        targetState: "sympathetic",
        archetype: "Curiosity hook",
        body: "Send one relevant insight with no CTA. Let curiosity do the work. Disappear after.",
        channel: "email",
        tip: "No links, no calendly, no ask. Just value.",
        adaptations: {
          ventral: "They've opened up — move to direct value ask now.",
          dorsal:  "Gone quiet — pause here and send re-entry message instead.",
        },
      },
      {
        day: 5,
        targetState: "ventral",
        archetype: "Direct value ask",
        body: "If signals have cooled and engagement is showing, make the direct ask for a short conversation.",
        channel: "email",
        tip: "Specific ask: 'Would a 20-minute call this week make sense?'",
        adaptations: {
          sympathetic: "Still cautious — not yet. Send another curiosity hook or wait.",
          dorsal:      "Went quiet — step back. Switch to Quiet Re-entry.",
        },
      },
      {
        day: 9,
        targetState: "dorsal",
        archetype: "Permission to reconnect",
        body: "If silence, step back entirely. Acknowledge timing with zero pressure. One sentence.",
        channel: "email",
        tip: "This is a safety net, not a last push. If they respond, move them to Engaged Fast-Track.",
      },
    ],
  },
  {
    id: "engaged-fast-track",
    name: "Engaged Fast-Track",
    description: "For contacts already open and responsive. Short, direct, high-conversion cadence.",
    targetEntry: "ventral",
    color: "#22c55e",
    icon: "🚀",
    steps: [
      {
        day: 0,
        targetState: "ventral",
        archetype: "Meeting invite",
        body: "Offer two specific times. Make it easy to say yes. Nothing else in the email.",
        channel: "email",
        tip: "Keep it to 3 sentences max. They're ready — don't oversell.",
        adaptations: {
          sympathetic: "Not ready for a meeting yet — slow down to a curiosity hook first.",
          dorsal:      "Withdrew — switch to Quiet Re-entry immediately.",
        },
      },
      {
        day: 2,
        targetState: "ventral",
        archetype: "Pricing unlock",
        body: "Send the program overview and investment range. Frame it as context, not a hard close.",
        channel: "email",
        tip: "Attach the one-pager. No lengthy email body.",
      },
      {
        day: 4,
        targetState: "ventral",
        archetype: "Close",
        body: "Confirm terms, send the agreement, set the kickoff date. Be direct — they're ready.",
        channel: "email",
        tip: "Don't re-pitch. They already said yes conceptually. Just close.",
      },
    ],
  },
  {
    id: "quiet-re-entry",
    name: "Quiet Re-entry",
    description: "Revive withdrawn contacts without urgency. Zero-pressure cadence. Time is your ally here.",
    targetEntry: "dorsal",
    color: "#8b5cf6",
    icon: "🌙",
    steps: [
      {
        day: 0,
        targetState: "dorsal",
        archetype: "Permission to reconnect",
        body: "No ask. No pitch. Acknowledge timing. One sentence only. Give them full permission to say not now.",
        channel: "email",
        tip: "Example: 'No pressure at all — just wanted to check in and make sure timing is still off.'",
      },
      {
        day: 14,
        targetState: "dorsal",
        archetype: "Low-stakes re-entry",
        body: "Share one genuinely useful thing with no strings attached. No CTA, no mention of your services.",
        channel: "email",
        tip: "A relevant article, a stat about their industry, a free resource. Then disappear.",
      },
      {
        day: 45,
        targetState: "ventral",
        archetype: "Soft door reopen",
        body: "Test if the window has opened. Light, curious, no urgency. 'Wondering if timing has shifted at all.'",
        channel: "email",
        tip: "If they respond with any energy at all, move them to Cautious → Engaged.",
        adaptations: {
          dorsal:  "Still quiet — wait another 30 days. Do not push. Patience wins here.",
          ventral: "Window has opened — transition immediately to Engaged Fast-Track.",
        },
      },
    ],
  },
  {
    id: "pressure-window",
    name: "PressureIQ Window",
    description: "For schools with active institutional pressure signals — budget cycles, state mandates, accountability deadlines.",
    targetEntry: "sympathetic",
    color: "#ef4444",
    icon: "🎯",
    steps: [
      {
        day: 0,
        targetState: "sympathetic",
        archetype: "Pressure acknowledge",
        body: "Name the pressure they're under. Show you understand the stakes and timing. No pitch yet.",
        channel: "email",
        tip: "Reference the specific pressure: 'Given the [mandate / budget deadline / score release]...'",
      },
      {
        day: 1,
        targetState: "sympathetic",
        archetype: "Solution frame",
        body: "Frame your work as pressure relief, not a training program. One short paragraph.",
        channel: "email",
        tip: "Avoid the word 'training.' Say 'support,' 'capacity-building,' or 'what we helped [similar district] do.'",
      },
      {
        day: 3,
        targetState: "ventral",
        archetype: "Social proof",
        body: "Share one outcome from a similar district that was under the same type of pressure.",
        channel: "email",
        tip: "Make it specific: district name or type, pressure context, measurable result.",
      },
      {
        day: 5,
        targetState: "ventral",
        archetype: "Urgency close",
        body: "Window is open. Ask for the meeting before the decision deadline passes. Be direct.",
        channel: "call",
        tip: "Call first if you have a number. If voicemail, follow up immediately with a short email.",
      },
    ],
  },
  {
    id: "burnout-recovery",
    name: "BurnoutIQ Recovery",
    description: "For exhausted staff and administrators. Empathy first. Never pitch. Build trust slowly over time.",
    targetEntry: "dorsal",
    color: "#eab308",
    icon: "🔋",
    steps: [
      {
        day: 0,
        targetState: "dorsal",
        archetype: "Empathy open",
        body: "Acknowledge what the team has been through. No mention of your services. Pure human connection.",
        channel: "email",
        tip: "This is not a business email. It's a genuine check-in from someone who understands their world.",
      },
      {
        day: 7,
        targetState: "dorsal",
        archetype: "Resource share",
        body: "Send one free, genuinely useful resource. No strings, no pitch, no CTA. Just give.",
        channel: "email",
        tip: "Could be an article on staff retention, a tool, a framework. Anything that reduces their load.",
      },
      {
        day: 21,
        targetState: "dorsal",
        archetype: "Check-in",
        body: "One genuine question about how the team is doing. Nothing else. No follow-up ask buried in it.",
        channel: "email",
        tip: "If they reply with any warmth, you're rebuilding trust. Don't squander it with a pitch.",
      },
      {
        day: 45,
        targetState: "ventral",
        archetype: "Gentle door open",
        body: "If signals have shifted, softly introduce how you've helped similar teams rebuild after burnout.",
        channel: "email",
        tip: "Lead with outcomes for the staff, not ROI for the district.",
        adaptations: {
          dorsal:  "Still exhausted — do not pitch. Wait another 30 days. Trust is not there yet.",
          ventral: "Ready to engage — transition to Engaged Fast-Track.",
        },
      },
    ],
  },
];

export const SEQUENCE_MAP = Object.fromEntries(SEQUENCES.map(s => [s.id, s]));

/** What the adaptive engine recommends when contact state ≠ step's target state */
export function branchRecommendation(
  contactState: NSS,
  seq: SequenceDef,
  stepIndex: number,
): string | null {
  const step = seq.steps[stepIndex];
  if (!step || step.targetState === contactState) return null;
  if (step.adaptations?.[contactState]) return step.adaptations[contactState]!;
  // Generic fallbacks
  if (contactState === "dorsal")      return "Contact has gone Quiet. Consider pausing and switching to Quiet Re-entry.";
  if (contactState === "ventral")     return "Contact is now Engaged. Consider fast-tracking to Engaged Fast-Track.";
  if (contactState === "sympathetic") return "Contact is Cautious. Slow the cadence — avoid hard CTAs this step.";
  return null;
}

/** State display labels (consistent with lib/nss.ts) */
export const STATE_LABEL: Record<NSS, string> = {
  ventral:     "Engaged",
  sympathetic: "Cautious",
  dorsal:      "Quiet",
};

export const STATE_COLOR: Record<NSS, string> = {
  ventral:     "#22c55e",
  sympathetic: "#f97316",
  dorsal:      "#8b5cf6",
};

export const CHANNEL_ICON: Record<SequenceChannel, string> = {
  email:    "✉️",
  call:     "📞",
  linkedin: "💼",
};
