// QueueManager.jsx
import React, { useEffect, useState } from "react";
import API from "../../Services/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { QrReader } from "react-qr-reader";
import Sidebar from "../Sidebar";
import VerifyQR from "../admin/verifyqr";

const QueueManager = () => {
  const [tokens, setTokens] = useState([]);
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("currently");
  const [manualTokenId, setManualTokenId] = useState("");
  const [manualCategoryId, setManualCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [showVerifyQR, setShowVerifyQR] = useState(false);

  useEffect(() => {
    fetchQueue();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
  try {
    const res = await API.get("tokens/staff-queue/");
    setCategories(Array.isArray(res.data.staff_queue) ? res.data.staff_queue : []);
  } catch (err) {
    console.error(err);
    toast.error("Failed to fetch categories.");
  }
};

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await API.get("tokens/active/");
      const activeList = Array.isArray(res.data) ? res.data : res.data.results || [];
      const calledToken = activeList.find((t) => t.status === "called") || null;
      setTokens(activeList);
      setCurrent(calledToken);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load queue.");
    } finally {
      setLoading(false);
    }
  };

  const callNext = async () => {
  try {
    const res = await API.post("tokens/staff-call-next/");
    if (res.data && res.data.token_id) {
      toast.success(`Token ${res.data.token_id} is now currently attending!`);
      setCurrent({
        token_id: res.data.token_id,
        category: res.data.category || "",
        category_name: res.data.category_name || "",
        status: res.data.status,
      });
    } else {
      toast.info("No waiting tokens available.");
      setCurrent(null);
    }
    fetchQueue();
  } catch (err) {
    console.error(err);
    toast.error(
      err.response?.data?.error ||
      err.response?.data?.detail ||
      "Failed to call next token."
    );
    fetchQueue();
  }
};
  const handleManualCall = async (tokenId = manualTokenId, categoryId = manualCategoryId) => {
    if (!tokenId || !categoryId) {
      toast.error("Please enter Token ID and select a Category.");
      return;
    }
    try {
      const res = await API.post("tokens/manual_call/", { token_id: tokenId, category_id: categoryId });
      toast.success(`Token ${res.data.token_id} called manually!`);
      setManualTokenId("");
      setManualCategoryId("");
      fetchQueue();
    } catch (err) {
      console.error(err);
      toast.error("Failed to manually call token.");
    }
  };

  if (loading) {
    return (
      <div style={centered}>
        <div style={spinner} />
        <p style={{ color: "#64748B" }}>Loading queue...</p>
      </div>
    );
  }

  return (
    <div style={fullWrapper}>
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
        <ToastContainer position="top-right" autoClose={2500} />

        {/* Top Tabs & Verify QR Button */}
        <div style={{ display: "flex", gap: 12, margin: "16px 0" }}>
          {["currently", "active", "manual", "scan"].map((t) => (
            <button
              key={t}
              style={tab === t && !showVerifyQR ? btn("#2563EB", "#fff") : btn("#E5E7EB", "#000")}
              onClick={() => {
                setTab(t);
                setShowVerifyQR(false);
              }}
            >
              {t === "currently"
                ? "Currently Attending"
                : t === "active"
                ? "Active Queue"
                : t === "manual"
                ? "Manual Token Entry"
                : "Scan QR"}
            </button>
          ))}
          {/* Verify QR button on top, acts as a separate tab */}
          <button
            style={showVerifyQR ? btn("#2563EB", "#fff") : btn("#E5E7EB", "#000")}
            onClick={() => {
              setShowVerifyQR(true);
              setTab(""); // Clear tab selection when VerifyQR is active
            }}
          >
            Verify QR
          </button>
        </div>

        {/* Tab Content */}
        {!showVerifyQR && tab === "currently" && (
          <div style={cardWrapper}>
            <h2>Currently Attending</h2>
            {current ? (
              <div style={currentCard}>
                <div>
                  <strong>{current.token_id}</strong> - {current.category_name || current.category?.name || current.category || ""}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={btn("#2563EB", "#fff")} onClick={callNext}>
                    Call Next
                  </button>
                  <button style={btn("#FACC15", "#000")} onClick={fetchQueue}>
                    Refresh
                  </button>
                  {/* Changed from Scan QR to Verify QR */}
                  <button style={btn("#10B981", "#fff")} onClick={() => { setShowVerifyQR(true); setTab(""); }}>
                    Verify QR
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p style={{ color: "#64748B" }}>No client is currently being attended.</p>
                <button style={btn("#2563EB", "#fff")} onClick={callNext}>
                  Call Next Token
                </button>
              </div>
            )}
          </div>
        )}

       {!showVerifyQR && tab === "active" && (
  <div style={cardWrapper}>
    <h2>Active Queue</h2>
    <table style={table}>
      <thead>
        <tr>
          <th style={th}>Token ID</th>
          <th style={th}>Category</th>
          <th style={th}>Status</th>
          <th style={th}>Issued At</th>
        </tr>
      </thead>
      <tbody>
        {tokens.length === 0 ? (
          <tr>
            <td colSpan={4} style={emptyCell}>
              No active tokens.
            </td>
          </tr>
        ) : (
          tokens.map((token) => (
            <tr
              key={token.id || token.token_id}
              style={{
                background: token.status === "called" ? "#E0F2FE" : "#fff",
                fontWeight: token.status === "called" ? 700 : 500,
              }}
            >
              <td style={td}>{token.token_id}</td>
              <td style={td}>{token.category_name || token.category?.name || token.category || ""}</td>
              <td style={td}>{token.status}</td>
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
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
)}


        {!showVerifyQR && tab === "manual" && (
          <div style={cardWrapper}>
            <h2>Manual Token Entry</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!manualTokenId.startsWith("MAN")) {
                  toast.error("Token ID must start with 'MAN'.");
                  return;
                }
                try {
                  const res = await API.post("tokens/manual_call/", {
                    token_id: manualTokenId,
                  });
                  toast.success(res.data?.detail || `Token ${res.data.token_id} called manually!`);
                  setManualTokenId("");
                  fetchQueue();
                } catch (err) {
                  const msg =
                    err.response?.data?.detail ||
                    err.response?.data?.error ||
                    "Failed to manually call token.";
                  toast.error(msg);
                }
              }}
              style={{ display: "flex", gap: 8, marginTop: 16 }}
            >
              <input
                type="text"
                placeholder="Token ID (must start with MAN)"
                value={manualTokenId}
                onChange={(e) => setManualTokenId(e.target.value)}
                style={input}
                required
              />
              <button type="submit" style={btn("#10B981", "#fff")}>
                Call Manually
              </button>
            </form>
          </div>
        )}

        {!showVerifyQR && tab === "scan" && (
          <div style={cardWrapper}>
            <h2>Scan QR Code</h2>
            <QrReader
              onResult={(result, error) => {
                if (!!result) {
                  try {
                    const data = JSON.parse(result?.text || "{}");
                    if (data.token_id && data.category_id) {
                      handleManualCall(data.token_id, data.category_id);
                      toast.success(`Token ${data.token_id} scanned & called!`);
                      setTab("currently");
                    } else {
                      toast.error("Invalid QR Code format.");
                    }
                  } catch {
                    toast.error("QR Code is not valid JSON.");
                  }
                }
                if (error) console.warn(error);
              }}
              style={{ width: "100%" }}
            />
            <button
              style={{ ...btn("#F87171", "#fff"), marginTop: 12 }}
              onClick={() => setTab("currently")}
            >
              Cancel
            </button>
          </div>
        )}

        {/* Show VerifyQR component when toggled */}
        {/* Show VerifyQR component when toggled */}
{/* Show VerifyQR component when toggled */}
{/* Show VerifyQR component when toggled */}
{showVerifyQR && (
  <div style={{ marginTop: 0, marginLeft:-300}}>
    <VerifyQR />
  </div>
)}







      </div>
    </div>
  );
};

const fullWrapper = {
  display: "flex",
  flexDirection: "row",
  height: "100vh",
};

const centered = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "column",
  height: "100%",
};

