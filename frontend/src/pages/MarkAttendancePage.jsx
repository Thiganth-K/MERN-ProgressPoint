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
  const [allStudents, setAllStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [date, setDate] = useState('');
  const [session, setSession] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [existingAttendanceFound, setExistingAttendanceFound] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [timeRestrictionAlert, setTimeRestrictionAlert] = useState(null);
  const [selectedBatchFilter, setSelectedBatchFilter] = useState('');
  const query = useQuery();
  const department = query.get('department');

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
    if (department) {
      // Check time restrictions when component loads
      checkTimeRestrictions();
      
      api.get(`/departments/${encodeURIComponent(department)}/students`)
        .then(res => {
          const fetchedStudents = res.data.students || [];
          // Sort students by registration number in ascending order
          const sortedStudents = fetchedStudents.sort((a, b) => a.regNo.localeCompare(b.regNo));
          setAllStudents(sortedStudents);
          setStudents(sortedStudents);
          const initial = {};
          sortedStudents.forEach(s => {
            initial[s.regNo] = 'Present'; // Default to Present
          });
          setAttendance(initial);
        });
    }
  }, [department]);

  // Filter students by batch
  useEffect(() => {
    if (selectedBatchFilter) {
      const filtered = allStudents.filter(s => s.batchName === selectedBatchFilter);
      // Sort filtered students by registration number
      const sortedFiltered = filtered.sort((a, b) => a.regNo.localeCompare(b.regNo));
      setStudents(sortedFiltered);
      // Update attendance state to only include filtered students
      const initial = {};
      sortedFiltered.forEach(s => {
        initial[s.regNo] = attendance[s.regNo] || 'Present';
      });
      setAttendance(initial);
    } else {
      // Sort all students by registration number
      const sortedAll = [...allStudents].sort((a, b) => a.regNo.localeCompare(b.regNo));
      setStudents(sortedAll);
      // Reset attendance for all students
      const initial = {};
      sortedAll.forEach(s => {
        initial[s.regNo] = attendance[s.regNo] || 'Present';
      });
      setAttendance(initial);
    }
  }, [selectedBatchFilter, allStudents]);

  // Get unique batches for filter
  const uniqueBatches = [...new Set(allStudents.map(s => s.batchName))].filter(Boolean).sort();

  // Note: Fetching existing attendance by department would require a new backend endpoint
  // For now, we'll skip existing attendance fetch for department view
  useEffect(() => {
    if (department && date && session) {
      setIsLoading(true);
      // This would need a new backend endpoint to fetch attendance by department
      // For now, skipping existing attendance fetch for department view
      setExistingAttendanceFound(false);
      setIsLoading(false);
    }
  }, [department, date, session]);

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
      // Group students by batch since attendance is batch-specific
      const batchGroups = {};
      students.forEach(student => {
        if (!batchGroups[student.batchName]) {
          batchGroups[student.batchName] = {};
        }
        batchGroups[student.batchName][student.regNo] = attendance[student.regNo];
      });
      
      // Mark attendance for each batch
      for (const [batchName, batchAttendance] of Object.entries(batchGroups)) {
        await api.post(`/batches/${batchName}/attendance`, {
          date,
          session,
          attendance: batchAttendance
        });
      }
      
      setShowSuccess(true);
      setExistingAttendanceFound(false); // Reset the flag after successful save
      setTimeout(() => setShowSuccess(false), 2200);
      toast.success('Attendance marked successfully for all students!');
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
          Mark Attendance <span className="text-accent">{department ? `- ${department}` : ''}</span>
        </h1>
        
        {/* Existing Attendance Alert */}
        {existingAttendanceFound && (
          <div className="w-full max-w-6xl mb-4">
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
          <div className="w-full max-w-6xl mb-4">
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
          className="w-full max-w-6xl bg-base-100 p-6 rounded-2xl shadow-xl relative"
        >
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-sm text-secondary">Date:</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="input input-bordered input-md"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-sm text-secondary">Session:</label>
              <select
                value={session}
                onChange={e => setSession(e.target.value)}
                className="select select-bordered input-md"
                required
              >
                <option value="">Select Session</option>
                <option value="FN">FN</option>
                <option value="AN">AN</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-sm text-secondary">Filter by Batch:</label>
              <select
                value={selectedBatchFilter}
                onChange={e => setSelectedBatchFilter(e.target.value)}
                className="select select-bordered input-md"
              >
                <option value="">All Batches</option>
                {uniqueBatches.map(batch => (
                  <option key={batch} value={batch}>{batch}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-center">
              {isLoading && (
                <div className="loading loading-spinner loading-md"></div>
              )}
            </div>
          </div>
          
          {selectedBatchFilter && (
            <div className="mb-4 alert alert-info">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span className="text-sm">Showing {students.length} student{students.length !== 1 ? 's' : ''} from <strong>{selectedBatchFilter}</strong></span>
            </div>
          )}
          
          <div className="overflow-x-auto rounded-xl border border-base-200">
            <table className="table w-full text-base">
              <thead>
                <tr className="bg-base-200 text-base font-semibold text-primary">
                  <th className="px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-left">Reg No</th>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Batch</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Attendance %</th>
                  <th className="px-4 py-2 text-left">Attendance</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, idx) => {
                  const uniqueKey = `${student.batchName}-${student.regNo}`;
                  return (
                  <tr key={uniqueKey} className={idx % 2 === 0 ? "bg-base-100" : "bg-base-200"}>
                    <td className="px-4 py-2">{idx + 1}</td>
                    <td className="px-4 py-2 font-mono">{student.regNo}</td>
                    <td className="px-4 py-2">{student.name}</td>
                    <td className="px-4 py-2 font-semibold text-primary">{student.batchName || '-'}</td>
                    <td className="px-4 py-2 text-sm">{student.personalEmail || student.collegeEmail || '-'}</td>
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
                  );
                })}
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