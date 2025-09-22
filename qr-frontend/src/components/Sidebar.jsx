import React, { useState, useEffect, useRef } from "react";
import API from "../Services/api";
import { useNavigate, NavLink, useLocation } from "react-router-dom";

export default function Sidebar() {
  const [sections, setSections] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false); // mobile sidebar toggle
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarRef = useRef(null);

  useEffect(() => {
    const cached = localStorage.getItem("sidebar");
    if (cached) {
      setSections(JSON.parse(cached));
      setLoading(false);
      return;
    }

    const fetchSidebar = async () => {
      try {
        const res = await API.get("sidebar/");
        setSections(res.data || []);
        localStorage.setItem("sidebar", JSON.stringify(res.data || []));
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

  // Scroll active item into view smoothly
  useEffect(() => {
    if (!sidebarRef.current) return;
    const activeItem = sidebarRef.current.querySelector(".active-link");
    if (activeItem) {
      activeItem.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [location.pathname, sections]);

  useEffect(() => {
    setOpen(false); // close sidebar on route change (mobile)
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    localStorage.removeItem("sidebar");
    navigate("/login");
  };

  // Hamburger icon
  const Hamburger = ({ onClick, open }) => (
    <button
      aria-label="Toggle sidebar"
      onClick={onClick}
      style={{
        ...hamburgerBtn,
        ...(open ? { background: "#2563EB" } : {}),
      }}
      className="sidebar-hamburger"
    >
      <span style={{ ...bar, ...(open ? { transform: "rotate(45deg) translate(5px,5px)" } : {}) }} />
      <span style={{ ...bar, ...(open ? { opacity: 0 } : {}) }} />
      <span style={{ ...bar, ...(open ? { transform: "rotate(-45deg) translate(7px,-7px)" } : {}) }} />
    </button>
  );

  if (loading && sections.length === 0)
    return <div style={loadingStyle}>Loading sidebar...</div>;
  if (error) return <div style={errorStyle}>{error}</div>;

  return (
    <>
      <Hamburger onClick={() => setOpen((o) => !o)} open={open} />
      <aside
        style={{
          ...sidebarWrapper,
          ...(open ? sidebarMobileOpen : sidebarMobileClosed),
        }}
        ref={sidebarRef}
        className="sidebar-main"
      >
        <div style={sidebarScroll}>
          <div style={logoContainer}>
            <span style={logoTextStyle}>FIRST FLIGHT</span>
          </div>
          {sections.map((section, idx) => (
            <div
              key={section.id}
              style={idx === 0 ? sectionStyle : { marginBottom: "18px" }} // only first section gets extra top margin
            >
              <h4 style={sectionTitleStyle}>{section.title}</h4>
              <ul style={listStyle}>
                {section.items.map((item) => (
                  <li key={item.id} style={itemStyle}>
                    <NavLink
                      to={`/${item.url}`}
                      className={({ isActive }) =>
                        isActive ? "active-link" : ""
                      }
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
        <button style={logoutBtnStyle} onClick={handleLogout}>
          Logout
        </button>
      </aside>
      {/* Overlay for mobile */}
      {open && <div style={overlay} onClick={() => setOpen(false)} />}
      <style>
        {`
          @media (max-width: 900px) {
            .sidebar-main {
              position: fixed !important;
              left: 0 !important;
              top: 0 !important;
              z-index: 1002 !important;
              height: 100vh !important;
              width: 220px !important;
              transition: transform 0.3s cubic-bezier(.4,0,.2,1);
            }
            .sidebar-hamburger {
              display: flex !important;
            }
          }
          @media (min-width: 900px) {
            .sidebar-hamburger { display: none !important; }
            .sidebar-main {
              transform: translateX(0) !important;
              position: fixed !important;
              left: 0 !important;
              top: 0 !important;
              z-index: 1002 !important;
              height: 100vh !important;
              width: 220px !important;
            }
          }
        `}
      </style>
    </>
  );
}

// --- Styles ---
const sidebarWrapper = {
  width: "400px",
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
  position: "fixed",
  left: 0,
  top: 0,
  zIndex: 1002,
  transition: "transform 0.3s cubic-bezier(.4,0,.2,1)",
};

const sidebarMobileOpen = {
  transform: "translateX(0)",
};

const sidebarMobileClosed = {
  transform: "translateX(-110%)",
  boxShadow: "none",
};

const sidebarScroll = {
  overflowY: "auto",
  padding: "20px",
  flex: 1,
  scrollbarWidth: "none",
  msOverflowStyle: "none",
  scrollBehavior: "smooth",
};

const logoContainer = { 
  display: "flex", 
  alignItems: "center", 
  justifyContent: "flex-start",
  marginBottom: "10px",
  paddingLeft: "6px"
};

const logoTextStyle = { 
  fontSize: "18px", 
  fontWeight: 800,  
  color: "#2563EB", 
  letterSpacing: 2, 
  fontFamily: "Segoe UI, sans-serif", 
  margin: 0,
  textAlign: "left"
};

const sectionStyle = {
  marginTop: "50px", 
  marginBottom: "18px",
};

const sectionTitleStyle = { fontSize: "13px", color: "#444", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 500 };
const listStyle = { listStyle: "none", padding: 0, margin: 0 };
const itemStyle = { marginBottom: "10px" };
const linkStyle = { color: "#1F2937", textDecoration: "none", fontSize: "14px", padding: "10px 14px", display: "block", borderRadius: "10px", fontWeight: 400, background: "rgba(0,0,0,0.02)", transition: "all 0.3s ease", cursor: "pointer" };
const logoutBtnStyle = { margin: 20, padding: "10px 0", width: "calc(100% - 40px)", background: "#DC2626", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 15, cursor: "pointer", letterSpacing: 1, boxShadow: "0 2px 8px rgba(220,38,38,0.08)" };
const errorStyle = { color: "red", padding: "20px", textAlign: "center" };
const loadingStyle = { color: "#444", padding: "20px", textAlign: "center" };

const hamburgerBtn = {
  position: "fixed",
  top: 18,
  left: 18,
  zIndex: 1100,
  width: 44,
  height: 44,
  background: "#fff",
  border: "none",
  borderRadius: "50%",
  boxShadow: "0 2px 8px rgba(37,99,235,0.10)",
  display: "none", 
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  gap: 5,
};

const bar = {
  display: "block",
  width: 22,
  height: 3,
  background: "#2563EB",
  borderRadius: 2,
  margin: "3px 0",
  transition: "all 0.3s cubic-bezier(.4,0,.2,1)",
};

const overlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,0.18)",
  zIndex: 1001,
  transition: "opacity 0.3s",
};
