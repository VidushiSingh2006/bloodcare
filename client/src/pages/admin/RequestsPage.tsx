import { FormEvent, useEffect, useState } from "react";
import { api } from "../../lib/api";
import { GROUPS, groupLabel } from "../../lib/groups";
import { PageHead } from "./AdminLayout";

type Req = {
  id: string;
  patientName: string;
  hospitalName: string;
  city: string;
  phone: string;
  bloodGroup: string;
  unitsRequested: number;
  urgency: string;
  status: string;
  createdAt: string;
};

export function RequestsPage() {
  const [rows, setRows] = useState<Req[]>([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const r = await api<{ requests: Req[] }>("/admin/requests");
    setRows(r.requests);
  }

  useEffect(() => {
    load().catch(() => setRows([]));
  }, []);

  async function patch(id: string, status: string) {
    await api(`/admin/requests/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
    await load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this request?")) return;
    await api(`/admin/requests/${id}`, { method: "DELETE" });
    await load();
  }

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    try {
      await api("/admin/requests", {
        method: "POST",
        body: JSON.stringify({
          patientName: String(fd.get("patientName")),
          hospitalName: String(fd.get("hospitalName")),
          city: String(fd.get("city")),
          phone: String(fd.get("phone")),
          email: String(fd.get("email") || ""),
          bloodGroup: String(fd.get("bloodGroup")),
          unitsRequested: Number(fd.get("unitsRequested")),
          urgency: String(fd.get("urgency")),
          notes: String(fd.get("notes") || ""),
        }),
      });
      setOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create request");
    }
  }

  return (
    <>
      <PageHead title="Requests" />
      <button className="btn btn-brand" type="button" onClick={() => setOpen(true)} style={{ width: "auto", marginBottom: 16 }}>
        + New blood request
      </button>

      {rows.length === 0 ? (
        <div className="card empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M8 4h8a2 2 0 0 1 2 2v14l-6-3-6 3V6a2 2 0 0 1 2-2z" />
          </svg>
          <p>
            No blood requests found. Click “+ New blood request” to log an emergency or hospital request.
          </p>
        </div>
      ) : (
        <div className="card table-wrap">
          <table>
            <thead>
              <tr>
                <th>PATIENT</th>
                <th>HOSPITAL</th>
                <th>GROUP</th>
                <th>UNITS</th>
                <th>URGENCY</th>
                <th>STATUS</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    {r.patientName}
                    <div className="gmeta">{r.city}</div>
                  </td>
                  <td>{r.hospitalName}</td>
                  <td>
                    <strong>{groupLabel(r.bloodGroup)}</strong>
                  </td>
                  <td>{r.unitsRequested}</td>
                  <td>{r.urgency}</td>
                  <td>
                    <select className="select-status" value={r.status} onChange={(e) => patch(r.id, e.target.value)}>
                      <option value="PENDING">PENDING</option>
                      <option value="FULFILLED">FULFILLED</option>
                      <option value="REJECTED">REJECTED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                  <td>
                    <button className="linkish" type="button" onClick={() => remove(r.id)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open ? (
        <div className="modal-back" onClick={() => setOpen(false)}>
          <div className="card modal" onClick={(e) => e.stopPropagation()}>
            <h3>New blood request</h3>
            {error ? <p className="err">{error}</p> : null}
            <form onSubmit={onCreate}>
              <div className="field">
                <label>Patient name</label>
                <input name="patientName" required />
              </div>
              <div className="grid-2">
                <div className="field">
                  <label>Hospital</label>
                  <input name="hospitalName" required />
                </div>
                <div className="field">
                  <label>City</label>
                  <input name="city" required />
                </div>
              </div>
              <div className="grid-2">
                <div className="field">
                  <label>Phone</label>
                  <input name="phone" required />
                </div>
                <div className="field">
                  <label>Email</label>
                  <input name="email" type="email" />
                </div>
              </div>
              <div className="grid-2">
                <div className="field">
                  <label>Blood group</label>
                  <select name="bloodGroup">
                    {GROUPS.map((g) => (
                      <option key={g.value} value={g.value}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Units</label>
                  <input name="unitsRequested" type="number" min={1} defaultValue={1} />
                </div>
              </div>
              <div className="field">
                <label>Urgency</label>
                <select name="urgency" defaultValue="URGENT">
                  <option value="ROUTINE">Routine</option>
                  <option value="URGENT">Urgent</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
              <div className="field">
                <label>Notes</label>
                <textarea name="notes" rows={2} />
              </div>
              <button className="btn btn-brand" type="submit">
                Save request
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
