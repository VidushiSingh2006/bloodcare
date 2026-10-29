import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { I } from "../../components/Icons";
import { useAuth } from "../../lib/auth";
import { useTheme } from "../../lib/theme";
import { useEffect } from "react";

const links = [
  { to: "/admin", label: "Dashboard", icon: I.dash, end: true },
  { to: "/admin/donors", label: "Donors", icon: I.people },
  { to: "/admin/donations", label: "Blood donations", icon: I.drop },
  { to: "/admin/requests", label: "Requests", icon: I.clip },
  { to: "/admin/compatibility", label: "Compatibility", icon: I.link },
];

export function AdminLayout() {
  const { user, ready, logout } = useAuth();
  const { toggle } = useTheme();
  const nav = useNavigate();

  useEffect(() => {
    if (ready && user?.role !== "ADMIN") nav("/", { replace: true });
  }, [ready, user, nav]);

  if (!ready || user?.role !== "ADMIN") return null;

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="side-brand">
          <span style={{ color: "#ef4444" }}>●</span> BloodCare
        </div>
        <nav className="nav">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? "active" : "")}>
              {l.icon}
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="side-foot">
          <button type="button" onClick={toggle}>
            Toggle theme
          </button>
          <button
            type="button"
            onClick={() => {
              logout();
              nav("/");
            }}
          >
            Log out
          </button>
        </div>
      </aside>
      <section className="main">
        <Outlet />
      </section>
    </div>
  );
}

export function PageHead({ title }: { title: string }) {
  const { user } = useAuth();
  return (
    <div className="topbar">
      <h1>{title}</h1>
      <div className="who">
        Administrator ({user?.fullName === "Administrator" ? "admin" : user?.fullName})
      </div>
    </div>
  );
}
