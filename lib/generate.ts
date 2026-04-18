import type { NSS, Prospect } from "./types";

type Candidate = { archetype: string; body: string };

export function generateMessages(p: Prospect): Candidate[] {
  const first = p.name.split(" ")[0];
  const topSignal = p.signals[0]?.value ?? "your recent activity";

  if (p.state === "ventral") {
    return [
      {
        archetype: "Direct value ask",
        body: `${first} — you mentioned ${topSignal.toLowerCase()}. I have a 20-minute slot Thursday at 2pm ET that maps cleanly to what you're solving. Book it and I'll bring the two numbers that matter.`,
      },
      {
        archetype: "Meeting invite",
        body: `${first}, based on where ${p.company} is in the cycle, the next step is a working session, not another email. Here's my link — pick the time that's least painful.`,
      },
      {
        archetype: "Pricing unlock",
        body: `${first} — for a team your size the Growth tier is the honest fit. Want me to send the one-pager and a three-week rollout plan? If yes, we can be done in two emails.`,
      },
    ];
  }

  if (p.state === "sympathetic") {
    return [
      {
        archetype: "Pattern interrupt",
        body: `${first} — not a pitch. One question: ${topSignal.toLowerCase()} usually forces a decision by week three. Are you at week one or week three?`,
      },
      {
        archetype: "Curiosity hook",
        body: `${first}, something specific pulled me toward ${p.company}. I'm not going to list features. If curious, reply with a question mark and I'll send the two-sentence version.`,
      },
      {
        archetype: "Zero-pressure acknowledgment",
        body: `${first} — read three of your posts this week. You don't need another vendor in your inbox. Tell me to go away and I will. Otherwise I'll share one observation when it's useful.`,
      },
    ];
  }

  // dorsal
  return [
    {
      archetype: "Permission to reconnect",
      body: `${first} — no ask here. Timing on our last thread was off, and that's on me. If the moment ever gets right on your side, I'm a reply away. Hope the build is going well.`,
    },
    {
      archetype: "Low-stakes re-entry",
      body: `${first}, sending one thing and disappearing: a short note I wrote about ${p.industry} teams in your stage. Open if useful, ignore if not. No follow-up.`,
    },
    {
      archetype: "Soft door reopen",
      body: `${first} — circling back is a phrase I've banned for myself, so I won't use it. If ${p.company} ever wants a second look, the door's open. That's the whole email.`,
    },
  ];
}

export function archetypeColor(state: NSS): "v" | "s" | "d" {
  return state === "ventral" ? "v" : state === "sympathetic" ? "s" : "d";
}
