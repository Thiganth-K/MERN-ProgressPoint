import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import AdminLogsModal from '../components/AdminLogsModal';
import BackupManager from '../components/BackupManager';
import StudentEditModal from '../components/StudentEditModal';
Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

// Minimal SuperAdmin NavBar and Footer
const SuperAdminNavBar = ({ onLogout, onViewPlacementDone }) => (
  <nav className="w-full bg-base-100 shadow z-50">
    {/* Title Bar */}
    <div className="flex items-center justify-center px-4 sm:px-6 py-3">
      <span className="text-lg sm:text-xl font-extrabold text-primary tracking-tight">ProgressPoint</span>
    </div>
    
    {/* Mobile Action Buttons */}
    <div className="flex items-center justify-center gap-2 px-4 pb-3 sm:hidden">
      <button
        className="btn btn-error btn-xs font-semibold flex items-center gap-1 flex-1"
        onClick={onLogout}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
        </svg>
        <span className="text-xs">Logout</span>
      </button>
    </div>

    {/* Desktop Action Buttons */}
    <div className="hidden sm:flex items-center justify-end gap-2 px-4 sm:px-6 pb-3">
      <button
        className="btn btn-error btn-sm font-semibold flex items-center"
        onClick={onLogout}
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
        </svg>
        Logout
      </button>
    </div>
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
  time: (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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
  const [newBatchYear, setNewBatchYear] = useState('');
  const [newBatchStudents, setNewBatchStudents] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [editAdminName, setEditAdminName] = useState('');
  const [editAdminPassword, setEditAdminPassword] = useState('');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showRemoveBatchModal, setShowRemoveBatchModal] = useState(false);
  const [batchToRemove, setBatchToRemove] = useState(null);
  const [showEditBatchModal, setShowEditBatchModal] = useState(false);
  const [batchToEdit, setBatchToEdit] = useState(null);
  const [showBackupManager, setShowBackupManager] = useState(false);
  const [editBatchName, setEditBatchName] = useState('');
  const [editBatchYear, setEditBatchYear] = useState('');
  const [profileStudent, setProfileStudent] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [placementDone, setPlacementDone] = useState(false);
  const [placementDetails, setPlacementDetails] = useState({ placedCompany: '', package: '', placementType: '' });
  const [showPlacementDoneModal, setShowPlacementDoneModal] = useState(false);
  const [placementDoneStudents, setPlacementDoneStudents] = useState([]);
  const [batchAverages, setBatchAverages] = useState([]);
  const [attendanceBarData, setAttendanceBarData] = useState(null);
  const [attendancePieData, setAttendancePieData] = useState(null);
  const [placementDoneBatchStats, setPlacementDoneBatchStats] = useState({});
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showAddBatch, setShowAddBatch] = useState(false);
  const [showBatches, setShowBatches] = useState(false);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [showViewAdmin, setShowViewAdmin] = useState(false);
  const [showTimeRestrictions, setShowTimeRestrictions] = useState(false);
  const [showDepartments, setShowDepartments] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [departmentStudents, setDepartmentStudents] = useState([]);
  const [showDepartmentStudentsModal, setShowDepartmentStudentsModal] = useState(false);
  const [departmentStats, setDepartmentStats] = useState([]);
  const [studentToEdit, setStudentToEdit] = useState(null);
  const [showEditStudentModal, setShowEditStudentModal] = useState(false);
  const [timeRestrictions, setTimeRestrictions] = useState({
    attendance: {
      isEnabled: false,
      startTime: '09:00',
      endTime: '17:00',
      allowedDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      allowWeekends: true
    },
    marks: {
      isEnabled: false,
      startTime: '09:00',
      endTime: '17:00', 
      allowedDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      allowWeekends: true
    }
  });
  // Added: State for selected year
  const [selectedYear, setSelectedYear] = useState(null);

  // Extract available years from batches
  const years = Array.from(new Set(batches.map(b => b.year))).sort();

  // Set default selected year when batches load
  useEffect(() => {
    if (years.length > 0 && !selectedYear) setSelectedYear(years[0]);
  }, [years, selectedYear]);

  useEffect(() => {
    fetchAll();
    fetchAttendanceAverages();
    fetchBatchAverages();
    fetchPlacementDoneBatchStats(); // <-- Add this
    fetchDepartments();
    fetchDepartmentStats();
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
    fetchTimeRestrictions();
  };

  // Fetch time restrictions
  const fetchTimeRestrictions = async () => {
    try {
      const res = await api.get('/time-restrictions');
      const restrictions = res.data.restrictions || [];
      
      const formattedRestrictions = {
        attendance: {
          isEnabled: false,
          startTime: '09:00',
          endTime: '17:00',
          allowedDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          allowWeekends: true
        },
        marks: {
          isEnabled: false,
          startTime: '09:00',
          endTime: '17:00',
          allowedDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          allowWeekends: true
        }
      };

      restrictions.forEach(restriction => {
        if (formattedRestrictions[restriction.type]) {
          formattedRestrictions[restriction.type] = {
            isEnabled: restriction.isEnabled,
            startTime: restriction.startTime,
            endTime: restriction.endTime,
            allowedDays: restriction.allowedDays || [],
            allowWeekends: restriction.allowWeekends
          };
        }
      });

      setTimeRestrictions(formattedRestrictions);
    } catch (error) {
      console.error('Failed to fetch time restrictions:', error);
    }
  };

  // Fetch batch averages for marks charts
  const fetchBatchAverages = async () => {
    try {
      const res = await api.get('/batch-averages');
      setBatchAverages(res.data || []);
    } catch {
      toast.error('Failed to fetch batch averages');
    }
  };

  // Fetch batch-wise attendance averages
  const fetchAttendanceAverages = async () => {
    const res = await api.get('/batch-averages');
    const batches = res.data || [];
    // Prepare attendance data for charts
    const labels = batches.map(b => b.batchName);
    const attendanceValues = batches.map(b => b.attendancePercent ?? 0);

    setAttendanceBarData({
      labels,
      datasets: [
        {
          label: 'Average Attendance (%)',
          data: attendanceValues,
          backgroundColor: 'rgba(34,197,94,0.7)',
        },
      ],
    });

    setAttendancePieData({
      labels,
      datasets: [
        {
          label: 'Attendance',
          data: attendanceValues,
          backgroundColor: [
            '#34d399', '#60a5fa', '#fbbf24', '#f87171', '#a78bfa', '#f472b6', '#38bdf8'
          ],
        },
      ],
    });
  };

  // Fetch Placement Done batch stats
  const fetchPlacementDoneBatchStats = async () => {
    try {
      const res = await api.get('/placement-done');
      const students = res.data.students || [];
      // Count students per originalBatch
      const batchCounts = {};
      students.forEach(s => {
        batchCounts[s.originalBatch] = (batchCounts[s.originalBatch] || 0) + 1;
      });
      setPlacementDoneBatchStats(batchCounts);
    } catch {
      toast.error('Failed to fetch placement done batch stats');
    }
  };

  const handleSuperAdminLogout = () => {
    localStorage.removeItem('adminName');
    localStorage.removeItem('role');
    localStorage.removeItem('selectedBatch');
    navigate('/');
  };

  const handleAddBatch = async (e) => {
    e.preventDefault();
    if (!newBatchName.trim() || !newBatchYear) {
      toast.error('Batch name and year required');
      return;
    }
    const students = newBatchStudents
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        const parts = line.split(',').map(s => s.trim());
        const [regNo, name, department, email, mobile] = parts;
        return {
          regNo,
          name: name || regNo,
          department: department || '',
          personalEmail: email || '',
          collegeEmail: '',
          mobile: mobile || '',
          marks: { efforts: 0, presentation: 0, assessment: 0, assignment: 0 },
          marksLastUpdated: null,
          attendance: [],
          attendancePercent: 0
        };
      });
    try {
      await api.post('/batches', { batchName: newBatchName, students, year: Number(newBatchYear) }); // <-- Add year
      toast.success('Batch added!');
      setNewBatchName('');
      setNewBatchYear('');
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

  const handleEditBatch = (batch) => {
    setBatchToEdit(batch);
    setEditBatchName(batch.batchName);
    setEditBatchYear(batch.year.toString());
    setShowEditBatchModal(true);
  };

  const confirmEditBatch = async () => {
    if (!batchToEdit || !editBatchName.trim() || !editBatchYear.trim()) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      await api.put(`/batches/${batchToEdit.batchName}`, {
        newBatchName: editBatchName.trim(),
        newYear: parseInt(editBatchYear)
      });
      toast.success('Batch updated successfully!');
      fetchAll();
      setShowEditBatchModal(false);
      setBatchToEdit(null);
      setEditBatchName('');
      setEditBatchYear('');
    } catch (error) {
      console.error('Edit batch error:', error);
      const errorMsg = error.response?.data?.error || 'Failed to update batch';
      toast.error(errorMsg);
    }
  };

  const cancelEditBatch = () => {
    setShowEditBatchModal(false);
    setBatchToEdit(null);
    setEditBatchName('');
    setEditBatchYear('');
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

  const handleViewLogs = () => {
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

  // Time Restriction Handlers
  const handleTimeRestrictionChange = (type, field, value) => {
    setTimeRestrictions(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }));
  };

  const handleDayToggle = (type, day) => {
    setTimeRestrictions(prev => {
      const currentDays = prev[type].allowedDays || [];
      const newDays = currentDays.includes(day)
        ? currentDays.filter(d => d !== day)
        : [...currentDays, day];
      
      return {
        ...prev,
        [type]: {
          ...prev[type],
          allowedDays: newDays,
          allowWeekends: newDays.includes('Saturday') || newDays.includes('Sunday')
        }
      };
    });
  };

  const handleSaveTimeRestriction = async () => {
    try {
      // Validate attendance times if enabled
      if (timeRestrictions.attendance.isEnabled && 
          timeRestrictions.attendance.startTime >= timeRestrictions.attendance.endTime) {
        toast.error('Attendance end time must be after start time');
        return;
      }

      // Validate marks times if enabled
      if (timeRestrictions.marks.isEnabled && 
          timeRestrictions.marks.startTime >= timeRestrictions.marks.endTime) {
        toast.error('Marks end time must be after start time');
        return;
      }

      // Validate that at least one day is selected for each enabled restriction
      if (timeRestrictions.attendance.isEnabled && timeRestrictions.attendance.allowedDays.length === 0) {
        toast.error('Please select at least one day for attendance restrictions');
        return;
      }

      if (timeRestrictions.marks.isEnabled && timeRestrictions.marks.allowedDays.length === 0) {
        toast.error('Please select at least one day for marks restrictions');
        return;
      }

      // Save attendance restrictions
      await api.post('/time-restrictions', {
        type: 'attendance',
        isEnabled: timeRestrictions.attendance.isEnabled,
        startTime: timeRestrictions.attendance.startTime,
        endTime: timeRestrictions.attendance.endTime,
        allowedDays: timeRestrictions.attendance.allowedDays,
        allowWeekends: timeRestrictions.attendance.allowWeekends
      });

      // Save marks restrictions
      await api.post('/time-restrictions', {
        type: 'marks',
        isEnabled: timeRestrictions.marks.isEnabled,
        startTime: timeRestrictions.marks.startTime,
        endTime: timeRestrictions.marks.endTime,
        allowedDays: timeRestrictions.marks.allowedDays,
        allowWeekends: timeRestrictions.marks.allowWeekends
      });

      toast.success('Time restrictions saved successfully!');
      fetchTimeRestrictions();
      setShowTimeRestrictions(false);
    } catch (error) {
      console.error('Time restriction save error:', error);
      let errorMsg = 'Failed to save time restrictions';
      
      if (error.response?.data?.error) {
        errorMsg = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      toast.error(errorMsg);
    }
  };

  const fetchPlacementDone = async () => {
    const res = await api.get('/placement-done');
    setPlacementDoneStudents(res.data.students || []);
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      setDepartments((res.data.departments || []).sort());
    } catch {
      toast.error('Failed to fetch departments');
    }
  };

  const fetchDepartmentStats = async () => {
    try {
      const res = await api.get('/departments/stats');
      setDepartmentStats(res.data.stats || []);
    } catch {
      toast.error('Failed to fetch department stats');
    }
  };

  const handleViewDepartmentStudents = async (department) => {
    try {
      setSelectedDepartment(department);
      const res = await api.get(`/departments/${encodeURIComponent(department)}/students`);
      setDepartmentStudents(res.data.students || []);
      setShowDepartmentStudentsModal(true);
    } catch {
      toast.error('Failed to fetch department students');
    }
  };

  const handleExportDepartmentStudents = (department, format) => {
    if (format === 'excel') {
      window.location.href = `http://localhost:5001/api/departments/${encodeURIComponent(department)}/export`;
      toast.success(`Exporting ${department} students...`);
    }
  };

  // Prepare data for charts
  const batchNames = batchAverages.map(b => b.batchName);
  const efforts = batchAverages.map(b => b.averages.efforts);
  const presentation = batchAverages.map(b => b.averages.presentation);
  const assessment = batchAverages.map(b => b.averages.assessment);
  const assignment = batchAverages.map(b => b.averages.assignment);

  const barData = {
    labels: batchNames,
    datasets: [
      { label: 'Efforts', data: efforts, backgroundColor: '#60a5fa' },
      { label: 'Presentation', data: presentation, backgroundColor: '#fbbf24' },
      { label: 'Assessment', data: assessment, backgroundColor: '#34d399' },
      { label: 'Assignment', data: assignment, backgroundColor: '#f472b6' }
    ]
  };

  const pieData = {
    labels: batchNames,
    datasets: [
      {
        label: 'Average Total Marks',
        data: batchAverages.map(b => b.averages.efforts + b.averages.presentation + b.averages.assessment + b.averages.assignment),
        backgroundColor: ['#60a5fa', '#fbbf24', '#34d399', '#f472b6', '#818cf8', '#f87171']
      }
    ]
  };

  // Handler for Placement Done button in navbar
  const handleShowPlacementDone = () => {
    navigate("/placement-done");
  };

  // Prepare data for Placement Done batch charts
  const placementDoneBatchNames = Object.keys(placementDoneBatchStats);
  const placementDoneBatchCounts = Object.values(placementDoneBatchStats);

  const placementDoneBarData = {
    labels: placementDoneBatchNames,
    datasets: [
      {
        label: 'Placement Done Students',
        data: placementDoneBatchCounts,
        backgroundColor: '#818cf8',
      },
    ],
  };

  const placementDonePieData = {
    labels: placementDoneBatchNames,
    datasets: [
      {
        label: 'Placement Done Students',
        data: placementDoneBatchCounts,
        backgroundColor: [
          '#818cf8', '#fbbf24', '#34d399', '#f472b6', '#60a5fa', '#f87171'
        ],
      },
    ],
  };

  // Filter batches and batchAverages for selected year
  const batchesForYear = batches.filter(b => b.year === selectedYear);
  const batchNamesForYear = batchesForYear.map(b => b.batchName);

  const batchAveragesForYear = batchAverages.filter(b =>
    batchNamesForYear.includes(b.batchName)
  );

  // Chart data for marks (for selected year)
  const barDataForYear = {
    labels: batchAveragesForYear.map(b => b.batchName),
    datasets: [
      { label: 'Efforts', data: batchAveragesForYear.map(b => b.averages.efforts), backgroundColor: '#60a5fa' },
      { label: 'Presentation', data: batchAveragesForYear.map(b => b.averages.presentation), backgroundColor: '#fbbf24' },
      { label: 'Assessment', data: batchAveragesForYear.map(b => b.averages.assessment), backgroundColor: '#34d399' },
      { label: 'Assignment', data: batchAveragesForYear.map(b => b.averages.assignment), backgroundColor: '#f472b6' }
    ]
  };

  const pieDataForYear = {
    labels: batchAveragesForYear.map(b => b.batchName),
    datasets: [
      {
        label: 'Average Total Marks',
        data: batchAveragesForYear.map(b =>
          b.averages.efforts + b.averages.presentation + b.averages.assessment + b.averages.assignment
        ),
        backgroundColor: ['#60a5fa', '#fbbf24', '#34d399', '#f472b6', '#818cf8', '#f87171']
      }
    ]
  };

  // Attendance chart data for selected year
  const attendanceBarDataForYear = {
    labels: batchAveragesForYear.map(b => b.batchName),
    datasets: [
      {
        label: 'Average Attendance (%)',
        data: batchAveragesForYear.map(b => b.attendancePercent ?? 0),
        backgroundColor: 'rgba(34,197,94,0.7)',
      },
    ],
  };

  const attendancePieDataForYear = {
    labels: batchAveragesForYear.map(b => b.batchName),
    datasets: [
      {
        label: 'Attendance',
        data: batchAveragesForYear.map(b => b.attendancePercent ?? 0),
        backgroundColor: [
          '#34d399', '#60a5fa', '#fbbf24', '#f87171', '#a78bfa', '#f472b6', '#38bdf8'
        ],
      },
    ],
  };

  // Placement Done chart data for selected year
  const placementDoneBatchNamesForYear = batchNamesForYear;
  const placementDoneBatchCountsForYear = placementDoneBatchNamesForYear.map(
    name => placementDoneBatchStats[name] || 0
  );

  const placementDoneBarDataForYear = {
    labels: placementDoneBatchNamesForYear,
    datasets: [
      {
        label: 'Placement Done Students',
        data: placementDoneBatchCountsForYear,
        backgroundColor: '#818cf8',
      },
    ],
  };

  const placementDonePieDataForYear = {
    labels: placementDoneBatchNamesForYear,
    datasets: [
      {
        label: 'Placement Done Students',
        data: placementDoneBatchCountsForYear,
        backgroundColor: [
          '#818cf8', '#fbbf24', '#34d399', '#f472b6', '#60a5fa', '#f87171'
        ],
      },
    ],
  };

  // Group batches by year for the table display
  const batchesByYear = batches.reduce((acc, batch) => {
    acc[batch.year] = acc[batch.year] || [];
    acc[batch.year].push(batch);
    return acc;
  }, {});

  return (
    <div className="min-h-screen flex flex-col bg-base-200">
      <SuperAdminNavBar
        onLogout={handleSuperAdminLogout}
        onViewPlacementDone={handleShowPlacementDone}
      />
      <main className="flex-1 flex flex-col items-center px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Control Buttons as Cards */}
        <section className="w-full max-w-4xl mb-4 sm:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Card: View Analysis */}
            <button
              onClick={() => setShowAnalysis(!showAnalysis)}
              className="card card-bordered bg-base-100 p-6 sm:p-6 lg:p-8 text-left hover:shadow-lg transition-shadow min-h-[96px]"
            >
              <div className="flex items-start gap-3">
                <div className="text-primary"> 
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-lg">{showAnalysis ? 'Hide Analysis' : 'View Analysis'}</div>
                  <p className="text-sm sm:text-base text-gray-500">Visualize batch metrics, attendance and placement charts.</p>
                </div>
              </div>
            </button>

            {/* Card: Add Batch */}
            <button
              onClick={() => setShowAddBatch(!showAddBatch)}
              className="card card-bordered bg-base-100 p-6 sm:p-6 lg:p-8 text-left hover:shadow-lg transition-shadow min-h-[96px]"
            >
              <div className="flex items-start gap-3">
                <div className="text-success">{icons.add}</div>
                <div>
                  <div className="font-semibold text-lg">{showAddBatch ? 'Hide Add Batch' : 'Add Batch'}</div>
                  <p className="text-sm sm:text-base text-gray-500">Create a new batch with students and assign a year.</p>
                </div>
              </div>
            </button>

            {/* Card: View Batches */}
            <button
              onClick={() => setShowBatches(!showBatches)}
              className="card card-bordered bg-base-100 p-6 sm:p-6 lg:p-8 text-left hover:shadow-lg transition-shadow min-h-[96px]"
            >
              <div className="flex items-start gap-3">
                <div className="text-primary">{icons.batch}</div>
                <div>
                  <div className="font-semibold text-lg">{showBatches ? 'Hide Batches' : 'View Batches'}</div>
                  <p className="text-sm sm:text-base text-gray-500">Browse and manage existing batches (edit/remove students).</p>
                </div>
              </div>
            </button>

            {/* Card: Add Admin */}
            <button
              onClick={() => setShowAddAdmin(!showAddAdmin)}
              className="card card-bordered bg-base-100 p-6 sm:p-6 lg:p-8 text-left hover:shadow-lg transition-shadow min-h-[96px]"
            >
              <div className="flex items-start gap-3">
                <div className="text-success">{icons.add}</div>
                <div>
                  <div className="font-semibold text-lg">{showAddAdmin ? 'Hide Add Admin' : 'Add Admin'}</div>
                  <p className="text-sm sm:text-base text-gray-500">Create admin accounts for marking attendance and entering marks.</p>
                </div>
              </div>
            </button>

            {/* Card: View Admins */}
            <button
              onClick={() => setShowViewAdmin(!showViewAdmin)}
              className="card card-bordered bg-base-100 p-6 sm:p-6 lg:p-8 text-left hover:shadow-lg transition-shadow min-h-[96px]"
            >
              <div className="flex items-start gap-3">
                <div className="text-primary">{icons.admin}</div>
                <div>
                  <div className="font-semibold text-lg">{showViewAdmin ? 'Hide Admins' : 'View Admins'}</div>
                  <p className="text-sm sm:text-base text-gray-500">Manage admin users and edit their credentials.</p>
                </div>
              </div>
            </button>

            {/* Card: View Departments */}
            <button
              onClick={() => setShowDepartments(!showDepartments)}
              className="card card-bordered bg-base-100 p-6 sm:p-6 lg:p-8 text-left hover:shadow-lg transition-shadow min-h-[96px]"
            >
              <div className="flex items-start gap-3">
                <div className="text-secondary">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-lg">{showDepartments ? 'Hide Departments' : 'View Departments'}</div>
                  <p className="text-sm sm:text-base text-gray-500">View students grouped by department across all batches.</p>
                </div>
              </div>
            </button>

            {/* Card: Student Management */}
            <button
              onClick={() => navigate('/student-management')}
              className="card card-bordered bg-base-100 p-6 sm:p-6 lg:p-8 text-left hover:shadow-lg transition-shadow min-h-[96px]"
            >
              <div className="flex items-start gap-3">
                <div className="text-info">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-lg">Student Management</div>
                  <p className="text-sm sm:text-base text-gray-500">Add, edit, delete students and manage their information across batches.</p>
                </div>
              </div>
            </button>

            {/* Card: View Admin Logs */}
            <button
              onClick={handleViewLogs}
              className="card card-bordered bg-base-100 p-6 sm:p-6 lg:p-8 text-left hover:shadow-lg transition-shadow min-h-[96px]"
            >
              <div className="flex items-start gap-3">
                <div className="text-warning">{icons.logs}</div>
                <div>
                  <div className="font-semibold text-lg">View Admin Logs</div>
                  <p className="text-sm sm:text-base text-gray-500">See activity logs for admins and clear them if needed.</p>
                </div>
              </div>
            </button>

            {/* Card: Time Restrictions */}
            <button
              onClick={() => setShowTimeRestrictions(!showTimeRestrictions)}
              className="card card-bordered bg-base-100 p-6 sm:p-6 lg:p-8 text-left hover:shadow-lg transition-shadow min-h-[96px]"
            >
              <div className="flex items-start gap-3">
                <div className="text-secondary">{icons.time}</div>
                <div>
                  <div className="font-semibold text-lg">{showTimeRestrictions ? 'Hide Time Settings' : 'Time Restrictions'}</div>
                  <p className="text-sm sm:text-base text-gray-500">Configure when admins can mark attendance and enter marks.</p>
                </div>
              </div>
            </button>

            {/* Card: Placement Done */}
            <button
              onClick={handleShowPlacementDone}
              className="card card-bordered bg-base-100 p-6 sm:p-6 lg:p-8 text-left hover:shadow-lg transition-shadow min-h-[96px]"
            >
              <div className="flex items-start gap-3">
                <div className="text-accent">{icons.view}</div>
                <div>
                  <div className="font-semibold text-lg">Placement Done</div>
                  <p className="text-sm sm:text-base text-gray-500">Open placement dashboard showing placed students.</p>
                </div>
              </div>
            </button>

            {/* Card: Database Backup */}
            <button
              onClick={() => setShowBackupManager(!showBackupManager)}
              className="card card-bordered bg-base-100 p-6 sm:p-6 lg:p-8 text-left hover:shadow-lg transition-shadow min-h-[96px]"
            >
              <div className="flex items-start gap-3">
                <div className="text-info">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-lg">{showBackupManager ? 'Hide Backup Manager' : 'Database Backup'}</div>
                  <p className="text-sm sm:text-base text-gray-500">Create, restore, and manage database backups for data protection.</p>
                </div>
              </div>
            </button>
          </div>
        </section>

        {/* Year Tabs for Chart Filtering (DaisyUI) - Only show when analysis is visible */}
        {showAnalysis && (
          <div className="w-full flex justify-center mb-4 sm:mb-6">
            <div role="tablist" className="tabs tabs-boxed tabs-sm sm:tabs-md">
              {years.map(year => (
                <button
                  key={year}
                  role="tab"
                  className={`tab text-xs sm:text-sm ${year === selectedYear ? "tab-active" : ""}`}
                  onClick={() => setSelectedYear(year)}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Show charts only if analysis is visible and a year is selected */}
        {showAnalysis && selectedYear && (
          <section className="w-full max-w-7xl mb-6 sm:mb-8 bg-base-100 rounded-xl sm:rounded-2xl shadow-xl p-3 sm:p-4 lg:p-6">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-primary mb-3 sm:mb-4 text-center sm:text-left">
              Batch Wise Comparison ({selectedYear})
            </h2>
            
            {/* Marks Charts */}
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 justify-center items-start mb-6 sm:mb-8">
              {/* Bar Chart Section */}
              <div className="w-full lg:w-1/2">
                <h3 className="text-sm sm:text-base lg:text-lg font-semibold mb-2 text-center lg:text-left">Average Marks (Bar Chart)</h3>
                <div className="w-full h-[250px] sm:h-[300px] lg:h-[400px]">
                  <Bar
                    data={barDataForYear}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { 
                        legend: { 
                          position: 'top',
                          labels: {
                            font: {
                              size: window.innerWidth < 640 ? 10 : 12
                            }
                          }
                        } 
                      },
                      scales: {
                        x: {
                          ticks: {
                            font: {
                              size: window.innerWidth < 640 ? 8 : 10
                            }
                          }
                        },
                        y: {
                          ticks: {
                            font: {
                              size: window.innerWidth < 640 ? 8 : 10
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
              {/* Pie Chart Section */}
              <div className="w-full lg:w-1/2">
                <h3 className="text-sm sm:text-base lg:text-lg font-semibold mb-2 text-center lg:text-left">Total Average Marks (Pie Chart)</h3>
                <div className="w-full h-[250px] sm:h-[300px] lg:h-[400px]">
                  <Pie
                    data={pieDataForYear}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { 
                        legend: { 
                          position: 'top',
                          labels: {
                            font: {
                              size: window.innerWidth < 640 ? 10 : 12
                            }
                          }
                        } 
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Attendance Charts */}
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 justify-center items-start mb-6 sm:mb-8">
              <div className="w-full lg:w-1/2">
                <h3 className="text-sm sm:text-base lg:text-lg font-semibold mb-2 text-center lg:text-left">Average Attendance (Bar Chart)</h3>
                <div className="w-full h-[250px] sm:h-[300px] lg:h-[400px]">
                  <Bar
                    data={attendanceBarDataForYear}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { 
                        legend: { 
                          position: 'top',
                          labels: {
                            font: {
                              size: window.innerWidth < 640 ? 10 : 12
                            }
                          }
                        } 
                      },
                      scales: {
                        x: {
                          ticks: {
                            font: {
                              size: window.innerWidth < 640 ? 8 : 10
                            }
                          }
                        },
                        y: {
                          ticks: {
                            font: {
                              size: window.innerWidth < 640 ? 8 : 10
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
              <div className="w-full lg:w-1/2">
                <h3 className="text-sm sm:text-base lg:text-lg font-semibold mb-2 text-center lg:text-left">Total Average Attendance (Pie Chart)</h3>
                <div className="w-full h-[250px] sm:h-[300px] lg:h-[400px]">
                  <Pie
                    data={attendancePieDataForYear}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { 
                        legend: { 
                          position: 'top',
                          labels: {
                            font: {
                              size: window.innerWidth < 640 ? 10 : 12
                            }
                          }
                        } 
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Placement Done Batch Stats Charts */}
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 justify-center items-start">
              <div className="w-full lg:w-1/2">
                <h3 className="text-sm sm:text-base lg:text-lg font-semibold mb-2 text-center lg:text-left">Placement Done Students by Batch (Bar Chart)</h3>
                <div className="w-full h-[250px] sm:h-[300px] lg:h-[400px]">
                  <Bar
                    data={placementDoneBarDataForYear}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { 
                        legend: { 
                          position: 'top',
                          labels: {
                            font: {
                              size: window.innerWidth < 640 ? 10 : 12
                            }
                          }
                        } 
                      },
                      scales: {
                        x: {
                          ticks: {
                            font: {
                              size: window.innerWidth < 640 ? 8 : 10
                            }
                          }
                        },
                        y: {
                          ticks: {
                            font: {
                              size: window.innerWidth < 640 ? 8 : 10
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
              <div className="w-full lg:w-1/2">
                <h3 className="text-sm sm:text-base lg:text-lg font-semibold mb-2 text-center lg:text-left">Placement Done Students by Batch (Pie Chart)</h3>
                <div className="w-full h-[250px] sm:h-[300px] lg:h-[400px]">
                  <Pie
                    data={placementDonePieDataForYear}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { 
                        legend: { 
                          position: 'top',
                          labels: {
                            font: {
                              size: window.innerWidth < 640 ? 10 : 12
                            }
                          }
                        } 
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Add Batch Form - Only show when showAddBatch is true */}
        {showAddBatch && (
          <section className="w-full max-w-4xl mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-secondary flex items-center mb-3 sm:mb-4">
              {icons.batch} Add New Batch
            </h2>
            <form onSubmit={handleAddBatch} className="flex flex-col gap-3 sm:gap-4 bg-base-200 rounded-xl p-3 sm:p-4 lg:p-6 shadow">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <input
                  type="text"
                  placeholder="Batch Name"
                  value={newBatchName}
                  onChange={e => setNewBatchName(e.target.value)}
                  className="input input-bordered input-sm sm:input-md"
                />
                <input
                  type="number"
                  placeholder="Year (e.g. 2026)"
                  value={newBatchYear}
                  onChange={e => setNewBatchYear(e.target.value)}
                  className="input input-bordered input-sm sm:input-md"
                  min={2000}
                  max={2100}
                  required
                />
              </div>
              <textarea
                placeholder={`Enter students in CSV format: regno,name,dept,email,mobile\nExample:\n21IT001,John Doe,CSE,john@email.com,9876543210\n21IT002,Jane Smith,IT,jane@email.com,9876543211`}
                value={newBatchStudents}
                onChange={e => setNewBatchStudents(e.target.value)}
                className="textarea textarea-bordered text-xs sm:text-sm"
                rows={window.innerWidth < 640 ? 4 : 6}
              />
              <button type="submit" className="btn btn-primary btn-sm sm:btn-md font-semibold flex items-center w-full sm:w-fit self-end">
                {icons.add} Add Batch
              </button>
            </form>
          </section>
        )}

        {/* Batches Table - Only show when showBatches is true */}
        {showBatches && (
          <section className="w-full max-w-6xl mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-secondary flex items-center mb-3 sm:mb-4">
              {icons.batch} Batches
            </h2>
            {Object.keys(batchesByYear).sort().map(year => (
              <div key={year} className="mb-4 sm:mb-6">
                <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-primary mb-2 sm:mb-3">{year} Batches</h3>
                <div className="overflow-x-auto rounded-xl shadow bg-base-100">
                  <table className="table table-zebra w-full text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-base-200">
                        <th className="text-left px-2 sm:px-4 py-2 sm:py-3 font-semibold">Batch Name</th>
                        <th className="text-center px-2 sm:px-4 py-2 sm:py-3 font-semibold">Students</th>
                        <th className="text-center px-2 sm:px-4 py-2 sm:py-3 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {batchesByYear[year].length === 0 ? (
                        <tr>
                          <td colSpan={3} className="text-center text-gray-400 py-6 sm:py-8">No batches added yet.</td>
                        </tr>
                      ) : (
                        batchesByYear[year].map(batch => (
                          <tr key={batch.batchName} className="hover:bg-base-50">
                            <td className="font-semibold px-2 sm:px-4 py-2 sm:py-3">{batch.batchName}</td>
                            <td className="text-center px-2 sm:px-4 py-2 sm:py-3">
                              <span className="badge badge-info badge-sm">{batch.students?.length || 0}</span>
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3">
                              <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 justify-center">
                                <button
                                  className="btn btn-info btn-xs text-xs"
                                  onClick={() => handleViewStudents(batch.batchName)}
                                  title="View Students"
                                >
                                  {icons.view} <span className="hidden sm:inline">View</span>
                                </button>
                                <button
                                  className="btn btn-warning btn-xs text-xs"
                                  onClick={() => handleEditBatch(batch)}
                                  title="Edit Batch"
                                >
                                  {icons.edit} <span className="hidden sm:inline">Edit</span>
                                </button>
                                <button
                                  className="btn btn-error btn-xs text-xs"
                                  onClick={() => {
                                    setBatchToRemove(batch.batchName);
                                    setShowRemoveBatchModal(true);
                                  }}
                                  title="Remove Batch"
                                >
                                  {icons.remove} <span className="hidden sm:inline">Remove</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Add Admin Form - Only show when showAddAdmin is true */}
        {showAddAdmin && (
          <section className="w-full max-w-4xl mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-secondary flex items-center mb-3 sm:mb-4">
              {icons.admin} Add New Admin
            </h2>
            <form onSubmit={handleAddAdmin} className="flex flex-col sm:flex-row gap-3 sm:gap-4 bg-base-200 rounded-xl p-3 sm:p-4 lg:p-6 shadow">
              <input
                type="text"
                placeholder="Admin Name"
                value={newAdminName}
                onChange={e => setNewAdminName(e.target.value)}
                className="input input-bordered input-sm sm:input-md flex-1"
              />
              <input
                type="password"
                placeholder="Admin Password"
                value={newAdminPassword}
                onChange={e => setNewAdminPassword(e.target.value)}
                className="input input-bordered input-sm sm:input-md flex-1"
                autoComplete="new-password"
              />
              <button type="submit" className="btn btn-success btn-sm sm:btn-md font-semibold flex items-center w-full sm:w-fit">
                {icons.add} Add Admin
              </button>
            </form>
          </section>
        )}

        {/* Admins List - Only show when showViewAdmin is true */}
        {showViewAdmin && (
          <section className="w-full max-w-4xl mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-secondary flex items-center mb-3 sm:mb-4">
              {icons.admin} Admins
            </h2>
            <div className="bg-base-200 rounded-xl shadow p-3 sm:p-4 lg:p-6">
              {admins.length === 0 ? (
                <div className="text-center text-gray-400 py-6 sm:py-8">No admins available.</div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  {admins.map(a => (
                    <div
                      key={a._id}
                      className="bg-base-100 rounded-lg p-3 sm:p-4 shadow-sm border border-base-300"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-primary shrink-0">{icons.admin}</span>
                          <div className="min-w-0">
                            <span className="font-semibold text-sm sm:text-base block truncate">{a.adminName}</span>
                            <span className="text-xs text-gray-500 font-mono block">
                              {a.adminPassword ? '*'.repeat(Math.min(a.adminPassword.length, 8)) : ''}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 sm:gap-3">
                          <button
                            className="btn btn-xs sm:btn-sm btn-info flex-1 sm:flex-none"
                            onClick={() => handleShowAdmin(a)}
                            title="Edit Admin"
                          >
                            {icons.edit} <span className="hidden sm:inline">Edit</span>
                          </button>
                          <button
                            className="btn btn-xs sm:btn-sm btn-error flex-1 sm:flex-none"
                            onClick={() => handleRemoveAdmin(a._id)}
                            title="Remove Admin"
                          >
                            {icons.remove} <span className="hidden sm:inline">Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}



        {/* Departments List - Only show when showDepartments is true */}
        {showDepartments && (
          <section className="w-full max-w-6xl mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-secondary flex items-center mb-3 sm:mb-4">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Departments
            </h2>
            <div className="bg-base-200 rounded-xl shadow p-3 sm:p-4 lg:p-6">
              {departments.length === 0 ? (
                <div className="text-center text-gray-400 py-6 sm:py-8">No departments found. Add students with department information.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table w-full text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-base-300">
                        <th className="text-left">Department</th>
                        <th className="text-center">Total Students</th>
                        <th className="text-center">Avg Marks</th>
                        <th className="text-center">Avg Attendance</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {departments.map(dept => {
                        const stats = departmentStats.find(s => s.department === dept) || {};
                        return (
                          <tr key={dept} className="hover:bg-base-300 transition">
                            <td className="font-semibold text-primary">{dept}</td>
                            <td className="text-center">{stats.totalStudents || 0}</td>
                            <td className="text-center">{stats.averageMarks || '0.00'}</td>
                            <td className="text-center">{stats.averageAttendance || '0.00'}%</td>
                            <td className="text-center">
                              <div className="flex gap-2 justify-center">
                                <button
                                  className="btn btn-info btn-xs"
                                  onClick={() => handleViewDepartmentStudents(dept)}
                                  title="View Students"
                                >
                                  {icons.view} <span className="hidden sm:inline">View</span>
                                </button>
                                <button
                                  className="btn btn-success btn-xs"
                                  onClick={() => handleExportDepartmentStudents(dept, 'excel')}
                                  title="Export to Excel"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  <span className="hidden sm:inline">Export</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}



        {/* Students Modal */}
        {showStudentsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-base-100 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] sm:max-h-[90vh] relative flex flex-col">
              <button
                className="absolute top-2 right-2 sm:top-3 sm:right-3 btn btn-circle btn-xs sm:btn-sm btn-ghost"
                onClick={() => setShowStudentsModal(false)}
                aria-label="Close"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              {/* Header */}
              <div className="p-3 sm:p-4 lg:p-6 border-b border-base-300">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="inline-flex items-center justify-center bg-primary rounded-full w-6 h-6 sm:w-8 sm:h-8 lg:w-9 lg:h-9 shrink-0">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 616 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </span>
                  <h3 className="text-sm sm:text-lg lg:text-xl font-extrabold text-primary tracking-tight">
                    Students in <span className="text-accent">{selectedBatch}</span>
                  </h3>
                </div>
                
                {/* Export Buttons */}
                <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row gap-2 justify-end">
                  <button
                    className="btn btn-outline btn-xs sm:btn-sm font-semibold flex items-center gap-1"
                    onClick={() => handleExportStudents(selectedBatch, 'csv')}
                    title="Export as CSV"
                  >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="hidden sm:inline">CSV</span>
                  </button>
                  <button
                    className="btn btn-outline btn-xs sm:btn-sm font-semibold flex items-center gap-1"
                    onClick={() => handleExportStudents(selectedBatch, 'pdf')}
                    title="Export as PDF"
                  >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span className="hidden sm:inline">PDF</span>
                  </button>
                </div>
              </div>
              
              {/* Table Container */}
              <div className="overflow-x-auto flex-1 w-full p-3 sm:p-4 lg:p-6">
                <table className="min-w-[800px] w-full text-xs sm:text-sm md:text-base">
                  <thead>
                    <tr className="bg-base-200 text-xs sm:text-sm uppercase text-gray-600">
                      <th className="px-2 py-2 text-left font-bold whitespace-nowrap">S.No</th>
                      <th className="px-2 py-2 text-left font-bold whitespace-nowrap">Reg No</th>
                      <th className="px-2 py-2 text-left font-bold whitespace-nowrap">Name</th>
                      <th className="px-2 py-2 text-left font-bold whitespace-nowrap">Dept</th>
                      <th className="px-2 py-2 text-left font-bold whitespace-nowrap">Email</th>
                      <th className="px-2 py-2 text-center font-bold whitespace-nowrap">Profile</th>
                      <th className="px-2 py-2 text-center font-bold whitespace-nowrap">Attendance</th>
                      <th className="px-2 py-2 text-center font-bold whitespace-nowrap">Edit</th>
                      <th className="px-2 py-2 text-center font-bold whitespace-nowrap">Move</th>
                      <th className="px-2 py-2 text-center font-bold whitespace-nowrap">Remove</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentsInBatch.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="text-center py-6 text-gray-400 font-semibold">
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
                          <td className="px-2 py-2 text-xs sm:text-sm whitespace-nowrap">{student.department || '-'}</td>
                          <td className="px-2 py-2 text-xs sm:text-sm whitespace-nowrap">{student.personalEmail || student.collegeEmail || '-'}</td>
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
                            <button
                              className="btn btn-primary btn-sm w-24 flex items-center gap-1 justify-center"
                              onClick={() => { setStudentToEdit(student); setShowEditStudentModal(true); }}
                              title="Edit Student"
                            >
                              {icons.edit} Edit
                            </button>
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

        {/* Enhanced Admin Logs Modal */}
        <AdminLogsModal 
          isOpen={showLogsModal} 
          onClose={() => setShowLogsModal(false)} 
        />

        {/* Database Backup Manager Modal */}
        <BackupManager 
          isOpen={showBackupManager} 
          onClose={() => setShowBackupManager(false)} 
        />

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

        {/* Edit Batch Modal */}
        {showEditBatchModal && batchToEdit && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-base-100 rounded-2xl shadow-2xl w-[90vw] max-w-md p-6">
              <h3 className="text-xl font-bold text-warning mb-4 flex items-center">
                {icons.edit} Edit Batch
              </h3>
              <div className="flex flex-col gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Batch Name</label>
                  <input
                    type="text"
                    value={editBatchName}
                    onChange={(e) => setEditBatchName(e.target.value)}
                    className="input input-bordered w-full"
                    placeholder="Enter batch name"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Year</label>
                  <input
                    type="number"
                    value={editBatchYear}
                    onChange={(e) => setEditBatchYear(e.target.value)}
                    className="input input-bordered w-full"
                    placeholder="Enter year (e.g. 2026)"
                    min={2000}
                    max={2100}
                  />
                </div>
              </div>
              <div className="flex gap-4 justify-end">
                <button 
                  className="btn btn-ghost font-semibold" 
                  onClick={cancelEditBatch}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-warning font-semibold" 
                  onClick={confirmEditBatch}
                  disabled={!editBatchName.trim() || !editBatchYear.trim()}
                >
                  Update Batch
                </button>
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

        {/* Time Restrictions Management Modal */}
        {showTimeRestrictions && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-base-100 rounded-2xl shadow-2xl w-[98vw] max-w-4xl max-h-[90vh] p-4 sm:p-8 relative flex flex-col">
              <button
                className="absolute top-3 right-3 btn btn-circle btn-sm btn-ghost"
                onClick={() => setShowTimeRestrictions(false)}
                aria-label="Close"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <h2 className="text-2xl sm:text-3xl font-extrabold text-primary mb-6 text-center tracking-tight">
                {icons.time} Time Restrictions Management
              </h2>
              
              <div className="overflow-y-auto flex-1 space-y-6">
                {/* Attendance Time Restrictions */}
                <div className="bg-base-200 rounded-xl p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-secondary mb-4 flex items-center gap-2">
                    📊 Attendance Marking Time Restrictions
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Enable/Disable Toggle */}
                    <div className="form-control">
                      <label className="label cursor-pointer justify-start gap-3">
                        <input
                          type="checkbox"
                          className="toggle toggle-primary"
                          checked={timeRestrictions.attendance.isEnabled}
                          onChange={(e) => handleTimeRestrictionChange('attendance', 'isEnabled', e.target.checked)}
                        />
                        <span className="label-text font-semibold">Enable Attendance Time Restrictions</span>
                      </label>
                    </div>

                    {/* Time Settings - Only show when enabled */}
                    {timeRestrictions.attendance.isEnabled && (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="form-control">
                            <label className="label">
                              <span className="label-text font-medium">Start Time</span>
                            </label>
                            <input
                              type="time"
                              className="input input-bordered"
                              value={timeRestrictions.attendance.startTime}
                              onChange={(e) => handleTimeRestrictionChange('attendance', 'startTime', e.target.value)}
                            />
                          </div>
                          
                          <div className="form-control">
                            <label className="label">
                              <span className="label-text font-medium">End Time</span>
                            </label>
                            <input
                              type="time"
                              className="input input-bordered"
                              value={timeRestrictions.attendance.endTime}
                              onChange={(e) => handleTimeRestrictionChange('attendance', 'endTime', e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Allowed Days */}
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text font-medium">Allowed Days</span>
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                              <label key={day} className="label cursor-pointer justify-start gap-2">
                                <input
                                  type="checkbox"
                                  className="checkbox checkbox-primary checkbox-sm"
                                  checked={timeRestrictions.attendance.allowedDays.includes(day)}
                                  onChange={(e) => {
                                    const days = timeRestrictions.attendance.allowedDays;
                                    if (e.target.checked) {
                                      handleTimeRestrictionChange('attendance', 'allowedDays', [...days, day]);
                                    } else {
                                      handleTimeRestrictionChange('attendance', 'allowedDays', days.filter(d => d !== day));
                                    }
                                  }}
                                />
                                <span className="label-text text-xs">{day.slice(0, 3)}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Marks Time Restrictions */}
                <div className="bg-base-200 rounded-xl p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-accent mb-4 flex items-center gap-2">
                    📝 Marks Entry Time Restrictions
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Enable/Disable Toggle */}
                    <div className="form-control">
                      <label className="label cursor-pointer justify-start gap-3">
                        <input
                          type="checkbox"
                          className="toggle toggle-accent"
                          checked={timeRestrictions.marks.isEnabled}
                          onChange={(e) => handleTimeRestrictionChange('marks', 'isEnabled', e.target.checked)}
                        />
                        <span className="label-text font-semibold">Enable Marks Entry Time Restrictions</span>
                      </label>
                    </div>

                    {/* Time Settings - Only show when enabled */}
                    {timeRestrictions.marks.isEnabled && (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="form-control">
                            <label className="label">
                              <span className="label-text font-medium">Start Time</span>
                            </label>
                            <input
                              type="time"
                              className="input input-bordered"
                              value={timeRestrictions.marks.startTime}
                              onChange={(e) => handleTimeRestrictionChange('marks', 'startTime', e.target.value)}
                            />
                          </div>
                          
                          <div className="form-control">
                            <label className="label">
                              <span className="label-text font-medium">End Time</span>
                            </label>
                            <input
                              type="time"
                              className="input input-bordered"
                              value={timeRestrictions.marks.endTime}
                              onChange={(e) => handleTimeRestrictionChange('marks', 'endTime', e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Allowed Days */}
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text font-medium">Allowed Days</span>
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                              <label key={day} className="label cursor-pointer justify-start gap-2">
                                <input
                                  type="checkbox"
                                  className="checkbox checkbox-accent checkbox-sm"
                                  checked={timeRestrictions.marks.allowedDays.includes(day)}
                                  onChange={(e) => {
                                    const days = timeRestrictions.marks.allowedDays;
                                    if (e.target.checked) {
                                      handleTimeRestrictionChange('marks', 'allowedDays', [...days, day]);
                                    } else {
                                      handleTimeRestrictionChange('marks', 'allowedDays', days.filter(d => d !== day));
                                    }
                                  }}
                                />
                                <span className="label-text text-xs">{day.slice(0, 3)}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                  <button
                    className="btn btn-primary flex-1"
                    onClick={handleSaveTimeRestriction}
                  >
                     Save Time Restrictions
                  </button>
                  <button
                    className="btn btn-ghost flex-1"
                    onClick={() => setShowTimeRestrictions(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Student Edit Modal */}
        {showEditStudentModal && studentToEdit && (
          <StudentEditModal
            student={studentToEdit}
            batchName={selectedBatch}
            onClose={() => {
              setShowEditStudentModal(false);
              setStudentToEdit(null);
            }}
            onUpdate={(updatedStudent, isDeleted) => {
              if (isDeleted) {
                // Remove student from list
                setStudentsInBatch(prev => prev.filter(s => s.regNo !== studentToEdit.regNo));
              } else {
                // Update student in list
                setStudentsInBatch(prev => prev.map(s => 
                  s.regNo === studentToEdit.regNo ? updatedStudent : s
                ));
              }
              // Refresh batches to update counts
              fetchBatches();
            }}
          />
        )}
      </main>
      <SuperAdminFooter />
    </div>
  );
};

export default SuperAdminPage;