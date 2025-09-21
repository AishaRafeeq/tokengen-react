import React, { useEffect, useState } from "react";
import API from "../../Services/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "../Sidebar"; // Adjust the path as needed

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
      <div style={pageWrapper}>
        <div style={cardWrapper}>
          <ToastContainer />
          <h2 style={title}>QR Code Settings</h2>
          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
            <label>
              Default Size:
              <input
                type="number"
                name="size"
                value={settings.size}
                min={128}
                max={1024}
                onChange={handleChange}
                style={input}
              />
            </label>
            <label>
              Default Border:
              <input
                type="number"
                name="border"
                value={settings.border}
                min={1}
                max={20}
                onChange={handleChange}
                style={input}
              />
            </label>
            <label>
              Error Correction:
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
            </label>
            <label>
              Default Expiry Hours:
              <input
                type="number"
                name="expiry_hours"
                value={settings.expiry_hours}
                min={1}
                max={168}
                onChange={handleChange}
                style={input}
              />
            </label>
            <label>
              Generation Start Time:
              <input
                type="time"
                name="generation_start_time"
                value={settings.generation_start_time}
                onChange={handleChange}
                style={input}
              />
            </label>
            <label>
              Generation End Time:
              <input
                type="time"
                name="generation_end_time"
                value={settings.generation_end_time}
                onChange={handleChange}
                style={input}
              />
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                name="daily_reset"
                checked={!!settings.daily_reset}
                onChange={handleChange}
              />
              Reset tokens daily
            </label>
            <button type="submit" style={btn("#2563EB", "#fff")} disabled={loading}>
              {loading ? "Saving..." : "Save Settings"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const pageWrapper = {
  flex: 1,
  marginLeft: 450, 
  padding: "48px 0 48px 0",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  minHeight: "100vh",
  background: "linear-gradient(90deg, #F9FAFB 60%, #EFF6FF 100%)",
};

const cardWrapper = {
  width: "100%",
  maxWidth: 380, // Focused, not long
  background: "#fff",
  borderRadius: 18,
  boxShadow: "0 12px 36px rgba(37,99,235,0.10)",
  padding: "32px 24px",
  margin: "48px auto 32px auto",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const title = {
  fontSize: 32,
  fontWeight: 800,
  marginBottom: 32,
  textAlign: "center",
  color: "#2563EB",
  letterSpacing: 1,
};

const input = {
  border: "1px solid #CBD5E1",
  borderRadius: 10,
  padding: "12px 10px",
  fontSize: 16,
  width: "60%",
  marginLeft: 8,
  background: "#F8FAFC",
  marginBottom: 8,
};

const btn = (bg, color) => ({
  padding: "10px 18px",
  borderRadius: 10,
  border: "none",
  background: bg,
  color,
  fontWeight: 700,
  cursor: "pointer",
  marginLeft: 0,
  marginRight: 8,
  transition: "all 0.2s ease",
  boxShadow: "0 2px 8px rgba(37,99,235,0.08)",
});

const panelWrapper = {
  width: "100%",
  maxWidth: 420,
  background: "linear-gradient(90deg, #F0F9FF 60%, #E0F2FE 100%)",
  border: "1px solid #E5E7EB",
  borderRadius: 14,
  padding: "32px 24px",
  margin: "48px auto 32px auto",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  boxShadow: "0 2px 12px rgba(37,99,235,0.06)",
};