import React, { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';

const LeaderBoard = () => {
  const [students, setStudents] = useState([]);
  const adminName = localStorage.getItem('adminName');

  useEffect(() => {
    fetch(`http://localhost:5001/api/admin/${adminName}/students`)
      .then(res => res.json())
      .then(data => setStudents(data.students || []));
  }, [adminName]);

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
      total,
      attendancePercent: Number(attendancePercent),
      ...student.marks
    };
  }).sort((a, b) => {
    if (b.total !== a.total) return b.total - a.total;
    return b.attendancePercent - a.attendancePercent;
  });

  return (
    <div className="bg-base-200 min-h-[calc(100vh-64px)] flex flex-col ">
      <NavBar />
      <div className="flex flex-col items-center flex-1 py-8 px-2 ">
        <h1 className="text-2xl font-bold mb-6 text-primary">Leaderboard</h1>
        <div className="overflow-x-auto w-full max-w-3xl">
          <table className="table w-full rounded-xl border border-base-200">
            <thead>
              <tr className="bg-base-200">
                <th className="px-4 py-2 text-left">Rank</th>
                <th className="px-4 py-2 text-left">Student</th>
                <th className="px-4 py-2 text-left">Reg No</th>
                <th className="px-4 py-2 text-left">Efforts</th>
                <th className="px-4 py-2 text-left">Presentation</th>
                <th className="px-4 py-2 text-left">Assessment</th>
                <th className="px-4 py-2 text-left">Assignment</th>
                <th className="px-4 py-2 text-left">Total</th>
                <th className="px-4 py-2 text-left">Attendance %</th>
                <th className="px-4 py-2 text-left">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((student, idx) => (
                <tr key={student.regNo} className={idx % 2 === 0 ? "bg-base-100" : "bg-base-200"}>
                  <td className="px-4 py-2">{idx + 1}</td>
                  <td className="px-4 py-2">{student.name}</td>
                  <td className="px-4 py-2">{student.regNo}</td>
                  <td className="px-4 py-2">{student.efforts}</td>
                  <td className="px-4 py-2">{student.presentation}</td>
                  <td className="px-4 py-2">{student.assessment}</td>
                  <td className="px-4 py-2">{student.assignment}</td>
                  <td className="px-4 py-2 font-bold">{student.total}</td>
                  <td className="px-4 py-2">{student.attendancePercent}%</td>
                  <td className="px-4 py-2">
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
    </div>
  );
};

export default LeaderBoard;