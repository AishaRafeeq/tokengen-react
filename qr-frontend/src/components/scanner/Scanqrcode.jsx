import React, { useState } from "react";
import { QrReader } from "react-qr-reader";
import API from "../../Services/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { Link } from "react-router-dom";
import Sidebar from "./Sidebar"; // Adjust the path as needed

export default function ScanQRCode() {
  const [scannedToken, setScannedToken] = useState("");
  const [loading, setLoading] = useState(false);

  const handleScan = async (data) => {
    if (data) {
      setScannedToken(data);
      try {
        const parsed = JSON.parse(data);
        if (parsed.token_id && parsed.category_id) {
          setLoading(true);
          await API.post("/tokens/tokens/manual_call/", {
            token_id: parsed.token_id,
            category_id: parsed.category_id,
          });
          toast.success(`Token ${parsed.token_id} scanned & called!`);
        } else {
          toast.error("Invalid QR Code format.");
        }
      } catch {
        toast.error("QR Code is not valid JSON.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleError = (err) => {
    console.error(err);
    toast.error("Error accessing camera. Please allow permissions.");
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
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>
          Scan QR Code
        </h2>

        <div style={{ maxWidth: 400, margin: "0 auto", background: "#fff", padding: 16, borderRadius: 12, border: "1px solid #E2E8F0" }}>
          <QrReader
            onResult={(result, error) => {
              if (result) handleScan(result?.text);
              if (error) handleError(error);
            }}
            style={{ width: "100%" }}
          />

          {scannedToken && (
            <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: "#D1FAE5", color: "#065F46", border: "1px solid #10B981" }}>
              <strong>Scanned Token Data:</strong> {scannedToken}
            </div>
          )}

          {loading && (
            <div style={{ marginTop: 12, color: "#2563EB", fontWeight: 600 }}>
              Submitting scan...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
