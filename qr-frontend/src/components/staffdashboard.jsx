import React, { useEffect, useState } from "react";
import axios from "../services/api";
import Sidebar from "./Sidebar";

export default function StaffDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboard();
    // eslint-disable-next-line
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("/staff-dashboard-stats/", {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });
      setDashboard(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={container}>
      <div style={sidebarFixed}>
        <Sidebar />
      </div>
      <div style={content}>
        <div style={cardWrapper}>
          <h2 style={title}>👋 Welcome{dashboard.full_name ? `, ${dashboard.full_name}` : ""}</h2>
          <div style={statsGrid}>
            <div style={statBox}>
              <div style={statLabel}>Total Tokens</div>
              <div style={statValue}>{dashboard.total_tokens ?? 0}</div>
              <div style={statSmall}>
                Active: <b>{dashboard.active_tokens ?? 0}</b> | Completed: <b>{dashboard.completed_tokens ?? 0}</b>
              </div>
            </div>
            <div style={statBox}>
              <div style={statLabel}>Total QR Codes</div>
              <div style={statValue}>{dashboard.total_qr_codes ?? 0}</div>
            </div>
            <div style={statBox}>
              <div style={statLabel}>Total Scans</div>
              <div style={statValue}>{dashboard.total_scans ?? 0}</div>
            </div>
            <div style={statBox}>
              <div style={statLabel}>Verifications</div>
              <div style={statValue}>{dashboard.successful_scans ?? 0}</div>
              <div style={statSmall}>
                Failed: <b>{dashboard.failed_scans ?? 0}</b> | Success Rate: <b>{dashboard.success_rate ?? 0}%</b>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Styles ---------------- */
const container = {
  display: "flex",
  minHeight: "100vh",
  width: "100vw",
  background: "linear-gradient(90deg, #F9FAFB 60%, #EFF6FF 100%)",
  fontFamily: "Segoe UI, sans-serif",
};

const sidebarFixed = {
  width: "220px",
  minHeight: "100vh",
  position: "fixed",
  left: 0,
  top: 0,
  zIndex: 100,
  background: "#fff",
  boxShadow: "5px 0 15px rgba(0,0,0,0.07)",
};

const content = {
  flex: 1,
  marginLeft: "220px",
  padding: "48px 0",
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
  minHeight: "100vh",
};

const cardWrapper = {
  width: "100%",
  maxWidth: 1200,
  background: "linear-gradient(90deg, #F0F9FF 60%, #E0F2FE 100%)",
  borderRadius: 20,
  padding: "40px 36px",
  boxShadow: "0 8px 32px rgba(37,99,235,0.10)",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const title = {
  fontSize: 32,
  fontWeight: 800,
  marginBottom: 32,
  color: "#2563EB",
  letterSpacing: 1,
  textAlign: "center",
};

const statsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 32,
  marginBottom: 32,
  width: "100%",
};

const statBox = {
  padding: "32px 24px",
  borderRadius: 16,
  background: "linear-gradient(120deg, #fff 80%, #e0f2fe 100%)",
  boxShadow: "0 2px 12px rgba(37,99,235,0.07)",
  border: "1px solid #e2e8f0",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  transition: "box-shadow 0.2s",
};

const statValue = {
  fontSize: 36,
  fontWeight: 800,
  margin: "16px 0 8px 0",
  color: "#2563EB",
  letterSpacing: 1,
};

const statLabel = {
  fontSize: 18,
  fontWeight: 600,
  color: "#334155",
  marginBottom: 8,
  letterSpacing: 0.5,
};

const statSmall = {
  fontSize: 14,
  color: "#64748b",
  marginTop: 6,
  textAlign: "center",
};
