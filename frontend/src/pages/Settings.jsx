import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import RoleBadge from "../components/RoleBadge";
import { Check } from "lucide-react";

const Settings = () => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [saved, setSaved] = useState(false);

  const save = async () => {
    // In a real app: await api.patch("/users/me", { name });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ fontFamily: "sans-serif" }}>
      <div style={{ color: "#fff", fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Settings</div>

      <div style={{ background: "#0f0f1a", border: "1px solid #1c1c2e", borderRadius: 14, padding: 28, maxWidth: 460 }}>
        <div style={{ color: "#d1d5db", fontWeight: 600, fontSize: 14, marginBottom: 20 }}>Profile</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <div style={{ color: "#9ca3af", fontSize: 12, marginBottom: 6 }}>Full Name</div>
            <input value={name} onChange={(e) => setName(e.target.value)}
              style={{ width: "100%", background: "#111120", border: "1px solid #2a2a3d", borderRadius: 10, padding: "10px 14px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>
          <div>
            <div style={{ color: "#9ca3af", fontSize: 12, marginBottom: 6 }}>Email</div>
            <input value={user?.email || ""} disabled
              style={{ width: "100%", background: "#111120", border: "1px solid #1c1c2e", borderRadius: 10, padding: "10px 14px", color: "#4b5563", fontSize: 14, boxSizing: "border-box" }} />
          </div>
          <div>
            <div style={{ color: "#9ca3af", fontSize: 12, marginBottom: 8 }}>System Role</div>
            <RoleBadge role={user?.systemRole} />
          </div>
          <button onClick={save}
            style={{ background: saved ? "#059669" : "#6366f1", color: "#fff", border: "none", borderRadius: 10, padding: "10px 22px", fontWeight: 700, fontSize: 14, cursor: "pointer", alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 7 }}>
            {saved ? <><Check size={14} /> Saved!</> : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;