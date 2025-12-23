import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import api from '../lib/axios';
import toast from 'react-hot-toast';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const columns = [
  { key: 'efforts', label: 'Efforts' },
  { key: 'presentation', label: 'Presentation' },
  { key: 'assignment', label: 'Assignment' },
  { key: 'assessment', label: 'Assessment' }
];

const MarkEntryPage = () => {
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [date, setDate] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [existingMarksFound, setExistingMarksFound] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showMarkTable, setShowMarkTable] = useState(false); // NEW
  const [openMarkRegNo, setOpenMarkRegNo] = useState(null); // NEW
  const [prevMarks, setPrevMarks] = useState({}); // NEW
  const [timeRestrictionAlert, setTimeRestrictionAlert] = useState(null);
  const query = useQuery();
  const batch = query.get('batch');

  // Check time restrictions for marks entry
  const checkTimeRestrictions = async () => {
    try {
      const response = await api.get('/time-restrictions/marks/check');
      if (!response.data.allowed) {
        setTimeRestrictionAlert({
          type: 'error',
          message: response.data.message || 'Marks entry is not allowed at this time'
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
      
      api.get(`/batches/${batch}/students`).then(res => {
        setStudents(res.data.students || []);
        // Initialize marks with zeros
        const initial = {};
        const prev = {};
        (res.data.students || []).forEach(s => {
          initial[s.regNo] = { efforts: 0, presentation: 0, assessment: 0, assignment: 0 };
          // Get last marksHistory entry if exists
          if (s.marksHistory && s.marksHistory.length > 0) {
            const last = s.marksHistory[s.marksHistory.length - 1];
            prev[s.regNo] = last.marks;
          }
        });
        setMarks(initial);
        setPrevMarks(prev); // NEW
      });
    }
  }, [batch]);

  // Fetch marks for the selected date
  useEffect(() => {
    if (batch && date) {
      setIsLoading(true);
      api.get(`/batches/${batch}/marks/${date}`)
        .then(res => {
          if (res.data.marks && Object.keys(res.data.marks).length > 0) {
            setMarks(prev => ({
              ...prev,
              ...res.data.marks
            }));
            setExistingMarksFound(true);
          } else {
            setExistingMarksFound(false);
            // Reset marks to zero for all students
            setMarks(prev => {
              const reset = { ...prev };
              students.forEach(s => {
                reset[s.regNo] = { efforts: 0, presentation: 0, assessment: 0, assignment: 0 };
              });
              return reset;
            });
          }
        })
        .catch(() => setExistingMarksFound(false))
        .finally(() => setIsLoading(false));
    }
  }, [batch, date, students]);

  const handleMarkChange = (regNo, key, value) => {
    setMarks(prev => ({
      ...prev,
      [regNo]: {
        ...prev[regNo],
        [key]: Number(value)
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check time restrictions before submitting
    const isAllowed = await checkTimeRestrictions();
    if (!isAllowed) {
      toast.error('Marks entry is not allowed at this time');
      return;
    }
    
    try {
      await api.post(`/batches/${batch}/marks`, {
        date,
        marks
      });
      toast.success(existingMarksFound ? 'Marks updated successfully!' : 'Marks saved successfully!');
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 2200);
      setExistingMarksFound(true);
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error('Marks entry is not allowed at this time');
      } else {
        toast.error('Failed to update marks');
      }
    }
  };

  return (
    <div>
      <NavBar />
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-base-200 px-2 py-8">
        <h1 className="mb-8 text-3xl sm:text-4xl font-extrabold text-primary text-center tracking-tight">
          Mark Entry <span className="text-accent">{batch ? `- ${batch}` : ''}</span>
        </h1>
        
        {/* Time Restriction Alert */}
        {timeRestrictionAlert && (
          <div className="w-full max-w-4xl mb-4">
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
          className="w-full max-w-4xl bg-base-100 p-6 rounded-2xl shadow-2xl relative"
        >
          <div className="mb-6 flex flex-col sm:flex-row items-center gap-4">
            <label className="font-semibold text-lg text-secondary">Test Conducted On:</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="input input-bordered input-md max-w-xs"
              required
            />
            {isLoading && <div className="loading loading-spinner loading-md"></div>}
          </div>
          {/* Student List with Mark Entry Button */}
          <div className="mb-6">
            {students.map((student, idx) => (
              <div key={student.regNo} className="flex flex-col gap-2 mb-4 bg-base-200 p-4 rounded-xl">
                <div className="flex flex-row items-center justify-between">
                  <span className="font-semibold text-base text-primary">
                    {idx + 1}. {student.name} <span className="text-xs text-secondary">({student.regNo})</span>
                  </span>
                  {/* Show "Enter Marks" button only if not open */}
                  {openMarkRegNo !== student.regNo && (
                    <button
                      type="button"
                      className="btn btn-accent btn-sm"
                      onClick={() => setOpenMarkRegNo(student.regNo)}
                    >
                      Enter Marks
                    </button>
                  )}
                </div>
                {openMarkRegNo === student.regNo && (
                  <div className="w-full">
                    {/* Previous Marks Display */}
                    {prevMarks[student.regNo] && (
                      <div className="mb-2 flex flex-col">
                        <span className="font-bold text-sm text-primary flex items-center mb-1">
                          <svg className="w-5 h-5 mr-1 text-primary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 20l9-5-9-5-9 5 9 5z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 12V4m0 0L8 8m4-4l4 4" />
                          </svg>
                          Previous Marks:
                        </span>
                        <div className="h-2"></div>
                        <div className="flex flex-wrap gap-4 items-center">
                          {columns.map(col => (
                            <span
                              key={col.key}
                              className="badge badge-lg badge-outline badge-primary text-base font-semibold px-4 py-2"
                              title={col.label}
                            >
                              <span className="text-primary">{col.label}:</span> <span className="text-accent">{prevMarks[student.regNo][col.key]}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2 sm:mt-0 items-end">
                      {columns.map(col => (
                        <div key={col.key} className="flex flex-col items-center">
                          <label className="text-xs font-medium text-secondary">{col.label}</label>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={marks[student.regNo]?.[col.key] ?? 0}
                            onChange={e => handleMarkChange(student.regNo, col.key, e.target.value)}
                            className="input input-bordered input-sm w-20 text-center font-semibold"
                            required
                          />
                        </div>
                      ))}
                      {/* Hide Marks button after last input */}
                      <button
                        type="button"
                        className="btn btn-outline btn-error btn-sm ml-4"
                        onClick={() => setOpenMarkRegNo(null)}
                      >
                        Hide Marks
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <button
            type="submit"
            className="btn btn-primary mt-6 w-full text-lg tracking-wide font-bold"
            disabled={isLoading}
          >
            {existingMarksFound ? 'Update Marks' : 'Save Marks'}
          </button>
          {/* Success Animation & Message */}
          {showMessage && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-base-100 bg-opacity-80 rounded-2xl animate-fade-in z-10">
              <div className="text-2xl font-bold text-success text-center tracking-wide">
                {existingMarksFound ? 'Marks updated successfully!' : 'Marks saved successfully!'}
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
export default MarkEntryPage;