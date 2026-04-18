import type { StateConfidence } from "@/lib/types";

export default function Ladder({ c }: { c: StateConfidence }) {
  const active = c.ventral >= c.sympathetic && c.ventral >= c.dorsal
    ? "ventral"
    : c.sympathetic >= c.dorsal ? "sympathetic" : "dorsal";
  const pct = (n: number) => `${Math.round(n * 100)}%`;
  return (
    <div className="ladder">
      <div className={`ladder-band ventral ${active === "ventral" ? "active" : ""}`}>
        <span>Ventral Vagal — regulated</span>
        <span className="ladder-conf">{pct(c.ventral)}</span>
      </div>
      <div className={`ladder-band sympathetic ${active === "sympathetic" ? "active" : ""}`}>
        <span>Sympathetic — activated</span>
        <span className="ladder-conf">{pct(c.sympathetic)}</span>
      </div>
      <div className={`ladder-band dorsal ${active === "dorsal" ? "active" : ""}`}>
        <span>Dorsal Vagal — shutdown</span>
        <span className="ladder-conf">{pct(c.dorsal)}</span>
      </div>
    </div>
  );
}
