import React, { useState, useEffect } from "react";
import API from "../../services/api";
import Sidebar from "../Sidebar";
import { Link } from "react-router-dom";

export default function BulkQRGenerator() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ category: "", count: 1 });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await API.get("categories/");
        setCategories(Array.isArray(res.data) ? res.data : res.data.results || []);
      } catch {
        setError("Failed to load categories");
      }
    }
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await API.post("tokens/admin-bulk-generate/", {
        category: form.category,
        count: form.count,
      });
      setResult(res.data);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Bulk generation failed"
      );
    }
    setLoading(false);
  };

  // --- Download and Share helpers ---
  const downloadQR = (url, filename = "qr.png") => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareQR = async (url, token) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], `qr_${token.token_id}.png`, { type: blob.type });
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `QR Code for ${token.token_id}`,
          text: `Token: ${token.token_id}, Category: ${token.category.name}, Status: ${token.status}`,
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert("QR link copied to clipboard. You can share it anywhere.");
      }
    } catch {
      alert("Sharing failed. Try downloading or copying the QR link.");
    }
  };

  return (
    <div style={mainBg}>
      <Sidebar />
      <div style={centeredContent}>
        <div style={cardWrapper}>
          <h2 style={title}>Bulk QR Token Generation</h2>
          <form onSubmit={handleSubmit} style={{ width: "100%" }}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontWeight: 600, fontSize: 15 }}>Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                style={input}
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontWeight: 600, fontSize: 15 }}>Count</label>
              <input
                type="number"
                name="count"
                min={1}
                value={form.count}
                onChange={handleChange}
                required
                style={input}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={btn("#2563EB", "#fff")}
            >
              {loading ? "Generating..." : "Bulk Generate"}
            </button>
            {error && (
              <div style={{ color: "red", marginTop: 18, textAlign: "center" }}>{error}</div>
            )}
          </form>
          {result && (
            <div style={tableWrapper}>
              <h3 style={tableTitle}>
                Generated Tokens ({result.count})
              </h3>
              <table style={table}>
                <thead>
                  <tr>
                    <th style={th}>Token ID</th>
                    <th style={th}>Status</th>
                    <th style={th}>Category</th>
                    <th style={th}>Queue Position</th>
                    <th style={th}>QR Code</th>
                    <th style={th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {result.created.map((token) => (
                    <tr key={token.token_id}>
                      <td style={td}>{token.token_id}</td>
                      <td style={td}>{token.status}</td>
                      <td style={td}>{token.category.name}</td>
                      <td style={td}>{token.queue_position ?? "-"}</td>
                      <td style={td}>
                        {token.qr_image ? (
                          <img
                            src={token.qr_image}
                            alt="QR"
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 6,
                              border: "1px solid #e2e8f0",
                              background: "#fff",
                              objectFit: "contain",
                            }}
                          />
                        ) : "No QR"}
                      </td>
                      <td style={td}>
                        {token.qr_image && (
                          <>
                            <button style={btn("#2563EB", "#fff")} onClick={() => downloadQR(token.qr_image, `qr_${token.token_id}.png`)}>Download</button>
                            <button style={btn("#10B981", "#fff")} onClick={() => shareQR(token.qr_image, token)}>Share</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <style>
        {`
          @media (max-width: 900px) {
            .bulkqr-card {
              max-width: 98vw !important;
              border-radius: 0 !important;
              padding: 18px 6px !important;
              margin: 0 !important;
              box-shadow: none !important;
            }
            .bulkqr-centered-content {
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
  );
}

// --- Styles ---
const mainBg = {
  display: "flex",
  minHeight: "100vh",
  width: "100vw",
  background: "#F9FAFB", // unified background
};

const centeredContent = {
  flex: 1,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "100vh",
  marginLeft: 240,
};
centeredContent.className = "bulkqr-centered-content";

const cardWrapper = {
  width: "100%",
  maxWidth: 900,
  background: "#fff",
  borderRadius: 24,
  boxShadow: "0 8px 32px rgba(37,99,235,0.10)",
  padding: "38px 28px",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};
cardWrapper.className = "bulkqr-card";

const title = {
  fontSize: 32,
  fontWeight: 800,
  marginBottom: 32,
  textAlign: "center",
  color: "#2563EB",
  letterSpacing: 1,
};

const tableWrapper = {
  width: "100%",
  maxWidth: 900,
  background: "#fff",
  borderRadius: 18,
  boxShadow: "0 6px 18px rgba(0,0,0,0.07)",
  padding: "28px 18px",
  margin: "0 auto",
  marginBottom: 32,
  overflowX: "auto",
};

const tableTitle = {
  fontSize: 24,
  fontWeight: 700,
  marginBottom: 22,
  color: "#1E293B",
  letterSpacing: 0.5,
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: 10,
  fontSize: 16,
  background: "#fff",
  borderRadius: 14,
  overflow: "hidden",
  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
};

const th = {
  textAlign: "center",
  padding: "14px",
  background: "#F3F6FC",
  fontWeight: 700,
  borderBottom: "2px solid #E2E8F0",
  color: "#2563EB",
  fontSize: 16,
  letterSpacing: 0.3,
};

const td = {
  padding: "14px",
  borderBottom: "1px solid #E2E8F0",
  color: "#334155",
  textAlign: "center",
  verticalAlign: "middle",
  background: "#fff",
};

const input = {
  width: "100%",
  padding: 12,
  borderRadius: 10,
  border: "1px solid #e2e8f0",
  marginTop: 8,
  fontSize: 16,
  background: "#F8FAFC",
  marginBottom: 8,
};

const btn = (bg, color) => ({
  background: bg,
  color: color,
  padding: "10px 18px",
  borderRadius: 10,
  border: "none",
  fontWeight: 700,
  fontSize: 16,
  cursor: "pointer",
  marginRight: 10,
  marginTop: 8,
  boxShadow: "0 2px 8px rgba(37,99,235,0.08)",
  transition: "background 0.2s",
});