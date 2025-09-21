// src/components/queue-manage/CategorySummary.jsx
import React, { useEffect, useState } from "react";
import API from "../../Services/api";
import { Link } from "react-router-dom";
import Sidebar from "../Sidebar";

export default function CategorySummary() {
  const [userSummary, setUserSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await API.get("tokens/my-summary/");
        setUserSummary(res.data);
      } catch (err) {
        console.error("Error fetching user summary:", err);
        setError("Failed to load user details");
      }
    };

    fetchSummary();
  }, []);

  if (error) return <div style={emptyText}>{error}</div>;
  if (!userSummary) return <div style={emptyText}>Loading...</div>;

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
      <div style={pageWrapper}>
        <div style={cardWrapper}>
          <h1 style={pageTitle}>My Profile</h1>
          <div style={card}>
            <div style={row}>
              <span style={label}>Username:</span>
              <span>{userSummary.username}</span>
            </div>
            <div style={row}>
              <span style={label}>Full Name:</span>
              <span>{userSummary.full_name}</span>
            </div>
            <div style={row}>
              <span style={label}>Email:</span>
              <span>{userSummary.email}</span>
            </div>
            <div style={row}>
              <span style={label}>Assigned Categories:</span>
              <span>{userSummary.categories.join(", ")}</span>
            </div>
          </div>
          
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
  background: "#F9FAFB",
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
  padding: 20,
  background: "#fff",
  maxWidth: 500,
  width: "100%",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  marginBottom: 24,
};

const row = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: 12,
};

const label = {
  fontWeight: 600,
  color: "#374151",
};

const emptyText = { color: "#64748B", padding: "12px 0" };

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
