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
    background: "rgba(201,138,62,0.15)",
    color: "#E0AC6B",
    borderLeft: "2px solid #C98A3E",
  };

  return (
    <div style={{
      width: 220, minHeight: "100vh", background: "#120F0B",
      borderRight: "1px solid #241F17", display: "flex",
      flexDirection: "column", padding: "16px 0", fontFamily: "sans-serif"
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 16px", marginBottom: 24 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: "#C98A3E", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Shield size={16} color="#F2EFE9" />
        </div>
        <span style={{ color: "#F2EFE9", fontWeight: 800, fontSize: 17 }}>SaaSBoard</span>
      </div>

      {/* Org name */}
      {org && (
        <div style={{ margin: "0 10px 16px", background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "8px 12px" }}>
          <div style={{ color: "#8C8575", fontSize: 11 }}>Organization</div>
          <div style={{ color: "#E8E3D8", fontSize: 13, fontWeight: 600, marginTop: 2 }}>
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
            color: isActive ? "#E0AC6B" : "#8C8575",
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
          <div style={{ color: "#F0ECE1", fontSize: 13, fontWeight: 600 }}>{user?.name}</div>
          <div style={{ color: "#4A4436", fontSize: 11, marginTop: 1 }}>{user?.email}</div>
        </div>
        <button onClick={logout} style={{
          display: "flex", alignItems: "center", gap: 10,
          width: "100%", padding: "9px 12px", borderRadius: 10,
          color: "#8C8575", background: "none", border: "none",
          fontSize: 14, cursor: "pointer"
        }}>
          <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;