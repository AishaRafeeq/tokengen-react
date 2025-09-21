import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Dashboard from "./Pages/Dashboard";
import Login from "./Pages/Login";
import ProtectedRoute from "./Services/ProtectedRoute";
import Staffs from "./components/Staffs";
import ScanQRCode from "./components/ScanQRCode";
import CreateToken from "./components/CreateToken";
import StaffDashboard from "./components/staffdashboard";

import QRCodeManager from "./components/qrcodemanagement";
import ActiveQueue from "./components/queue-manage/activequeue";
import CalledToken from "./components/queue-manage/calledtoken";
import CompletedToken from "./components/completedtoken";
import ManualEntry from "./components/scanner/manualentry";
import CategorySummary from "./components/queue-manage/categorysummary";
import StaffScanReports from "./components/Reports/Staffscanreports";
import OperationalReport from "./components/Reports/staffoperational";

import AdminTokenQRManager from "./components/admin/adminqr";
import BulkQRGenerator from "./components/admin/bulkqr";
import VerifyQR from "./components/admin/verifyqr";
import QRSettingsManager from "./components/admin/qrsettings";
import CategoryManager from "./components/admin/categorymanage";
import QueueDashboard from "./components/admin/queuemonitor"
import DailyScanReport from "./components/admin/DailyScanReport";

function AppWrapper({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    // Set session timeout for 1 hour
    const timer = setTimeout(() => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      navigate("/login");
      alert("Session expired. Please login again.");
    }, 3600000); // 1 hour in milliseconds

    return () => clearTimeout(timer);
  }, []);

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AppWrapper>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Admin routes */}
          <Route
            path="/admin/staffs"
            element={
              <ProtectedRoute>
                <Staffs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/monitor/*"
            element={
              <ProtectedRoute>
                <QueueDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/createtoken"
            element={
              <ProtectedRoute>
                <CreateToken />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/qrcodemanage"
            element={
              <ProtectedRoute>
                <QRCodeManager />
              </ProtectedRoute>
            }
          />
          <Route  path="admin/qrgen" element={
            <ProtectedRoute>
              <AdminTokenQRManager />
            </ProtectedRoute>
          }/>
          

          {/* Staff routes */}
          <Route
            path="/staff/queue"
            element={
              <ProtectedRoute>
                <ActiveQueue />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/call"
            element={
              <ProtectedRoute>
                <CalledToken />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/comptoken"
            element={
              <ProtectedRoute>
                <CompletedToken />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/scan"
            element={
              <ProtectedRoute>
                <ScanQRCode />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/manual"
            element={
              <ProtectedRoute>
                <ManualEntry />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/catsum"
            element={
              <ProtectedRoute>
                <CategorySummary />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/activity"
            element={
              <ProtectedRoute>
                <StaffScanReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/operationrepo"
            element={
              <ProtectedRoute>
                <OperationalReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/dashboard"
            element={
              <ProtectedRoute>
                <StaffDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/bulk"
            element={
              <ProtectedRoute>
                <BulkQRGenerator />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/qrverification"
            element={
              <ProtectedRoute>
                <VerifyQR />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/qrtemplate"
            element={
              <ProtectedRoute>
                <QRSettingsManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/categ"
            element={
              <ProtectedRoute>
                <CategoryManager />
              </ProtectedRoute>
            }
          />  
          <Route path="/admin/reports" element={
            <ProtectedRoute>
              <DailyScanReport />
            </ProtectedRoute>
          }/> 

          {/* Redirect unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppWrapper>
    </BrowserRouter>
  );
}
