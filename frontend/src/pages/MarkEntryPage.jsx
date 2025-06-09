import React, { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';

const columns = ['Efforts', 'Presentation', 'Assignment', 'Assessment'];

const MarkEntryPage = () => {
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [showMessage, setShowMessage] = useState(false);
  const adminName = localStorage.getItem('adminName');

  useEffect(() => {
    fetch(`http://localhost:5001/api/admin/${adminName}/students`)
      .then(res => res.json())
      .then(data => {
        setStudents(data.students || []);
        const initial = {};
        (data.students || []).forEach(s => {
          initial[s.regNo] = { Efforts: 0, Presentation: 0, Assignment: 0, Assessment: 0, Total: 0 };
        });
        setMarks(initial);
      });
  }, [adminName]);

  const handleMarkChange = (regNo, col, value) => {
    setMarks(prev => {
      const updated = { ...prev };
      updated[regNo][col] = Number(value);
      updated[regNo].Total = columns.reduce((sum, c) => sum + Number(updated[regNo][c]), 0);
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    localStorage.setItem('marksRecords', JSON.stringify(marks));
    setShowMessage(true);

    // Save marks to server
    for (const regNo in marks) {
      await fetch(`${import.meta.env.VITE_API_URL}/api/admin/${adminName}/student/${regNo}/marks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marks: marks[regNo] }),
      });
    }

    setTimeout(() => setShowMessage(false), 2000);
  };

  return (
    <div className="min-h-screen bg-base-200">
      <NavBar />
      <div className="flex flex-col items-center py-8 px-2">
        <h1 className="text-2xl font-bold mb-6 text-primary">Mark Entry</h1>
        <form onSubmit={handleSubmit} className="w-full max-w-3xl bg-base-100 rounded-xl shadow-lg p-6">
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Student</th>
                  {columns.map(col => <th key={col}>{col}</th>)}
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student.regNo}>
                    <td className="font-medium">{student.name}</td>
                    {columns.map(col => (
                      <td key={col}>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={marks[student.regNo]?.[col] || ''}
                          onChange={e => handleMarkChange(student.regNo, col, e.target.value)}
                          className="input input-bordered input-xs w-16"
                          required
                        />
                      </td>
                    ))}
                    <td className="font-bold">{marks[student.regNo]?.Total || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="submit" className="btn btn-primary mt-6 w-full">Submit Marks</button>
          {showMessage && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
              <div className="bg-base-100 border-2 border-success px-10 py-8 rounded-2xl shadow-2xl flex flex-col items-center animate-fade-pop">
                <svg className="w-16 h-16 text-success mb-4 animate-success-tick" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <path d="M7 13l3 3 7-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
                <span className="text-success text-2xl font-bold mb-2">Success!</span>
                <span className="text-base-content text-lg">Marks saved successfully!</span>
              </div>
              <style>
                {`
                  @keyframes fade-pop {
                    0% { opacity: 0; transform: scale(0.8);}
                    60% { opacity: 1; transform: scale(1.05);}
                    100% { opacity: 1; transform: scale(1);}
                  }
                  .animate-fade-pop {
                    animation: fade-pop 0.5s cubic-bezier(.68,-0.55,.27,1.55);
                  }
                  @keyframes success-tick {
                    0% { stroke-dasharray: 0 24; }
                    60% { stroke-dasharray: 24 0; }
                    100% { stroke-dasharray: 24 0; }
                  }
                  .animate-success-tick path {
                    stroke-dasharray: 24 0;
                    animation: success-tick 0.7s cubic-bezier(.68,-0.55,.27,1.55);
                  }
                `}
              </style>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default MarkEntryPage;