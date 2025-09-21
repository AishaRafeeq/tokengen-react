import React from "react";
import Sidebar from "../Sidebar";

export default function MainLayout({ children }) {
  return (
    <div style={containerStyle}>
      <div style={sidebarFixedStyle}>
        <Sidebar />
      </div>
      <div style={contentStyle}>
        {children}
      </div>
    </div>
  );
}

// --- Styles ---
const containerStyle = {
  display: "flex",
  minHeight: "100vh",
  width: "100vw",
  background: "#F9FAFB",
};

const sidebarFixedStyle = {
  width: 220,
  minHeight: "100vh",
  position: "fixed",
  left: 0,
  top: 0,
  zIndex: 100,
  background: "#fff",
  boxShadow: "5px 0 15px rgba(0,0,0,0.07)",
};

const contentStyle = {
  flex: 1,
  marginLeft: 220,
  padding: "20px 40px",
  minHeight: "100vh",
  background: "#F9FAFB",
  overflow: "auto",
};