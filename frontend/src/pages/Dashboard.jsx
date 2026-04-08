import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { Users, DollarSign, Activity, TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const KPI = ({ title, value, Icon, color }) => (
  <div style={{ background: "#0f0f1a", border: "1px solid #1c1c2e", borderRadius: 14, padding: 20 }}>
    <div style={{ width: 36, height: 36, borderRadius: 10, background: color + "22", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
      <Icon size={16} style={{ color }} />
    </div>
    <div style={{ color: "#fff", fontSize: 26, fontWeight: 700 }}>{value}</div>
    <div style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>{title}</div>
  </div>
);

const Dashboard = () => {
  const { user, org } = useAuth();
  const [analytics, setAnalytics] = useState([]);
  const orgId = org?._id || org?.id || org;

  useEffect(() => {
    if (orgId) {
      api.get(`/analytics/org/${orgId}?months=6`)
        .then((res) => setAnalytics(res.data.data))
        .catch(console.error);
    }
  }, [orgId]);

  return (
    <div style={{ fontFamily: "sans-serif" }}>
      <div style={{ color: "#fff", fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Dashboard</div>
      <div style={{ color: "#4b5563", fontSize: 13, marginBottom: 24 }}>Welcome back, {user?.name}</div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        <KPI title="Monthly Revenue" value="$2,400" Icon={DollarSign} color="#34d399" />
        <KPI title="Total Users"     value="24"     Icon={Users}       color="#6366f1" />
        <KPI title="Active Sessions" value="283"    Icon={Activity}    color="#fbbf24" />
        <KPI title="Uptime"          value="99.9%"  Icon={TrendingUp}  color="#a78bfa" />
      </div>

      {/* Chart */}
      <div style={{ background: "#0f0f1a", border: "1px solid #1c1c2e", borderRadius: 14, padding: 24 }}>
        <div style={{ color: "#d1d5db", fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Sessions (Last 6 Months)</div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={analytics}>
            <defs>
              <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#14141f" />
            <XAxis dataKey="period" tick={{ fill: "#4b5563", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#4b5563", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "#111122", border: "1px solid #2a2a3d", borderRadius: 8, color: "#e5e7eb", fontSize: 12 }} />
            <Area type="monotone" dataKey="sessions" stroke="#6366f1" fill="url(#sg)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;