import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { GROUPS, type BloodGroup, groupLabel } from "../../lib/groups";
import { PageHead } from "./AdminLayout";

type Row = { group: BloodGroup; label: string; units: number; critical: boolean };

export function CompatibilityPage() {
  const [group, setGroup] = useState<BloodGroup>("A_POS");
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    api<{ canReceiveFrom: Row[] }>(`/admin/compatibility?group=${group}`)
      .then((r) => setRows(r.canReceiveFrom))
      .catch(() => setRows([]));
  }, [group]);

  return (
    <>
      <PageHead title="Compatibility" />
      <div className="card">
        <div className="section-title">Who can give blood to me?</div>
        <div className="compat-pills">
          {GROUPS.map((g) => (
            <button key={g.value} className={group === g.value ? "on" : ""} onClick={() => setGroup(g.value)} type="button">
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
              <h3 style={{ margin: "0 0 6px" }}>{r.label}</h3>
              <div className="gmeta">{r.units} units</div>
              {r.critical ? (
                <div className="badge" style={{ position: "static", marginTop: 12, display: "inline-block" }}>
                  Critical
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
