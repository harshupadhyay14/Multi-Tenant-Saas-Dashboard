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

  if (loading) return <div style={{ color: "#A89F8C" }}>Loading…</div>;

  return (
    <div style={{ fontFamily: "sans-serif" }}>
      <div style={{ color: "#F2EFE9", fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Organizations</div>
      <div style={{ color: "#8C8575", fontSize: 13, marginBottom: 24 }}>{orgs.length} tenants</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {orgs.map((org) => (
          <div key={org._id} style={{ background: "#1D1A15", border: "1px solid #2C2820", borderRadius: 14, padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(201,138,62,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#E0AC6B", fontWeight: 700, fontSize: 16 }}>{org.name?.[0]}</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#F2EFE9", fontWeight: 600, fontSize: 15 }}>{org.name}</div>
              <div style={{ color: "#8C8575", fontSize: 12, marginTop: 2 }}>
                {org.plan} · {org.status} · Owner: {org.ownerId?.name || "—"}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "#6FA287", fontWeight: 700, fontSize: 16 }}>${org.mrr}/mo</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Organizations;