import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../lib/axios';

const navItems = [
  {
    label: 'Home',
    path: '/admin',
    icon: (
      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M4 10v10a1 1 0 001 1h3m10-11v10a1 1 0 01-1 1h-3m-4 0h4" />
      </svg>
    ),
    btnClass: "btn-outline"
  },
  {
    label: 'Leaderboard',
    path: '/leaderboard',
    icon: (
      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 17v-7a4 4 0 118 0v7M12 21v-4" />
      </svg>
    ),
    btnClass: "btn-info"
  },
  {
    label: 'Mark Attendance',
    path: '/markattendance',
    icon: (
      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    btnClass: "btn-success"
  },
  {
    label: 'View Attendance',
    path: '/viewattendance',
    icon: (
      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
    btnClass: "btn-warning"
  },
  {
    label: 'Mark Entry',
    path: '/markentry',
    icon: (
      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.5a2.121 2.121 0 013 3L7 19.5 3 21l1.5-4L16.5 3.5z" />
      </svg>
    ),
    btnClass: "btn-primary"
  }
];

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(localStorage.getItem('selectedBatch') || '');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    api.get('/batches').then(res => {
      const sorted = (res.data.batches || []).sort((a, b) =>
        a.batchName.localeCompare(b.batchName)
      );
      setBatches(sorted);
    });
    const params = new URLSearchParams(location.search);
    const batchFromUrl = params.get('batch');
    if (batchFromUrl && batchFromUrl !== selectedBatch) {
      setSelectedBatch(batchFromUrl);
      localStorage.setItem('selectedBatch', batchFromUrl);
    }
  }, [location]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  const goTo = (path) => {
    setMenuOpen(false);
    if (selectedBatch && path !== '/admin') {
      navigate(`${path}?batch=${selectedBatch}`);
    } else {
      navigate(path);
    }
  };

  const handleBatchChange = (e) => {
    const batch = e.target.value;
    setSelectedBatch(batch);
    localStorage.setItem('selectedBatch', batch);
    const params = new URLSearchParams(location.search);
    params.set('batch', batch);
    navigate(`${location.pathname}?${params.toString()}`);
    setMenuOpen(false);
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
    setMenuOpen(false);
  };

  return (
    <header className="bg-base-100 shadow-md sticky top-0 z-50 w-full">
      <nav className="flex items-center justify-between p-4 w-full max-w-none">
        <div
          className="text-2xl font-extrabold text-primary cursor-pointer tracking-tight flex items-center gap-2"
          onClick={() => goTo('/admin')}
        >
          <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 10v10a1 1 0 001 1h3m10-11v10a1 1 0 01-1 1h-3m-4 0h4" />
          </svg>
          Progress Point
        </div>
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-3">
          {navItems.map(item => (
            <button
              key={item.label}
              className={`btn btn-sm font-semibold flex items-center ${item.btnClass}`}
              onClick={() => goTo(item.path)}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
          <select
            className="select select-sm ml-2"
            value={selectedBatch}
            onChange={handleBatchChange}
          >
            <option value="">Select Batch</option>
            {batches.map(batch => (
              <option key={batch.batchName} value={batch.batchName}>{batch.batchName}</option>
            ))}
          </select>
          <button className="btn btn-sm btn-ghost font-semibold ml-2" onClick={handleLogout}>
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
            </svg>
            Logout
          </button>
        </div>
        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button
            className="btn btn-ghost btn-circle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Open Menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>
      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div
          ref={menuRef}
          className="md:hidden fixed left-0 right-0 top-[64px] bg-base-100 border-t border-base-200 px-4 py-3 flex flex-col gap-2 shadow-lg z-50"
          style={{ maxWidth: '100vw', minWidth: 0 }}
        >
          {navItems.map(item => (
            <button
              key={item.label}
              className={`btn btn-sm font-semibold flex items-center w-full ${item.btnClass}`}
              onClick={() => goTo(item.path)}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
          <select
            className="select select-sm mb-2 w-full"
            value={selectedBatch}
            onChange={handleBatchChange}
          >
            <option value="">Select Batch</option>
            {batches.map(batch => (
              <option key={batch.batchName} value={batch.batchName}>{batch.batchName}</option>
            ))}
          </select>
          <button className="btn btn-sm btn-ghost font-semibold w-full" onClick={handleLogout}>
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
            </svg>
            Logout
          </button>
        </div>
      )}
    </header>
  );
};

export default NavBar;