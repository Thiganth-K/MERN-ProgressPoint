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
  const [showMessage, setShowMessage] = useState(false);
  const query = useQuery();
  const batch = query.get('batch');

  useEffect(() => {
    if (batch) {
      api.get(`/batches/${batch}/students`)
        .then(res => {
          setStudents(res.data.students || []);
          const initial = {};
          (res.data.students || []).forEach(s => {
            initial[s.regNo] = { ...s.marks };
          });
          setMarks(initial);
        });
    }
  }, [batch]);

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
      await Promise.all(
        students.map(student =>
          api.post(`/batches/${batch}/student/${student.regNo}/marks`, {
            marks: marks[student.regNo]
          })
        )
      );
      toast.success('Marks updated successfully!');
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 2200);
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
          >
            Save Marks
          </button>
          {/* Success Animation & Message */}
          {showMessage && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-base-100 bg-opacity-90 rounded-2xl animate-fade-in z-10">
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
                Mark Entry Done!
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