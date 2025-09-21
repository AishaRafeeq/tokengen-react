import React, { useEffect, useState } from "react";
import Sidebar from "../Sidebar";
import axios from "../../Services/api";

export default function AdminTokensView() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ category: "", status: "waiting" });
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchTokens();
    fetchCategories();
  }, []);

  const fetchTokens = () => {
    setLoading(true);
    axios.get("/tokens/admin-tokens/")
      .then(res => setTokens(res.data))
      .catch(() => setTokens([]))
      .finally(() => setLoading(false));
  };

  const fetchCategories = () => {
    axios.get("/categories/")
      .then(res => setCategories(res.data))
      .catch(() => setCategories([]));
  };

  // Download QR image
  const downloadQR = (url, filename = "qr.png") => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Share QR image (if supported)
  const shareQR = async (url, token) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], `qr_${token.token_id}.png`, { type: blob.type });
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `QR Code for ${token.token_id}`,
          text: `Token: ${token.token_id}, Category: ${token.category_name}, Status: ${token.status}`,
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert("QR link copied to clipboard. You can share it anywhere.");
      }
    } catch {
      alert("Sharing failed. Try downloading or copying the QR link.");
    }
  };

  // Handle token generation
  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.category || !form.status) return;
    try {
      await axios.post("/tokens/admin_generate/", form);
      setForm({ category: "", status: "waiting" });
      fetchTokens();
    } catch (error) {
      alert("Failed to generate token. Please try again.");
    }
  };

  // Filter tokens by search
  const filteredTokens = tokens.filter(token =>
    (token.token_id?.toLowerCase().includes(search.toLowerCase()) ||
     token.category_name?.toLowerCase().includes(search.toLowerCase()) ||
     token.status?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={outerWrapper}>
      <div style={sidebarWrapper}>
        <Sidebar />
      </div>
      <div style={contentFill}>
        <h2 style={title}>Admin Generated Tokens</h2>
        <form style={formStyle} onSubmit={handleGenerate}>
          <select
            value={form.category}
            onChange={e => setForm({ ...form, category: e.target.value })}
            style={input}
            required
          >
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <select
            value={form.status}
            onChange={e => setForm({ ...form, status: e.target.value })}
            style={input}
            required
          >
            <option value="waiting">Waiting</option>
            <option value="called">Called</option>
            <option value="completed">Completed</option>
          </select>
          <button type="submit" style={btn("#2563EB", "#fff")}>Generate Token</button>
        </form>
        <input
          type="text"
          placeholder="Search by Token, Category, Status"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={searchInput}
        />
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div style={{ overflowX: "auto", width: "100%", marginTop: 24 }}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>Token ID</th>
                  <th style={th}>Category</th>
                  <th style={th}>Status</th>
                  
                  <th style={th}>Issued At</th>
                  <th style={th}>QR Code</th>
                  <th style={th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTokens.length === 0 ? (
                  <tr>
                    <td style={td} colSpan={7}>No tokens found.</td>
                  </tr>
                ) : (
                  filteredTokens.map(token => (
                    <tr key={token.token_id}>
                      <td style={td}>{token.token_id}</td>
                      <td style={td}>{token.category_name}</td>
                      <td style={td}>{token.status}</td>
                      
                      <td style={td}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                          <span>{token.issued_at ? new Date(token.issued_at).toLocaleDateString() : "-"}</span>
                          <span>{token.issued_at ? new Date(token.issued_at).toLocaleTimeString() : ""}</span>
                        </div>
                      </td>
                      <td style={td}>
                        {token.qr_code ? (
                          <img src={token.qr_code} alt="QR" style={{ width: 40, height: 40, borderRadius: 6 }} />
                        ) : "No QR"}
                      </td>
                      <td style={td}>
                        {token.qr_code && (
                          <>
                            <button style={btn("#2563EB", "#fff")} onClick={() => downloadQR(token.qr_code, `qr_${token.token_id}.png`)}>Download</button>
                            <button
                              style={btn("#10B981", "#fff")}
                              onClick={() => shareQR(token.qr_code, token)}
                            >
                              Share
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Styles ---
const outerWrapper = {
  display: "flex",
  minHeight: "100vh",
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

const contentFill = {
  flex: 1,
  marginLeft: 400,
  padding: "32px 0px 32px 32px",
  minHeight: "100vh",
  background: "#F9FAFB",
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  justifyContent: "flex-start",
  width: "100%",
};

const formStyle = {
  marginBottom: 32,
  width: "100%",
  display: "flex",
  gap: 12,
  alignItems: "center",
  justifyContent: "flex-start",
  flexWrap: "wrap",
};

const searchInput = {
  border: "1px solid #CBD5E1",
  borderRadius: 8,
  padding: "8px 10px",
  fontSize: 16,
  background: "#F8FAFC",
  marginBottom: 16,
  width: "300px",
  maxWidth: "100%",
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: 10,
  fontSize: 15,
  background: "#fff",
  borderRadius: 12,
  overflow: "hidden",
  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
};

const th = {
  textAlign: "center",
  padding: "12px",
  background: "#F6F8FF",
  fontWeight: 700,
  borderBottom: "2px solid #E2E8F0",
  color: "#0B3A6A",
  fontSize: 15,
};

const td = {
  padding: "12px",
  borderBottom: "1px solid #E2E8F0",
  color: "#475569",
  textAlign: "center",
  verticalAlign: "middle",
};

const title = {
  fontSize: 26,
  fontWeight: 700,
  marginBottom: 24,
  color: "#2563EB",
  textAlign: "left",
};

const btn = (bg, color) => ({
  padding: "8px 14px",
  borderRadius: 8,
  border: "none",
  background: bg,
  color,
  fontWeight: 600,
  cursor: "pointer",
  marginRight: 8,
  transition: "all 0.2s ease",
  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
});

const input = {
  border: "1px solid #CBD5E1",
  borderRadius: 8,
  padding: "8px 10px",
  fontSize: 16,
  background: "#F8FAFC",
  minWidth: 120,
};