import React, { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';

const AdminPage = () => {
  const [students, setStudents] = useState([]);
  const adminName = localStorage.getItem('adminName');

  useEffect(() => {
    if (adminName) {
      fetch(`http://localhost:5001/api/admin/${adminName}/students`)
        .then(res => res.json())
        .then(data => setStudents(data.students || []));
    }
  }, [adminName]);

  return (
    <div>
      <NavBar />
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-base-200 px-4 py-8">
        <h1 className="mb-8 text-4xl font-bold text-primary text-center">Admin Dashboard</h1>
        <section className="bg-base-100 w-full max-w-3xl px-8 py-8 rounded-2xl shadow-xl">
          <h2 className="mb-6 text-2xl font-semibold text-secondary text-center">Welcome to the Admin Dashboard</h2>
          <p className="text-lg text-gray-700 mb-4">
            Here you can manage your application settings, user accounts, and more.
          </p>
          <h3 className="font-bold mb-4 text-lg">Your Students:</h3>
          <div className="overflow-x-auto">
            <table className="table w-full text-base rounded-xl border border-base-200">
              <thead>
                <tr>
                  <th className="text-left px-4 py-2">S.no</th>
                  <th className="text-left px-4 py-2">Student Name</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-base-100" : "bg-base-200"}>
                    <td className="px-4 py-2">{idx + 1}</td>
                    <td className="px-4 py-2">{student}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminPage;