import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
import MainLayout from "./layout/MainLayout";

const API_BASE = "/api/";

export default function QueueDashboard() {
  const [liveQueues, setLiveQueues] = useState([]);
  const [scannerStatus, setScannerStatus] = useState([]);
  const [tokenStatus, setTokenStatus] = useState(null);
  const [tokenIdInput, setTokenIdInput] = useState("");
  const [emergencyAction, setEmergencyAction] = useState("pause");
  const [emergencyCategory, setEmergencyCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [activeSection, setActiveSection] = useState("liveQueues");
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL"); // <-- Fix here

  // Fetch categories
  useEffect(() => {
    axios
      .get(`${API_BASE}categories/`)
      .then((res) => {
        setCategories(Array.isArray(res.data) ? res.data : res.data.results || []);
      })
      .catch(() => setCategories([]));
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchLiveQueues();
    fetchScannerStatus();
  }, []);

  // --- Updated fetch functions ---
  const fetchLiveQueues = async () => {
    try {
      const res = await axios.get(`${API_BASE}tokens/live_queue/`);
      setLiveQueues(res.data.live_queue || []);
    } catch {
      toast.error("Failed to fetch live queues");
    }
  };

  const fetchScannerStatus = async () => {
  try {
    const res = await axios.get(`${API_BASE}scanner-status/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`, // if using JWT
      },
    });
    setScannerStatus(Array.isArray(res.data) ? res.data : res.data.results || []);
  } catch {
    toast.error("Failed to fetch scanner status");
  }
};



  const fetchTokenStatus = async () => {
    if (!tokenIdInput) return;
    try {
      const res = await axios.get(`${API_BASE}tokens/public/${tokenIdInput}/`);
      setTokenStatus(res.data);
    } catch {
      toast.error("Token not found");
      setTokenStatus(null);
    }
  };

  const handleEmergency = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}queue/emergency/`, {
        action: emergencyAction,
        category_id: emergencyCategory || undefined,
      });
      toast.success("Emergency action performed");
      fetchLiveQueues();
    } catch {
      toast.error("Failed to perform emergency action");
    }
  };

  /* --- Section Renderer --- */
  const renderSection = () => {
    switch (activeSection) {
      case "liveQueues":
        return (
          <section>
            <h2 style={sectionTitle}>Live Queues</h2>
            {liveQueues.length === 0 ? (
              <div style={emptyText}>No queues found.</div>
            ) : (
              liveQueues.map((q, idx) => (
                <div key={q.category?.id || idx} style={card}>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>
                    {q.category?.name || "Unknown"}
                  </div>
                  <table style={table}>
                    <thead>
                      <tr>
                        <th>Token ID</th>
                        <th>Status</th>
                        <th>Queue Position</th>
                        <th>Issued At</th>
                        <th>QR Image</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(q.tokens || []).map((token) => (
                        <tr key={token.token_id}>
                          <td>{token.token_id}</td>
                          <td>{token.status}</td>
                          <td>{token.queue_position}</td>
                          <td>
                            {token.issued_at
                              ? new Date(token.issued_at).toLocaleString()
                              : ""}
                          </td>
                          <td>
                            {token.qr_image ? (
                              <img
                                src={token.qr_image}
                                alt="QR"
                                style={{ width: 40, height: 40, borderRadius: 6 }}
                              />
                            ) : (
                              "No QR"
                            )}
                          </td>
                        </tr>
                      ))}
                      {(q.tokens || []).length === 0 && (
                        <tr>
                          <td colSpan={5} style={emptyCell}>
                            No tokens in queue
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ))
            )}
            <button onClick={fetchLiveQueues} style={btn("#2563EB", "#fff")}>
              Refresh Queues
            </button>
          </section>
        );

      case "tokenStatus":
        return (
          <section>
            <h2 style={sectionTitle}>Token Status Overview</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetchTokenStatus();
              }}
              style={{ display: "flex", gap: 8, marginBottom: 16 }}
            >
              <input
                type="text"
                placeholder="Enter Token ID"
                value={tokenIdInput}
                onChange={(e) => setTokenIdInput(e.target.value)}
                style={input}
              />
              <button type="submit" style={btn("#16A34A", "#fff")}>
                Check Status
              </button>
            </form>
            {tokenStatus && (
              <div style={card}>
                <div>
                  <b>Token ID:</b> {tokenStatus.token_id}
                </div>
                <div>
                  <b>Status:</b> {tokenStatus.status}
                </div>
                <div>
                  <b>Category:</b> {tokenStatus.category?.name}
                </div>
                <div>
                  <b>Queue Position:</b> {tokenStatus.queue_position}
                </div>
                <div>
                  <b>QR Code:</b>{" "}
                  {tokenStatus.qr_image ? (
                    <img
                      src={tokenStatus.qr_image}
                      alt="QR"
                      style={{ width: 60, height: 60, borderRadius: 8 }}
                    />
                  ) : (
                    "No QR"
                  )}
                </div>
              </div>
            )}
          </section>
        );

      case "emergency":
        return (
          <section>
            <h2 style={sectionTitle}>Emergency Queue Control</h2>
            <form
              onSubmit={handleEmergency}
              style={{ display: "flex", gap: 8, alignItems: "center" }}
            >
              <select
                value={emergencyAction}
                onChange={(e) => setEmergencyAction(e.target.value)}
                style={input}
              >
                <option value="pause">Pause</option>
                <option value="resume">Resume</option>
                <option value="clear">Clear</option>
              </select>
              <select
                value={emergencyCategory}
                onChange={(e) => setEmergencyCategory(e.target.value)}
                style={input}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <button type="submit" style={btn("#DC2626", "#fff")}>
                Execute
              </button>
            </form>
            <div style={{ fontSize: 12, color: "#64748B", marginTop: 6 }}>
              Pause: set all tokens to waiting. Resume: set waiting tokens to in
              progress. Clear: delete all tokens.
            </div>
          </section>
        );

     case "scannerStatus":
  const [scanFilter, setScanFilter] = useState("ALL");
  const filteredScannerStatus = scannerStatus.filter(row => {
    if (scanFilter === "ALL") return true;
    return row.verification_status === scanFilter;
  });

  return (
    <section>
      <h2 style={sectionTitle}>QR Code Scanner Status</h2>
      <div style={filterBar}>
        <label htmlFor="scan-filter" style={filterLabel}>Filter:</label>
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
      </div>
      <div style={card}>
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
            {Array.isArray(filteredScannerStatus) && filteredScannerStatus.length > 0 ? (
              filteredScannerStatus.map((row, idx) => (
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
      </div>
      <button onClick={fetchScannerStatus} style={btn("#2563EB", "#fff")}>
        Refresh Scanner Status
      </button>
    </section>
  );



      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <div style={pageWrapper}>
        <ToastContainer />
        <h1 style={pageTitle}>Queue Monitoring Dashboard</h1>

        {/* Top Navigation Buttons */}
        <div style={navBar}>
          <button
            onClick={() => setActiveSection("liveQueues")}
            style={
              activeSection === "liveQueues" ? btn("#2563EB", "#fff") : btn("#E5E7EB", "#000")
            }
          >
            Live Queues
          </button>
          <button
            onClick={() => setActiveSection("tokenStatus")}
            style={
              activeSection === "tokenStatus" ? btn("#2563EB", "#fff") : btn("#E5E7EB", "#000")
            }
          >
            Token Status
          </button>
          <button
            onClick={() => setActiveSection("emergency")}
            style={
              activeSection === "emergency" ? btn("#2563EB", "#fff") : btn("#E5E7EB", "#000")
            }
          >
            Emergency Control
          </button>
          <button
            onClick={() => setActiveSection("scannerStatus")}
            style={
              activeSection === "scannerStatus"
                ? btn("#2563EB", "#fff")
                : btn("#E5E7EB", "#000")
            }
          >
            Scanner Status
          </button>
        </div>

        {/* Sidebar Links */}
        <ul style={listStyle}>
          <li style={itemStyle}>
            <Link to="/dashboard" style={linkStyle}>Dashboard</Link>
          </li>
          <li style={itemStyle}>
            <Link to="/admin/bulkqr" style={linkStyle}>Bulk QR</Link>
          </li>
          {/* Add more links as needed */}
        </ul>

        {renderSection()}
      </div>
    </MainLayout>
  );
}

/* --- Styles --- */
const pageWrapper = {
  width: "100vw",
  minHeight: "100vh",
  margin: 0,
  padding: "20px 40px",
  background: "#F9FAFB",
};

const pageTitle = {
  fontSize: 28,
  fontWeight: 700,
  marginBottom: 20,
};

const sectionTitle = {
  fontSize: 20,
  fontWeight: 600,
  marginBottom: 12,
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
const emptyCell = { textAlign: "center", color: "#94A3B8", padding: 12 };

const input = {
  border: "1px solid #CBD5E1",
  borderRadius: 8,
  padding: "8px 10px",
  fontSize: 14,
};

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
  marginBottom: 24,
};

const itemStyle = {
  marginBottom: 12,
};

const linkStyle = {
  textDecoration: "none",
  color: "#2563EB",
  fontWeight: 500,
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