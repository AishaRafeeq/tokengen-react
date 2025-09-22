import React, { useEffect, useState } from "react";
import API from "../../services/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link, Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import Sidebar from "../Sidebar";

export default function QueueDashboard() {
  const [liveQueues, setLiveQueues] = useState([]);
  const [tokenStatus, setTokenStatus] = useState(null);
  const [tokenIdInput, setTokenIdInput] = useState("");
  const [emergencyAction, setEmergencyAction] = useState("pause");
  const [emergencyCategory, setEmergencyCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  // Redirect /monitor → /monitor/live
  useEffect(() => {
    if (location.pathname.endsWith("/monitor") || location.pathname.endsWith("/monitor/")) {
      navigate("live", { replace: true });
    }
  }, [location, navigate]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.get("categories/");
        setCategories(res.data || []);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch live queues
  const fetchLiveQueues = async () => {
    try {
      const res = await API.get("tokens/queue/live/");
      setLiveQueues(res.data.live_queue || []);
    } catch (err) {
      toast.error("Failed to fetch live queues");
    }
  };

  useEffect(() => {
    fetchLiveQueues();
  }, []);

  // Fetch token status
  const fetchTokenStatus = async () => {
    if (!tokenIdInput) return;
    try {
      const res = await API.post("tokens/verify-qr/", { token_id: tokenIdInput });
      setTokenStatus(res.data);
    } catch (err) {
      toast.error("Token not found or invalid");
      setTokenStatus(null);
    }
  };

  // Emergency handler
  const handleEmergency = async (e) => {
    e.preventDefault();
    try {
      await API.post("tokens/queue/emergency/", {
        action: emergencyAction,
        category_id: emergencyCategory || undefined,
      });
      toast.success("Emergency action performed");
      fetchLiveQueues();
    } catch {
      toast.error("Failed to perform emergency action");
    }
  };

  // Filter tokens for display
  const filterTokensForDisplay = (tokens) => {
    const waiting = tokens.filter((t) => t.status === "waiting");
    const called = tokens.find((t) => t.status === "called");
    return called ? [...waiting, called] : waiting;
  };

  // Filter live queues by search term
  const filteredLiveQueues = liveQueues
    .map((q) => ({
      ...q,
      tokens: filterTokensForDisplay(q.tokens || []).filter(
        (token) =>
          token.token_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((q) => q.tokens.length > 0);

  // Add filter state for scanner status
  const [scanFilter, setScanFilter] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [scannerStatus, setScannerStatus] = useState([]);
  const [loading, setLoading] = useState(false);

  // Build query params for backend
  const fetchScannerStatus = async () => {
    setLoading(true);
    try {
      let params = [];
      if (scanFilter && scanFilter !== "ALL") params.push(`status=${scanFilter}`);
      if (startDate) params.push(`from=${startDate}`);
      if (endDate) params.push(`to=${endDate}`);
      let url = "scanner-status/";
      if (params.length) url += "?" + params.join("&");
      const res = await API.get(url);
      setScannerStatus(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch (err) {
      toast.error("Failed to fetch scanner status");
    } finally {
      setLoading(false);
    }
  };

  // Fetch scanner status on mount and when filters change
  useEffect(() => {
    fetchScannerStatus();
    // eslint-disable-next-line
  }, [scanFilter, startDate, endDate]);

  return (
    <div style={containerStyle}>
      <div style={sidebarFixedStyle}>
        <Sidebar />
      </div>
      <div style={contentStyle}>
        <ToastContainer />
        <h1 style={pageTitle}>Queue Monitoring Dashboard</h1>

        <div style={navBar}>
          <Link
            to="live"
            style={location.pathname.endsWith("/live") ? btn("#2563EB", "#fff") : btn("#E5E7EB", "#000")}
          >
            Live Queues
          </Link>
          <Link
            to="token-status"
            style={location.pathname.endsWith("/token-status") ? btn("#2563EB", "#fff") : btn("#E5E7EB", "#000")}
          >
            Token Status
          </Link>
          <Link
            to="emergency"
            style={location.pathname.endsWith("/emergency") ? btn("#2563EB", "#fff") : btn("#E5E7EB", "#000")}
          >
            Emergency Control
          </Link>
          <Link
            to="scanner-status"
            style={location.pathname.endsWith("/scanner-status") ? btn("#2563EB", "#fff") : btn("#E5E7EB", "#000")}
          >
            Scanner Status
          </Link>
        </div>

        <Routes>
          <Route path="/" element={<Navigate to="live" replace />} />

          {/* Live Queues */}
          <Route
            path="live"
            element={
              <section>
                <h2 style={sectionTitle}>Live Queues</h2>
                <input
                  type="text"
                  placeholder="Search by Token ID or Category"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ ...input, marginBottom: 16, width: 320, maxWidth: "100%" }}
                />
                {filteredLiveQueues.length === 0 ? (
                  <div style={emptyText}>No data</div>
                ) : (
                  filteredLiveQueues.map((q, idx) => (
                    <div key={q.category?.id || idx} style={card}>
                      <div style={categoryHighlight}>{q.category?.name || "Unknown"}</div>
                      <table style={table}>
                        <thead>
                          <tr>
                            <th style={th}>Token ID</th>
                            <th style={th}>Status</th>
                            <th style={th}>Queue Position</th>
                            <th style={th}>Issued At</th>
                            <th style={th}>QR Image</th>
                          </tr>
                        </thead>
                        <tbody>
                          {q.tokens.map((token) => (
                            <tr key={token.token_id}>
                              <td style={td}>{token.token_id}</td>
                              <td style={td}>{token.status}</td>
                              <td style={td}>{token.queue_position || "-"}</td>
                              <td style={td}>
                                {token.issued_at ? (
                                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <span>{new Date(token.issued_at).toLocaleDateString()}</span>
                                    <span>{new Date(token.issued_at).toLocaleTimeString()}</span>
                                  </div>
                                ) : (
                                  "-"
                                )}
                              </td>
                              <td style={td}>
                                {token.qr_image ? (
                                  <img
                                    src={token.qr_image}
                                    alt="QR"
                                    style={{ width: 40, height: 40, borderRadius: 6, margin: "0 auto", display: "block" }}
                                  />
                                ) : (
                                  <span style={{ color: "#64748B" }}>No QR</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))
                )}
                <button onClick={fetchLiveQueues} style={btn("#2563EB", "#fff")}>
                  Refresh Queues
                </button>
              </section>
            }
          />

          {/* Token Status */}
          <Route
            path="token-status"
            element={
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
                      <b>Category:</b> {tokenStatus.category?.name || "-"}
                    </div>
                    <div>
                      <b>QR Code:</b>{" "}
                      {tokenStatus.qr_image ? (
                        <img src={tokenStatus.qr_image} alt="QR" style={{ width: 60, height: 60, borderRadius: 8 }} />
                      ) : (
                        "No QR"
                      )}
                    </div>
                  </div>
                )}
              </section>
            }
          />

          {/* Emergency Control */}
          <Route
            path="emergency"
            element={
              <section>
                <h2 style={sectionTitle}>Emergency Queue Control</h2>
                <form onSubmit={handleEmergency} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <select value={emergencyAction} onChange={(e) => setEmergencyAction(e.target.value)} style={input}>
                    <option value="pause">Pause</option>
                    <option value="resume">Resume</option>
                    <option value="clear">Clear</option>
                  </select>
                  <select value={emergencyCategory} onChange={(e) => setEmergencyCategory(e.target.value)} style={input}>
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
                  Pause: set all tokens to waiting. Resume: set waiting tokens to in progress. Clear: delete all tokens.
                </div>
              </section>
            }
          />

          {/* Scanner Status */}
          <Route
            path="scanner-status"
            element={
              <section>
                <h2 style={sectionTitle}>QR Code Scanner Status</h2>
                <div style={{ ...card, marginBottom: 24 }}>
                  <div
                    style={{
                      display: "flex",
                      gap: 16,
                      flexWrap: "wrap",
                      alignItems: "center",
                      marginBottom: 16,
                    }}
                  >
                    <div>
                      <label htmlFor="scan-filter" style={filterLabel}>
                        Status:
                      </label>
                      <select
                        id="scan-filter"
                        value={scanFilter}
                        onChange={(e) => setScanFilter(e.target.value)}
                        style={{ ...input, minWidth: 120, marginLeft: 8 }}
                      >
                        <option value="ALL">All</option>
                        <option value="SUCCESS">Success</option>
                        <option value="FAILED">Failed</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="start-date" style={filterLabel}>
                        Start Date:
                      </label>
                      <input
                        id="start-date"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        style={{ ...input, minWidth: 140, marginLeft: 8 }}
                      />
                    </div>
                    <div>
                      <label htmlFor="end-date" style={filterLabel}>
                        End Date:
                      </label>
                      <input
                        id="end-date"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        style={{ ...input, minWidth: 140, marginLeft: 8 }}
                      />
                    </div>
                    <button
                      onClick={fetchScannerStatus}
                      style={{ ...btn("#2563EB", "#fff"), minWidth: 120 }}
                    >
                      Apply Filters
                    </button>
                  </div>
                  <table style={table}>
                    <thead>
                      <tr>
                        <th style={th}>Token ID</th>
                        <th style={th}>Status</th>
                        <th style={th}>Category</th>
                        <th style={th}>Scanned By</th>
                        <th style={th}>Scan Time</th>
                        <th style={th}>Verification Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={6} style={emptyCell}>Loading...</td>
                        </tr>
                      ) : scannerStatus.length > 0 ? (
                        scannerStatus.map((row, idx) => (
                          <tr key={row.token_id || idx}>
                            <td style={td}>{row.token_id || "-"}</td>
                            <td style={td}>{row.status || "-"}</td>
                            <td style={td}>{row.category?.name || "-"}</td>
                            <td style={td}>{row.scanned_by?.username || "-"}</td>
                            <td style={td}>{row.scan_time ? new Date(row.scan_time).toLocaleString() : "-"}</td>
                            <td style={{
                              ...td,
                              color:
                                row.verification_status === "SUCCESS"
                                  ? "green"
                                  : row.verification_status === "FAILED"
                                  ? "red"
                                  : "#000",
                              fontWeight: 700,
                            }}>
                              {row.verification_status || "-"}
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
            }
          />

          <Route path="*" element={<div>Select a section above.</div>} />
        </Routes>
      </div>
    </div>
  );
}

/* --- Styles --- */
const containerStyle = { display: "flex", minHeight: "100vh", width: "100vw", background: "#F9FAFB" };
const sidebarFixedStyle = { width: 220, minHeight: "100vh", position: "fixed", left: 0, top: 0, zIndex: 100, background: "#fff", boxShadow: "5px 0 15px rgba(0,0,0,0.07)" };
const contentStyle = { flex: 1, marginLeft: 220, padding: "20px 40px", minHeight: "100vh", background: "#F9FAFB", overflow: "auto" };
const pageTitle = { fontSize: 28, fontWeight: 700, marginBottom: 20 };
const sectionTitle = { fontSize: 20, fontWeight: 600, marginBottom: 12 };
const navBar = { display: "flex", gap: 12, marginBottom: 24 };
const card = { border: "1px solid #E2E8F0", borderRadius: 12, padding: 16, background: "#fff", marginBottom: 16 };
const table = { width: "100%", borderCollapse: "collapse" };
const emptyText = { color: "#64748B", padding: "12px 0" };
const emptyCell = { textAlign: "center", color: "#94A3B8", padding: 12 };
const input = { border: "1px solid #CBD5E1", borderRadius: 8, padding: "8px 10px", fontSize: 14 };
const btn = (bg, color) => ({ padding: "10px 16px", borderRadius: 8, border: "none", background: bg, color, fontWeight: 600, cursor: "pointer" });
const th = { textAlign: "center", padding: "12px", background: "#F6F8FF", fontWeight: 700, borderBottom: "2px solid #E5E7EB", color: "#0B3A6A", fontSize: 15 };
const td = { textAlign: "center", padding: "12px", borderBottom: "1px solid #E5E7EB", fontSize: 15, verticalAlign: "middle" };
const categoryHighlight = { fontWeight: 700, fontSize: 18, color: "#0B3A6A", background: "#F6F8FF", padding: "10px 0", borderRadius: "8px 8px 0 0", marginBottom: 0, textAlign: "center", letterSpacing: 1, boxShadow: "0 2px 8px rgba(37,99,235,0.05)", borderBottom: "1px solid #E0E7EF" };
const filterLabel = {
  fontWeight: 600,
  fontSize: 15,
  color: "#334155",
};
