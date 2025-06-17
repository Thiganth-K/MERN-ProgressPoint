import React, { useEffect, useState } from 'react';
import api from '../lib/axios';
import NavBar from '../components/NavBar';
import toast from 'react-hot-toast';

const ManageAdminsPage = () => {
  const [admins, setAdmins] = useState([]);
  const [newAdmin, setNewAdmin] = useState({ adminName: '', adminPassword: '' });
  const [studentList, setStudentList] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showStudents, setShowStudents] = useState(false);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await api.get('/superadmin/admins');
      setAdmins(res.data.admins);
    } catch (err) {
      toast.error('Failed to fetch admins');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const addAdmin = async (e) => {
    e.preventDefault();
    if (!newAdmin.adminName || !newAdmin.adminPassword) return;

    const students = studentList
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        const [regNo, name] = line.split(',').map(s => s.trim());
        return {
          regNo,
          name: name || regNo,
          marks: {
            efforts: 0,
            presentation: 0,
            assessment: 0,
            assignment: 0
          },
          attendance: [],
          attendancePercent: 0
        };
      });

    try {
      await api.post('/superadmin/admins', { ...newAdmin, students });
      toast.success('Admin added successfully!');
      setNewAdmin({ adminName: '', adminPassword: '' });
      setStudentList('');
      fetchAdmins();
    } catch (err) {
      toast.error('Failed to add admin');
    }
  };

  const removeAdmin = async (adminName) => {
    if (window.confirm(`Remove admin "${adminName}"?`)) {
      try {
        await api.delete(`/superadmin/admins/${adminName}`);
        toast.success('Admin removed successfully!');
        fetchAdmins();
      } catch (err) {
        toast.error('Failed to remove admin');
      }
    }
  };

  // Fetch and show students for a selected admin
  const handleViewStudents = async (adminName) => {
    setSelectedAdmin(adminName);
    setShowStudents(true);
    try {
      const res = await api.get(`/admin/${adminName}/students`);
      setSelectedStudents(res.data.students || []);
    } catch (err) {
      toast.error('Failed to fetch students');
      setSelectedStudents([]);
    }
  };

  const closeStudentsModal = () => {
    setShowStudents(false);
    setSelectedAdmin(null);
    setSelectedStudents([]);
  };

  // MoveStudentDropdown component
  function MoveStudentDropdown({ student, fromAdmin, admins, onMoved }) {
    const [toAdmin, setToAdmin] = useState('');
    const [moving, setMoving] = useState(false);

    const handleMove = async () => {
      if (!toAdmin) return;
      setMoving(true);
      try {
        await api.post('/superadmin/move-student', {
          fromAdmin,
          toAdmin,
          regNo: student.regNo
        });
        toast.success(`Moved ${student.name} to ${toAdmin}`);
        setToAdmin('');
        onMoved(fromAdmin); // Refresh students list for the current admin
      } catch {
        toast.error('Failed to move student');
      }
      setMoving(false);
    };

    return (
      <div className="flex items-center gap-1">
        <select
          className="select select-xs"
          value={toAdmin}
          onChange={e => setToAdmin(e.target.value)}
        >
          <option value="">Move to...</option>
          {admins
            .filter(a => a.adminName !== fromAdmin)
            .map(a => (
              <option key={a.adminName} value={a.adminName}>{a.adminName}</option>
            ))}
        </select>
        <button
          className="btn btn-xs btn-accent"
          disabled={!toAdmin || moving}
          onClick={handleMove}
        >
          Move
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <NavBar />
      <div className="flex flex-col items-center py-8 px-2">
        <h1 className="text-2xl font-bold mb-6 text-primary">Manage Admins</h1>
        <section className="bg-base-100 w-full max-w-md px-6 py-6 rounded-xl shadow-lg flex flex-col gap-6">
          <form onSubmit={addAdmin} className="flex flex-col gap-3">
            <h2 className="font-semibold text-lg mb-2">Add Admin</h2>
            <input
              type="text"
              placeholder="Admin Name"
              value={newAdmin.adminName}
              onChange={e => setNewAdmin({ ...newAdmin, adminName: e.target.value })}
              className="input input-bordered w-full"
              required
            />
            <input
              type="password"
              placeholder="Admin Password"
              value={newAdmin.adminPassword}
              onChange={e => setNewAdmin({ ...newAdmin, adminPassword: e.target.value })}
              className="input input-bordered w-full"
              required
            />
            <textarea
              placeholder={`Enter students, one per line: regno,studentname\nExample:\n21IT001,John Doe\n21IT002,Jane Smith`}
              value={studentList}
              onChange={e => setStudentList(e.target.value)}
              className="textarea textarea-bordered w-full"
              rows={5}
            />
            <button type="submit" className="btn btn-primary w-full">Add Admin</button>
          </form>
          <div>
            <h2 className="font-semibold text-lg mb-2">View Admins</h2>
            {loading ? (
              <div>Loading...</div>
            ) : (
              <ul className="divide-y divide-base-200">
                {admins.map(a => (
                  <li key={a.adminName} className="flex items-center justify-between py-2 gap-2">
                    <span>{a.adminName}</span>
                    <div className="flex gap-2">
                      <button
                        className="btn btn-xs btn-info"
                        onClick={() => handleViewStudents(a.adminName)}
                      >
                        View Students
                      </button>
                      <button
                        className="btn btn-xs btn-error"
                        onClick={() => removeAdmin(a.adminName)}
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
        {/* Students Modal */}
        {showStudents && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-base-100 rounded-xl shadow-2xl p-4 sm:p-6 w-[95vw] max-w-lg sm:max-w-2xl relative border border-base-300 max-h-[90vh] overflow-y-auto">
              <button
                className="absolute top-2 right-2 btn btn-sm btn-circle btn-ghost"
                onClick={closeStudentsModal}
                aria-label="Close"
              >✕</button>
              <h2 className="text-lg sm:text-xl font-bold mb-3 text-primary text-center">
                Students of {selectedAdmin}
              </h2>
              <div className="overflow-x-auto">
                <table className="table w-full text-xs sm:text-sm rounded-xl border border-base-200">
                  <thead>
                    <tr className="bg-base-200">
                      <th className="px-2 py-1 text-left">Reg No</th>
                      <th className="px-2 py-1 text-left">Name</th>
                      <th className="px-2 py-1 text-left">Efforts</th>
                      <th className="px-2 py-1 text-left">Presentation</th>
                      <th className="px-2 py-1 text-left">Assessment</th>
                      <th className="px-2 py-1 text-left">Assignment</th>
                      <th className="px-2 py-1 text-left">Attendance</th>
                      <th className="px-2 py-1 text-left">Move</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedStudents.length === 0 && (
                      <tr>
                        <td colSpan={8} className="text-center text-gray-500 py-4">No students found.</td>
                      </tr>
                    )}
                    {selectedStudents.map(student => (
                      <tr key={student.regNo}>
                        <td className="px-2 py-1">{student.regNo}</td>
                        <td className="px-2 py-1">{student.name}</td>
                        <td className="px-2 py-1">{student.marks?.efforts ?? 0}</td>
                        <td className="px-2 py-1">{student.marks?.presentation ?? 0}</td>
                        <td className="px-2 py-1">{student.marks?.assessment ?? 0}</td>
                        <td className="px-2 py-1">{student.marks?.assignment ?? 0}</td>
                        <td className="px-2 py-1">
                          {student.attendance && student.attendance.length > 0
                            ? (
                              <div className="flex flex-col gap-1 max-h-16 overflow-y-auto">
                                {student.attendance.map((a, idx) => (
                                  <div key={idx} className="whitespace-nowrap">
                                    {a.date ? new Date(a.date).toLocaleDateString() : ''} - {a.status}
                                  </div>
                                ))}
                              </div>
                            )
                            : <span className="text-gray-400">No records</span>
                          }
                        </td>
                        <td className="px-2 py-1">
                          <MoveStudentDropdown
                            student={student}
                            fromAdmin={selectedAdmin}
                            admins={admins}
                            onMoved={handleViewStudents}
                          />
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

export default ManageAdminsPage;