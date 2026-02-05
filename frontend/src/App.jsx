import React from 'react';
import { Route, Routes } from 'react-router-dom';
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
import StudentDashboardPage from "./pages/StudentDashboardPage.jsx";


const App = () => {
  return (
    <div>
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
        <Route path="/student-dashboard" element={<StudentDashboardPage />} />
      </Routes>
    </div>
  );
};

export default App;