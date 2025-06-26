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
  const query = useQuery();
  const batch = query.get('batch');

  useEffect(() => {
    if (batch) {
      api.get(`/batches/${batch}/students`).then(res => {
        setStudents(res.data.students || []);
        // Initialize marks with zeros
        const initial = {};
        (res.data.students || []).forEach(s => {
          initial[s.regNo] = { efforts: 0, presentation: 0, assessment: 0, assignment: 0 };
        });
        setMarks(initial);
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
    try {
      await api.post(`/batches/${batch}/marks`, {
        date,
        marks
      });
      toast.success(existingMarksFound ? 'Marks updated successfully!' : 'Marks saved successfully!');
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 2200);
      setExistingMarksFound(true);
    } catch {
      toast.error('Failed to update marks');
    }
  };

  return (
    <div>
      <NavBar />
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-base-200 px-2 py-8">
        <h1 className="mb-8 text-3xl sm:text-4xl font-extrabold text-primary text-center tracking-tight">
          Mark Entry <span className="text-accent">{batch ? `- ${batch}` : ''}</span>
        </h1>
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
          {existingMarksFound && (
            <div className="alert alert-info mb-4">
              <span>Existing marks found for this date. You can update them below.</span>
            </div>
          )}
          <div className="overflow-x-auto rounded-xl border border-base-200 mb-4">
            <table className="table w-full text-base">
              <thead>
                <tr className="bg-base-200 text-base font-semibold text-primary">
                  <th className="px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-left">Reg No</th>
                  <th className="px-4 py-2 text-left">Name</th>
                  {columns.map(col => (
                    <th key={col.key} className="px-4 py-2 text-center">{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((student, idx) => (
                  <tr key={student.regNo} className={idx % 2 === 0 ? "bg-base-100" : "bg-base-200"}>
                    <td className="px-4 py-2">{idx + 1}</td>
                    <td className="px-4 py-2 font-mono">{student.regNo}</td>
                    <td className="px-4 py-2">{student.name}</td>
                    {columns.map(col => (
                      <td key={col.key} className="px-2 py-2 text-center">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={marks[student.regNo]?.[col.key] ?? 0}
                          onChange={e => handleMarkChange(student.regNo, col.key, e.target.value)}
                          className="input input-bordered input-sm w-20 text-center font-semibold"
                          required
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
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