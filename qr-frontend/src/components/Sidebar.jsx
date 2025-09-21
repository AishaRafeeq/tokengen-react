import React, { useState, useEffect } from "react";
import API from "../Services/api";
import { useNavigate, NavLink, useLocation } from "react-router-dom";

export default function Sidebar() {
  const [sections, setSections] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchSidebar = async () => {
      try {
        const res = await API.get("sidebar/");
        setSections(res.data || []);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          setError("Session expired. Redirecting to login...");
          setTimeout(() => navigate("/login"), 1500);
        } else {
          setError("Failed to load sidebar.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchSidebar();
  }, [navigate]);

  const handleLogout = () => {
    // Remove token from localStorage/sessionStorage if used
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    // Optionally, call backend logout endpoint here
    navigate("/login");
  };

  if (loading) return <div style={loadingStyle}>Loading sidebar...</div>;
  if (error) return <div style={errorStyle}>{error}</div>;

  return (
    <aside style={sidebarWrapper}>
      <div style={sidebarScroll}>
        <div style={logoContainer}>
          <h2 style={logoTextStyle}>FIRST FLIGHT</h2>
        </div>
        {sections.map((section) => (
          <div key={section.id} style={sectionStyle}>
            <h4 style={sectionTitleStyle}>{section.title}</h4>
            <ul style={listStyle}>
              {section.items.map((item) => (
                <li key={item.id} style={itemStyle}>
                  <NavLink
                    to={`/${item.url}`}
                    style={({ isActive }) => ({
                      ...linkStyle,
                      background: isActive
                        ? "rgba(59, 130, 246, 0.2)"
                        : linkStyle.background,
                      color: isActive ? "#1E40AF" : linkStyle.color,
                      fontWeight: isActive ? 600 : 400,
                    })}
                  >
                    {item.title}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {/* Logout Button */}
      <button style={logoutBtnStyle} onClick={handleLogout}>
        Logout
      </button>
    </aside>
  );
}

// --- Styles ---
const sidebarWrapper = {
  width: "220px",
  height: "100vh",
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(15px)",
  WebkitBackdropFilter: "blur(15px)",
  borderRight: "1px solid rgba(0,0,0,0.1)",
  borderRadius: "16px 0 0 16px",
  boxShadow: "5px 0 15px rgba(0,0,0,0.1)",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  justifyContent: "space-between",
};

const sidebarScroll = {
  overflowY: "auto",
  padding: "20px",
  flex: 1,
  scrollbarWidth: "none",
  msOverflowStyle: "none",
};

const logoContainer = {
  display: "flex",
  alignItems: "center",
  marginBottom: "30px",
};

const logoTextStyle = {
  fontSize: "20px",
  color: "#1E3A8A",
  fontWeight: 500,
  margin: 0,
  letterSpacing: 1,
};

const sectionStyle = {
  marginBottom: "25px",
};

const sectionTitleStyle = {
  fontSize: "13px",
  color: "#444",
  marginBottom: "8px",
  textTransform: "uppercase",
  letterSpacing: "1px",
  fontWeight: 500,
};

const listStyle = {
  listStyle: "none",
  padding: 0,
  margin: 0,
};

const itemStyle = {
  marginBottom: "10px",
};

const linkStyle = {
  color: "#1F2937",
  textDecoration: "none",
  fontSize: "14px",
  padding: "10px 14px",
  display: "block",
  borderRadius: "10px",
  fontWeight: 400,
  background: "rgba(0,0,0,0.02)",
  transition: "all 0.3s ease",
  cursor: "pointer",
};

const logoutBtnStyle = {
  margin: 20,
  padding: "10px 0",
  width: "calc(100% - 40px)",
  background: "#DC2626",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  fontWeight: 600,
  fontSize: 15,
  cursor: "pointer",
  letterSpacing: 1,
  boxShadow: "0 2px 8px rgba(220,38,38,0.08)",
};

const errorStyle = {
  color: "red",
  padding: "20px",
  textAlign: "center",
};

const loadingStyle = {
  color: "#444",
  padding: "20px",
  textAlign: "center",
};
