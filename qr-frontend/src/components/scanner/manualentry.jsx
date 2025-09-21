// src/components/Queue/ManualEntry.jsx
import React, { useState, useEffect } from "react";
import API from "../../Services/api";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import MainLayout from "../layout/MainLayout";

const ManualEntry = ({ onSuccess }) => {
  const [tokenId, setTokenId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await API.get("/users/categories/");
      setCategories(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load categories.");
    }
  };

  const handleManualCall = async () => {
    if (!tokenId || !categoryId) {
      toast.error("Token ID and Category are required");
      return;
    }

    try {
      setLoading(true);
      const res = await API.post("/tokens/tokens/manual_call/", {
        token_id: tokenId,
        category_id: categoryId,
      });

      toast.success(`Token ${res.data.token_id} has been manually called!`);
      setTokenId("");
      setCategoryId("");

      if (onSuccess) {
        onSuccess(res.data); // notify parent to refresh queue
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to manually call token.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div style={wrapper}>
        <h2>Manual Token Entry</h2>
        <div style={formRow}>
          <input
            type="text"
            placeholder="Enter Token ID"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            style={input}
          />
        </div>
        <div style={formRow}>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            style={input}
          >
            <option value="">-- Select Category --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleManualCall}
          disabled={loading}
          style={btn("#2563EB", "#fff")}
        >
          {loading ? "Processing..." : "Call Token"}
        </button>
        <ul style={listStyle}>
          <li style={itemStyle}>
            <Link to="/dashboard" style={linkStyle}>
              Dashboard
            </Link>
          </li>
          <li style={itemStyle}>
            <Link to="/admin/bulkqr" style={linkStyle}>
              Bulk QR
            </Link>
          </li>
          {/* Add more links as needed */}
        </ul>
      </div>
    </MainLayout>
  );
};

/* --- Styles --- */
const wrapper = {
  margin: "16px 24px",
  padding: 16,
  background: "#fff",
  borderRadius: 12,
  border: "1px solid #E2E8F0",
};

const formRow = { marginBottom: 12 };

const input = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #CBD5E1",
  fontSize: 15,
};

const btn = (bg, color) => ({
  padding: "10px 14px",
  borderRadius: 10,
  border: "none",
  background: bg,
  color,
  fontWeight: 700,
  cursor: "pointer",
});

const listStyle = {
  listStyleType: "none",
  padding: 0,
  margin: 0,
};

const itemStyle = {
  marginBottom: 8,
};

const linkStyle = {
  textDecoration: "none",
  color: "#2563EB",
  fontWeight: 500,
};

export default ManualEntry;
