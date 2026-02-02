import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import api from '../lib/axios';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

// Helper to group attendance by date and session
function groupAttendanceByDateSession(students) {
  const map = {};
  students.forEach(student => {
    (student.attendance || []).forEach(record => {
      const key = `${record.date}__${record.session}`;
      if (!map[key]) map[key] = [];
      map[key].push({ 
        ...record, 
        regNo: student.regNo, 
        name: student.name,
        batchName: student.batchName,
        department: student.department,
        personalEmail: student.personalEmail,
        collegeEmail: student.collegeEmail
      });
    });
  });
  return map;
}

const ViewAttendancePage = () => {
  const [students, setStudents] = useState([]);
  const [attendanceByDate, setAttendanceByDate] = useState({});
  const [selectedDateSession, setSelectedDateSession] = useState(null);
  const query = useQuery();
  const batch = query.get('batch');
  const department = query.get('department');

  useEffect(() => {
    if (department) {
      // Fetch students by department
      api.get(`/departments/${encodeURIComponent(department)}/students`)
        .then(res => {
          setStudents(res.data.students || []);
          const grouped = groupAttendanceByDateSession(res.data.students || []);
          setAttendanceByDate(grouped);
        });
    } else if (batch) {
      // Fetch students by batch (legacy support)
      api.get(`/batches/${batch}/students`)
        .then(res => {
          setStudents(res.data.students || []);
          const grouped = groupAttendanceByDateSession(res.data.students || []);
          setAttendanceByDate(grouped);
        });
    }
  }, [batch, department]);

  // Get sorted date-session keys (latest first, FN before AN)
  const dateSessionKeys = Object.keys(attendanceByDate).sort((a, b) => {
    const [dateA, sessionA] = a.split("__");
    const [dateB, sessionB] = b.split("__");
    if (dateA !== dateB) return new Date(b) - new Date(a);
    return sessionA.localeCompare(sessionB);
  });

  return (
    <div>
      <NavBar />
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center bg-base-200 px-2 py-8">
        <h1 className="mb-8 text-3xl sm:text-4xl font-extrabold text-primary text-center tracking-tight">
          Attendance Records <span className="text-accent">{department ? `- ${department}` : batch ? `- ${batch}` : ''}</span>
        </h1>
        {!selectedDateSession ? (
          <div className="w-full max-w-6xl flex flex-wrap gap-6 justify-center">
            {dateSessionKeys.length === 0 && (
              <div className="text-gray-500 text-lg font-medium">No attendance records found.</div>
            )}
            {dateSessionKeys.map(key => {
              const records = attendanceByDate[key];
              const [date, session] = key.split("__");
              const present = records.filter(r => r.status === 'Present').length;
              const absent = records.filter(r => r.status === 'Absent').length;
              const onDuty = records.filter(r => r.status === 'On-Duty').length;
              return (
                <div
                  key={key}
                  className="card w-80 bg-base-100 shadow-xl cursor-pointer hover:scale-[1.03] transition-transform duration-200"
                  onClick={() => setSelectedDateSession(key)}
                >
                  <div className="card-body items-center text-center">
                    <h2 className="card-title mb-2 text-lg font-bold text-primary">
                      {new Date(date).toLocaleDateString()} <span className="text-accent">({session})</span>
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
          <div className="w-full max-w-6xl bg-base-100 p-6 rounded-2xl shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 text-primary text-center">
              Attendance on <span className="text-accent">
                {(() => {
                  const [date, session] = selectedDateSession.split("__");
                  return `${new Date(date).toLocaleDateString()} (${session})`;
                })()}
              </span>
            </h2>
            <div className="overflow-x-auto rounded-xl border border-base-200 mb-6">
              <table className="table w-full text-base">
                <thead>
                  <tr className="bg-base-200 text-base font-semibold text-primary">
                    <th className="px-4 py-2 text-left">#</th>
                    <th className="px-4 py-2 text-left">Reg No</th>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Batch</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceByDate[selectedDateSession].map((record, idx) => (
                    <tr key={record.regNo + idx} className={idx % 2 === 0 ? "bg-base-100" : "bg-base-200"}>
                      <td className="px-4 py-2">{idx + 1}</td>
                      <td className="px-4 py-2 font-mono">{record.regNo}</td>
                      <td className="px-4 py-2">{record.name}</td>
                      <td className="px-4 py-2 font-semibold text-primary">{record.batchName || '-'}</td>
                      <td className="px-4 py-2 text-sm">{record.personalEmail || record.collegeEmail || '-'}</td>
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
              onClick={() => setSelectedDateSession(null)}
            >
              ← Back to Attendance Sessions
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ViewAttendancePage;