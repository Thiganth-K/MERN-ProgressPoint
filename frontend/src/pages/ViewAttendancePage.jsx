import React, { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';

const ViewAttendancePage = () => {
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    // Load attendance records from localStorage
    const records = JSON.parse(localStorage.getItem('attendanceRecords') || '{}');
    setAttendanceRecords(records);
  }, []);

  const dates = Object.keys(attendanceRecords);

  return (
    <div className="min-h-screen bg-base-200">
      <NavBar />
      <div className="flex flex-col items-center justify-center px-2 py-8">
        <h1 className="text-2xl font-bold mb-6 text-primary">View Attendance</h1>
        <div className="flex flex-wrap gap-6 justify-center">
          {dates.length === 0 && (
            <div className="text-gray-500">No attendance records found.</div>
          )}
          {dates.map((date, idx) => {
            const records = attendanceRecords[date];
            const present = Object.values(records).filter(s => s === 'Present').length;
            const absent = Object.values(records).filter(s => s === 'Absent').length;
            const onduty = Object.values(records).filter(s => s === 'On-Duty').length;
            return (
              <div
                key={date}
                className="card w-72 bg-base-100 shadow-xl cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setSelected(date)}
              >
                <div className="card-body">
                  <h2 className="card-title">{date}</h2>
                  <p>Present: <span className="font-bold">{present}</span></p>
                  <p>Absent: <span className="font-bold">{absent}</span></p>
                  <p>On-Duty: <span className="font-bold">{onduty}</span></p>
                </div>
              </div>
            );
          })}
        </div>
        {/* Detailed View */}
        {selected && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-base-100 rounded-2xl shadow-2xl p-8 w-full max-w-md relative border border-base-300">
              <button
                className="absolute top-2 right-2 btn btn-sm btn-circle btn-ghost"
                onClick={() => setSelected(null)}
                aria-label="Close"
              >✕</button>
              <h2 className="text-xl font-bold mb-4 text-primary text-center">
                Attendance Details ({selected})
              </h2>
              <div className="overflow-x-auto">
                <table className="table w-full rounded-xl border border-base-200">
                  <thead>
                    <tr className="bg-base-200">
                      <th className="px-4 py-2 text-left">Student</th>
                      <th className="px-4 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(attendanceRecords[selected]).map(([student, status], idx) => (
                      <tr
                        key={student}
                        className={idx % 2 === 0 ? "bg-base-100" : "bg-base-200 hover:bg-base-300"}
                      >
                        <td className="px-4 py-2">{student}</td>
                        <td className="px-4 py-2">
                          <span className={
                            status === 'Present' ? 'text-success font-bold' :
                            status === 'Absent' ? 'text-error font-bold' :
                            'text-warning font-bold'
                          }>
                            {status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewAttendancePage;