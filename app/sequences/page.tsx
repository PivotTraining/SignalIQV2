const sequences = [
  {
    name: "Sympathetic → Ventral (activate → cool down)",
    description: "Pattern interrupt first, then space, then permission-based ask.",
    steps: [
      { day: 0, state: "sympathetic", archetype: "Pattern interrupt", body: "One question, not a pitch." },
      { day: 2, state: "sympathetic", archetype: "Curiosity hook", body: "Send observation, no CTA." },
      { day: 5, state: "ventral", archetype: "Direct value ask", body: "If signals cooled, ask for the call." },
      { day: 9, state: "dorsal", archetype: "Permission to reconnect", body: "If silence, step back." },
    ],
  },
  {
    name: "Ventral Fast-Track",
    description: "For prospects already in regulated engagement. Short, direct, high conversion.",
    steps: [
      { day: 0, state: "ventral", archetype: "Meeting invite", body: "Offer two specific times." },
      { day: 2, state: "ventral", archetype: "Pricing unlock", body: "Send the one-pager." },
      { day: 4, state: "ventral", archetype: "Close", body: "Confirm terms and kickoff." },
    ],
  },
  {
    name: "Dorsal Re-entry",
    description: "Revive ghosted accounts without urgency. Zero-pressure cadence.",
    steps: [
      { day: 0, state: "dorsal", archetype: "Permission to reconnect", body: "No ask. Acknowledge timing." },
      { day: 14, state: "dorsal", archetype: "Low-stakes re-entry", body: "Share one useful thing, disappear." },
      { day: 45, state: "ventral", archetype: "Soft door reopen", body: "Test if window has opened." },
    ],
  },
];

const stateCode = { ventral: "v", sympathetic: "s", dorsal: "d" } as const;
const stateShort = { ventral: "Ventral", sympathetic: "Sympathetic", dorsal: "Dorsal" } as const;

export default function SequencesPage() {
  return (
    <>
      <div className="topbar">
        <div className="greeting">
          <h1 className="page-title">Adaptive Sequences</h1>
          <p className="page-sub">Not linear drips. Branching on detected state after each reply.</p>
        </div>
        <div className="topbar-actions">
          <button className="btn">Clone archetype</button>
          <button className="btn btn-primary">New sequence</button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {sequences.map(seq => (
          <div className="card" key={seq.name}>
            <div className="card-header">
              <div>
                <div className="card-title">{seq.name}</div>
                <div className="card-sub">{seq.description}</div>
              </div>
              <button className="micro-btn">Activate</button>
            </div>
            {seq.steps.map((s, i) => (
              <div className="sequence-step" key={i}>
                <div className="step-num">{i + 1}</div>
                <div style={{ fontSize: 12, color: "var(--text-2)" }}>
                  Day {s.day}
                </div>
                <div>
                  <div style={{ fontSize: 13, marginBottom: 4 }}>
                    <span className="chip">{s.archetype}</span>
                    <span className={`state-badge ${stateCode[s.state as keyof typeof stateCode]}`}>
                      <span className="state-dot" />
                      {stateShort[s.state as keyof typeof stateShort]}
                    </span>
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--text-1)" }}>{s.body}</div>
                </div>
                <button className="micro-btn">Edit</button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
