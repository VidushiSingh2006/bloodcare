import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { GROUPS } from "../lib/groups";

export function NeedBloodPage() {
  const [ok, setOk] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setOk("");
    const fd = new FormData(e.currentTarget);
    try {
      await api("/public/requests", {
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
          neededBy: String(fd.get("neededBy") || "") || undefined,
        }),
      });
      setOk("Request logged. The campus blood bank will review it shortly.");
      e.currentTarget.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit request");
    }
  }

  return (
    <div className="gate-panel" style={{ minHeight: "100vh" }}>
      <div className="auth-card">
        <div className="brand-row">
          <span className="drop">●</span> BloodCare
        </div>
        <h2 style={{ margin: "8px 0 4px" }}>Hospital / emergency request</h2>
        <p className="subtitle">No login required. Staff will see this on the Requests board.</p>
        {error ? <p className="err">{error}</p> : null}
        {ok ? <p className="chip-ok">{ok}</p> : null}
        <form onSubmit={onSubmit}>
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
              <label>Units needed</label>
              <input name="unitsRequested" type="number" min={1} max={10} defaultValue={1} />
            </div>
          </div>
          <div className="grid-2">
            <div className="field">
              <label>Urgency</label>
              <select name="urgency" defaultValue="URGENT">
                <option value="ROUTINE">Routine</option>
                <option value="URGENT">Urgent</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <div className="field">
              <label>Needed by</label>
              <input name="neededBy" type="date" />
            </div>
          </div>
          <div className="field">
            <label>Notes</label>
            <textarea name="notes" rows={3} />
          </div>
          <button className="btn btn-brand" type="submit">
            Submit request
          </button>
        </form>
        <div className="public-links">
          <Link to="/">Back to live stock</Link>
        </div>
      </div>
    </div>
  );
}
