import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { PageHead } from "./AdminLayout";

type Dash = {
  totals: { totalUnits: number; totalLitres: number; registeredDonors: number; pendingRequests: number };
  stock: { group: string; label: string; units: number; litres: number; critical: boolean; fillPercent: number }[];
  criticalBanner: string | null;
  activity: { id: string; message: string; createdAt: string }[];
};

export function DashboardPage() {
  const [data, setData] = useState<Dash | null>(null);

  useEffect(() => {
    api<Dash>("/admin/dashboard").then(setData).catch(() => setData(null));
  }, []);

  if (!data) return <PageHead title="Dashboard" />;

  return (
    <>
      <PageHead title="Dashboard" />
      {data.criticalBanner ? <div className="banner">⚠ {data.criticalBanner}</div> : null}
      <div className="kpis">
        <div className="kpi">
          <div className="num">{data.totals.totalUnits}</div>
          <div className="lbl">Total units in stock</div>
        </div>
        <div className="kpi">
          <div className="num">{data.totals.totalLitres.toFixed(2)} L</div>
          <div className="lbl">Total volume</div>
        </div>
        <div className="kpi">
          <div className="num">{data.totals.registeredDonors}</div>
          <div className="lbl">Registered donors</div>
        </div>
        <div className="kpi">
          <div className="num">{data.totals.pendingRequests}</div>
          <div className="lbl">Pending requests</div>
        </div>
      </div>

      <div className="section-title">Available blood by group</div>
      <div className="groups">
        {data.stock.map((s) => (
          <div className="card gcard" key={s.group}>
            {s.critical ? <span className="badge">Critical</span> : null}
            <h3>{s.label}</h3>
            <div className="gmeta">
              {s.units} units · {s.litres.toFixed(2)} L
            </div>
            <div className="bar">
              <i style={{ width: `${Math.max(4, s.fillPercent)}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="section-title" style={{ marginTop: 22 }}>
        Recent activity
      </div>
      <div className="card activity">
        <ul>
          {data.activity.map((a) => (
            <li key={a.id}>
              <span>{a.message}</span>
              <time>{a.createdAt.slice(0, 10)}</time>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
