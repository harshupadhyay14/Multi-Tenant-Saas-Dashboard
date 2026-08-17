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

  if (loading) return <div style={{ color: "#A89F8C" }}>Loading users…</div>;

  return (
    <div style={{ fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <div style={{ color: "#F2EFE9", fontSize: 22, fontWeight: 700 }}>Users</div>
          <div style={{ color: "#8C8575", fontSize: 13, marginTop: 3 }}>{users.length} members</div>
        </div>
        {canManage && (
          <button onClick={() => setShowModal(true)}
            style={{ background: "#C98A3E", color: "#F2EFE9", border: "none", borderRadius: 10, padding: "9px 18px", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 7 }}>
            <Plus size={15} /> Invite User
          </button>
        )}
      </div>

      <div style={{ background: "#1D1A15", border: "1px solid #2C2820", borderRadius: 14, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #241F17" }}>
              {["User", "Role", "Status", "Joined"].map((h) => (
                <th key={h} style={{ textAlign: "left", color: "#8C8575", fontSize: 12, fontWeight: 500, padding: "12px 18px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.id} style={{ borderBottom: i < users.length - 1 ? "1px solid #241F17" : "none" }}>
                <td style={{ padding: "12px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(201,138,62,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ color: "#E0AC6B", fontSize: 13, fontWeight: 700 }}>{u.name?.[0]}</span>
                    </div>
                    <div>
                      <div style={{ color: "#F0ECE1", fontSize: 14, fontWeight: 600 }}>{u.name}</div>
                      <div style={{ color: "#4A4436", fontSize: 11 }}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "12px 18px" }}><RoleBadge role={u.role} /></td>
                <td style={{ padding: "12px 18px" }}>
                  <span style={{ color: u.status === "active" ? "#6FA287" : "#D9A63F", fontSize: 13, textTransform: "capitalize" }}>● {u.status}</span>
                </td>
                <td style={{ padding: "12px 18px", color: "#8C8575", fontSize: 12 }}>
                  {u.joinedAt ? new Date(u.joinedAt).toLocaleDateString() : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ background: "#17140F", border: "1px solid #3A3428", borderRadius: 18, padding: 28, width: 340 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <span style={{ color: "#F2EFE9", fontWeight: 700, fontSize: 16 }}>Invite User</span>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: "#8C8575", cursor: "pointer" }}><X size={16} /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <div style={{ color: "#A89F8C", fontSize: 12, marginBottom: 6 }}>Email</div>
                <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="colleague@company.com"
                  style={{ width: "100%", background: "#201C14", border: "1px solid #3A3428", borderRadius: 10, padding: "10px 14px", color: "#F2EFE9", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <div style={{ color: "#A89F8C", fontSize: 12, marginBottom: 6 }}>Role</div>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                  style={{ width: "100%", background: "#201C14", border: "1px solid #3A3428", borderRadius: 10, padding: "10px 14px", color: "#F2EFE9", fontSize: 14, outline: "none" }}>
                  <option value="member">Member</option>
                  <option value="org_admin">Org Admin</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              {msg && (
                <div style={{ color: msg === "Invited!" ? "#6FA287" : "#C4665A", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                  {msg === "Invited!" && <Check size={14} />}{msg}
                </div>
              )}
              <button onClick={invite}
                style={{ background: "#C98A3E", color: "#F2EFE9", border: "none", borderRadius: 10, padding: "11px 0", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
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