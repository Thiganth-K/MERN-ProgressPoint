import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import api from '../lib/axios';
import toast from 'react-hot-toast';

// Minimal SuperAdmin NavBar and Footer
const SuperAdminNavBar = ({ onLogout }) => (
  <nav className="w-full h-16 flex items-center justify-between px-4 sm:px-6 bg-base-100 shadow z-50">
    <span className="text-lg sm:text-xl font-extrabold text-primary tracking-tight">ProgressPoint</span>
    <button
      className="btn btn-error btn-sm font-semibold flex items-center"
      onClick={onLogout}
    >
      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
      </svg>
      Logout
    </button>
  </nav>
);

const SuperAdminFooter = () => (
  <footer className="w-full h-14 flex items-center justify-center bg-base-100 shadow-inner mt-8">
    <span className="text-xs sm:text-sm text-gray-500 font-semibold">ProgressPoint &copy; {new Date().getFullYear()}</span>
  </footer>
);

const icons = {
  batch: (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18" />
    </svg>
  ),
  admin: (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.485 0 4.797.657 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  logs: (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 17v-2a4 4 0 014-4h2a4 4 0 014 4v2" />
    </svg>
  ),
  logout: (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
    </svg>
  ),
  add: (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  ),
  edit: (
    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2l-6 6m-2 2h6" />
    </svg>
  ),
  remove: (
    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  view: (
    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
};

const SuperAdminPage = () => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [logs, setLogs] = useState([]);
  const [studentsInBatch, setStudentsInBatch] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [newBatchName, setNewBatchName] = useState('');
  const [newBatchStudents, setNewBatchStudents] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [editAdminName, setEditAdminName] = useState('');
  const [editAdminPassword, setEditAdminPassword] = useState('');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showRemoveBatchModal, setShowRemoveBatchModal] = useState(false);
  const [batchToRemove, setBatchToRemove] = useState(null);
  const [profileStudent, setProfileStudent] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [placementDone, setPlacementDone] = useState(false);
  const [placementDetails, setPlacementDetails] = useState({ placedCompany: '', package: '', placementType: '' });
  const [showPlacementDoneModal, setShowPlacementDoneModal] = useState(false);
  const [placementDoneStudents, setPlacementDoneStudents] = useState([]);

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line
  }, []);

  const fetchAll = async () => {
    const [batchRes, adminRes] = await Promise.all([
      api.get('/batches'),
      api.get('/superadmin/admins')
    ]);
    setBatches(
      (batchRes.data.batches || []).sort((a, b) =>
        a.batchName.localeCompare(b.batchName)
      )
    );
    setAdmins(adminRes.data.admins || []);
  };

  const handleSuperAdminLogout = () => {
    localStorage.removeItem('adminName');
    localStorage.removeItem('role');
    localStorage.removeItem('selectedBatch');
    navigate('/');
  };

  const handleAddBatch = async (e) => {
    e.preventDefault();
    if (!newBatchName.trim()) {
      toast.error('Batch name required');
      return;
    }
    const students = newBatchStudents
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        const [regNo, name] = line.split(',').map(s => s.trim());
        return {
          regNo,
          name: name || regNo,
          marks: { efforts: 0, presentation: 0, assessment: 0, assignment: 0 },
          marksLastUpdated: null,
          attendance: [],
          attendancePercent: 0
        };
      });
    try {
      await api.post('/batches', { batchName: newBatchName, students });
      toast.success('Batch added!');
      setNewBatchName('');
      setNewBatchStudents('');
      fetchAll();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error === "Batch name already exists") {
        toast.error('Batch name already exists!');
      } else {
        toast.error('Failed to add batch');
      }
    }
  };

  const handleRemoveBatch = (batchName) => {
    setBatchToRemove(batchName);
    setShowRemoveBatchModal(true);
  };

  const confirmRemoveBatch = async () => {
    if (!batchToRemove) return;
    try {
      await api.delete(`/batches/${batchToRemove}`);
      toast.success('Batch removed!');
      fetchAll();
    } catch {
      toast.error('Failed to remove batch');
    }
    setShowRemoveBatchModal(false);
    setBatchToRemove(null);
  };

  const cancelRemoveBatch = () => {
    setShowRemoveBatchModal(false);
    setBatchToRemove(null);
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (!newAdminName.trim() || !newAdminPassword.trim()) {
      toast.error('Admin name and password required');
      return;
    }
    try {
      await api.post('/superadmin/admins', { adminName: newAdminName, adminPassword: newAdminPassword });
      toast.success('Admin added!');
      setNewAdminName('');
      setNewAdminPassword('');
      fetchAll();
    } catch {
      toast.error('Failed to add admin');
    }
  };

  const handleShowAdmin = (admin) => {
    setSelectedAdmin(admin);
    setEditAdminName(admin.adminName);
    setEditAdminPassword(admin.adminPassword || '');
    setShowAdminModal(true);
  };

  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/superadmin/admins/${selectedAdmin._id}`, {
        adminName: editAdminName,
        adminPassword: editAdminPassword
      });
      toast.success('Admin updated!');
      setShowAdminModal(false);
      fetchAll();
    } catch {
      toast.error('Failed to update admin');
    }
  };

  const handleRemoveAdmin = async (adminId) => {
    if (!window.confirm('Are you sure you want to remove this admin?')) return;
    try {
      await api.delete(`/superadmin/admins/${adminId}`);
      toast.success('Admin removed!');
      setShowAdminModal(false);
      fetchAll();
    } catch {
      toast.error('Failed to remove admin');
    }
  };

  const handleViewStudents = async (batchName) => {
    setSelectedBatch(batchName);
    const res = await api.get(`/batches/${batchName}/students`);
    setStudentsInBatch(res.data.students || []);
    setShowStudentsModal(true);
  };

  const handleMoveStudent = async (regNo, fromBatch, toBatch) => {
    if (!toBatch || toBatch === fromBatch) {
      toast.error('Select a different batch');
      return;
    }
    try {
      await api.post(`/superadmin/move-student`, { regNo, fromBatch, toBatch });
      toast.success('Student moved!');
      handleViewStudents(fromBatch);
      fetchAll();
    } catch {
      toast.error('Failed to move student');
    }
  };

  const handleRemoveStudent = async (regNo, batchName) => {
    if (!window.confirm(`Remove student ${regNo} from ${batchName}?`)) return;
    try {
      await api.delete(`/batches/${batchName}/student/${regNo}`);
      toast.success('Student removed!');
      handleViewStudents(batchName);
      fetchAll();
    } catch {
      toast.error('Failed to remove student');
    }
  };

  const handleViewLogs = async () => {
    const res = await api.get('/superadmin/logs');
    setLogs(res.data.logs || []);
    setShowLogsModal(true);
  };

  const handleClearAllLogs = async () => {
    if (!window.confirm('Are you sure you want to clear all admin logs?')) return;
    try {
      await api.delete('/superadmin/logs');
      toast.success('All logs cleared!');
      setLogs([]);
    } catch {
      toast.error('Failed to clear logs');
    }
  };

  const fetchPlacementDone = async () => {
    const res = await api.get('/placement-done');
    setPlacementDoneStudents(res.data.students || []);
  };

  return (
    <div className="min-h-screen flex flex-col bg-base-200">
      <SuperAdminNavBar onLogout={handleSuperAdminLogout} />
      <main className="flex-1 flex flex-col items-center px-2 py-4 sm:py-8">
        <div className="w-full max-w-4xl bg-base-100 rounded-2xl shadow-2xl px-2 sm:px-4 md:px-8 py-4 sm:py-8 flex flex-col items-center">
          {/* Add Placement Done button near the top of the dashboard */}
          <div className="w-full flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary tracking-tight flex items-center gap-2">
              {icons.admin} Super Admin Dashboard
            </h1>
            {/* Placement Done button now navigates to the new page */}
            <button
              className="btn btn-success font-semibold flex items-center px-4 py-2 text-base rounded-lg shadow hover:scale-105 transition-transform"
              onClick={() => navigate("/placement-done")}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Placement Done Students
            </button>
          </div>

          {/* Add Batch */}
          <section className="w-full mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-secondary flex items-center mb-2">
              {icons.batch} Add New Batch
            </h2>
            <form onSubmit={handleAddBatch} className="flex flex-col gap-3 bg-base-200 rounded-xl p-3 sm:p-4 shadow">
              <input
                type="text"
                placeholder="Batch Name"
                value={newBatchName}
                onChange={e => setNewBatchName(e.target.value)}
                className="input input-bordered"
              />
              <textarea
                placeholder={`Enter students, one per line: regno,studentname\nExample:\n21IT001,John Doe\n21IT002,Jane Smith`}
                value={newBatchStudents}
                onChange={e => setNewBatchStudents(e.target.value)}
                className="textarea textarea-bordered"
                rows={3}
              />
              <button type="submit" className="btn btn-primary font-semibold flex items-center w-full sm:w-fit self-end">
                {icons.add} Add Batch
              </button>
            </form>
          </section>

          {/* Batches Table */}
          <section className="w-full mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-secondary flex items-center mb-2">
              {icons.batch} Batches
            </h2>
            <div className="overflow-x-auto rounded-xl shadow">
              <table className="table w-full text-xs sm:text-sm md:text-base">
                <thead>
                  <tr>
                    <th className="text-left">Batch Name</th>
                    <th className="text-left">Students</th>
                    <th className="text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center text-gray-400 py-6">No batches added yet.</td>
                    </tr>
                  ) : (
                    batches.map(batch => (
                      <tr key={batch.batchName}>
                        <td className="font-semibold">{batch.batchName}</td>
                        <td>{batch.students?.length || 0}</td>
                        <td className="flex flex-col sm:flex-row gap-2 py-2">
                          <button
                            className="btn btn-info btn-xs"
                            onClick={() => handleViewStudents(batch.batchName)}
                          >
                            {icons.view} View
                          </button>
                          <button
                            className="btn btn-error btn-xs"
                            onClick={() => handleRemoveBatch(batch.batchName)}
                          >
                            {icons.remove} Remove
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Add Admin */}
          <section className="w-full mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-secondary flex items-center mb-2">
              {icons.admin} Add New Admin
            </h2>
            <form onSubmit={handleAddAdmin} className="flex flex-col sm:flex-row gap-3 bg-base-200 rounded-xl p-3 sm:p-4 shadow">
              <input
                type="text"
                placeholder="Admin Name"
                value={newAdminName}
                onChange={e => setNewAdminName(e.target.value)}
                className="input input-bordered flex-1"
              />
              <input
                type="password"
                placeholder="Admin Password"
                value={newAdminPassword}
                onChange={e => setNewAdminPassword(e.target.value)}
                className="input input-bordered flex-1"
                autoComplete="new-password"
              />
              <button type="submit" className="btn btn-success font-semibold flex items-center w-full sm:w-fit">
                {icons.add} Add Admin
              </button>
            </form>
          </section>

          {/* Admins List */}
          <section className="w-full mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-secondary flex items-center mb-2">
              {icons.admin} Admins
            </h2>
            <div className="bg-base-200 rounded-xl shadow p-3 sm:p-4">
              {admins.length === 0 ? (
                <div className="text-center text-gray-400 py-6">No admins available.</div>
              ) : (
                <ul className="divide-y divide-base-300">
                  {admins.map(a => (
                    <li
                      key={a._id}
                      className="py-2 flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-1"
                    >
                      <div className="flex-1 flex items-center gap-2">
                        {icons.admin}
                        <span className="font-semibold">{a.adminName}</span>
                        <span className="ml-2 text-gray-500 font-mono">
                          {a.adminPassword ? '*'.repeat(a.adminPassword.length) : ''}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-1 sm:mt-0">
                        <button
                          className="btn btn-xs btn-info"
                          onClick={() => handleShowAdmin(a)}
                          title="Edit"
                        >
                          {icons.edit} Edit
                        </button>
                        <button
                          className="btn btn-xs btn-error"
                          onClick={() => handleRemoveAdmin(a._id)}
                          title="Remove"
                        >
                          {icons.remove} Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* Admin Logs */}
          <section className="w-full mb-2">
            <button className="btn btn-warning font-semibold flex items-center w-full sm:w-fit" onClick={handleViewLogs}>
              {icons.logs} View Admin Logs
            </button>
          </section>
        </div>

        {/* Students Modal */}
        {showStudentsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-base-100 rounded-2xl shadow-2xl w-[98vw] max-w-3xl max-h-[90vh] p-2 sm:p-6 relative flex flex-col">
              <button
                className="absolute top-3 right-3 btn btn-circle btn-sm btn-ghost"
                onClick={() => setShowStudentsModal(false)}
                aria-label="Close"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="flex items-center gap-3 mb-4 mt-2">
                <span className="inline-flex items-center justify-center bg-primary rounded-full w-9 h-9">
                  {icons.view}
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-primary tracking-tight">
                  Students in <span className="text-accent">{selectedBatch}</span>
                </h3>
              </div>
              {/* Export Buttons */}
              <div className="mb-4 flex flex-col sm:flex-row gap-2 sm:gap-4 justify-end items-stretch sm:items-center">
                <button
                  className="btn btn-accent font-semibold text-base flex-1 sm:flex-none"
                  onClick={() => window.open(`/api/batches/${encodeURIComponent(selectedBatch)}/export`, "_blank")}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Export Students as Excel
                </button>
                <button
                  className="btn btn-secondary font-semibold text-base flex-1 sm:flex-none"
                  onClick={() => window.open(`/api/batches/${encodeURIComponent(selectedBatch)}/export-attendance`, "_blank")}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Export Attendance as Excel
                </button>
              </div>
              {/* Responsive Table Container */}
              <div className="overflow-x-auto flex-1 w-full">
                <table className="min-w-[600px] w-full text-xs sm:text-sm md:text-base">
                  <thead>
                    <tr className="bg-base-200 text-xs sm:text-sm uppercase text-gray-600">
                      <th className="px-2 py-2 text-left font-bold whitespace-nowrap">S.No</th>
                      <th className="px-2 py-2 text-left font-bold whitespace-nowrap">Reg No</th>
                      <th className="px-2 py-2 text-left font-bold whitespace-nowrap">Name</th>
                      <th className="px-2 py-2 text-center font-bold whitespace-nowrap">Profile</th>
                      <th className="px-2 py-2 text-center font-bold whitespace-nowrap">Attendance</th>
                      <th className="px-2 py-2 text-center font-bold whitespace-nowrap">Move</th>
                      <th className="px-2 py-2 text-center font-bold whitespace-nowrap">Remove</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentsInBatch.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-6 text-gray-400 font-semibold">
                          <span className="inline-flex items-center gap-2">
                            {icons.add}
                            No students in this batch.
                          </span>
                        </td>
                      </tr>
                    ) : (
                      studentsInBatch.map((student, idx) => (
                        <tr key={student.regNo} className="hover:bg-base-200 transition">
                          <td className="px-2 py-2 text-xs sm:text-sm text-gray-500 whitespace-nowrap">{idx + 1}</td>
                          <td className="px-2 py-2 font-mono text-xs sm:text-sm whitespace-nowrap">{student.regNo}</td>
                          <td className="px-2 py-2 text-xs sm:text-sm whitespace-nowrap">{student.name}</td>
                          <td className="px-2 py-2 text-center whitespace-nowrap">
                            <button
                              className="btn btn-secondary btn-sm w-24 flex items-center gap-1 justify-center"
                              onClick={() => { setProfileStudent(student); setShowProfileModal(true); }}
                              title="View Profile"
                            >
                              {icons.view} Profile
                            </button>
                          </td>
                          <td className="px-2 py-2 text-center whitespace-nowrap">
                            <span className="inline-flex items-center gap-1">
                              <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                              {student.attendancePercent ?? 0}%
                            </span>
                          </td>
                          <td className="px-2 py-2 text-center whitespace-nowrap">
                            <select
                              className="select select-xs w-[90px]"
                              value=""
                              onChange={e => handleMoveStudent(student.regNo, selectedBatch, e.target.value)}
                            >
                              <option value="">Batch</option>
                              {batches
                                .filter(b => b.batchName !== selectedBatch)
                                .map(b => (
                                  <option key={b.batchName} value={b.batchName}>{b.batchName}</option>
                                ))}
                            </select>
                          </td>
                          <td className="px-2 py-2 text-center whitespace-nowrap">
                            <button
                              className="btn btn-error btn-sm w-24 flex items-center gap-1 justify-center"
                              onClick={() => handleRemoveStudent(student.regNo, selectedBatch)}
                              title="Remove Student"
                            >
                               Remove
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Logs Modal */}
        {showLogsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-base-100 rounded-xl shadow-2xl p-4 sm:p-6 w-full max-w-2xl relative">
              <button className="absolute top-2 right-2 btn btn-xs btn-ghost" onClick={() => setShowLogsModal(false)}>
                ✕
              </button>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                <h3 className="text-lg sm:text-2xl font-bold text-primary flex items-center gap-2">
                  {icons.logs} Admin Logs
                </h3>
                <button
                  className="btn btn-xs btn-error font-semibold flex items-center gap-1"
                  onClick={handleClearAllLogs}
                >
                  {icons.remove} Clear All
                </button>
              </div>
              <div className="overflow-x-auto max-h-[400px]">
                <table className="table w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-base-200 text-primary text-xs sm:text-base">
                      <th className="px-4 py-2 text-left font-semibold">Admin Name</th>
                      <th className="px-4 py-2 text-left font-semibold">Action</th>
                      <th className="px-4 py-2 text-left font-semibold">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.length === 0 && (
                      <tr>
                        <td colSpan={3} className="text-center py-8 text-gray-400 font-semibold">
                          No logs found.
                        </td>
                      </tr>
                    )}
                    {logs
                      .flatMap((log) =>
                        (log.logs && log.logs.length > 0)
                          ? log.logs.map((l) => ({
                              adminName: log.adminName,
                              ...l,
                            }))
                          : [{
                              adminName: log.adminName,
                              type: 'No actions',
                              timestamp: null,
                            }]
                      )
                      .sort((a, b) => {
                        if (a.timestamp && b.timestamp) {
                          return new Date(b.timestamp) - new Date(a.timestamp);
                        }
                        if (a.timestamp) return -1;
                        if (b.timestamp) return 1;
                        return 0;
                      })
                      .map((entry, idx) => (
                        <tr key={idx}>
                          <td>{entry.adminName}</td>
                          <td>{entry.type === 'No actions' ? <span className="text-gray-400">No actions</span> : (entry.type.charAt(0).toUpperCase() + entry.type.slice(1))}</td>
                          <td>{entry.timestamp ? new Date(entry.timestamp).toLocaleString() : '-'}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Admin Edit Modal */}
        {showAdminModal && selectedAdmin && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-base-100 rounded-xl shadow-2xl p-4 sm:p-6 w-full max-w-md relative">
              <button
                className="absolute top-2 right-2 btn btn-xs btn-ghost"
                onClick={() => setShowAdminModal(false)}
                aria-label="Close"
              >
                ✕
              </button>
              <h3 className="text-base sm:text-lg font-bold mb-4 text-primary flex items-center gap-2">
                {icons.admin} Edit Admin
              </h3>
              <form onSubmit={handleUpdateAdmin} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold mb-1">Admin Name</label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={editAdminName}
                    onChange={e => setEditAdminName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold mb-1">Admin Password</label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={editAdminPassword}
                    onChange={e => setEditAdminPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button type="submit" className="btn btn-primary font-semibold flex items-center gap-1 flex-1">
                    {icons.edit} Save Changes
                  </button>
                  <button
                    type="button"
                    className="btn btn-error font-semibold flex items-center gap-1 flex-1"
                    onClick={() => handleRemoveAdmin(selectedAdmin._id)}
                  >
                    {icons.remove} Remove Admin
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Remove Batch Confirmation Modal */}
        {showRemoveBatchModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-base-100 rounded-2xl shadow-2xl w-[90vw] max-w-sm p-6 flex flex-col items-center">
              <h3 className="text-xl font-bold text-error mb-4">Confirm Batch Removal</h3>
              <p className="mb-6 text-center">Are you sure you want to remove batch <span className="font-semibold text-accent">{batchToRemove}</span>? This action cannot be undone.</p>
              <div className="flex gap-4">
                <button className="btn btn-error font-semibold" onClick={confirmRemoveBatch}>Yes, Remove</button>
                <button className="btn btn-ghost font-semibold" onClick={cancelRemoveBatch}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Student Profile Modal */}
        {showProfileModal && profileStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-base-100 rounded-2xl shadow-2xl w-[95vw] max-w-md p-6 relative flex flex-col items-center">
              <button
                className="absolute top-3 right-3 btn btn-circle btn-sm btn-ghost"
                onClick={() => { setShowProfileModal(false); setPlacementDone(false); setPlacementDetails({ placedCompany: '', package: '', placementType: '' }); }}
                aria-label="Close"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="flex flex-col items-center gap-2 mb-4">
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-bold mb-2">
                  {profileStudent.name?.[0] || '?'}
                </div>
                <h2 className="text-xl font-extrabold text-primary">{profileStudent.name || ''}</h2>
                <div className="text-sm text-gray-500 font-mono">Reg No: {profileStudent.regNo || ''}</div>
                <div className="text-sm text-gray-500">Department: {profileStudent.department || ''}</div>
              </div>
              <div className="w-full flex flex-col gap-2 mb-2">
                <div className="flex justify-between">
                  <span className="font-semibold">Attendance %:</span>
                  <span>{profileStudent.attendancePercent ?? 0}%</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-semibold">Marks:</span>
                  <div className="ml-2 grid grid-cols-2 gap-x-4 gap-y-1">
                    <span>Efforts:</span><span>{profileStudent.marks?.efforts ?? 0}</span>
                    <span>Presentation:</span><span>{profileStudent.marks?.presentation ?? 0}</span>
                    <span>Assessment:</span><span>{profileStudent.marks?.assessment ?? 0}</span>
                    <span>Assignment:</span><span>{profileStudent.marks?.assignment ?? 0}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 mt-2">
                  <span className="font-semibold">Mail Details:</span>
                  <div className="ml-2">
                    <div>Personal: <span className="font-mono">{profileStudent.personalEmail || '-'}</span></div>
                    <div>College: <span className="font-mono">{profileStudent.collegeEmail || '-'}</span></div>
                  </div>
                </div>
              </div>
              {/* Placement Done Checkbox and Form */}
              <div className="w-full mt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="checkbox checkbox-success" checked={placementDone} onChange={e => setPlacementDone(e.target.checked)} />
                  <span className="font-semibold">Placement Done</span>
                </label>
                {placementDone && (
                  <form className="flex flex-col gap-2 mt-3" onSubmit={async e => {
                    e.preventDefault();
                    if (!placementDetails.placedCompany || !placementDetails.package || !placementDetails.placementType) {
                      toast.error('Please fill all placement details');
                      return;
                    }
                    try {
                      await api.post('/placement-done', {
                        regNo: profileStudent.regNo,
                        batchName: selectedBatch,
                        placedCompany: placementDetails.placedCompany,
                        package: placementDetails.package,
                        placementType: placementDetails.placementType
                      });
                      toast.success('Student moved to Placement Done group!');
                      setShowProfileModal(false);
                      setPlacementDone(false);
                      setPlacementDetails({ placedCompany: '', package: '', placementType: '' });
                      fetchAll();
                      fetchPlacementDone();
                      handleViewStudents(selectedBatch);
                    } catch (err) {
                      console.error('Failed to confirm placement:', err);
                      const errorMessage = err.response?.data?.error || 'Failed to confirm placement. The student may already be in the placement list.';
                      toast.error(errorMessage);
                    }
                  }}>
                    <input
                      type="text"
                      className="input input-bordered w-full"
                      placeholder="Placed Company"
                      value={placementDetails.placedCompany}
                      onChange={e => setPlacementDetails({ ...placementDetails, placedCompany: e.target.value })}
                      required
                    />
                    <input
                      type="text"
                      className="input input-bordered w-full"
                      placeholder="Package (e.g. 6 LPA)"
                      value={placementDetails.package}
                      onChange={e => setPlacementDetails({ ...placementDetails, package: e.target.value })}
                      required
                    />
                    <select
                      className="select select-bordered w-full max-w-xs"
                      value={placementDetails.placementType}
                      onChange={e => setPlacementDetails({ ...placementDetails, placementType: e.target.value })}
                      required
                    >
                      <option value="">Select Placement Type</option>
                      <option value="internship">Internship</option>
                      <option value="internship+work">Internship + Work</option>
                      <option value="work">Work</option>
                    </select>
                    <button type="submit" className="btn btn-success w-full mt-2">Confirm Placement</button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Placement Done Group Modal (improved) */}
        {showPlacementDoneModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-base-100 rounded-2xl shadow-2xl w-[98vw] max-w-5xl max-h-[90vh] p-4 sm:p-8 relative flex flex-col">
              <button
                className="absolute top-3 right-3 btn btn-circle btn-sm btn-ghost"
                onClick={() => setShowPlacementDoneModal(false)}
                aria-label="Close"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-primary mb-4 text-center tracking-tight">Placement Done Students</h2>
              <div className="overflow-x-auto flex-1 w-full">
                <table className="min-w-[900px] w-full text-xs sm:text-sm md:text-base border-separate border-spacing-y-2">
                  <thead>
                    <tr className="bg-base-200 text-xs sm:text-sm uppercase text-gray-600">
                      <th className="px-2 py-2 text-left font-bold whitespace-nowrap">S.No</th>
                      <th className="px-2 py-2 text-left font-bold whitespace-nowrap">Reg No</th>
                      <th className="px-2 py-2 text-left font-bold whitespace-nowrap">Name</th>
                      <th className="px-2 py-2 text-left font-bold whitespace-nowrap">Department</th>
                      <th className="px-2 py-2 text-left font-bold whitespace-nowrap">Company</th>
                      <th className="px-2 py-2 text-left font-bold whitespace-nowrap">Package</th>
                      <th className="px-2 py-2 text-left font-bold whitespace-nowrap">Type</th>
                      <th className="px-2 py-2 text-left font-bold whitespace-nowrap">Batch</th>
                      <th className="px-2 py-2 text-left font-bold whitespace-nowrap">Attendance %</th>
                      <th className="px-2 py-2 text-left font-bold whitespace-nowrap">Efforts</th>
                      <th className="px-2 py-2 text-left font-bold whitespace-nowrap">Presentation</th>
                      <th className="px-2 py-2 text-left font-bold whitespace-nowrap">Assessment</th>
                      <th className="px-2 py-2 text-left font-bold whitespace-nowrap">Assignment</th>
                      <th className="px-2 py-2 text-left font-bold whitespace-nowrap">Personal Email</th>
                      <th className="px-2 py-2 text-left font-bold whitespace-nowrap">College Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {placementDoneStudents.length === 0 ? (
                      <tr><td colSpan={15} className="text-center py-6 text-gray-400 font-semibold">No placement done students.</td></tr>
                    ) : (
                      placementDoneStudents.map((s, idx) => (
                        <tr key={s._id} className="hover:bg-base-200 transition rounded-xl">
                          <td className="px-2 py-2 font-semibold text-primary">{idx + 1}</td>
                          <td className="px-2 py-2 font-mono">{s.regNo}</td>
                          <td className="px-2 py-2 font-semibold">{s.name}</td>
                          <td className="px-2 py-2">{s.department}</td>
                          <td className="px-2 py-2">{s.placedCompany}</td>
                          <td className="px-2 py-2">{s.package}</td>
                          <td className="px-2 py-2 capitalize">{s.placementType.replace("+", " + ")}</td>
                          <td className="px-2 py-2">{s.originalBatch}</td>
                          <td className="px-2 py-2 text-center font-bold text-success">{s.attendancePercent ?? 0}%</td>
                          <td className="px-2 py-2">{s.marks?.efforts ?? 0}</td>
                          <td className="px-2 py-2">{s.marks?.presentation ?? 0}</td>
                          <td className="px-2 py-2">{s.marks?.assessment ?? 0}</td>
                          <td className="px-2 py-2">{s.marks?.assignment ?? 0}</td>
                          <td className="px-2 py-2 font-mono text-xs">{s.personalEmail}</td>
                          <td className="px-2 py-2 font-mono text-xs">{s.collegeEmail}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
      <SuperAdminFooter />
    </div>
  );
};

export default SuperAdminPage;