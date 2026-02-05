import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import api from '../lib/axios';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const trophyIcons = [
  // Gold, Silver, Bronze
  <svg key="gold" className="w-6 h-6 text-yellow-400 inline-block mr-1" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9 2a1 1 0 012 0v1h3a1 1 0 011 1v2a5 5 0 01-4 4.9V13h2a1 1 0 010 2H7a1 1 0 010-2h2V8.9A5 5 0 015 6V4a1 1 0 011-1h3V2z" />
  </svg>,
  <svg key="silver" className="w-6 h-6 text-gray-400 inline-block mr-1" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9 2a1 1 0 012 0v1h3a1 1 0 011 1v2a5 5 0 01-4 4.9V13h2a1 1 0 010 2H7a1 1 0 010-2h2V8.9A5 5 0 015 6V4a1 1 0 011-1h3V2z" />
  </svg>,
  <svg key="bronze" className="w-6 h-6 text-yellow-700 inline-block mr-1" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9 2a1 1 0 012 0v1h3a1 1 0 011 1v2a5 5 0 01-4 4.9V13h2a1 1 0 010 2H7a1 1 0 010-2h2V8.9A5 5 0 015 6V4a1 1 0 011-1h3V2z" />
  </svg>,
];

const LeaderBoard = () => {
  const [students, setStudents] = useState([]);
  const query = useQuery();
  const department = query.get('department');
  const batch = query.get('batch'); // Keep for backward compatibility

  useEffect(() => {
    if (department) {
      // Use department endpoint for admin
      api.get(`/departments/${encodeURIComponent(department)}/students`)
        .then(res => setStudents(res.data.students || []))
        .catch(err => console.error('Error fetching department students:', err));
    } else if (batch) {
      // Use batch endpoint for superadmin
      api.get(`/batches/${batch}/students`)
        .then(res => setStudents(res.data.students || []))
        .catch(err => console.error('Error fetching batch students:', err));
    }
  }, [department, batch]);

  // Calculate total marks and attendance percentage for each student
  const leaderboard = students.map(student => {
    const total = (student.marks.efforts || 0) +
                  (student.marks.presentation || 0) +
                  (student.marks.assessment || 0) +
                  (student.marks.assignment || 0);

    const totalDays = student.attendance.length;
    const presentDays = student.attendance.filter(a => a.status === 'Present' || a.status === 'On-Duty').length;
    const attendancePercent = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : "0.00";

    return {
      name: student.name,
      regNo: student.regNo,
      department: student.department,
      personalEmail: student.personalEmail,
      collegeEmail: student.collegeEmail,
      total,
      attendancePercent: Number(attendancePercent),
      ...student.marks,
      marksLastUpdated: student.marksLastUpdated
    };
  }).sort((a, b) => {
    if (b.total !== a.total) return b.total - a.total;
    return b.attendancePercent - a.attendancePercent;
  });

  return (
    <div className="bg-base-200 min-h-[calc(100vh-64px)] flex flex-col">
      <NavBar />
      <div className="flex flex-col items-center flex-1 py-8 px-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-primary tracking-tight flex items-center gap-2">
          <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 17v-7a4 4 0 118 0v7M12 21v-4" />
          </svg>
          Leaderboard
        </h1>
        {(department || batch) && (
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-secondary">
            {department ? `Department: ${department}` : `Batch: ${batch}`}
          </h2>
        )}
        <div className="overflow-x-auto w-full max-w-4xl bg-base-100 rounded-2xl shadow-xl p-4">
          <table className="table w-full text-base">
            <thead>
              <tr className="bg-base-200 text-primary font-semibold text-base">
                <th className="px-4 py-2 text-left">Rank</th>
                <th className="px-4 py-2 text-left">Student</th>
                <th className="px-4 py-2 text-left">Reg No</th>
                <th className="px-4 py-2 text-left">Dept</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-center">Efforts</th>
                <th className="px-4 py-2 text-center">Presentation</th>
                <th className="px-4 py-2 text-center">Assessment</th>
                <th className="px-4 py-2 text-center">Assignment</th>
                <th className="px-4 py-2 text-center">Total</th>
                <th className="px-4 py-2 text-center">Attendance %</th>
                <th className="px-4 py-2 text-center">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.length === 0 && (
                <tr>
                  <td colSpan={12} className="text-center py-8 text-gray-400 font-semibold">
                    No students found for this batch.
                  </td>
                </tr>
              )}
              {leaderboard.map((student, idx) => (
                <tr key={student.regNo} className={idx % 2 === 0 ? "bg-base-100" : "bg-base-200"}>
                  <td className="px-4 py-2 font-bold text-lg text-center">
                    {idx < 3 ? trophyIcons[idx] : <span className="text-base">{idx + 1}</span>}
                  </td>
                  <td className="px-4 py-2 font-semibold">{student.name}</td>
                  <td className="px-4 py-2 font-mono">{student.regNo}</td>
                  <td className="px-4 py-2">{student.department || '-'}</td>
                  <td className="px-4 py-2">{student.personalEmail || student.collegeEmail || '-'}</td>
                  <td className="px-4 py-2 text-center">{student.efforts}</td>
                  <td className="px-4 py-2 text-center">{student.presentation}</td>
                  <td className="px-4 py-2 text-center">{student.assessment}</td>
                  <td className="px-4 py-2 text-center">{student.assignment}</td>
                  <td className="px-4 py-2 font-bold text-center text-primary">{student.total}</td>
                  <td className="px-4 py-2 text-center">
                    <span className={
                      student.attendancePercent >= 90
                        ? "text-success font-semibold"
                        : student.attendancePercent >= 75
                        ? "text-warning font-semibold"
                        : "text-error font-semibold"
                    }>
                      {student.attendancePercent}%
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center text-xs">
                    {student.marksLastUpdated
                      ? new Date(student.marksLastUpdated).toLocaleString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LeaderBoard;