import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import api from './lib/axios';
import HomePage from "./pages/HomePage";
import AdminPage from "./pages/AdminPage";
import AboutPage from "./pages/AboutPage";
import LeaderBoard from './pages/LeaderBoard';
import AttendancePage from './pages/AttendancePage';
import MarkAttendancePage from './pages/MarkAttendancePage';
import ViewAttendancePage from './pages/ViewAttendancePage';
import MarkEntryPage from "./pages/MarkEntryPage";
import SuperAdminPage from './pages/SuperAdminPage';
import ManageAdminsPage from './pages/ManageAdminsPage';
import PlacementDonePage from "./pages/PlacementDonePage.jsx";
import ClientDashboardPage from "./pages/ClientDashboardPage.jsx";
import StudentLoginPage from "./pages/StudentLoginPage.jsx";
import AdminLoginPage from "./pages/AdminLoginPage.jsx";
import StudentDashboardPage from "./pages/StudentDashboardPage.jsx";
import StudentManagementPage from "./pages/StudentManagementPage.jsx";
import LeadManagementPage from "./pages/LeadManagementPage.jsx";
import RateLimitModal from "./components/RateLimitModal.jsx";


const App = () => {
  // Fetch a guest token for visitors who are not logged in as any role
  useEffect(() => {
    const hasToken =
      localStorage.getItem("token") ||
      localStorage.getItem("studentToken");

    if (!hasToken) {
      api.post("/admin/guest-token")
        .then(res => {
          if (res.data?.token) {
            localStorage.setItem("guestToken", res.data.token);
          }
        })
        .catch(() => {
          // Silently ignore — guest token is optional
        });
    }
  }, []);

  return (
    <div>
      <RateLimitModal />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/leaderboard" element={<LeaderBoard />} />
        <Route path="/attendancepage" element={<AttendancePage />} />
        <Route path="/markattendance" element={<MarkAttendancePage />} />
        <Route path="/viewattendance" element={<ViewAttendancePage />} />
        <Route path="/markentry" element={<MarkEntryPage />} />
        <Route path="/superadmin" element={<SuperAdminPage />} />
        <Route path="/manage-admins" element={<ManageAdminsPage />} />
        <Route path="/placement-done" element={<PlacementDonePage />} />
        <Route path="/client-dashboard" element={<ClientDashboardPage />} />
        <Route path="/student-login" element={<StudentLoginPage />} />
        <Route path="/admin-login" element={<AdminLoginPage />} />
        <Route path="/student-dashboard" element={<StudentDashboardPage />} />
        <Route path="/student-management" element={<StudentManagementPage />} />
        <Route path="/lead-management" element={<LeadManagementPage />} />
      </Routes>
    </div>
  );
};

export default App;