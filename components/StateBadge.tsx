import type { NSS } from "@/lib/types";
import { stateCode, stateShort } from "@/lib/nss";

export default function StateBadge({ state }: { state: NSS }) {
  const code = stateCode[state];
  return (
    <span className={`state-badge ${code}`}>
      <span className="state-dot" />
      {stateShort[state]}
    </span>
  );
}
