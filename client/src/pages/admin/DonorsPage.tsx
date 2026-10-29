import { FormEvent, useEffect, useState } from "react";
import { api } from "../../lib/api";
import { GROUPS, groupLabel } from "../../lib/groups";
import { PageHead } from "./AdminLayout";

type Donor = {
  id: string;
  fullName: string;
  phone: string;
  city: string;
  bloodGroup: string;
  lastDonationAt: string | null;
  eligibility: { state: string; label: string };
};

export function DonorsPage() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [q, setQ] = useState("");
  const [group, setGroup] = useState("ALL");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  async function load(nextQ = q, nextGroup = group) {
    const params = new URLSearchParams({ q: nextQ, group: nextGroup });
    const r = await api<{ donors: Donor[] }>(`/admin/donors?${params}`);
    setDonors(r.donors);
  }

  useEffect(() => {
    load().catch(() => setDonors([]));
  }, []);

  async function remove(id: string) {
    if (!confirm("Remove this donor from the active roster?")) return;
    await api(`/admin/donors/${id}`, { method: "DELETE" });
    await load();
  }

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    try {
      await api("/admin/donors", {
        method: "POST",
        body: JSON.stringify({
          fullName: String(fd.get("fullName")),
          phone: String(fd.get("phone")),
          city: String(fd.get("city")),
          bloodGroup: String(fd.get("bloodGroup")),
          lastDonationAt: String(fd.get("lastDonationAt") || "") || null,
        }),
      });
      setOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add donor");
    }
  }

  return (
    <>
      <PageHead title="Donors" />
      <div className="card">
        <div className="toolbar">
          <input
            className="grow"
            placeholder="Search by name or city"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              load(e.target.value, group).catch(() => undefined);
            }}
          />
          <select
            value={group}
            onChange={(e) => {
              setGroup(e.target.value);
              load(q, e.target.value).catch(() => undefined);
            }}
          >
            <option value="ALL">All groups</option>
            {GROUPS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
          <button className="btn btn-brand ml-auto" type="button" onClick={() => setOpen(true)}>
            + Add donor
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>NAME</th>
                <th>GROUP</th>
                <th>PHONE</th>
                <th>CITY</th>
                <th>LAST DONATION</th>
                <th>ELIGIBILITY</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {donors.map((d) => (
                <tr key={d.id}>
                  <td>{d.fullName}</td>
                  <td>
                    <strong>{groupLabel(d.bloodGroup)}</strong>
                  </td>
                  <td>{d.phone}</td>
                  <td>{d.city}</td>
                  <td>{d.lastDonationAt ? d.lastDonationAt.slice(0, 10) : "—"}</td>
                  <td>
                    <span className={d.eligibility.state === "eligible" ? "chip-ok" : "chip-wait"}>
                      {d.eligibility.label}
                    </span>
                  </td>
                  <td>
                    <button className="linkish" type="button" onClick={() => remove(d.id)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {open ? (
        <div className="modal-back" onClick={() => setOpen(false)}>
          <div className="card modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add donor</h3>
            {error ? <p className="err">{error}</p> : null}
            <form onSubmit={onCreate}>
              <div className="field">
                <label>Full name</label>
                <input name="fullName" required />
              </div>
              <div className="grid-2">
                <div className="field">
                  <label>Phone</label>
                  <input name="phone" required />
                </div>
                <div className="field">
                  <label>City</label>
                  <input name="city" required />
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
                  <label>Last donation</label>
                  <input name="lastDonationAt" type="date" />
                </div>
              </div>
              <button className="btn btn-brand" type="submit">
                Save donor
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
