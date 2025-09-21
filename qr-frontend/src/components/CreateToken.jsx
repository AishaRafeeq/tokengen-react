import React, { useEffect, useState } from "react";
import API from "../Services/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
import Sidebar from "./Sidebar"; // Adjust the path as needed

export default function CreateToken() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    category: "",
    customer_name: "",
    customer_contact: "",
  });
  const [loading, setLoading] = useState(false);
  const [createdToken, setCreatedToken] = useState(null);

  // Fetch categories safely
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await API.get("categories/");
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setCategories(data);
    } catch (err) {
      toast.error("Failed to load categories");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category) {
      toast.error("Please select a category");
      return;
    }

    try {
      setLoading(true);
      const res = await API.post("tokens/", form);
      toast.success("Token created successfully!");
      setCreatedToken(res.data); // store token details including QR code
      setForm({ category: "", customer_name: "", customer_contact: "" });
      setLoading(false);
    } catch (err) {
      toast.error("Failed to create token");
      setLoading(false);
    }
  };

  // Download QR code as PNG
  const handleDownloadQR = () => {
    if (!createdToken || !createdToken.qr_code) return;
    const link = document.createElement("a");
    link.href = createdToken.qr_code;
    link.download = `token_${createdToken.token_id}.png`;
    link.click();
  };

  const listStyle = {
    listStyleType: "none",
    padding: 0,
    margin: 0,
  };

  const itemStyle = {
    marginBottom: "10px",
  };

  const linkStyle = {
    textDecoration: "none",
    color: "#1DA1F2",
    fontWeight: "bold",
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <div className="w-56 min-h-screen fixed left-0 top-0 z-50 bg-white shadow-md">
        <Sidebar />
      </div>
      <div className="flex-1 ml-56 p-6">
        <ToastContainer />
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Create Token</h2>

        <div className="w-full max-w-md bg-white rounded shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-semibold">Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              >
                <option value="">Select Category</option>
                {Array.isArray(categories) &&
                  categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 font-semibold">Customer Name</label>
              <input
                type="text"
                name="customer_name"
                placeholder="Optional"
                value={form.customer_name}
                onChange={handleChange}
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold">Customer Contact</label>
              <input
                type="text"
                name="customer_contact"
                placeholder="Optional"
                value={form.customer_contact}
                onChange={handleChange}
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 flex justify-center items-center gap-2"
            >
              {loading ? "Creating..." : "Create Token"}
            </button>
          </form>

          {/* QR Code Preview */}
          {createdToken && createdToken.qr_code && (
            <div className="mt-6 text-center">
              <h3 className="font-bold mb-2">Generated QR Code</h3>
              <img
                src={createdToken.qr_code}
                alt="Token QR Code"
                className="mx-auto w-48 h-48 border p-2 bg-white"
              />
              <p className="mt-2 text-sm text-gray-600">
                Token ID: {createdToken.token_id}
              </p>
              <button
                onClick={handleDownloadQR}
                className="mt-2 px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Download QR
              </button>
            </div>
          )}
        </div>

        {/* Sidebar Navigation */}
        <div className="w-full max-w-xs bg-white rounded shadow p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">Navigation</h3>
          <ul style={listStyle}>
            <li style={itemStyle}>
              <Link to="/dashboard" style={linkStyle}>
                Dashboard
              </Link>
            </li>
            <li style={itemStyle}>
              <Link to="/admin/bulkqr" style={linkStyle}>
                Bulk QR
              </Link>
            </li>
            {/* Add more links as needed */}
          </ul>
        </div>
      </div>
    </div>
  );
}
