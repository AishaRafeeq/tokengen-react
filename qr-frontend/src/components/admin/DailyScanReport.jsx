// src/components/admin/DailyReport.jsx
import React, { useEffect, useState } from "react";
import axios from "../../Services/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "../Sidebar";
import { jsPDF } from "jspdf";

// Utility to convert JSON to CSV
function jsonToCSV(items) {
  if (!items?.length) return "";
  const header = Object.keys(items[0]);
  const csvRows = [
    header.join(","),
    ...items.map((row) =>
      header
        .map((fieldName) => {
          let val = row[fieldName];
          if (val === null || val === undefined) return "";
          return val;
        })
        .join(",")
    ),
  ];
  return csvRows.join("\n");
}

export default function DailyReport() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await axios.get("daily-report/", {
        params: { start_date: startDate, end_date: endDate },
      });
      setReport(res.data);
    } catch (err) {
      toast.error("Failed to fetch daily report");
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!report) return toast.info("No data to export");

    const staffData =
      report.staff_summary?.map((staff) => ({
        Staff: staff.staff,
        Waiting_Tokens: staff.waiting_tokens,
        Completed_Tokens: staff.completed_tokens,
        Success: staff.success_verifications,
        Failed: staff.failed_verifications,
      })) || [];

    const categoryData =
      report.categories?.map((cat) => ({
        Category: cat.category,
        Total_QR: cat.total_qr,
        Staff_Assigned: cat.staff_assigned.join(", "),
      })) || [];

    const csv = jsonToCSV([...staffData, ...categoryData]);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `daily_report_${startDate}_to_${endDate}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    if (!report) return toast.info("No data to export");
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Daily Report", 14, 22);

    doc.setFontSize(12);
    doc.text(`Date Range: ${startDate} to ${endDate}`, 14, 32);
    doc.text(`Total QR Codes: ${report.total_qr_codes}`, 14, 40);
    doc.text(`Completed QR Codes: ${report.completed_qr_codes}`, 14, 48);
    doc.text(`Success Verifications: ${report.success_verifications}`, 14, 56);
    doc.text(`Failed Verifications: ${report.failed_verifications}`, 14, 64);

    let y = 74;
    report.staff_summary?.forEach((staff) => {
      doc.text(
        `${staff.staff}: Waiting ${staff.waiting_tokens}, Completed ${staff.completed_tokens}, Success ${staff.success_verifications}, Failed ${staff.failed_verifications}`,
        14,
        y
      );
      y += 8;
    });

    y += 8;
    report.categories?.forEach((cat) => {
      doc.text(
        `${cat.category}: Total QR ${cat.total_qr}, Staff Assigned: ${cat.staff_assigned.join(
          ", "
        )}`,
        14,
        y
      );
      y += 8;
    });

    doc.save(`daily_report_${startDate}_to_${endDate}.pdf`);
  };

  // Replace with your actual report data and logic
  const reportData = [
    { token_id: "123456", scanned_at: "2025-09-21 09:00", staff: "Alice" },
    { token_id: "654321", scanned_at: "2025-09-21 09:15", staff: "Bob" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F9FAFB" }}>
      {/* Sidebar */}
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

      {/* Content */}
      <div
        style={{
          flex: 1,
          marginLeft: 220,
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          minHeight: "100vh",
          padding: "32px",
          width: "100%",
        }}
      >
        <div style={container}>
          <ToastContainer />
          <h2 style={title}>Daily Report</h2>

          {/* Date filters + actions */}
          <div style={{ marginBottom: 20 }}>
            <label>
              Start Date:{" "}
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={inputStyle}
              />
            </label>
            <label style={{ marginLeft: 12 }}>
              End Date:{" "}
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={inputStyle}
              />
            </label>
            <button onClick={fetchReport} style={btn("#2563EB", "#fff", 12)}>
              Fetch
            </button>
            <button onClick={handleExportCSV} style={btn("#16A34A", "#fff", 12)}>
              Export CSV
            </button>
            <button onClick={handleExportPDF} style={btn("#EF4444", "#fff", 12)}>
              Export PDF
            </button>
          </div>

          {/* Report Content */}
          {loading ? (
            <div>Loading...</div>
          ) : !report ? (
            <div style={emptyText}>No data for selected dates.</div>
          ) : (
            <>
              <div style={{ marginBottom: 20 }}>
                <strong>Total QR Codes:</strong> {report.total_qr_codes} |{" "}
                <strong>Completed:</strong> {report.completed_qr_codes} |{" "}
                <strong>Success:</strong> {report.success_verifications} |{" "}
                <strong>Failed:</strong> {report.failed_verifications}
              </div>

              {/* Staff Summary */}
              <h3 style={{ marginTop: 20 }}>Staff Summary</h3>
              <div style={{ overflowX: "auto" }}>
                <table style={table}>
                  <thead>
                    <tr>
                      <th style={th}>Staff</th>
                      <th style={th}>Waiting Tokens</th>
                      <th style={th}>Completed Tokens</th>
                      <th style={th}>Success</th>
                      <th style={th}>Failed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.staff_summary?.map((staff, idx) => (
                      <tr key={staff.staff} style={idx % 2 ? trAlt : {}}>
                        <td style={td}>{staff.staff}</td>
                        <td style={td}>{staff.waiting_tokens}</td>
                        <td style={td}>{staff.completed_tokens}</td>
                        <td style={td}>{staff.success_verifications}</td>
                        <td style={td}>{staff.failed_verifications}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Categories */}
              <h3 style={{ marginTop: 32 }}>Categories</h3>
              <div style={{ overflowX: "auto" }}>
                <table style={table}>
                  <thead>
                    <tr>
                      <th style={th}>Category</th>
                      <th style={th}>Total QR</th>
                      <th style={th}>Staff Assigned</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.categories?.map((cat, idx) => (
                      <tr key={cat.category} style={idx % 2 ? trAlt : {}}>
                        <td style={td}>{cat.category}</td>
                        <td style={td}>{cat.total_qr}</td>
                        <td style={td}>{cat.staff_assigned?.join(", ")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* --- Styles --- */
const container = {
  width: "100%",
  maxWidth: "100%",
  margin: 0,
  padding: 24,
  background: "#fff",
  borderRadius: 12,
  boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
  textAlign: "left",
};

const title = {
  fontSize: 26,
  fontWeight: 700,
  marginBottom: 24,
  color: "#1E3A8A",
  textAlign: "center",
};

const btn = (bg, color, ml = 0) => ({
  padding: "10px 18px",
  borderRadius: 8,
  border: "none",
  background: bg,
  color,
  fontWeight: 600,
  cursor: "pointer",
  marginLeft: ml,
  marginRight: 8,
  transition: "all 0.2s ease",
  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
});

const inputStyle = {
  padding: "8px 12px",
  borderRadius: 6,
  border: "1px solid #CBD5E1",
  marginRight: 8,
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: 20,
  fontSize: 14,
};

const th = {
  background: "#F1F5F9",
  color: "#334155",
  fontWeight: 600,
  padding: "12px 16px",
  borderBottom: "2px solid #E2E8F0",
  textAlign: "left",
};

const td = {
  padding: "12px 16px",
  borderBottom: "1px solid #E2E8F0",
  color: "#475569",
};

const trAlt = {
  background: "#F9FAFB",
};

const emptyText = {
  color: "#64748B",
  padding: "16px 0",
  fontStyle: "italic",
  textAlign: "center",
};

const pageWrapper = {
  flex: 1,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: 24,
};

const cardWrapper = {
  width: "100%",
  maxWidth: 800,
  background: "#fff",
  borderRadius: 12,
  boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
  padding: 24,
  textAlign: "center",
};
