import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { GROUPS, type BloodGroup, groupLabel } from "../lib/groups";

type StockRow = { group: BloodGroup; label: string; units: number; critical: boolean };

export function PublicCompatibilityPage() {
  const [group, setGroup] = useState<BloodGroup>("A_POS");
  const [rows, setRows] = useState<StockRow[]>([]);

  useEffect(() => {
    api<{ canReceiveFrom: StockRow[] }>(`/public/compatibility?group=${group}`)
      .then((r) => setRows(r.canReceiveFrom))
      .catch(() => setRows([]));
  }, [group]);

  return (
    <div className="main" style={{ maxWidth: 960, margin: "0 auto" }}>
      <div className="topbar">
        <h1>Compatibility</h1>
        <Link to="/">Live stock & login</Link>
      </div>
      <div className="card">
        <div className="section-title">Who can give blood to me?</div>
        <div className="compat-pills">
          {GROUPS.map((g) => (
            <button key={g.value} className={group === g.value ? "on" : ""} onClick={() => setGroup(g.value)}>
              {g.label}
            </button>
          ))}
        </div>
        <p>
          {groupLabel(group)} can receive from:
        </p>
        <div className="compat-grid">
          {rows.map((r) => (
            <div className="card" key={r.group}>
              <h3>{r.label}</h3>
              <div className="gmeta">{r.units} units</div>
              {r.critical ? <div className="badge" style={{ position: "static", marginTop: 10, display: "inline-block" }}>Critical</div> : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
