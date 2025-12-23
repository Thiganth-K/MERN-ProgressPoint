import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import api from '../lib/axios';
import toast from 'react-hot-toast';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const MarkAttendancePage = () => {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [date, setDate] = useState('');
  const [session, setSession] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [existingAttendanceFound, setExistingAttendanceFound] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [timeRestrictionAlert, setTimeRestrictionAlert] = useState(null);
  const query = useQuery();
  const batch = query.get('batch');

  // Check time restrictions for attendance
  const checkTimeRestrictions = async () => {
    try {
      const response = await api.get('/time-restrictions/attendance/check');
      if (!response.data.allowed) {
        setTimeRestrictionAlert({
          type: 'error',
          message: response.data.message || 'Attendance marking is not allowed at this time'
        });
        return false;
      } else {
        setTimeRestrictionAlert(null);
        return true;
      }
    } catch (error) {
      // If there's an error checking restrictions, allow the action (fail open)
      setTimeRestrictionAlert(null);
      return true;
    }
  };

  useEffect(() => {
    if (batch) {
      // Check time restrictions when component loads
      checkTimeRestrictions();
      
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

  // Fetch existing attendance when date and session are selected
  useEffect(() => {
    if (batch && date && session) {
      setIsLoading(true);
      api.get(`/batches/${batch}/attendance/${date}/${session}`)
        .then(res => {
          if (res.data.attendance && Object.keys(res.data.attendance).length > 0) {
            setAttendance(prev => ({
              ...prev,
              ...res.data.attendance
            }));
            setExistingAttendanceFound(true);
          } else {
            setExistingAttendanceFound(false);
          }
        })
        .catch(err => {
          console.error('Error fetching existing attendance:', err);
          setExistingAttendanceFound(false);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [batch, date, session]);

  const handleAttendanceChange = (regNo, value) => {
    setAttendance(prev => ({
      ...prev,
      [regNo]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check time restrictions before submitting
    const isAllowed = await checkTimeRestrictions();
    if (!isAllowed) {
      toast.error('Attendance marking is not allowed at this time');
      return;
    }
    
    try {
      await api.post(`/batches/${batch}/attendance`, {
        date,
        session,
        attendance
      });
      setShowSuccess(true);
      setExistingAttendanceFound(false); // Reset the flag after successful save
      setTimeout(() => setShowSuccess(false), 2200);
      toast.success('Attendance marked successfully!');
    } catch (error) {
      setShowSuccess(false);
      if (error.response?.status === 403) {
        toast.error('Attendance marking is not allowed at this time');
      } else {
        toast.error('Failed to mark attendance');
      }
    }
  };

  return (
    <div>
      <NavBar />
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-base-200 px-2 py-8">
        <h1 className="mb-6 text-3xl font-extrabold text-primary text-center tracking-tight">
          Mark Attendance <span className="text-accent">{batch ? `- ${batch}` : ''}</span>
        </h1>
        
        {/* Existing Attendance Alert */}
        {existingAttendanceFound && (
          <div className="w-full max-w-3xl mb-4">
            <div className="alert alert-info shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div>
                <h3 className="font-bold">Existing Attendance Found!</h3>
                <div className="text-xs">Previous attendance records for {date} ({session}) have been loaded. You can modify them below.</div>
              </div>
            </div>
          </div>
        )}

        {/* Time Restriction Alert */}
        {timeRestrictionAlert && (
          <div className="w-full max-w-3xl mb-4">
            <div className={`alert ${timeRestrictionAlert.type === 'error' ? 'alert-error' : 'alert-warning'} shadow-lg`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
              <div>
                <h3 className="font-bold">Access Restricted</h3>
                <div className="text-xs">{timeRestrictionAlert.message}</div>
              </div>
            </div>
          </div>
        )}

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
            <label className="font-semibold text-lg text-secondary">Session:</label>
            <select
              value={session}
              onChange={e => setSession(e.target.value)}
              className="select select-bordered input-md max-w-xs"
              required
            >
              <option value="">Select Session</option>
              <option value="FN">FN</option>
              <option value="AN">AN</option>
            </select>
            {isLoading && (
              <div className="loading loading-spinner loading-md"></div>
            )}
          </div>
          <div className="overflow-x-auto rounded-xl border border-base-200">
            <table className="table w-full text-base">
              <thead>
                <tr className="bg-base-200 text-base font-semibold text-primary">
                  <th className="px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-left">Reg No</th>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Attendance %</th>
                  <th className="px-4 py-2 text-left">Attendance</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, idx) => (
                  <tr key={student.regNo} className={idx % 2 === 0 ? "bg-base-100" : "bg-base-200"}>
                    <td className="px-4 py-2">{idx + 1}</td>
                    <td className="px-4 py-2 font-mono">{student.regNo}</td>
                    <td className="px-4 py-2">{student.name}</td>
                    <td className="px-4 py-2 min-w-[90px] text-center">
                      <span
                        className={`font-extrabold text-base sm:text-lg
                          ${student.attendancePercent >= 90
                            ? 'text-success'
                            : student.attendancePercent >= 75
                            ? 'text-warning'
                            : 'text-error'}
                        `}
                        title="Current Attendance %"
                      >
                        {student.attendancePercent !== undefined
                          ? `${student.attendancePercent}%`
                          : '0%'}
                      </span>
                    </td>
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
            disabled={isLoading}
          >
            {existingAttendanceFound ? 'Update Attendance' : 'Save Attendance'}
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
                {existingAttendanceFound ? 'Attendance Updated Successfully!' : 'Attendance Marked Successfully!'}
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