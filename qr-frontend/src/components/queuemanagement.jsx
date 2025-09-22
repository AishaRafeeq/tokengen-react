import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MainLayout from "./layout/MainLayout";

const API_BASE = "/api/";

export default function DailyScannerStatus() {
  const [scannerStatus, setScannerStatus] = useState([]);
  const [scanFilter, setScanFilter] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch scanner status every 30 seconds
  useEffect(() => {
    fetchScannerStatus();
    const interval = setInterval(fetchScannerStatus, 30000);
    return () => clearInterval(interval);
  }, [scanFilter, startDate, endDate]);

  const fetchScannerStatus = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE}scanner-status/?`;
      if (scanFilter !== "ALL") url += `verification_status=${scanFilter}&`;
      if (startDate) url += `start_date=${startDate}&`;
      if (endDate) url += `end_date=${endDate}&`;
      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      setScannerStatus(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch {
      toast.error("Failed to fetch scanner status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div style={mainBg}>
        <ToastContainer />
        <div style={centeredContent}>
          <div style={cardWrapper}>
            <h1 style={pageTitle}>Daily QR Code Scanner Status</h1>
            <div style={filterBar}>
              <label htmlFor="scan-filter" style={filterLabel}>Status:</label>
              <select
                id="scan-filter"
                value={scanFilter}
                onChange={e => setScanFilter(e.target.value)}
                style={dropdown}
              >
                <option value="ALL">All</option>
                <option value="SUCCESS">Success</option>
                <option value="FAILED">Failed</option>
              </select>
              <label htmlFor="start-date" style={filterLabel}>Start Date:</label>
              <input
                id="start-date"
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                style={dropdown}
              />
              <label htmlFor="end-date" style={filterLabel}>End Date:</label>
              <input
                id="end-date"
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                style={dropdown}
              />
              <button onClick={fetchScannerStatus} style={btn("#2563EB", "#fff")}>
                Apply Filters
              </button>
            </div>
            <div style={card}>
              {loading ? (
                <div style={emptyText}>Loading...</div>
              ) : (
                <table style={table}>
                  <thead>
                    <tr>
                      <th>Token ID</th>
                      <th>Status</th>
                      <th>Category</th>
                      <th>Scanned By</th>
                      <th>Scan Time</th>
                      <th>Verification Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(scannerStatus) && scannerStatus.length > 0 ? (
                      scannerStatus.map((row, idx) => (
                        <tr key={row.token_id || idx}>
                          <td>{row.token_id || "N/A"}</td>
                          <td>{row.status || "N/A"}</td>
                          <td>{row.category?.name || "N/A"}</td>
                          <td>{row.scanned_by?.username || "N/A"}</td>
                          <td>
                            {row.scan_time
                              ? new Date(row.scan_time).toLocaleString()
                              : "Never"}
                          </td>
                          <td
                            style={{
                              color:
                                row.verification_status === "SUCCESS"
                                  ? "green"
                                  : row.verification_status === "FAILED"
                                  ? "red"
                                  : "#000",
                              fontWeight: 700,
                              letterSpacing: 0.5,
                            }}
                          >
                            {row.verification_status || "N/A"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} style={emptyCell}>
                          No scanner data
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
        <style>
          {`
            @media (max-width: 900px) {
              .queue-card {
                max-width: 98vw !important;
                border-radius: 0 !important;
                padding: 18px 6px !important;
                margin: 0 !important;
                box-shadow: none !important;
              }
              .queue-centered-content {
                margin-left: 0 !important;
                padding: 0 !important;
                width: 100vw !important;
                min-height: 100vh !important;
                display: flex !important;
                justify-content: center !important;
                align-items: flex-start !important;
              }
            }
          `}
        </style>
      </div>
    </MainLayout>
  );
}

// --- Styles ---
const mainBg = {
  display: "flex",
  minHeight: "100vh",
  width: "100vw",
  background: "#F9FAFB",
};

const centeredContent = {
  flex: 1,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "100vh",
};
centeredContent.className = "queue-centered-content";

const cardWrapper = {
  width: "100%",
  maxWidth: 900,
  background: "#fff",
  borderRadius: 18,
  boxShadow: "0 6px 18px rgba(0,0,0,0.07)",
  padding: "28px 18px",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};
cardWrapper.className = "queue-card";

const pageTitle = {
  fontSize: 28,
  fontWeight: 700,
  marginBottom: 20,
};

const filterBar = {
  display: "flex",
  alignItems: "center",
  gap: 16,
  marginBottom: 18,
  background: "#F3F6FC",
  padding: "10px 20px",
  borderRadius: 12,
  boxShadow: "0 2px 8px rgba(37,99,235,0.06)",
  flexWrap: "wrap",
};

const filterLabel = {
  fontWeight: 600,
  fontSize: 16,
  color: "#334155",
};

const dropdown = {
  padding: "8px 16px",
  borderRadius: 8,
  border: "1px solid #CBD5E1",
  fontSize: 16,
  fontWeight: 600,
  background: "#fff",
  color: "#2563EB",
  boxShadow: "0 1px 4px rgba(37,99,235,0.06)",
  outline: "none",
  cursor: "pointer",
};

const card = {
  border: "1px solid #E2E8F0",
  borderRadius: 12,
  padding: 16,
  background: "#fff",
  marginBottom: 16,
  width: "100%",
  overflowX: "auto",
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
};

const emptyText = { color: "#64748B", padding: "12px 0" };
const emptyCell = { textAlign: "center", color: "#94A3B8", padding: 12 };