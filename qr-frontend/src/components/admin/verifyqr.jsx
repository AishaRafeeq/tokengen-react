// VerifyQR.jsx

import React, { useState } from "react";
import { QrReader } from "react-qr-reader";
import API from "../../services/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "../Sidebar"; // <-- Import Sidebar

export default function VerifyQR() {
  const [tokenId, setTokenId] = useState("");
  const [result, setResult] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async (id) => {
    try {
      const res = await API.post("tokens/verify-qr/", { token_id: id });
      setResult(res.data);
      if (res.data.verified) {
        toast.success("QR Verified!");
      } else {
        toast.error("Verification Failed");
      }
    } catch {
      toast.error("Verification failed");
      setResult(null);
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
      <div style={verifyWrapper}>
        <ToastContainer />
        <div style={verifyCard}>
          <h2 style={title}>Verify QR / Token</h2>
          <form
            onSubmit={e => {
              e.preventDefault();
              if (tokenId) handleVerify(tokenId);
            }}
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 16,
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
          >
            <input
              type="text"
              placeholder="Enter Token ID"
              value={tokenId}
              onChange={e => setTokenId(e.target.value)}
              style={input}
            />
            <button type="submit" style={btn("#2563EB", "#fff")}>
              Verify
            </button>
            <button
              type="button"
              style={btn("#16A34A", "#fff")}
              onClick={() => setShowScanner(!showScanner)}
            >
              {showScanner ? "Hide Scanner" : "Scan QR"}
            </button>
          </form>
          {showScanner && (
            <div style={{ marginBottom: 16, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <QrReader
                constraints={{ facingMode: "environment" }}
                scanDelay={500}
                onResult={result => {
                  if (!!result?.text) {
                    setShowScanner(false);
                    setTokenId(result.text);
                    handleVerify(result.text);
                  }
                }}
                style={{ width: "100%", maxWidth: 400 }}
              />
            </div>
          )}
          {error && <div style={{ color: "red", marginTop: 10 }}>{error}</div>}
          {result && (
            <div style={cardFull}>
              <div><b>Token ID:</b> {result.token_id}</div>
              <div><b>Verified:</b> {result.verified ? "Yes" : "No"}</div>
              <div><b>Status:</b> {result.verification_status}</div>
              {result.qr_image && (
                <img src={result.qr_image} alt="QR" style={{ width: 80, marginTop: 8, borderRadius: 8 }} />
              )}
            </div>
          )}
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

const verifyWrapper = {
  flex: 1,
  marginLeft: "220px",
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#F9FAFB",
};

const verifyCard = {
  width: "100%",
  maxWidth: 500,
  background: "#fff",
  borderRadius: 16,
  boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
  padding: 32,
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const title = {
  fontSize: 24,
  fontWeight: 700,
  marginBottom: 24,
  color: "#2563EB",
};

const input = {
  border: "1px solid #CBD5E1",
  borderRadius: 8,
  padding: "8px 10px",
  fontSize: 16,
  width: 180,
  minWidth: 0,
};

const btn = (bg, color) => ({
  padding: "10px 16px",
  borderRadius: 8,
  border: "none",
  background: bg,
  color,
  fontWeight: 600,
  cursor: "pointer",
});

const cardFull = {
  border: "1px solid #E2E8F0",
  borderRadius: 14,
  padding: 24,
  background: "#F9FAFB",
  marginTop: 24,
  textAlign: "left",
  width: "100%",
  maxWidth: 400,
};