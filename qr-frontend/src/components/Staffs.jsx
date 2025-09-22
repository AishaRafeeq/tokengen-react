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
    const selected = Array.from(e.target.selectedOptions, (opt) => opt.value);
    setForm({ ...form, categories: selected });
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
      const payload = { ...form, role: 'staff', category_ids: form.categories };
      delete payload.categories;
      if (editingId) {
        await API.put(`users/${editingId}/`, payload);
        toast.success('Staff updated successfully!');
      } else {
        await API.post('users/', payload);
        toast.success('Staff added successfully!');
      }
      resetForm();
      setShowModal(false);
      fetchStaffs();
    } catch {
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
      categories: staff.categories?.map(String) || [],
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

        {/* Staff Table */}
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

        {/* Activity Modal */}
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
      <style>
        {`
          @media (max-width: 900px) {
            .staff-main-content {
              margin-left: 0 !important;
              padding: 8px 2vw !important;
              width: 100vw !important;
              min-height: 100vh !important;
            }
            .staff-header {
              flex-direction: column !important;
              align-items: flex-start !important;
              gap: 10px !important;
              padding: 10px 0 !important;
            }
            .staff-header-title {
              font-size: 18px !important;
            }
            .staff-table-wrapper {
              border-radius: 0 !important;
              padding: 0 !important;
              box-shadow: none !important;
              width: 100vw !important;
              overflow-x: auto !important;
            }
            .staff-table-header, .staff-table-row {
              grid-template-columns: 1.5fr 2fr 1.5fr 2fr 1.5fr 1.5fr !important;
              font-size: 12px !important;
              padding: 8px 6px !important;
            }
            .staff-category-badge {
              font-size: 11px !important;
              padding: 2px 4px !important;
            }
            .staff-btn-edit, .staff-btn-delete, .staff-btn-view {
              font-size: 11px !important;
              padding: 2px 6px !important;
            }
          }
        `}
      </style>
    </div>
  );
}

/* --- Styles --- */
const container = {
  display: "flex",
  minHeight: "100vh",
  background: "#F9FAFB",
  width: "100vw",
  overflow: "hidden",
};

const sidebarContainer = {
  width: 220,
  minHeight: "100vh",
  position: "fixed",
  left: 0,
  top: 0,
  zIndex: 100,
  background: "#fff",
  boxShadow: "5px 0 15px rgba(0,0,0,0.07)",
};

const mainContent = {
  flex: 1,
  marginLeft: 220,
  padding: "20px 40px",
  width: "100%",
};
mainContent.className = "staff-main-content";

const header = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px 24px',
};
header.className = "staff-header";

const headerTitle = {
  margin: 0,
  fontSize: 24,
};
headerTitle.className = "staff-header-title";

const headerDesc = {
  margin: 0,
  color: '#64748B',
};

const btnPrimary = {
  padding: '6px 12px',
  borderRadius: 8,
  border: 'none',
  background: '#2563EB',
  color: '#fff',
  fontWeight: 600,
  cursor: 'pointer',
  fontSize: 14,
};

const tableWrapper = {
  width: '100%',
  margin: '0 auto',
  border: '1px solid #E2E8F0',
  borderRadius: 12,
  background: '#fff',
  overflow: 'hidden',
};
tableWrapper.className = "staff-table-wrapper";

const tableHeader = {
  display: 'grid',
  gridTemplateColumns: '1.2fr 1.5fr 1fr 1.5fr 1fr 1fr',
  padding: '16px 20px',
  background: '#F8FAFC',
  color: '#475569',
  fontSize: 14,
  fontWeight: 600,
};
tableHeader.className = "staff-table-header";

const tableRow = {
  display: 'grid',
  gridTemplateColumns: '1.2fr 1.5fr 1fr 1.5fr 1fr 1fr',
  padding: '12px 20px',
  borderTop: '1px solid #F1F5F9',
  fontSize: 14,
  alignItems: 'center',
};
tableRow.className = "staff-table-row";

const emptyText = { padding: 24, textAlign: 'center', color: '#64748B' };

const categoryBadge = {
  padding: '2px 6px',
  background: '#2563EB',
  borderRadius: 4,
  color: '#fff',
  fontSize: 12,
};
categoryBadge.className = "staff-category-badge";

const btnEdit = {
  padding: '3px 8px',
  borderRadius: 4,
  border: 'none',
  background: '#FACC15',
  color: '#000',
  fontSize: 12,
  cursor: 'pointer',
};
btnEdit.className = "staff-btn-edit";

const btnDelete = {
  padding: '3px 8px',
  borderRadius: 4,
  border: 'none',
  background: '#DC2626',
  color: '#fff',
  fontSize: 12,
  cursor: 'pointer',
};
btnDelete.className = "staff-btn-delete";

const btnView = {
  padding: '3px 8px',
  borderRadius: 4,
  border: 'none',
  background: '#4ADE80',
  color: '#000',
  fontSize: 12,
  cursor: 'pointer',
};
btnView.className = "staff-btn-view";

const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 };
const modal = { background: '#F9FAFB', padding: 24, borderRadius: 16, width: 'min(700px, 95vw)', maxHeight: '90vh', overflowY: 'auto', position: 'relative', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' };
const close = { position: 'absolute', top: 12, right: 12, border: 'none', background: 'transparent', fontSize: 18, cursor: 'pointer', color: '#64748B' };
const spinner = { width: 40, height: 40, border: '4px solid #F1F5F9', borderTop: '4px solid #3B82F6', borderRadius: '50%', animation: 'spin 1s linear infinite' };
const centered = { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 40 };
const activityScroll = { maxHeight: 300, overflowY: 'auto', border: '1px solid #E2E8F0', borderRadius: 8, padding: 8 };

const pageWrapper = { flex: 1, padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 24 };
const cardWrapper = { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', flex: 1 };
const title = { fontSize: 20, margin: 0, color: '#111827' };
const table = { width: '100%', borderCollapse: 'collapse', marginTop: 16 };
const th = { padding: '12px 16px', textAlign: 'left', background: '#F9FAFB', color: '#111827', fontSize: 14, fontWeight: 600, borderBottom: '2px solid #E5E7EB' };
const td = { padding: '12px 16px', textAlign: 'left', color: '#374151', fontSize: 14, borderBottom: '1px solid #E5E7EB' };
