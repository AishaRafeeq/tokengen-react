import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from "./Sidebar";

const initialForm = {
  username: '',
  email: '',
  first_name: '',
  last_name: '',
  password: '',
  categories: [],
  can_scan_qr: false,
  can_generate_qr: false,
  can_view_analytics: false,
  can_verify_qr: false,
};

export default function StaffManagement() {
  const [staffs, setStaffs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [activityModal, setActivityModal] = useState({ open: false, staff: null, logs: [], stats: null, loading: false });

  useEffect(() => {
    fetchStaffs();
    fetchCategories();
  }, []);

  const fetchStaffs = async () => {
    try {
      setLoading(true);
      const res = await API.get('users/');
      setStaffs(res.data.filter(user => user.role === 'staff'));
    } catch {
      toast.error('Failed to load staff users.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await API.get('categories/');
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error('Failed to load categories.');
    }
  };

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

 const handleCategoryChange = (e) => {
  const selected = Array.from(e.target.selectedOptions, (opt) => Number(opt.value));
  setForm((prev) => ({ ...prev, categories: selected }));
};


  const validate = () => {
    const errs = {};
    if (!form.username) errs.username = 'Username is required';
    if (!form.email) errs.email = 'Email is required';
    if (!editingId && !form.password) errs.password = 'Password is required';
    if (form.categories.length === 0) errs.categories = 'Select at least one category';
    return errs;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const errs = validate();
  setErrors(errs);
  if (Object.keys(errs).length > 0) return;

  try {
    // Build payload
    const payload = { ...form, role: 'staff', category_ids: form.categories };
    delete payload.categories; // remove frontend-only field

    // Only send password if it's non-empty
    if (editingId && !form.password) {
      delete payload.password;
    }

    // Log payload
    console.log("Payload to backend:", payload);

    if (editingId) {
      const res = await API.put(`users/${editingId}/`, payload);
      console.log("Response from PUT:", res.data);
      toast.success('Staff updated successfully!');
    } else {
      const res = await API.post('users/', payload);
      console.log("Response from POST:", res.data);
      toast.success('Staff added successfully!');
    }

    resetForm();
    setShowModal(false);
    fetchStaffs();
  } catch (err) {
    console.error("Error sending payload:", err.response?.data || err.message);
    toast.error('Failed to save staff user.');
  }
};


  const handleEdit = (staff) => {
  setForm({
    username: staff.username,
    email: staff.email,
    first_name: staff.first_name,
    last_name: staff.last_name,
    password: '',
    categories: staff.categories?.map(cat => cat.id) || [], // number, not string

    can_scan_qr: staff.can_scan_qr,
    can_generate_qr: staff.can_generate_qr,
    can_view_analytics: staff.can_view_analytics,
    can_verify_qr: staff.can_verify_qr,
  });
  setEditingId(staff.id);
  setErrors({});
  setShowModal(true);
};

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this staff?')) return;
    try {
      await API.delete(`users/${id}/`);
      toast.success('Staff deleted successfully!');
      fetchStaffs();
    } catch {
      toast.error('Failed to delete staff user.');
    }
  };

  const openNewUserModal = () => {
    resetForm();
    setEditingId(null);
    setErrors({});
    setShowModal(true);
  };

  const resetForm = () => setForm(initialForm);

  const handleViewActivity = async (staff) => {
    setActivityModal({ open: true, staff, logs: [], stats: null, loading: true });
    try {
      const statsRes = await API.get(`/staff/${staff.id}/full-stats/`);
      const logsRes = await API.get(`/staff-activity/?username=${staff.username}`);
      setActivityModal({
        open: true,
        staff,
        logs: logsRes.data,
        stats: statsRes.data,
        loading: false,
      });
    } catch {
      toast.error('Failed to load staff stats or activity.');
      setActivityModal({ open: false, staff: null, logs: [], stats: null, loading: false });
    }
  };

  if (loading) {
    return (
      <div style={centered}>
        <div style={spinner} />
        <p style={{ color: '#64748B' }}>Loading staff users…</p>
      </div>
    );
  }

  return (
    <div style={container}>
      <div style={sidebarContainer}>
        <Sidebar />
      </div>
      <div style={mainContent}>
        <ToastContainer position="top-right" autoClose={2500} />
        <div style={header}>
          <div>
            <h1 style={headerTitle}>Staff Management</h1>
            <p style={headerDesc}>Manage staff accounts and permissions</p>
          </div>
          <button onClick={openNewUserModal} style={btnPrimary}>+ Add Staff</button>
        </div>

        
        <div style={tableWrapper}>
          <div style={tableHeader}>
            <div>Username</div>
            <div>Email</div>
            <div>Name</div>
            <div>Categories</div>
            <div>Permissions</div>
            <div>Actions</div>
          </div>
          {staffs.length === 0 ? (
            <div style={emptyText}>No staff users found.</div>
          ) : (
            staffs.map((staff) => (
              <div key={staff.id} style={tableRow}>
                <div>{staff.username}</div>
                <div>{staff.email}</div>
                <div>{staff.full_name || staff.username}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {staff.categories?.map(cat => (
                    <span key={cat.id} style={categoryBadge}>{cat.name}</span>
                  ))}
                </div>
                <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {staff.can_scan_qr && <div>Scan</div>}
                  {staff.can_generate_qr && <div>Generate</div>}
                  {staff.can_view_analytics && <div>Analytics</div>}
                  {staff.can_verify_qr && <div>Verify</div>}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => handleEdit(staff)} style={btnEdit}>Edit</button>
                  <button onClick={() => handleDelete(staff.id)} style={btnDelete}>Delete</button>
                  <button onClick={() => handleViewActivity(staff)} style={btnView}>View</button>
                </div>
              </div>
            ))
          )}
        </div>

       
        {showModal && (
          <div style={overlay} onClick={() => setShowModal(false)}>
            <div style={modal} onClick={(e) => e.stopPropagation()}>
              <button style={close} onClick={() => setShowModal(false)}>✕</button>
              <h2>{editingId ? 'Edit Staff' : 'Add Staff'}</h2>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
  <div style={formGroup}>
    <label style={label}>Username</label>
    <input name="username" value={form.username} onChange={handleChange} style={input} />
    {errors.username && <div style={error}>{errors.username}</div>}
  </div>

  <div style={formGroup}>
    <label style={label}>Email</label>
    <input name="email" type="email" value={form.email} onChange={handleChange} style={input} />
    {errors.email && <div style={error}>{errors.email}</div>}
  </div>

  <div style={formGroup}>
    <label style={label}>First Name</label>
    <input name="first_name" value={form.first_name} onChange={handleChange} style={input} />
  </div>

  <div style={formGroup}>
    <label style={label}>Last Name</label>
    <input name="last_name" value={form.last_name} onChange={handleChange} style={input} />
  </div>

  {!editingId && (
    <div style={formGroup}>
      <label style={label}>Password</label>
      <input name="password" type="password" value={form.password} onChange={handleChange} style={input} />
      {errors.password && <div style={error}>{errors.password}</div>}
    </div>
  )}

  <div style={formGroup}>
    
   <div style={formGroup}>
  <label style={label}>Categories</label>
  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
    {categories.map((cat) => (
      <label key={cat.id} style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <input
  type="checkbox"
  value={cat.id}
  checked={form.categories.includes(cat.id)}
  onChange={(e) => {
    if (e.target.checked) {
      setForm(prev => ({ ...prev, categories: [...prev.categories, cat.id] }));
    } else {
      setForm(prev => ({ ...prev, categories: prev.categories.filter(id => id !== cat.id) }));
    }
  }}
/>

        {cat.name}
      </label>
    ))}
  </div>
  {errors.categories && <div style={error}>{errors.categories}</div>}
</div>

    {errors.categories && <div style={error}>{errors.categories}</div>}
  </div>

  <div style={{ marginBottom: 16 }}>
  <label style={{ ...label, display: "block", marginBottom: 8 }}>Permissions</label>
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "12px 16px",
      padding: "12px",
      border: "1px solid #ddd",
      borderRadius: "8px",
      background: "#fafafa",
    }}
  >
    <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <input
        type="checkbox"
        name="can_scan_qr"
        checked={form.can_scan_qr}
        onChange={handleChange}
      />
      Can Scan QR
    </label>
    <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <input
        type="checkbox"
        name="can_generate_qr"
        checked={form.can_generate_qr}
        onChange={handleChange}
      />
      Can Generate QR
    </label>
    <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <input
        type="checkbox"
        name="can_verify_qr"
        checked={form.can_verify_qr}
        onChange={handleChange}
      />
      Can Verify QR
    </label>
    <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <input
        type="checkbox"
        name="can_view_analytics"
        checked={form.can_view_analytics}
        onChange={handleChange}
      />
      Can View Analytics
    </label>
  </div>
</div>


  <button type="submit" style={btnPrimary}>
    {editingId ? 'Update Staff' : 'Add Staff'}
  </button>
</form>

            </div>
          </div>
        )}

        
        {activityModal.open && (
          <div style={overlay} onClick={() => setActivityModal({ open: false, staff: null, logs: [], stats: null, loading: false })}>
            <div style={modal} onClick={e => e.stopPropagation()}>
              <button style={close} onClick={() => setActivityModal({ open: false, staff: null, logs: [], stats: null, loading: false })}>✕</button>
              <h2 style={{ marginBottom: 12 }}>Stats for {activityModal.staff?.full_name || activityModal.staff?.username}</h2>
              {activityModal.loading ? (
                <div style={centered}><div style={spinner} />Loading…</div>
              ) : (
                <>
                  {activityModal.stats && (
                    <div style={{ marginBottom: 16 }}>
                      <div><b>Categories:</b> {activityModal.stats.categories.join(", ")}</div>
                      <div><b>Active Tokens:</b> {activityModal.stats.active_tokens}</div>
                      <div><b>Completed Tokens:</b> {activityModal.stats.completed_tokens}</div>
                    </div>
                  )}
                  <h3 style={{ marginBottom: 8 }}>Recent Activity</h3>
                  <div style={activityScroll}>
                    {activityModal.logs.length === 0 ? (
                      <div style={{ color: '#64748B', padding: 16 }}>No activity found.</div>
                    ) : (
                      <table style={{ width: '100%', fontSize: 14 }}>
                        <thead>
                          <tr>
                            <th>Scan Time</th>
                            <th>Category</th>
                            <th>Token ID</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activityModal.logs.map(log => (
                            <tr key={log.scan_id || log.id}>
                              <td>{new Date(log.scan_time).toLocaleString()}</td>
                              <td>{log.category}</td>
                              <td>{log.token_id}</td>
                              <td>{log.verification_status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Styles ---
const input = {
  padding: '8px 12px',
  fontSize: '14px',
  border: '1px solid #CBD5E1',
  borderRadius: '6px',
  outline: 'none',
  background: '#fff',
  transition: 'border 0.2s ease',
  width: '100%',
  maxWidth: '500px', 
  alignSelf: 'center'
};


const multiSelect = {
  ...input,
  height: 80,
  overflowY: 'auto',
};


const label = {
  marginBottom: 6,
  fontWeight: 600,
  color: '#334155',
  display: 'block',
};

const error = {
  marginTop: 4,
  fontSize: 12,
  color: '#DC2626',
};

const formGroup = {
  display: 'flex',
  flexDirection: 'column',
};

const container = { display: "flex", minHeight: "100vh", background: "#F9FAFB", width: "100vw", overflow: "hidden" };
const sidebarContainer = { width: 220, minHeight: "100vh", position: "fixed", left: 0, top: 0, zIndex: 100, background: "#fff", boxShadow: "5px 0 15px rgba(0,0,0,0.07)" };
const mainContent = { flex: 1, marginLeft: 220, padding: "20px 40px", width: "100%" };
const header = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px' };
const headerTitle = { margin: 0, fontSize: 24 };
const headerDesc = { margin: 0, color: '#64748B' };
const btnPrimary = { padding: '6px 12px', borderRadius: 8, border: 'none', background: '#2563EB', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 14 };
const tableWrapper = { width: '100%', border: '1px solid #E2E8F0', borderRadius: 12, background: '#fff', overflow: 'hidden' };
const tableHeader = { display: 'grid', gridTemplateColumns: '1.2fr 1.5fr 1fr 1.5fr 1fr 1fr', padding: '16px 20px', background: '#F8FAFC', color: '#475569', fontSize: 14, fontWeight: 600 };
const tableRow = { display: 'grid', gridTemplateColumns: '1.2fr 1.5fr 1fr 1.5fr 1fr 1fr', padding: '12px 20px', borderTop: '1px solid #F1F5F9', fontSize: 14, alignItems: 'center' };
const emptyText = { padding: 24, textAlign: 'center', color: '#64748B' };
const categoryBadge = { padding: '2px 6px', background: '#2563EB', borderRadius: 4, color: '#fff', fontSize: 12 };
const btnEdit = { padding: '3px 8px', borderRadius: 4, border: 'none', background: '#FACC15', color: '#000', fontSize: 12, cursor: 'pointer' };
const btnDelete = { padding: '3px 8px', borderRadius: 4, border: 'none', background: '#DC2626', color: '#fff', fontSize: 12, cursor: 'pointer' };
const btnView = { padding: '3px 8px', borderRadius: 4, border: 'none', background: '#4ADE80', color: '#000', fontSize: 12, cursor: 'pointer' };
const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 };
const modal = { background: '#F9FAFB', padding: 24, borderRadius: 16, width: 'min(600px, 80vw)', maxHeight: '90vh', overflowY: 'auto', position: 'relative', display: 'flex', flexDirection: 'column', gap: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' };
const close = { position: 'absolute', top: 12, right: 12, border: 'none', background: 'transparent', fontSize: 18, cursor: 'pointer', color: '#64748B' };
const spinner = { width: 40, height: 40, border: '4px solid #F1F5F9', borderTop: '4px solid #3B82F6', borderRadius: '50%', animation: 'spin 1s linear infinite' };
const centered = { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 40 };
const activityScroll = { maxHeight: 300, overflowY: 'auto', border: '1px solid #E2E8F0', borderRadius: 8, padding: 8 };
