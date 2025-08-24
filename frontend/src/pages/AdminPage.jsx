import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import api from '../lib/axios';

const buttonIcons = {
  leaderboard: (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 17v-7a4 4 0 118 0v7M12 21v-4" />
    </svg>
  ),
  attendance: (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  view: (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  mark: (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.5a2.121 2.121 0 013 3L7 19.5 3 21l1.5-4L16.5 3.5z" />
    </svg>
  ),
  logout: (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
    </svg>
  ),
};

const AdminPage = () => {
  const [batches, setBatches] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedBatch, setSelectedBatch] = useState(localStorage.getItem('selectedBatch') || '');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/batches').then(res => {
      const sortedBatches = (res.data.batches || []).sort((a, b) =>
        a.batchName.localeCompare(b.batchName)
      );
      setBatches(sortedBatches);
    });
  }, []);

  // Extract unique years from batches
  const years = Array.from(new Set(batches.map(b => b.year))).sort();

  // Filter batches by selected year
  const batchesForYear = selectedYear
    ? batches.filter(b => b.year === Number(selectedYear))
    : [];

  const handleSelectBatch = (batchName) => {
    setSelectedBatch(batchName);
    localStorage.setItem('selectedBatch', batchName);
    navigate(`/admin?batch=${batchName}`);
  };

  const goTo = (path) => {
    if (selectedBatch) {
      navigate(`${path}?batch=${selectedBatch}`);
    } else {
      navigate(path);
    }
  };

  const handleLogout = async () => {
    const adminName = localStorage.getItem('adminName');
    if (adminName) {
      try {
        await api.post('/admin/logout', { adminName });
      } catch (err) {}
    }
    localStorage.removeItem('adminName');
    localStorage.removeItem('selectedBatch');
    navigate('/');
  };

  return (
    <div>
      <NavBar />
      <main className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-base-200 px-2 py-8">
        <div className="w-full max-w-3xl bg-base-100 rounded-3xl shadow-2xl px-8 py-12 flex flex-col items-center">
          <h1 className="mb-4 text-3xl sm:text-4xl font-extrabold text-primary text-center tracking-tight">
            Admin Dashboard
          </h1>
          <h2 className="mb-6 text-lg sm:text-xl font-semibold text-secondary text-center">
            Select a Batch
          </h2>

          {/* Year Tabs */}
          <div className="w-full flex justify-center mb-4">
            <div role="tablist" className="tabs tabs-boxed">
              {years.map(year => (
                <button
                  key={year}
                  role="tab"
                  className={`tab ${year === Number(selectedYear) ? "tab-active" : ""}`}
                  onClick={() => {
                    setSelectedYear(year);
                    setSelectedBatch('');
                  }}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>

          {/* Batch Buttons for Selected Year */}
          <div className="flex flex-wrap justify-center gap-4 w-full mb-8">
            {batchesForYear.map(batch => (
              <button
                key={batch.batchName}
                className={`btn btn-md font-bold transition-all duration-150 ${
                  selectedBatch === batch.batchName
                    ? 'btn-primary scale-105 shadow-lg'
                    : 'btn-outline'
                }`}
                onClick={() => handleSelectBatch(batch.batchName)}
              >
                {batch.batchName}
              </button>
            ))}
          </div>
          {selectedBatch && (
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
              <button
                className="btn btn-info h-14 font-semibold text-base flex items-center justify-center w-full"
                onClick={() => goTo('/leaderboard')}
              >
                {buttonIcons.leaderboard} Leaderboard
              </button>
              <button
                className="btn btn-success h-14 font-semibold text-base flex items-center justify-center w-full"
                onClick={() => goTo('/markattendance')}
              >
                {buttonIcons.attendance} Mark Attendance
              </button>
              <button
                className="btn btn-warning h-14 font-semibold text-base flex items-center justify-center w-full"
                onClick={() => goTo('/viewattendance')}
              >
                {buttonIcons.view} View Attendance
              </button>
              <button
                className="btn btn-primary h-14 font-semibold text-base flex items-center justify-center w-full"
                onClick={() => goTo('/markentry')}
              >
                {buttonIcons.mark} Mark Entry
              </button>
              <button
                className="btn btn-ghost h-14 font-semibold text-base flex items-center justify-center w-full"
                onClick={handleLogout}
              >
                {buttonIcons.logout} Logout
              </button>
            </div>
          )}
          {!selectedBatch && (
            <p className="mb-6 text-sm text-center text-warning font-medium bg-warning/10 px-4 py-2 rounded-lg shadow-sm">
              <svg className="inline w-4 h-4 mr-1 mb-1 text-warning" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              If the batch is not selected, the other pages will be visible in empty slots.
            </p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminPage;