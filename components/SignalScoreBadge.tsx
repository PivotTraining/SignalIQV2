import { signalBand } from "@/lib/scoring";

const bandColors: Record<string, string> = {
  hot:      "var(--danger)",
  warm:     "var(--sympathetic)",
  cooling:  "#a78bfa",
  cold:     "var(--dorsal)",
  dormant:  "var(--text-3)",
};

const bandLabels: Record<string, string> = {
  hot:     "🔥 Hot",
  warm:    "🌡 Warm",
  cooling: "📉 Cooling",
  cold:    "🧊 Cold",
  dormant: "💤 Dormant",
};

export default function SignalScoreBadge({ score }: { score: number }) {
  const band  = signalBand(score);
  const color = bandColors[band];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 10px", borderRadius: 999,
      background: `${color}22`, color,
      fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}` }} />
      Signal {score} · {bandLabels[band]}
    </span>
  );
}
