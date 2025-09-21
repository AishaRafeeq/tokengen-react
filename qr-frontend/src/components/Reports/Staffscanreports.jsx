import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../Services/api";
import Sidebar from "../Sidebar"; // Adjust the path as needed


export default function StaffScanReports() {
  const [activeReport, setActiveReport] = useState("scan");
  const [scanData, setScanData] = useState([]);
  const [verificationData, setVerificationData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchScanActivity = async () => {
    try {
      setLoading(true);
      const res = await API.get("/tokens/scan-activity/");
      setScanData(res.data);
    } catch (err) {
      console.error("Error fetching scan activity:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVerificationLogs = async () => {
    try {
      setLoading(true);
      const res = await API.get("/tokens/verification-logs/");
      setVerificationData(res.data);
    } catch (err) {
      console.error("Error fetching verification logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeReport === "scan") fetchScanActivity();
    else fetchVerificationLogs();
  }, [activeReport]);

  const formatDate = (dt) => new Date(dt).toLocaleString();

  const renderSection = () => {
    const data = activeReport === "scan" ? scanData : verificationData;

    if (loading) return <div style={emptyText}>Loading...</div>;
    if (!data.length) return <div style={emptyText}>No records found.</div>;

    return data.map((row, idx) => (
      <div key={idx} style={card}>
        <div style={{ marginBottom: 12, fontWeight: 600 }}>
          {activeReport === "scan" ? "Scan Record" : "Verification Record"}
        </div>
        <table style={table}>
          <thead>
            <tr>
              <th>Token ID</th>
              <th>Category</th>
              <th>Time</th>
              <th>{activeReport === "scan" ? "Scanner Name" : "Verifier Name"}</th>
              <th>IP / Location</th>
              <th>Device</th>
              <th>{activeReport === "scan" ? "Scan Result" : "Verification Result"}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{row.token_id}</td>
              <td>{row.token_category}</td>
              <td>{formatDate(row.scan_time)}</td>
              <td>{activeReport === "scan" ? row.scanner_name : row.verifier_name}</td>
              <td>{row.ip_address || "N/A"}</td>
              <td>{row.device_type || "N/A"}</td>
              <td
                style={{
                  fontWeight: 600,
                  color:
                    row.scan_result === "VALID" || row.verification_result === "VALID"
                      ? "#16A34A"
                      : row.scan_result === "EXPIRED" || row.verification_result === "EXPIRED"
                      ? "#DC2626"
                      : "#F97316",
                }}
              >
                {activeReport === "scan" ? row.scan_result : row.verification_result}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    ));
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F9FAFB" }}>
      <div
        style={{
          width: 220,
          minHeight: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          zIndex: 100,
          background: "#fff",
          boxShadow: "5px 0 15px rgba(0,0,0,0.07)",
        }}
      >
        <Sidebar />
      </div>
      <div style={{ flex: 1, marginLeft: 220, padding: "20px 40px" }}>
        <h1 style={pageTitle}> Scan Reports</h1>

        <div style={navBar}>
          <button
            onClick={() => setActiveReport("scan")}
            style={activeReport === "scan" ? btn("#2563EB", "#fff") : btn("#E5E7EB", "#000")}
          >
            Scan Activity
          </button>
          <button
            onClick={() => setActiveReport("verification")}
            style={activeReport === "verification" ? btn("#2563EB", "#fff") : btn("#E5E7EB", "#000")}
          >
            Verification Logs
          </button>
        </div>

        <div>{renderSection()}</div>
      </div>
    </div>
  );
}

/* --- Styles --- */
const pageWrapper = {
  display: "flex",
  width: "100vw",
  minHeight: "100vh",
  background: "#F9FAFB",
};

const contentWrapper = {
  flex: 1,
  padding: "20px 40px",
};

const pageTitle = {
  fontSize: 28,
  fontWeight: 700,
  marginBottom: 20,
};

const navBar = {
  display: "flex",
  gap: 12,
  marginBottom: 24,
};

const card = {
  border: "1px solid #E2E8F0",
  borderRadius: 12,
  padding: 16,
  background: "#fff",
  marginBottom: 16,
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
};

const emptyText = { color: "#64748B", padding: "12px 0" };

const btn = (bg, color) => ({
  padding: "10px 16px",
  borderRadius: 8,
  border: "none",
  background: bg,
  color,
  fontWeight: 600,
  cursor: "pointer",
});

const listStyle = {
  listStyleType: "none",
  padding: 0,
  margin: 0,
};

const itemStyle = {
  marginBottom: 12,
};

const linkStyle = {
  textDecoration: "none",
  color: "#2563EB",
  fontWeight: 600,
};
