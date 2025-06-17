import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import api from '../lib/axios';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

// Helper to group attendance by date
function groupAttendanceByDate(students) {
  const dateMap = {};
  students.forEach(student => {
    (student.attendance || []).forEach(record => {
      if (!dateMap[record.date]) dateMap[record.date] = [];
      dateMap[record.date].push({ ...record, regNo: student.regNo, name: student.name });
    });
  });
  return dateMap;
}

const ViewAttendancePage = () => {
  const [students, setStudents] = useState([]);
  const [attendanceByDate, setAttendanceByDate] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const query = useQuery();
  const batch = query.get('batch');

  useEffect(() => {
    if (batch) {
      api.get(`/batches/${batch}/students`)
        .then(res => {
          setStudents(res.data.students || []);
          const grouped = groupAttendanceByDate(res.data.students || []);
          setAttendanceByDate(grouped);
        });
    }
  }, [batch]);

  // Get sorted dates (latest first)
  const dates = Object.keys(attendanceByDate).sort((a, b) => new Date(b) - new Date(a));

  return (
    <div>
      <NavBar />
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center bg-base-200 px-2 py-8">
        <h1 className="mb-8 text-3xl sm:text-4xl font-extrabold text-primary text-center tracking-tight">
          Attendance Records <span className="text-accent">{batch ? `- ${batch}` : ''}</span>
        </h1>
        {!selectedDate ? (
          <div className="w-full max-w-4xl flex flex-wrap gap-6 justify-center">
            {dates.length === 0 && (
              <div className="text-gray-500 text-lg font-medium">No attendance records found.</div>
            )}
            {dates.map(date => {
              const records = attendanceByDate[date];
              const present = records.filter(r => r.status === 'Present').length;
              const absent = records.filter(r => r.status === 'Absent').length;
              const onDuty = records.filter(r => r.status === 'On-Duty').length;
              return (
                <div
                  key={date}
                  className="card w-80 bg-base-100 shadow-xl cursor-pointer hover:scale-[1.03] transition-transform duration-200"
                  onClick={() => setSelectedDate(date)}
                >
                  <div className="card-body items-center text-center">
                    <h2 className="card-title mb-2 text-lg font-bold text-primary">
                      {new Date(date).toLocaleDateString()}
                    </h2>
                    <div className="flex flex-col gap-1 text-base">
                      <span className="font-semibold text-success">Present: {present}</span>
                      <span className="font-semibold text-error">Absent: {absent}</span>
                      <span className="font-semibold text-yellow-500">On-Duty: {onDuty}</span>
                    </div>
                    <button className="btn btn-primary btn-sm mt-4 w-full font-semibold tracking-wide">
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="w-full max-w-4xl bg-base-100 p-6 rounded-2xl shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 text-primary text-center">
              Attendance on <span className="text-accent">{new Date(selectedDate).toLocaleDateString()}</span>
            </h2>
            <div className="overflow-x-auto rounded-xl border border-base-200 mb-6">
              <table className="table w-full text-base">
                <thead>
                  <tr className="bg-base-200 text-base font-semibold text-primary">
                    <th className="px-4 py-2 text-left">#</th>
                    <th className="px-4 py-2 text-left">Reg No</th>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceByDate[selectedDate].map((record, idx) => (
                    <tr key={record.regNo + idx} className={idx % 2 === 0 ? "bg-base-100" : "bg-base-200"}>
                      <td className="px-4 py-2">{idx + 1}</td>
                      <td className="px-4 py-2 font-mono">{record.regNo}</td>
                      <td className="px-4 py-2">{record.name}</td>
                      <td className="px-4 py-2">
                        {record.status === 'Present' && <span className="text-success font-semibold">Present</span>}
                        {record.status === 'Absent' && <span className="text-error font-semibold">Absent</span>}
                        {record.status === 'On-Duty' && <span className="text-yellow-500 font-semibold">On-Duty</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              className="btn btn-sm btn-secondary mt-4 w-full"
              onClick={() => setSelectedDate(null)}
            >
              ← Back to Attendance Days
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ViewAttendancePage;