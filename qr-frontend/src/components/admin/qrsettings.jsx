import React, { useEffect, useState } from "react";
import API from "../../Services/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "../Sidebar";

export default function QRSettingsManager() {
  const [settings, setSettings] = useState({
    size: 256,
    border: 4,
    error_correction: "M",
    expiry_hours: 24,
    generation_start_time: "09:00",
    generation_end_time: "18:00",
    daily_reset: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await API.get("tokens/qr-settings/");
      setSettings(res.data);
    } catch {
      toast.error("Failed to load QR settings");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("tokens/qr-settings/", settings);
      setSettings(res.data.settings);
      toast.success("Settings saved!");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={mainBg}>
      <Sidebar />
      <div style={centeredContent}>
        <ToastContainer />
        <form onSubmit={handleSave} style={formGrid}>
          <h2 style={title}>⚙️ QR Code Settings</h2>
          <div style={row}>
            <label style={label}>Default Size:</label>
            <input
              type="number"
              name="size"
              value={settings.size}
              min={128}
              max={1024}
              onChange={handleChange}
              style={input}
            />
          </div>
          <div style={row}>
            <label style={label}>Default Border:</label>
            <input
              type="number"
              name="border"
              value={settings.border}
              min={1}
              max={20}
              onChange={handleChange}
              style={input}
            />
          </div>
          <div style={row}>
            <label style={label}>Error Correction:</label>
            <select
              name="error_correction"
              value={settings.error_correction}
              onChange={handleChange}
              style={input}
            >
              <option value="L">Low</option>
              <option value="M">Medium</option>
              <option value="Q">Quartile</option>
              <option value="H">High</option>
            </select>
          </div>
          <div style={row}>
            <label style={label}>Expiry Hours:</label>
            <input
              type="number"
              name="expiry_hours"
              value={settings.expiry_hours}
              min={1}
              max={168}
              onChange={handleChange}
              style={input}
            />
          </div>
          <div style={row}>
            <label style={label}>Generation Start Time:</label>
            <input
              type="time"
              name="generation_start_time"
              value={settings.generation_start_time}
              onChange={handleChange}
              style={input}
            />
          </div>
          <div style={row}>
            <label style={label}>Generation End Time:</label>
            <input
              type="time"
              name="generation_end_time"
              value={settings.generation_end_time}
              onChange={handleChange}
              style={input}
            />
          </div>
          <div style={row}>
            <label style={label}>Reset tokens daily:</label>
            <input
              type="checkbox"
              name="daily_reset"
              checked={!!settings.daily_reset}
              onChange={handleChange}
              style={{ ...input, width: 22, height: 22 }}
            />
          </div>
          <div style={row}>
            <button type="submit" style={btn} disabled={loading}>
              {loading ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
      <style>
        {`
          @media (max-width: 900px) {
            .qr-centered-content {
              margin-left: 0 !important;
              padding: 0 !important;
              width: 100vw !important;
              min-height: 100vh !important;
              display: flex !important;
              justify-content: center !important;
              align-items: flex-start !important;
            }
            .qr-form-grid {
              grid-template-columns: 1fr !important;
              max-width: 98vw !important;
              padding: 18px 6px !important;
            }
          }
        `}
      </style>
    </div>
  );
}

/* -------- Styles -------- */
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
centeredContent.className = "qr-centered-content";

const formGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 24,
  background: "#fff",
  borderRadius: 18,
  boxShadow: "0 6px 18px rgba(0,0,0,0.07)",
  padding: "32px 36px",
  maxWidth: 700,
  width: "100%",
  alignItems: "center",
};
formGrid.className = "qr-form-grid";

const row = {
  display: "flex",
  alignItems: "center",
  gap: 18,
  marginBottom: 0,
};

const label = {
  fontWeight: 600,
  fontSize: 16,
  color: "#1E3A8A",
  minWidth: 180,
  textAlign: "right",
};

const input = {
  border: "1px solid #CBD5E1",
  borderRadius: 8,
  padding: "10px 12px",
  fontSize: 15,
  width: "100%",
  background: "#F8FAFC",
};

const btn = {
  padding: "12px 32px",
  borderRadius: 8,
  border: "none",
  background: "#2563EB",
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer",
  fontSize: 16,
  marginLeft: "auto",
  marginRight: "auto",
  transition: "all 0.2s ease",
  boxShadow: "0 2px 8px rgba(37,99,235,0.08)",
};

const title = {
  gridColumn: "1 / span 2",
  fontSize: 28,
  fontWeight: 700,
  marginBottom: 18,
  textAlign: "center",
  color: "#1E3A8A",
};
