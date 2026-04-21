export type NSS = "ventral" | "sympathetic" | "dorsal";

export type StateConfidence = { ventral: number; sympathetic: number; dorsal: number };

export type Signal = {
  label: string;
  value: string;
  weight?: number;
};

export type Interaction = {
  id: string;
  channel: "email" | "linkedin" | "call";
  direction: "in" | "out";
  at: string;
  body: string;
  latencyHours?: number;
};

export type Prospect = {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string | null;
  phone: string | null;
  headcount: number;
  initials: string;
  industry: string;
  stack: string[];
  signalStack: number;
  intentVelocity: number;
  budgetIndicator: number;
  authorityMatch: number;
  timingWindow: number;
  socialProofAlignment: number;
  state: NSS;
  stateConfidence: StateConfidence;
  nextMove: string;
  signals: Signal[];
  interactions: Interaction[];
  lastTouchDaysAgo: number;
};

export type FeedEvent = {
  id: string;
  icon: string;
  html: string;
  meta: string;
  prospectId?: string;
};
