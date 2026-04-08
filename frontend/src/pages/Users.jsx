import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import RoleBadge from "../components/RoleBadge";
import { Plus, X, Check } from "lucide-react";

const Users = () => {
  const { org, user } = useAuth();
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ email: "", role: "member" });
  const [msg, setMsg]   = useState("");
  const orgId = org?._id || org?.id || org;
  const canManage = ["super_admin", "org_admin"].includes(user?.systemRole);

  useEffect(() => {
    if (!orgId) return;
    api.get(`/users/org/${orgId}`)
      .then((res) => setUsers(res.data.users))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [orgId]);

  const invite = async () => {
    try {
      await api.post("/users/invite", { ...form, orgId });
      setMsg("Invited!");
      setTimeout(async () => {
        setMsg("");
        setShowModal(false);
        setForm({ email: "", role: "member" });
        const res = await api.get(`/users/org/${orgId}`);
        setUsers(res.data.users);
      }, 1500);
    } catch (err) {
      setMsg(err.response?.data?.message || "Error");
    }
  };

  if (loading) return <div style={{ color: "#9ca3af" }}>Loading users…</div>;

  return (
    <div style={{ fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <div style={{ color: "#fff", fontSize: 22, fontWeight: 700 }}>Users</div>
          <div style={{ color: "#4b5563", fontSize: 13, marginTop: 3 }}>{users.length} members</div>
        </div>
        {canManage && (
          <button onClick={() => setShowModal(true)}
            style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 10, padding: "9px 18px", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 7 }}>
            <Plus size={15} /> Invite User
          </button>
        )}
      </div>

      <div style={{ background: "#0f0f1a", border: "1px solid #1c1c2e", borderRadius: 14, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #14141f" }}>
              {["User", "Role", "Status", "Joined"].map((h) => (
                <th key={h} style={{ textAlign: "left", color: "#4b5563", fontSize: 12, fontWeight: 500, padding: "12px 18px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.id} style={{ borderBottom: i < users.length - 1 ? "1px solid #14141f" : "none" }}>
                <td style={{ padding: "12px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ color: "#818cf8", fontSize: 13, fontWeight: 700 }}>{u.name?.[0]}</span>
                    </div>
                    <div>
                      <div style={{ color: "#e5e7eb", fontSize: 14, fontWeight: 600 }}>{u.name}</div>
                      <div style={{ color: "#3a3a55", fontSize: 11 }}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "12px 18px" }}><RoleBadge role={u.role} /></td>
                <td style={{ padding: "12px 18px" }}>
                  <span style={{ color: u.status === "active" ? "#34d399" : "#fbbf24", fontSize: 13, textTransform: "capitalize" }}>● {u.status}</span>
                </td>
                <td style={{ padding: "12px 18px", color: "#4b5563", fontSize: 12 }}>
                  {u.joinedAt ? new Date(u.joinedAt).toLocaleDateString() : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ background: "#0d0d1a", border: "1px solid #2a2a3d", borderRadius: 18, padding: 28, width: 340 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>Invite User</span>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: "#4b5563", cursor: "pointer" }}><X size={16} /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <div style={{ color: "#9ca3af", fontSize: 12, marginBottom: 6 }}>Email</div>
                <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="colleague@company.com"
                  style={{ width: "100%", background: "#111120", border: "1px solid #2a2a3d", borderRadius: 10, padding: "10px 14px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <div style={{ color: "#9ca3af", fontSize: 12, marginBottom: 6 }}>Role</div>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                  style={{ width: "100%", background: "#111120", border: "1px solid #2a2a3d", borderRadius: 10, padding: "10px 14px", color: "#fff", fontSize: 14, outline: "none" }}>
                  <option value="member">Member</option>
                  <option value="org_admin">Org Admin</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              {msg && (
                <div style={{ color: msg === "Invited!" ? "#34d399" : "#f87171", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                  {msg === "Invited!" && <Check size={14} />}{msg}
                </div>
              )}
              <button onClick={invite}
                style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 10, padding: "11px 0", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;