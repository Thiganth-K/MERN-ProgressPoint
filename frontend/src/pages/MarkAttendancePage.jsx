import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import api from '../lib/axios';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const MarkAttendancePage = () => {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [date, setDate] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const query = useQuery();
  const batch = query.get('batch');

  useEffect(() => {
    if (batch) {
      api.get(`/batches/${batch}/students`)
        .then(res => {
          setStudents(res.data.students || []);
          const initial = {};
          (res.data.students || []).forEach(s => {
            initial[s.regNo] = 'Present'; // Default to Present
          });
          setAttendance(initial);
        });
    }
  }, [batch]);

  const handleAttendanceChange = (regNo, value) => {
    setAttendance(prev => ({
      ...prev,
      [regNo]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/batches/${batch}/attendance`, {
        date,
        attendance
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2200);
    } catch {
      setShowSuccess(false);
      alert('Failed to mark attendance');
    }
  };

  return (
    <div>
      <NavBar />
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-base-200 px-2 py-8">
        <h1 className="mb-6 text-3xl font-extrabold text-primary text-center tracking-tight">
          Mark Attendance <span className="text-accent">{batch ? `- ${batch}` : ''}</span>
        </h1>
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-3xl bg-base-100 p-6 rounded-2xl shadow-xl relative"
        >
          <div className="mb-6 flex flex-col sm:flex-row items-center gap-4">
            <label className="font-semibold text-lg text-secondary">Date:</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="input input-bordered input-md max-w-xs"
              required
            />
          </div>
          <div className="overflow-x-auto rounded-xl border border-base-200">
            <table className="table w-full text-base">
              <thead>
                <tr className="bg-base-200 text-base font-semibold text-primary">
                  <th className="px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-left">Reg No</th>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Attendance</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, idx) => (
                  <tr key={student.regNo} className={idx % 2 === 0 ? "bg-base-100" : "bg-base-200"}>
                    <td className="px-4 py-2">{idx + 1}</td>
                    <td className="px-4 py-2 font-mono">{student.regNo}</td>
                    <td className="px-4 py-2">{student.name}</td>
                    <td className="px-4 py-2">
                      <select
                        className={`select select-bordered select-sm
                          ${attendance[student.regNo] === 'Present' ? 'text-success'
                            : attendance[student.regNo] === 'Absent' ? 'text-error'
                            : attendance[student.regNo] === 'On-Duty' ? '!text-yellow-500'
                            : ''}
                        `}
                        value={attendance[student.regNo] || 'Present'}
                        onChange={e => handleAttendanceChange(student.regNo, e.target.value)}
                      >
                        <option value="Present" className="text-success">Present</option>
                        <option value="Absent" className="text-error">Absent</option>
                        <option value="On-Duty" className="text-yellow-500">On-Duty</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            type="submit"
            className="btn btn-primary mt-6 w-full text-lg tracking-wide"
          >
            Save Attendance
          </button>
          {/* Success Animation & Message */}
          {showSuccess && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-base-100 bg-opacity-80 rounded-2xl animate-fade-in z-10">
              <svg
                className="w-20 h-20 text-success animate-bounce mb-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12l2 2l4-4" />
              </svg>
              <div className="text-2xl font-bold text-success text-center tracking-wide">
                Attendance Marked Successfully!
              </div>
            </div>
          )}
        </form>
        {/* Animation keyframes */}
        <style>
          {`
            @keyframes fade-in {
              0% { opacity: 0; transform: scale(0.95);}
              100% { opacity: 1; transform: scale(1);}
            }
            .animate-fade-in {
              animation: fade-in 0.5s cubic-bezier(.4,0,.2,1);
            }
          `}
        </style>
      </div>
      <Footer />
    </div>
  );
};

export default MarkAttendancePage;