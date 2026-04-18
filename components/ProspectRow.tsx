import Link from "next/link";
import type { Prospect } from "@/lib/types";
import { stateCode } from "@/lib/nss";
import { rBand, rScore } from "@/lib/rscore";
import StateBadge from "./StateBadge";

export default function ProspectRow({ p }: { p: Prospect }) {
  const r = rScore(p);
  const band = rBand(r);
  const avatarCode = stateCode[p.state];
  return (
    <Link
      href={`/prospects/${p.id}`}
      className="prospect-row"
      style={{ display: "grid", textDecoration: "none", color: "inherit" }}
    >
      <div className="person">
        <div className={`avatar ${avatarCode}`}>{p.initials}</div>
        <div>
          <div className="person-name">{p.name}</div>
          <div className="person-sub">{p.title} · {p.company} · {p.headcount} emp</div>
        </div>
      </div>
      <div><StateBadge state={p.state} /></div>
      <div className={`rscore ${band}`}>{Math.round(r)}</div>
      <div className="next-move">{p.nextMove}</div>
      <button className="micro-btn">Act</button>
    </Link>
  );
}
