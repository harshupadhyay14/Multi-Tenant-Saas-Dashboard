import { useEffect, useState } from "react";
import api from "../api/axios";

const Organizations = () => {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/organizations")
      .then((res) => setOrgs(res.data.orgs))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: "#9ca3af" }}>Loading…</div>;

  return (
    <div style={{ fontFamily: "sans-serif" }}>
      <div style={{ color: "#fff", fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Organizations</div>
      <div style={{ color: "#4b5563", fontSize: 13, marginBottom: 24 }}>{orgs.length} tenants</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {orgs.map((org) => (
          <div key={org._id} style={{ background: "#0f0f1a", border: "1px solid #1c1c2e", borderRadius: 14, padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#818cf8", fontWeight: 700, fontSize: 16 }}>{org.name?.[0]}</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#fff", fontWeight: 600, fontSize: 15 }}>{org.name}</div>
              <div style={{ color: "#4b5563", fontSize: 12, marginTop: 2 }}>
                {org.plan} · {org.status} · Owner: {org.ownerId?.name || "—"}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "#34d399", fontWeight: 700, fontSize: 16 }}>${org.mrr}/mo</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Organizations;