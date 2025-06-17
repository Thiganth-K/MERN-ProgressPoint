import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../lib/axios';

const navItems = [
  {
    label: 'Home',
    icon: (
      <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M4 10v10a1 1 0 001 1h3m10-11v10a1 1 0 01-1 1h-3m-4 0h4" />
      </svg>
    ),
    path: '/admin'
  },
  {
    label: 'Leaderboard',
    icon: (
      <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 17v-7a4 4 0 118 0v7M12 21v-4" />
      </svg>
    ),
    path: '/leaderboard'
  },
  {
    label: 'Attendance',
    icon: (
      <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    path: '/markattendance'
  },
  {
    label: 'View',
    icon: (
      <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
    path: '/viewattendance'
  },
  {
    label: 'Mark Entry',
    icon: (
      <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.5a2.121 2.121 0 013 3L7 19.5 3 21l1.5-4L16.5 3.5z" />
      </svg>
    ),
    path: '/markentry'
  },
  {
    label: 'Logout',
    icon: (
      <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
      </svg>
    ),
    path: '/logout'
  }
];

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(localStorage.getItem('selectedBatch') || '');

  useEffect(() => {
    api.get('/batches').then(res => setBatches(res.data.batches || []));
    const params = new URLSearchParams(location.search);
    const batchFromUrl = params.get('batch');
    if (batchFromUrl && batchFromUrl !== selectedBatch) {
      setSelectedBatch(batchFromUrl);
      localStorage.setItem('selectedBatch', batchFromUrl);
    }
  }, [location]);

  // --- FIX: Make logout API call before clearing localStorage ---
  const handleNav = async (item) => {
    if (item.path === '/logout') {
      const adminName = localStorage.getItem('adminName');
      if (adminName) {
        try {
          await api.post('/admin/logout', { adminName });
        } catch (err) {
          // ignore error, still proceed with logout
        }
      }
      localStorage.removeItem('adminName');
      localStorage.removeItem('selectedBatch');
      navigate('/');
    } else {
      const selectedBatch = localStorage.getItem('selectedBatch');
      if (
        ['/leaderboard', '/markattendance', '/viewattendance', '/markentry'].includes(item.path) &&
        selectedBatch
      ) {
        navigate(`${item.path}?batch=${selectedBatch}`);
      } else {
        navigate(item.path);
      }
    }
  };

  return (
    <footer className="bg-base-100 border-t border-base-200 w-full">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between py-4 px-4 gap-4">
        {/* Branding */}
        <div className="flex flex-col items-center md:items-start w-full md:w-auto">
          <span className="text-primary font-bold text-xl mb-1">Progress Point</span>
          <span className="text-xs text-gray-500 text-center md:text-left">
            &copy; {new Date().getFullYear()} Progress Point<br />Sona College of Technology, Salem
          </span>
        </div>
        {/* Navigation */}
        <nav className="flex flex-1 justify-center gap-4 flex-wrap mt-2 md:mt-0">
          {navItems.map(item => (
            <button
              key={item.label}
              className="flex flex-col items-center px-2 py-1 text-secondary hover:text-primary transition-colors"
              onClick={() => handleNav(item)}
              type="button"
            >
              {item.icon}
              <span className="text-xs font-semibold">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </footer>
  );
};

export default Footer;