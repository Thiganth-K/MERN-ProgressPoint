import React, { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import api from '../lib/axios';

const statusOptions = [
  { label: 'Present', color: 'btn-primary' },
  { label: 'Absent', color: 'btn-error' },
  { label: 'On-Duty', color: 'btn-warning' }
];

const MarkAttendancePage = () => {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [showMessage, setShowMessage] = useState(false);
  const adminName = localStorage.getItem('adminName');

  useEffect(() => {
    api.get(`/admin/${adminName}/students`)
      .then(res => {
        setStudents(res.data.students || []);
        const initial = {};
        (res.data.students || []).forEach(s => {
          initial[s.regNo] = 'Present';
        });
        setAttendance(initial);
      });
  }, [adminName]);

  const handleStatusChange = (regNo, status) => {
    setAttendance(prev => ({ ...prev, [regNo]: status }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post(`/admin/${adminName}/attendance`, { date, attendance });
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 2500);
  };

  return (
    <div className="min-h-screen bg-base-200 flex flex-col items-center py-8 px-2">
      <NavBar />
      <h1 className="text-2xl font-bold mb-6 text-primary">Mark Attendance</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-base-100 rounded-xl shadow-lg p-6">
        <div className="mb-6 flex flex-col sm:flex-row items-center gap-4">
          <label className="font-semibold text-secondary">Select Date:</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="input input-bordered"
            required
          />
        </div>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th className="text-left">#</th>
                <th className="text-left">Student Name</th>
                <th className="text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, idx) => (
                <tr key={student.regNo} className="hover">
                  <td>{idx + 1}</td>
                  <td className="font-medium">{student.name}</td>
                  <td>
                    <div className="flex gap-2">
                      {statusOptions.map(option => (
                        <button
                          type="button"
                          key={option.label}
                          className={`btn btn-xs ${attendance[student.regNo] === option.label ? option.color : 'btn-outline'}`}
                          onClick={() => handleStatusChange(student.regNo, option.label)}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button type="submit" className="btn btn-success mt-6 w-full">Submit Attendance</button>
        {showMessage && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
            <div className="bg-base-100 border-2 border-success px-10 py-8 rounded-2xl shadow-2xl flex flex-col items-center animate-fade-pop">
              <svg className="w-16 h-16 text-success mb-4 animate-success-tick" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M7 13l3 3 7-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
              <span className="text-success text-2xl font-bold mb-2">Success!</span>
              <span className="text-base-content text-lg">Attendance marked successfully!</span>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default MarkAttendancePage;