import React, { useEffect, useState } from "react";
import API from "../services/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
import Sidebar from "./Sidebar"; // Adjust the path as needed

export default function QRCodeManager() {
  const [qrcodes, setQRCodes] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [form, setForm] = useState({ data: "", color: "", template: "" });
  const [bulkData, setBulkData] = useState("");
  const [verifyResult, setVerifyResult] = useState(null);
  const [activeSection, setActiveSection] = useState("generate");

  useEffect(() => {
    fetchQRCodes();
    fetchTemplates();
  }, []);

  const fetchQRCodes = async () => {
    try {
      const res = await API.get("qr/");
      setQRCodes(res.data);
    } catch {
      toast.error("Failed to load QR codes");
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await API.get("qr/templates/");
      setTemplates(res.data);
    } catch {
      toast.error("Failed to load templates");
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      await API.post("qr/generate/", form);
      toast.success("QR code generated");
      fetchQRCodes();
    } catch {
      toast.error("Failed to generate QR code");
    }
  };

  const handleBulkGenerate = async (e) => {
    e.preventDefault();
    try {
      await API.post("qr/bulk_generate/", { data: bulkData.split("\n") });
      toast.success("Bulk QR codes generated");
      fetchQRCodes();
    } catch {
      toast.error("Bulk generation failed");
    }
  };

  const handleVerify = async (id) => {
    try {
      const res = await API.post(`qr/${id}/verify/`);
      setVerifyResult(res.data.detail);
      toast.success("Verification complete");
    } catch {
      toast.error("Verification failed");
    }
  };

  const handleTemplateCreate = async (e) => {
    e.preventDefault();
    try {
      await API.post("qr/templates/", {
        name: form.template,
        color: form.color,
      });
      toast.success("Template created");
      fetchTemplates();
    } catch {
      toast.error("Failed to create template");
    }
  };

  const handleDownload = (id) => {
    window.open(`${API.defaults.baseURL}qr/${id}/download/`, "_blank");
  };

  const handleShare = async (id) => {
    try {
      const res = await API.get(`qr/${id}/share/`);
      navigator.clipboard.writeText(res.data.share_url);
      toast.success("Share link copied!");
    } catch {
      toast.error("Failed to get share link");
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case "generate":
        return (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Generate QR Code</h2>
            <form onSubmit={handleGenerate} className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Data"
                value={form.data}
                onChange={(e) => setForm({ ...form, data: e.target.value })}
                className="border p-1 rounded flex-1"
                required
              />
              <input
                type="color"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="border p-1 rounded"
                title="Color"
              />
              <select
                value={form.template}
                onChange={(e) =>
                  setForm({ ...form, template: e.target.value })
                }
                className="border p-1 rounded"
              >
                <option value="">No Template</option>
                {templates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.name}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="bg-blue-600 text-white px-3 py-1 rounded"
              >
                Generate
              </button>
            </form>
          </section>
        );

      case "bulk":
        return (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">
              Bulk QR Code Generation
            </h2>
            <form
              onSubmit={handleBulkGenerate}
              className="flex flex-col gap-2 mb-2"
            >
              <textarea
                placeholder="Enter one data per line"
                value={bulkData}
                onChange={(e) => setBulkData(e.target.value)}
                className="border p-1 rounded"
                rows={3}
              />
              <button
                type="submit"
                className="bg-green-600 text-white px-3 py-1 rounded"
              >
                Bulk Generate
              </button>
            </form>
          </section>
        );

      case "templates":
        return (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">QR Code Templates</h2>
            <form
              onSubmit={handleTemplateCreate}
              className="flex gap-2 mb-2"
            >
              <input
                type="text"
                placeholder="Template Name"
                value={form.template}
                onChange={(e) =>
                  setForm({ ...form, template: e.target.value })
                }
                className="border p-1 rounded"
                required
              />
              <input
                type="color"
                value={form.color}
                onChange={(e) =>
                  setForm({ ...form, color: e.target.value })
                }
                className="border p-1 rounded"
                title="Color"
              />
              <button
                type="submit"
                className="bg-purple-600 text-white px-3 py-1 rounded"
              >
                Create Template
              </button>
            </form>
            <ul>
              {templates.map((tpl) => (
                <li key={tpl.id}>
                  {tpl.name}{" "}
                  <span
                    style={{
                      background: tpl.color,
                      padding: "0 8px",
                      display: "inline-block",
                    }}
                  ></span>
                </li>
              ))}
            </ul>
          </section>
        );

      case "list":
        return (
          <section>
            <h2 className="text-xl font-semibold mb-2">Your QR Codes</h2>
            <table className="w-full text-sm mb-2 border rounded bg-gray-50">
              <thead>
                <tr>
                  <th className="text-left p-2">QR ID</th>
                  <th className="text-left p-2">Data</th>
                  <th className="text-left p-2">Template</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {qrcodes.map((qr) => (
                  <tr key={qr.id} className="border-t">
                    <td className="p-2">{qr.id}</td>
                    <td className="p-2">{qr.data}</td>
                    <td className="p-2">{qr.template_name || "-"}</td>
                    <td className="p-2 space-x-2">
                      <button
                        onClick={() => handleVerify(qr.id)}
                        className="bg-yellow-500 text-white px-2 py-1 rounded"
                      >
                        Verify
                      </button>
                      <button
                        onClick={() => handleDownload(qr.id)}
                        className="bg-blue-500 text-white px-2 py-1 rounded"
                      >
                        Download
                      </button>
                      <button
                        onClick={() => handleShare(qr.id)}
                        className="bg-green-500 text-white px-2 py-1 rounded"
                      >
                        Share
                      </button>
                    </td>
                  </tr>
                ))}
                {qrcodes.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-gray-400 text-center p-3"
                    >
                      No QR codes found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {verifyResult && (
              <div className="mt-2 text-green-700 font-bold">
                {verifyResult}
              </div>
            )}
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#F9FAFB",
      }}
    >
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
        <ToastContainer />
        <h1 className="text-2xl font-bold mb-6">QR Code Management</h1>

        {/* Navigation Buttons */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveSection("generate")}
            className={`px-4 py-2 rounded ${
              activeSection === "generate"
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
          >
            Generate
          </button>
          <button
            onClick={() => setActiveSection("bulk")}
            className={`px-4 py-2 rounded ${
              activeSection === "bulk"
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
          >
            Bulk Generate
          </button>
          <button
            onClick={() => setActiveSection("templates")}
            className={`px-4 py-2 rounded ${
              activeSection === "templates"
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
          >
            Templates
          </button>
          <button
            onClick={() => setActiveSection("list")}
            className={`px-4 py-2 rounded ${
              activeSection === "list"
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
          >
            QR List
          </button>
        </div>

        {/* Render Section */}
        {renderSection()}
      </div>
    </div>
  );
}

