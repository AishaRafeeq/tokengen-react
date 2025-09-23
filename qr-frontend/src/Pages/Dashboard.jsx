import React, { useEffect, useState } from "react";
import axios from "../Services/api";
import Sidebar from "../components/Sidebar";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [weeklyTrend, setWeeklyTrend] = useState([]);

  useEffect(() => {
    fetchDashboard();
    fetchWeeklyTrends();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("/admin-dashboard-stats/", {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });
      setDashboard(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchWeeklyTrends = async () => {
    try {
      const res = await axios.get("/weekly-scan-chart/", {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });
      setWeeklyTrend(res.data);
    } catch (err) {
      console.error("Failed to fetch weekly trends:", err);
    }
  };

  if (loading) return <p style={loadingStyle}>Loading dashboard...</p>;
  if (error) return <p style={errorStyle}>{error}</p>;

  const trendData = dashboard?.scan_trends ?? [
    { date: "Mon", scans: 120 },
    { date: "Tue", scans: 200 },
    { date: "Wed", scans: 150 },
    { date: "Thu", scans: 250 },
    { date: "Fri", scans: 300 },
    { date: "Sat", scans: 280 },
    { date: "Sun", scans: 350 },
  ];

  const pieData = [
    { name: "Success", value: dashboard?.total_success ?? 0, color: "#10B981" },
    { name: "Failed", value: dashboard?.total_failed ?? 0, color: "#EF4444" },
  ];

  return (
    <div style={container}>
      <div style={sidebarFixed}>
        <Sidebar />
      </div>

      <div style={content}>
        <div style={cardWrapper}>
          <h2 style={title}>
            👋 Welcome{dashboard?.full_name ? `, ${dashboard.full_name}` : ""}
          </h2>

          <div style={statsGrid}>
            <StatBox
              label="Total Tokens"
              value={dashboard?.total_tokens}
              small={`Waiting: ${dashboard?.total_waiting} | Called: ${dashboard?.total_called} | Completed: ${dashboard?.total_completed}`}
            />
            <StatBox label="Total QR Codes" value={dashboard?.total_qr_codes} />
            <StatBox label="Total Scans" value={dashboard?.total_scans} />
            <StatBox
              label="Verifications"
              value={dashboard?.total_success}
              small={`Failed: ${dashboard?.total_failed} | Success Rate: ${dashboard?.success_rate}%`}
            />
          </div>

          <div style={chartsContainer}>
            {/* Daily Scan Trends */}
            

            {/* Weekly Scan Trends */}
            <div style={chartWrapper}>
              <h3 style={chartTitle}>Weekly Scans</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={weeklyTrend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(148,163,184,0.2)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderRadius: 6,
                      border: "none",
                      boxShadow: "0 3px 8px rgba(0,0,0,0.1)",
                      fontSize: "10px",
                    }}
                  />
                  <Line type="monotone" dataKey="scans" stroke="#10B981" strokeWidth={2} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Verification Status Pie */}
            <div style={pieWrapper}>
              <h3 style={chartTitle}>Verification Status</h3>
              <div style={{ width: "100%", height: 180 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <defs>
                      <linearGradient id="successGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10B981" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#34D399" stopOpacity={0.8} />
                      </linearGradient>
                      <linearGradient id="failedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#EF4444" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#F87171" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>

                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={25}
                      outerRadius={45}
                      paddingAngle={2}
                      stroke="#f0f0f0"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      labelStyle={{ fontSize: 11, fill: "#334155", fontWeight: 600 }}
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.name === "Success" ? "url(#successGradient)" : "url(#failedGradient)"}
                          stroke="#fff"
                          strokeWidth={1}
                        />
                      ))}
                    </Pie>

                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        borderRadius: 8,
                        border: "none",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        fontSize: 11,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------- Components -------- */
const StatBox = ({ label, value, small }) => (
  <div style={statBox}>
    <div style={statLabel}>{label}</div>
    <div style={statValue}>{value ?? 0}</div>
    {small && <div style={statSmall}>{small}</div>}
  </div>
);

/* -------- Styles -------- */
const loadingStyle = { fontSize: 16, textAlign: "center", marginTop: 30 };
const errorStyle = { fontSize: 14, color: "red", textAlign: "center", marginTop: 30 };

const container = {
  display: "flex",
  minHeight: "100vh",
  width: "100vw",
  background: "#F9FAFB",
  fontFamily: "Segoe UI, sans-serif",
};

const sidebarFixed = {
  width: 180,
  minHeight: "100vh",
  position: "fixed",
  left: 0,
  top: 0,
  zIndex: 100,
  background: "#fff",
  boxShadow: "5px 0 12px rgba(0,0,0,0.07)",
};

const content = {
  flex: 1,
  marginLeft: 180,
  padding: 12,
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
};

const cardWrapper = {
  width: "100%",
  maxWidth: 850,
  background: "#fff",
  borderRadius: 14,
  padding: "20px",
  minHeight: 500,
  boxShadow: "0 6px 24px rgba(0,0,0,0.05)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  overflow: "hidden",
};

const title = {
  fontSize: 22,
  fontWeight: 700,
  marginBottom: 14,
  color: "#2563EB",
  textAlign: "center",
};

const statsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 16,
  marginBottom: 20,
  width: "100%",
};

const statBox = {
  padding: "10px",
  borderRadius: 12,
  background: "#EFF6FF",
  boxShadow: "0 4px 14px rgba(37,99,235,0.05)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const statValue = {
  fontSize: 22,
  fontWeight: 700,
  margin: "10px 0 6px",
  color: "#2563EB",
};

const statLabel = {
  fontSize: 12,
  fontWeight: 600,
  color: "#334155",
};

const statSmall = {
  fontSize: 10,
  color: "#64748b",
  marginTop: 4,
  textAlign: "center",
};

const chartsContainer = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  width: "100%",
};

const chartWrapper = {
  flex: 1,
  minWidth: 200,
  padding: 8,
  borderRadius: 10,
  background: "#fff",
  boxShadow: "0 3px 12px rgba(37,99,235,0.05)",
};

const pieWrapper = {
  flex: 1,
  minWidth: 200,
  padding: 8,
  borderRadius: 10,
  background: "#fff",
  boxShadow: "0 3px 12px rgba(37,99,235,0.05)",
};

const chartTitle = {
  fontSize: 12,
  fontWeight: 600,
  marginBottom: 2,
};
