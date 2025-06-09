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
import Footer from './components/Footer';

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
      </Routes>
      <Footer />
    </div>
  );
};

export default App;