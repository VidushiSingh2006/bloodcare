import { FormEvent, useEffect, useState } from "react";
import { api } from "../../lib/api";
import { groupLabel } from "../../lib/groups";
import { PageHead } from "./AdminLayout";

type Payload = {
  donations: { id: string; donorName: string; bloodGroup: string; units: number; litres: number; donatedAt: string }[];
  donors: { id: string; fullName: string; bloodGroup: string; eligibility: { eligible: boolean; waitDays: number } }[];
  cooldownDays: number;
};

export function DonationsPage() {
  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState("");

  async function load() {
    setData(await api<Payload>("/admin/donations"));
  }

  useEffect(() => {
    load().catch(() => setData(null));
  }, []);

  async function onSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    try {
      await api("/admin/donations", {
        method: "POST",
        body: JSON.stringify({
          donorId: String(fd.get("donorId")),
          units: Number(fd.get("units")),
        }),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not record donation");
    }
  }

  return (
    <>
      <PageHead title="Blood donations" />
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>Record a donation</h3>
        {error ? <p className="err">{error}</p> : null}
        <form onSubmit={onSave}>
          <div className="field">
            <label>Donor</label>
            <select name="donorId" required defaultValue="">
              <option value="" disabled>
                Select a registered donor...
              </option>
              {data?.donors.map((d) => (
                <option key={d.id} value={d.id} disabled={!d.eligibility.eligible}>
                  {d.fullName} ({groupLabel(d.bloodGroup)})
                  {d.eligibility.eligible ? "" : ` — wait ${d.eligibility.waitDays}d`}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Units (1 unit = 450 ml)</label>
            <input name="units" type="number" min={1} max={3} defaultValue={1} />
          </div>
          <button className="btn btn-green" type="submit">
            Save donation
          </button>
        </form>
        <p className="note">
          Donors can give again after {data?.cooldownDays ?? 90} days. The system blocks earlier donations to protect
          donor health.
        </p>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Recent Donation Records</h3>
        <table>
          <thead>
            <tr>
              <th>DONOR</th>
              <th>GROUP</th>
              <th>UNITS</th>
              <th>DATE</th>
            </tr>
          </thead>
          <tbody>
            {data?.donations.map((row) => (
              <tr key={row.id}>
                <td>{row.donorName}</td>
                <td>
                  <strong>{groupLabel(row.bloodGroup)}</strong>
                </td>
                <td>
                  {row.units} unit(s) ({row.litres.toFixed(2)} L)
                </td>
                <td>{row.donatedAt.slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
