import React, { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';

const LeaderBoard = () => {
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [attendance, setAttendance] = useState({});

  useEffect(() => {
    setMarks(JSON.parse(localStorage.getItem('marksRecords') || '{}'));
    setAttendance(JSON.parse(localStorage.getItem('attendanceRecords') || '{}'));
    // Get students from marks or attendance
    const allStudents = new Set([
      ...Object.keys(JSON.parse(localStorage.getItem('marksRecords') || '{}')),
      ...Object.values(JSON.parse(localStorage.getItem('attendanceRecords') || '{}')).flatMap(obj => Object.keys(obj))
    ]);
    setStudents(Array.from(allStudents));
  }, []);

  // Calculate attendance percentage
  const getAttendancePercent = (student) => {
    const attendanceData = Object.values(attendance);
    if (!attendanceData.length) return 0;
    let present = 0, total = 0;
    attendanceData.forEach(day => {
      if (student in day) {
        total++;
        if (day[student] === 'Present') present++;
      }
    });
    return total ? Math.round((present / total) * 100) : 0;
  };

  // Prepare leaderboard data
  const leaderboard = students.map(student => ({
    student,
    total: marks[student]?.Total || 0,
    attendance: getAttendancePercent(student)
  })).sort((a, b) =>
    b.total - a.total !== 0
      ? b.total - a.total
      : b.attendance - a.attendance
  );

  return (
    <div className="min-h-screen bg-base-200">
      <NavBar />
      <div className="flex flex-col items-center py-8 px-2">
        <h1 className="text-2xl font-bold mb-6 text-primary">Leaderboard</h1>
        <div className="overflow-x-auto w-full max-w-2xl">
          <table className="table w-full rounded-xl border border-base-200">
            <thead>
              <tr className="bg-base-200">
                <th className="px-4 py-2 text-left">Rank</th>
                <th className="px-4 py-2 text-left">Student</th>
                <th className="px-4 py-2 text-left">Total Marks</th>
                <th className="px-4 py-2 text-left">Attendance %</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, idx) => (
                <tr
                  key={entry.student}
                  className={idx % 2 === 0 ? "bg-base-100" : "bg-base-200 hover:bg-base-300"}
                >
                  <td className="px-4 py-2">{idx + 1}</td>
                  <td className="px-4 py-2 font-medium">{entry.student}</td>
                  <td className="px-4 py-2">{entry.total}</td>
                  <td className="px-4 py-2">
                    <span className={
                      entry.attendance < 25
                        ? 'text-error font-bold'
                        : 'text-success font-bold'
                    }>
                      {entry.attendance}%
                    </span>
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