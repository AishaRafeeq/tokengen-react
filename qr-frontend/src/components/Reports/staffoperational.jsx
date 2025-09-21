import React, { useEffect, useState } from "react";
import API from "../../Services/api";
import Sidebar from "../Sidebar";

export default function OperationalReport() {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const flattenData = (data) => {
    const rows = [];
    Object.entries(data).forEach(([section, value]) => {
      if (typeof value === "object" && value !== null) {
        Object.entries(value).forEach(([subKey, subValue]) => {
          rows.push({
            metric: `${section} → ${subKey}`,
            value: subValue,
          });
        });
      } else {
        rows.push({ metric: section, value });
      }
    });
    return rows;
  };

  const fetchOperationalReport = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get("staff-operational-report/");
      const data = flattenData(res.data);
      setReportData(data);
    } catch (err) {
      console.error("Error fetching operational report:", err);
      setError("Failed to load operational report. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperationalReport();
  }, []);

  return (
    <div style={fullWrapper}>
      {/* Sidebar fixed */}
      <div style={sidebarWrapper}>
        <Sidebar />
      </div>

      {/* Page content */}
      <div style={pageWrapper}>
        <div style={cardWrapper}>
          <h1 style={pageTitle}>Operational Report</h1>

          {loading ? (
            <div style={emptyText}>Loading report...</div>
          ) : error ? (
            <div style={{ ...emptyText, color: "red" }}>{error}</div>
          ) : reportData.length === 0 ? (
            <div style={emptyText}>No report data available.</div>
          ) : (
            <div style={card}>
              <table style={table}>
                <thead>
                  <tr>
                    <th style={th}>Metric</th>
                    <th style={th}>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((row, idx) => (
                    <tr
                      key={idx}
                      style={idx % 2 === 0 ? rowEven : rowOdd}
                    >
                      <td style={td}>{row.metric}</td>
                      <td style={td}>{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* --- Styles --- */
const fullWrapper = {
  display: "flex",
  width: "100vw",
  minHeight: "100vh",
  overflowX: "hidden",
  background: "#F9FAFB",
};

const sidebarWrapper = {
  width: 220,
  minHeight: "100vh",
  position: "fixed",
  left: 0,
  top: 0,
  zIndex: 100,
  background: "#fff",
  boxShadow: "5px 0 15px rgba(0,0,0,0.07)",
};

const pageWrapper = {
  flex: 1,
  marginLeft: "220px",
  padding: 24,
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "flex-start",
};

const cardWrapper = {
  margin: "32px 0",
  padding: 24,
  background: "#fff",
  borderRadius: 16,
  border: "1px solid #E2E8F0",
  boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
  width: "100%",
  maxWidth: 700,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const pageTitle = {
  fontSize: 28,
  fontWeight: 700,
  marginBottom: 24,
};

const card = {
  border: "1px solid #E2E8F0",
  borderRadius: 12,
  padding: 16,
  background: "#fff",
  marginBottom: 16,
  width: "100%",
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
};

const th = {
  textAlign: "left",
  padding: "12px",
  background: "#F3F4F6",
  fontWeight: 600,
  borderBottom: "1px solid #E5E7EB",
};

const td = {
  padding: "12px",
  borderBottom: "1px solid #E5E7EB",
};

const rowEven = { background: "#ffffff" };
const rowOdd = { background: "#F9FAFB" };

const emptyText = { color: "#64748B", padding: "16px 0", fontSize: 16 };
