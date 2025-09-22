// CompletedTokens.jsx
import React, { useEffect, useState } from "react";
import API from "../services/api"; // Axios helper
import Sidebar from "./Sidebar"; // Adjust the path as needed

import { Link } from "react-router-dom";

export default function CompletedTokens() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCompletedTokens = async () => {
    try {
      setLoading(true);
      const response = await API.get("/api/tokens/completed/"); // DRF endpoint
      if (Array.isArray(response.data)) {
        setTokens(response.data);
      } else {
        console.error("Expected array but got:", response.data);
        setTokens([]);
      }
    } catch (err) {
      console.error("Error fetching completed tokens:", err);
      setError("Failed to fetch completed tokens.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletedTokens();
  }, []);

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
        <h1 style={pageTitle}>Completed Tokens</h1>

        {loading ? (
          <div style={emptyText}>Loading...</div>
        ) : error ? (
          <div style={emptyText}>{error}</div>
        ) : (
          <div style={card}>
            {tokens.length === 0 ? (
              <div style={emptyText}>No completed tokens at the moment.</div>
            ) : (
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
                  {tokens.map((token) => (
                    <tr key={token.id}>
                      <td style={td}>{token.token_id}</td>
                      <td style={td}>{token.category_name}</td>
                      <td style={td}>{token.status}</td>
                      <td style={td}>
                        {token.issued_at
                          ? new Date(token.issued_at).toLocaleString()
                          : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
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

const emptyText = {
  color: "#64748B",
  padding: "12px 0",
};

const listStyle = {
  listStyleType: "none",
  padding: 0,
  margin: 0,
};

const itemStyle = {
  marginBottom: 10,
};

const linkStyle = {
  textDecoration: "none",
  color: "#1D4ED8",
  fontWeight: 500,
};