const spinner = {
  border: "4px solid rgba(0, 0, 0, 0.1)",
  borderTop: "4px solid #2563EB",
  borderRadius: "50%",
  width: 40,
  height: 40,
  animation: "spin 1s linear infinite",
};

const cardWrapper = {
  background: "#fff",
  borderRadius: 8,
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  padding: 24,
  marginTop: 16,
};

const currentCard = {
  padding: 16,
  borderRadius: 8,
  background: "#E0F7FA",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  marginTop: 8,
};

const tableWrapper = {
  background: "#fff",
  borderRadius: 8,
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  marginTop: 16,
};

const tableHeader = {
  display: "grid",
  gridTemplateColumns: "1fr 2fr 1fr 1fr 1fr",
  padding: "12px 16px",
  background: "#F9FAFB",
  fontWeight: 600,
  color: "#374151",
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
};

const tableRow = {
  display: "grid",
  gridTemplateColumns: "1fr 2fr 1fr 1fr 1fr",
  padding: "12px 16px",
  alignItems: "center",
  borderBottom: "1px solid #E5E7EB",
};

const input = {
  flex: 1,
  padding: "12px 16px",
  borderRadius: 8,
  border: "1px solid #E5E7EB",
  fontSize: 16,
  color: "#374151",
};

const btn = (bgColor, textColor) => ({
  backgroundColor: bgColor,
  color: textColor,
  border: "none",
  borderRadius: 8,
  padding: "12px 24px",
  fontSize: 16,
  cursor: "pointer",
  transition: "background 0.3s",
  "&:hover": {
    backgroundColor: textColor === "#fff" ? "#2563EB" : "#F3F4F6",
  },
});

const table = {
  width: "100%",
  borderCollapse: "collapse",
};

const th = {
  textAlign: "center",
  padding: "12px",
  background: "#F6F8FF",
  fontWeight: 700,
  borderBottom: "2px solid #E5E7EB",
  color: "#0B3A6A",
  fontSize: 15,
};

const td = {
  textAlign: "center",
  padding: "12px",
  borderBottom: "1px solid #E5E7EB",
  fontSize: 15,
  verticalAlign: "middle",
};

const emptyCell = {
  textAlign: "center",
  color: "#94A3B8",
  padding: 12,
};

export default QueueManager;