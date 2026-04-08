import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const Analytics = () => {
  const { org } = useAuth();
  const [data, setData] = useState([]);
  const orgId = org?._id || org?.id || org;

  useEffect(() => {
    if (orgId) {
      api.get(`/analytics/org/${orgId}?months=6`)
        .then((res) => setData(res.data.data))
        .catch(console.error);
    }
  }, [orgId]);

  const TT = { contentStyle: { background: "#111122", border: "1px solid #2a2a3d", borderRadius: 8, color: "#e5e7eb", fontSize: 12 } };

  return (
    <div style={{ fontFamily: "sans-serif" }}>
      <div style={{ color: "#fff", fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Analytics</div>
      <div style={{ color: "#4b5563", fontSize: 13, marginBottom: 24 }}>Last 6 months</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div style={{ background: "#0f0f1a", border: "1px solid #1c1c2e", borderRadius: 14, padding: 20 }}>
          <div style={{ color: "#d1d5db", fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Revenue</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#14141f" />
              <XAxis dataKey="period" tick={{ fill: "#4b5563", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#4b5563", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...TT} />
              <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: "#0f0f1a", border: "1px solid #1c1c2e", borderRadius: 14, padding: 20 }}>
          <div style={{ color: "#d1d5db", fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Active Users</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#14141f" />
              <XAxis dataKey="period" tick={{ fill: "#4b5563", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#4b5563", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...TT} />
              <Bar dataKey="activeUsers" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ background: "#0f0f1a", border: "1px solid #1c1c2e", borderRadius: 14, padding: 20 }}>
        <div style={{ color: "#d1d5db", fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Sessions</div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#14141f" />
            <XAxis dataKey="period" tick={{ fill: "#4b5563", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#4b5563", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip {...TT} />
            <Bar dataKey="sessions" fill="#818cf8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Analytics;