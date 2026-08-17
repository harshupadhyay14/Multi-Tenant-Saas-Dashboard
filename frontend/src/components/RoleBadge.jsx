const STYLES = {
  super_admin: { bg: "rgba(168,98,62,0.15)", color: "#A8623E", label: "Super Admin" },
  org_admin:   { bg: "rgba(201,138,62,0.15)",  color: "#E0AC6B", label: "Org Admin"   },
  member:      { bg: "rgba(111,162,135,0.15)",  color: "#8FC0A8", label: "Member"      },
  viewer:      { bg: "rgba(140,133,117,0.15)", color: "#A89F8C", label: "Viewer"      },
  user:        { bg: "rgba(140,133,117,0.15)", color: "#A89F8C", label: "User"        },
};

const RoleBadge = ({ role }) => {
  const s = STYLES[role] || STYLES.user;
  return (
    <span style={{
      background: s.bg, color: s.color,
      borderRadius: 20, padding: "2px 10px",
      fontSize: 12, fontWeight: 600
    }}>
      {s.label}
    </span>
  );
};

export default RoleBadge;