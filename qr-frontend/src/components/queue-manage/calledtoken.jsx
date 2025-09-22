// CalledTokens.jsx
import React, { useEffect, useState } from "react";
import API from "../../services/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "../Staffs";
import { Link } from "react-router-dom";

export default function CalledTokens() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCalledTokens();
  }, []);

  const fetchCalledTokens = async () => {
    try {
      setLoading(true);
      const res = await API.get("/tokens/tokens/called/");
      if (Array.isArray(res.data)) {
        setTokens(res.data);
      } else {
        toast.error("Invalid response format.");
        setTokens([]);
      }
    } catch {
      toast.error("Failed to fetch called tokens.");
    } finally {
      setLoading(false);
    }
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
        <ToastContainer position="top-right" autoClose={2500} />

        {/* Header */}
        <div style={header}>
          <h1 style={{ margin: 0, fontSize: 24 }}>Called Tokens</h1>
          <p style={{ margin: 0, color: "#64748B" }}>Tokens that have been called</p>
        </div>

        {/* Table */}
        <div style={tableWrapper}>
          <div style={tableHeader}>
            <div>Token ID</div>
            <div>Category</div>
            <div>Status</div>
            <div>Queue Position</div>
            <div>Issued At</div>
          </div>

          {loading ? (
            <div style={centered}>
              <div style={spinner} />
              <p style={{ color: "#64748B" }}>Loading tokens…</p>
            </div>
          ) : tokens.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: "#64748B" }}>
              No called tokens found.
            </div>
          ) : (
            tokens.map((token) => (
              <div key={token.id} style={tableRow}>
                <div>{token.token_id}</div>
                <div>{token.category_name || token.category?.name || "N/A"}</div>
                <div>{token.status}</div>
                <div>{token.queue_position}</div>
                <div>{new Date(token.issued_at).toLocaleString()}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* --- Styles --- */
const pageWrapper = {
  width: "100vw",
  minHeight: "100vh",
  margin: 0,
  padding: 0,
  background: "#F9FAFB",
};

const header = {
  padding: "16px 24px",
};

const tableWrapper = {
  width: "100%",
  margin: "0 auto",
  border: "1px solid #E2E8F0",
  borderRadius: 12,
  background: "#fff",
};

const tableHeader = {
  display: "grid",
  gridTemplateColumns: "1.2fr 1.5fr 1fr 1fr 1.5fr",
  padding: "16px 20px",
  background: "#F8FAFC",
  color: "#475569",
  fontSize: 14,
  fontWeight: 600,
  textTransform: "uppercase",
};

const tableRow = {
  display: "grid",
  gridTemplateColumns: "1.2fr 1.5fr 1fr 1fr 1.5fr",
  padding: "16px 20px",
  borderTop: "1px solid #F1F5F9",
  fontSize: 15,
};

const spinner = {
  width: 40,
  height: 40,
  border: "4px solid #F1F5F9",
  borderTop: "4px solid #3B82F6",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
};

const centered = { display: "flex", flexDirection: "column", alignItems: "center", padding: 40 };

const listStyle = {
  listStyleType: "none",
  padding: 0,
  margin: 0,
};

const itemStyle = {
  margin: "8px 0",
};

const linkStyle = {
  textDecoration: "none",
  color: "#3B82F6",
  fontWeight: 500,
};
