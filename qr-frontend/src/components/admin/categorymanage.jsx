// CategoryManager.jsx

import React, { useEffect, useState } from "react";
import API from "../../Services/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "../Sidebar";

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#2563EB");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("#2563EB");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await API.get("categories/settings/");
      setCategories(res.data);
    } catch {
      toast.error("Failed to load categories");
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await API.post("categories/settings/", { name: newName, color: newColor });
      toast.success("Category added!");
      setNewName("");
      setNewColor("#2563EB");
      fetchCategories();
    } catch {
      toast.error("Failed to add category");
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await API.patch("categories/settings/", { id: editId, name: editName, color: editColor });
      toast.success("Category updated!");
      setEditId(null);
      setEditName("");
      setEditColor("#2563EB");
      fetchCategories();
    } catch {
      toast.error("Failed to update category");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await API.delete(`categories/${id}/`);
      toast.success("Category deleted!");
      fetchCategories();
    } catch {
      toast.error("Failed to delete category");
    }
  };

  return (
    <div style={mainBg}>
      <Sidebar />
      <div style={centeredContent}>
        <ToastContainer />
        <div style={cardWrapper}>
          <h2 style={title}>Category Management</h2>
          <form onSubmit={handleAdd} style={{ display: "flex", gap: 8, marginBottom: 24, width: "100%" }}>
            <input
              type="text"
              placeholder="Category Name"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              style={input}
              required
            />
            <input
              type="color"
              value={newColor}
              onChange={e => setNewColor(e.target.value)}
              style={input}
            />
            <button type="submit" style={btn("#2563EB", "#fff")}>Add Category</button>
          </form>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Color</th>
                <th style={th}>Category Name</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id}>
                  <td style={td}>
                    <span style={{ ...catColor, background: cat.color }}></span>
                  </td>
                  <td style={td}>{cat.name}</td>
                  <td style={td}>
                    <button
                      style={smallBtn("#16A34A", "#fff")}
                      onClick={() => {
                        setEditId(cat.id);
                        setEditName(cat.name);
                        setEditColor(cat.color);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      style={smallBtn("#DC2626", "#fff")}
                      onClick={() => handleDelete(cat.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {editId && (
            <form onSubmit={handleEdit} style={{ display: "flex", gap: 8, marginTop: 16, width: "100%" }}>
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                style={input}
                required
              />
              <input
                type="color"
                value={editColor}
                onChange={e => setEditColor(e.target.value)}
                style={input}
              />
              <button type="submit" style={btn("#DC2626", "#fff")}>Save</button>
              <button type="button" style={btn("#E5E7EB", "#000")} onClick={() => setEditId(null)}>Cancel</button>
            </form>
          )}
        </div>
      </div>
      <style>
        {`
          @media (max-width: 900px) {
            .category-card {
              max-width: 98vw !important;
              border-radius: 0 !important;
              padding: 18px 6px !important;
              margin: 0 !important;
              box-shadow: none !important;
            }
            .category-centered-content {
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
  marginLeft: 240,
};
centeredContent.className = "category-centered-content";

const cardWrapper = {
  width: "100%",
  maxWidth: 500,
  background: "#fff",
  borderRadius: 18,
  boxShadow: "0 6px 18px rgba(0,0,0,0.07)",
  padding: "28px 18px",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};
cardWrapper.className = "category-card";

const title = {
  fontSize: 24,
  fontWeight: 700,
  marginBottom: 24,
  color: "#2563EB",
  textAlign: "center",
};

const input = {
  border: "1px solid #CBD5E1",
  borderRadius: 8,
  padding: "8px 10px",
  fontSize: 16,
  minWidth: 80,
};

const btn = (bg, color, mt = 0) => ({
  padding: "8px 14px",
  borderRadius: 8,
  border: "none",
  background: bg,
  color,
  fontWeight: 600,
  cursor: "pointer",
  marginTop: mt,
  marginRight: 8,
});

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
  background: "#fff",
};

const smallBtn = (bg, color) => ({
  padding: "4px 10px",
  borderRadius: 6,
  border: "none",
  background: bg,
  color,
  fontWeight: 600,
  cursor: "pointer",
  marginRight: 6,
  fontSize: 13,
  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
});

const catColor = {
  width: 24,
  height: 24,
  borderRadius: "50%",
  display: "inline-block",
  margin: "0 auto",
};