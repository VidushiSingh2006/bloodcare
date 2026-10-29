import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BloodBag } from "../components/BloodBag";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { GROUPS, type BloodGroup, groupLabel } from "../lib/groups";

type StockRow = { group: BloodGroup; label: string; units: number; litres: number; critical: boolean; fillPercent: number };

export function GatePage() {
  const { login, register, user } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [stock, setStock] = useState<StockRow[]>([]);
  const [selected, setSelected] = useState<BloodGroup>("O_NEG");
  const [remember, setRemember] = useState(true);

  useEffect(() => {
    if (user?.role === "ADMIN") nav("/admin", { replace: true });
  }, [user, nav]);

  useEffect(() => {
    api<{ stock: StockRow[] }>("/public/overview")
      .then((r) => setStock(r.stock))
      .catch(() => setStock([]));
  }, []);

  const current = stock.find((s) => s.group === selected);

  async function onLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    try {
      const u = await login(String(fd.get("email")), String(fd.get("password")), remember);
      nav(u.role === "ADMIN" ? "/admin" : "/need-blood");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  }

  async function onRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    try {
      await register({
        fullName: String(fd.get("fullName")),
        email: String(fd.get("email")),
        phone: String(fd.get("phone")),
        role: String(fd.get("role")),
        bloodGroup: String(fd.get("bloodGroup")),
        city: String(fd.get("city")),
        dateOfBirth: String(fd.get("dateOfBirth")),
        password: String(fd.get("password")),
      });
      nav("/need-blood");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  }

  return (
    <div className="gate">
      <section className="gate-hero">
        <BloodBag label={groupLabel(selected)} fillPercent={current?.fillPercent ?? 8} />
        <h1>Every unit counts. See it fill.</h1>
        <p>Tap a blood group to see how much the bank holds right now.</p>
        <div className="pills">
          {GROUPS.map((g) => (
            <button
              key={g.value}
              className={`pill ${selected === g.value ? "active" : ""}`}
              onClick={() => setSelected(g.value)}
              type="button"
            >
              {g.label}
            </button>
          ))}
        </div>
        <div className="hero-stock">
          {current
            ? `${current.units} units (${current.litres.toFixed(2)} L)${current.critical ? " · Critical" : ""}`
            : "Loading live stock…"}
        </div>
      </section>

      <section className="gate-panel">
        <div className="auth-card">
          <div className="brand-row">
            <span className="drop">●</span> BloodCare
          </div>
          <div className="subtitle">Blood Group Management System</div>
          <div className="tabs">
            <button type="button" className={mode === "login" ? "on" : ""} onClick={() => setMode("login")}>
              Login
            </button>
            <button type="button" className={mode === "register" ? "on" : ""} onClick={() => setMode("register")}>
              Register
            </button>
          </div>

          {error ? <p className="err">{error}</p> : null}

          {mode === "login" ? (
            <form onSubmit={onLogin}>
              <div className="field">
                <label>Email</label>
                <input name="email" type="email" required defaultValue="admin@college.edu" />
              </div>
              <div className="field">
                <label>Password</label>
                <input name="password" type="password" required defaultValue="AdminPass123!" />
              </div>
              <label className="check">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                Remember me
              </label>
              <button className="btn btn-brand" type="submit">
                Login
              </button>
              <div className="hint">
                Demo admin: admin@college.edu / AdminPass123!
                <br />
                Or register as a donor or patient.
              </div>
            </form>
          ) : (
            <form onSubmit={onRegister}>
              <div className="field">
                <label>Full name</label>
                <input name="fullName" placeholder="Your full name" required />
              </div>
              <div className="grid-2">
                <div className="field">
                  <label>Email</label>
                  <input name="email" type="email" placeholder="name@email.com" required />
                </div>
                <div className="field">
                  <label>Phone</label>
                  <input name="phone" placeholder="10-digit mobile" required />
                </div>
              </div>
              <div className="grid-2">
                <div className="field">
                  <label>I am a</label>
                  <select name="role" defaultValue="DONOR">
                    <option value="DONOR">Donor</option>
                    <option value="PATIENT">Patient</option>
                  </select>
                </div>
                <div className="field">
                  <label>Blood group</label>
                  <select name="bloodGroup" defaultValue="A_POS">
                    {GROUPS.map((g) => (
                      <option key={g.value} value={g.value}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid-2">
                <div className="field">
                  <label>City</label>
                  <input name="city" placeholder="Your city" required />
                </div>
                <div className="field">
                  <label>Date of birth</label>
                  <input name="dateOfBirth" type="date" required />
                </div>
              </div>
              <div className="field">
                <label>Password</label>
                <input name="password" type="password" placeholder="Strong password" minLength={8} required />
              </div>
              <button className="btn btn-brand" type="submit">
                Create account
              </button>
            </form>
          )}

          <div className="public-links">
            <Link to="/need-blood">Submit a blood request</Link>
            <Link to="/compatibility">Public compatibility</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
