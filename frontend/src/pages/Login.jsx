import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Shield } from "lucide-react";

const Login = () => {
  const { login } = useAuth();
  const navigate   = useNavigate();
  const [form, setForm]   = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "#06060f", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 400, padding: 20 }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", marginBottom: 32 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Shield size={18} color="#fff" />
          </div>
          <span style={{ color: "#fff", fontWeight: 800, fontSize: 22 }}>SaaSBoard</span>
        </div>

        <div style={{ background: "#0d0d1a", border: "1px solid #1c1c2e", borderRadius: 20, padding: 32 }}>
          <div style={{ color: "#fff", fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Sign in</div>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <div style={{ color: "#9ca3af", fontSize: 12, marginBottom: 6 }}>Email</div>
              <input
                type="email" required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@company.com"
                style={{ width: "100%", background: "#111120", border: "1px solid #2a2a3d", borderRadius: 10, padding: "10px 14px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <div style={{ color: "#9ca3af", fontSize: 12, marginBottom: 6 }}>Password</div>
              <input
                type="password" required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                style={{ width: "100%", background: "#111120", border: "1px solid #2a2a3d", borderRadius: 10, padding: "10px 14px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }}
              />
            </div>
            {error && <div style={{ color: "#f87171", fontSize: 13 }}>{error}</div>}
            <button type="submit" disabled={loading}
              style={{ background: "#6366f1", color: "#fff", borderRadius: 10, padding: "11px 0", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", opacity: loading ? 0.6 : 1 }}>
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;