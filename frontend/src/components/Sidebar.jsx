import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard, Users, BarChart3,
  Building2, Settings, LogOut, Shield
} from "lucide-react";

const Sidebar = () => {
  const { user, org, logout } = useAuth();
  const isSuperAdmin = user?.systemRole === "super_admin";

  const links = [
    { to: "/dashboard",      label: "Dashboard",     Icon: LayoutDashboard },
    { to: "/users",          label: "Users",          Icon: Users           },
    { to: "/analytics",      label: "Analytics",      Icon: BarChart3       },
    ...(isSuperAdmin ? [{ to: "/organizations", label: "Organizations", Icon: Building2 }] : []),
    { to: "/settings",       label: "Settings",       Icon: Settings        },
  ];

  const activeStyle = {
    background: "rgba(99,102,241,0.15)",
    color: "#818cf8",
    borderLeft: "2px solid #6366f1",
  };

  return (
    <div style={{
      width: 220, minHeight: "100vh", background: "#0a0a15",
      borderRight: "1px solid #14141f", display: "flex",
      flexDirection: "column", padding: "16px 0", fontFamily: "sans-serif"
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 16px", marginBottom: 24 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Shield size={16} color="#fff" />
        </div>
        <span style={{ color: "#fff", fontWeight: 800, fontSize: 17 }}>SaaSBoard</span>
      </div>

      {/* Org name */}
      {org && (
        <div style={{ margin: "0 10px 16px", background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "8px 12px" }}>
          <div style={{ color: "#6b7280", fontSize: 11 }}>Organization</div>
          <div style={{ color: "#d1d5db", fontSize: 13, fontWeight: 600, marginTop: 2 }}>
            {org.name || org}
          </div>
        </div>
      )}

      {/* Nav links */}
      <nav style={{ flex: 1, padding: "0 8px", display: "flex", flexDirection: "column", gap: 4 }}>
        {links.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({
            display: "flex", alignItems: "center", gap: 10,
            padding: "9px 12px", borderRadius: 10,
            color: isActive ? "#818cf8" : "#4b5563",
            textDecoration: "none",
            borderLeft: "2px solid transparent",
            fontSize: 14,
            ...(isActive ? activeStyle : {}),
          })}>
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User info + logout */}
      <div style={{ padding: "0 8px" }}>
        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "10px 12px", marginBottom: 6 }}>
          <div style={{ color: "#e5e7eb", fontSize: 13, fontWeight: 600 }}>{user?.name}</div>
          <div style={{ color: "#3a3a55", fontSize: 11, marginTop: 1 }}>{user?.email}</div>
        </div>
        <button onClick={logout} style={{
          display: "flex", alignItems: "center", gap: 10,
          width: "100%", padding: "9px 12px", borderRadius: 10,
          color: "#4b5563", background: "none", border: "none",
          fontSize: 14, cursor: "pointer"
        }}>
          <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;