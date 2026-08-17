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

  const TT = { contentStyle: { background: "#201C14", border: "1px solid #3A3428", borderRadius: 8, color: "#F0ECE1", fontSize: 12 } };

  return (
    <div style={{ fontFamily: "sans-serif" }}>
      <div style={{ color: "#F2EFE9", fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Analytics</div>
      <div style={{ color: "#8C8575", fontSize: 13, marginBottom: 24 }}>Last 6 months</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div style={{ background: "#1D1A15", border: "1px solid #2C2820", borderRadius: 14, padding: 20 }}>
          <div style={{ color: "#E8E3D8", fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Revenue</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#241F17" />
              <XAxis dataKey="period" tick={{ fill: "#8C8575", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#8C8575", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...TT} />
              <Line type="monotone" dataKey="revenue" stroke="#C98A3E" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: "#1D1A15", border: "1px solid #2C2820", borderRadius: 14, padding: 20 }}>
          <div style={{ color: "#E8E3D8", fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Active Users</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#241F17" />
              <XAxis dataKey="period" tick={{ fill: "#8C8575", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#8C8575", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...TT} />
              <Bar dataKey="activeUsers" fill="#C9862E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ background: "#1D1A15", border: "1px solid #2C2820", borderRadius: 14, padding: 20 }}>
        <div style={{ color: "#E8E3D8", fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Sessions</div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#241F17" />
            <XAxis dataKey="period" tick={{ fill: "#8C8575", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#8C8575", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip {...TT} />
            <Bar dataKey="sessions" fill="#E0AC6B" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Analytics;