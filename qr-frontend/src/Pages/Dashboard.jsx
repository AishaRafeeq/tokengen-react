import React, { useEffect, useState } from "react";
import axios from "../Services/api";
import Sidebar from "../components/Sidebar";

export default function AdminDashboard() {
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
                Waiting: <b>{dashboard.total_waiting ?? 0}</b> | Called: <b>{dashboard.total_called ?? 0}</b> | Completed: <b>{dashboard.total_completed ?? 0}</b>
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
              <div style={statValue}>{dashboard.total_success ?? 0}</div>
              <div style={statSmall}>
                Failed: <b>{dashboard.total_failed ?? 0}</b> | Success Rate: <b>{dashboard.success_rate ?? 0}%</b>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>
        {`
          @media (max-width: 900px) {
            .dashboard-content {
              margin-left: 0 !important;
              padding: 0 !important;
              width: 100vw !important;
              min-height: 100vh !important;
              justify-content: flex-start !important;
              align-items: flex-start !important;
            }
            .dashboard-card {
              max-width: 100vw !important;
              border-radius: 0 !important;
              padding: 16px 4px !important;
              margin: 0 !important;
              box-shadow: none !important;
            }
            .dashboard-stats-grid {
              grid-template-columns: 1fr !important;
              gap: 18px !important;
              margin-bottom: 18px !important;
            }
            .dashboard-stat-box {
              padding: 18px 10px !important;
              border-radius: 10px !important;
              font-size: 15px !important;
            }
            .dashboard-title {
              font-size: 22px !important;
              margin-bottom: 18px !important;
            }
          }
        `}
      </style>
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
  overflow: "hidden",
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
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
  padding: "0",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "100vh",
  width: "100%",
}
content.className = "dashboard-content";

const cardWrapper = {
  width: "100%",
  maxWidth: 1200,
  background: "linear-gradient(90deg, #F0F9FF 60%, #E0F2FE 100%)",
  borderRadius: 20,
  padding: "32px 24px",
  boxShadow: "0 8px 32px rgba(37,99,235,0.10)",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  maxHeight: "90vh",
  overflow: "auto",
}
cardWrapper.className = "dashboard-card";

const title = {
  fontSize: 32,
  fontWeight: 800,
  marginBottom: 32,
  color: "#2563EB",
  letterSpacing: 1,
  textAlign: "center",
}
title.className = "dashboard-title";

const statsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 32,
  marginBottom: 32,
  width: "100%",
}
statsGrid.className = "dashboard-stats-grid";

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
}
statBox.className = "dashboard-stat-box";

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
