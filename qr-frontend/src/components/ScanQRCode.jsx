// src/components/ScanQRCode.jsx
import React, { useState } from "react";
import { QrReader } from "react-qr-reader";
import API from "../services/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "./Sidebar";

export default function ScanQRCode() {
  const [scannedToken, setScannedToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Scan logic: Accepts plain token_id, JSON with token_id/category_id, or QR with url param
  const handleResult = async (result, errorObj) => {
    if (!!result?.text) {
      let tokenId = result.text;
      let categoryId = null;
      setError("");
      setScannedToken(null);

      // Try to parse JSON or extract token_id/category_id
      try {
        const payload = JSON.parse(result.text);
        if (payload.token_id) tokenId = payload.token_id;
        if (payload.category_id) categoryId = payload.category_id;
        // If QR contains a url with token_id param
        if (payload.url) {
          try {
            const urlObj = new URL(payload.url);
            tokenId = urlObj.searchParams.get("token_id") || tokenId;
            categoryId = urlObj.searchParams.get("category_id") || categoryId;
          } catch {}
        }
      } catch {
        // Not JSON, use as is
      }

      if (!tokenId) {
        setError("Invalid QR Code");
        toast.error("Invalid QR Code");
        return;
      }

      // If categoryId is present, call manual_call, else just show token
      if (categoryId) {
        try {
          setLoading(true);
          await API.post("/tokens/tokens/manual_call/", { token_id: tokenId, category_id: categoryId });
          setScannedToken(tokenId);
          toast.success(`Token ${tokenId} scanned and called!`);
        } catch (err) {
          setError("Failed to call token.");
          toast.error("Failed to call token.");
        } finally {
          setLoading(false);
        }
      } else {
        setScannedToken(tokenId);
        toast.success(`Token ${tokenId} scanned!`);
      }
    }

    if (errorObj) {
      if (
        errorObj?.message?.includes("selectBestPatterns") ||
        errorObj?.name === "NotFoundException"
      ) return;
      console.warn(errorObj);
    }
  };

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
        <ToastContainer position="top-right" autoClose={2500} />
        <div style={cardWrapper}>
          <h2 style={title}>Scan QR Code</h2>
          <div style={qrContainer}>
            <QrReader
              onResult={handleResult}
              constraints={{ facingMode: "environment" }}
              videoStyle={{ width: "100%" }}
              style={{ width: "100%", maxWidth: 400 }}
            />
          </div>

          {scannedToken && (
            <div style={successMessage}>
              Scanned Token ID: {scannedToken}
            </div>
          )}

          {error && <div style={errorText}>{error}</div>}
          {loading && <div style={loadingText}>Submitting scan...</div>}
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
  overflowX: "hidden",
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
  maxWidth: 480,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const title = {
  fontSize: 28,
  fontWeight: 700,
  marginBottom: 24,
  color: "#2563EB",
};

const qrContainer = {
  border: "4px solid #3B82F6",
  borderRadius: 12,
  overflow: "hidden",
  width: "100%",
  maxWidth: 400,
  background: "#F3F4F6",
};

const successMessage = {
  marginTop: 16,
  padding: 12,
  background: "#D1FAE5",
  color: "#065F46",
  borderRadius: 8,
  border: "1px solid #10B981",
  fontWeight: 600,
  width: "100%",
  textAlign: "center",
};

const errorText = {
  marginTop: 16,
  color: "#DC2626",
  fontWeight: 500,
  width: "100%",
  textAlign: "center",
};

const loadingText = {
  marginTop: 12,
  color: "#2563EB",
  fontWeight: 500,
  width: "100%",
  textAlign: "center",
};
