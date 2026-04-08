const STYLES = {
  super_admin: { bg: "rgba(168,85,247,0.15)", color: "#c084fc", label: "Super Admin" },
  org_admin:   { bg: "rgba(99,102,241,0.15)",  color: "#818cf8", label: "Org Admin"   },
  member:      { bg: "rgba(52,211,153,0.15)",  color: "#6ee7b7", label: "Member"      },
  viewer:      { bg: "rgba(107,114,128,0.15)", color: "#9ca3af", label: "Viewer"      },
};

const RoleBadge = ({ role }) => {
  const s = STYLES[role] || STYLES.viewer;
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