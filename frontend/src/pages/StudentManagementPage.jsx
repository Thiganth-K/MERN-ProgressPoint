import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import { 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiX,
  FiUsers,
  FiArrowLeft
} from 'react-icons/fi';

const StudentManagementPage = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    regNo: '',
    name: '',
    department: '',
    personalEmail: '',
    collegeEmail: '',
    mobile: '',
    batchId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsRes, batchesRes] = await Promise.all([
        api.get('/students/batch/all-students'),
        api.get('/batches')
      ]);

      if (studentsRes.data.success) {
        // Sort students by registration number in ascending order
        const sortedStudents = studentsRes.data.students.sort((a, b) => 
          a.regNo.localeCompare(b.regNo)
        );
        setStudents(sortedStudents);
      }

      if (batchesRes.data.batches) {
        setBatches(batchesRes.data.batches);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      regNo: '',
      name: '',
      department: '',
      personalEmail: '',
      collegeEmail: '',
      mobile: '',
      batchId: ''
    });
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();

    if (!formData.regNo || !formData.name || !formData.batchId) {
      toast.error('Registration number, name, and batch are required');
      return;
    }

    try {
      const response = await api.post('/students/batch/create-student', formData);

      if (response.data.success) {
        toast.success('Student added successfully');
        setShowAddModal(false);
        resetForm();
        fetchData();
      }
    } catch (error) {
      console.error('Error adding student:', error);
      toast.error(error.response?.data?.message || 'Failed to add student');
    }
  };

  const handleEditStudent = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.batchId) {
      toast.error('Name and batch are required');
      return;
    }

    try {
      const response = await api.put(`/students/batch/${selectedStudent._id}`, formData);

      if (response.data.success) {
        toast.success('Student updated successfully');
        setShowEditModal(false);
        setSelectedStudent(null);
        resetForm();
        fetchData();
      }
    } catch (error) {
      console.error('Error updating student:', error);
      toast.error(error.response?.data?.message || 'Failed to update student');
    }
  };

  const handleDeleteStudent = async (studentId, studentName) => {
    if (!window.confirm(`Are you sure you want to delete ${studentName}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await api.delete(`/students/batch/${studentId}`);

      if (response.data.success) {
        toast.success('Student deleted successfully');
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error(error.response?.data?.message || 'Failed to delete student');
    }
  };

  const openEditModal = (student) => {
    setSelectedStudent(student);
    setFormData({
      regNo: student.regNo,
      name: student.name,
      department: student.department || '',
      personalEmail: student.personalEmail || '',
      collegeEmail: student.collegeEmail || '',
      mobile: student.mobile || '',
      batchId: student.batchId
    });
    setShowEditModal(true);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-4 text-lg font-semibold">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header */}
      <div className="bg-base-100 shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/superadmin')}
                className="btn btn-ghost btn-sm"
              >
                <FiArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <FiUsers className="w-6 h-6 text-primary" />
                <h1 className="text-2xl font-bold">Student Management</h1>
              </div>
            </div>
            <button
              onClick={openAddModal}
              className="btn btn-primary btn-sm"
            >
              <FiPlus className="w-5 h-5" />
              Add Student
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div className="stats shadow">
              <div className="stat">
                <div className="stat-title">Total Students</div>
                <div className="stat-value text-primary">{students.length}</div>
              </div>
            </div>
            <div className="stats shadow">
              <div className="stat">
                <div className="stat-title">Total Batches</div>
                <div className="stat-value text-accent">{batches.length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-base-100 rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Reg No</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Batch</th>
                  <th>Personal Email</th>
                  <th>College Email</th>
                  <th>Mobile</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8">
                      <div className="text-gray-500">
                        <FiUsers className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No students found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student._id}>
                      <td className="font-semibold">{student.regNo}</td>
                      <td>{student.name}</td>
                      <td>{student.department || '-'}</td>
                      <td className="text-sm font-medium">{student.batchName || '-'}</td>
                      <td className="text-sm">{student.personalEmail || '-'}</td>
                      <td className="text-sm">{student.collegeEmail || '-'}</td>
                      <td>{student.mobile || '-'}</td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(student)}
                            className="btn btn-ghost btn-xs text-info"
                            title="Edit"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(student._id, student.name)}
                            className="btn btn-ghost btn-xs text-error"
                            title="Delete"
                          >
                            <FiTrash2 className="w-4 h-4" />
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
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Add New Student</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="btn btn-ghost btn-sm btn-circle"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudent}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Registration Number *</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 61782323106001"
                    className="input input-bordered"
                    value={formData.regNo}
                    onChange={(e) => setFormData({ ...formData, regNo: e.target.value })}
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Name *</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Student Name"
                    className="input input-bordered"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Department</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CSE, ECE, IT"
                    className="input input-bordered"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Batch *</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={formData.batchId}
                    onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                    required
                  >
                    <option value="">Select Batch</option>
                    {batches.map(batch => (
                      <option key={batch._id} value={batch._id}>
                        {batch.batchName} ({batch.year})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Personal Email</span>
                  </label>
                  <input
                    type="email"
                    placeholder="personal@example.com"
                    className="input input-bordered"
                    value={formData.personalEmail}
                    onChange={(e) => setFormData({ ...formData, personalEmail: e.target.value })}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">College Email</span>
                  </label>
                  <input
                    type="email"
                    placeholder="student@college.edu"
                    className="input input-bordered"
                    value={formData.collegeEmail}
                    onChange={(e) => setFormData({ ...formData, collegeEmail: e.target.value })}
                  />
                </div>

                <div className="form-control md:col-span-2">
                  <label className="label">
                    <span className="label-text">Mobile</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    className="input input-bordered"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="btn"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditModal && selectedStudent && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Edit Student</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedStudent(null);
                  resetForm();
                }}
                className="btn btn-ghost btn-sm btn-circle"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditStudent}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Registration Number *</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={formData.regNo}
                    onChange={(e) => setFormData({ ...formData, regNo: e.target.value })}
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Name *</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Student Name"
                    className="input input-bordered"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Department</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CSE, ECE, IT"
                    className="input input-bordered"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Batch *</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={formData.batchId}
                    onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                    required
                  >
                    <option value="">Select Batch</option>
                    {batches.map(batch => (
                      <option key={batch._id} value={batch._id}>
                        {batch.batchName} ({batch.year})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Personal Email</span>
                  </label>
                  <input
                    type="email"
                    placeholder="personal@example.com"
                    className="input input-bordered"
                    value={formData.personalEmail}
                    onChange={(e) => setFormData({ ...formData, personalEmail: e.target.value })}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">College Email</span>
                  </label>
                  <input
                    type="email"
                    placeholder="student@college.edu"
                    className="input input-bordered"
                    value={formData.collegeEmail}
                    onChange={(e) => setFormData({ ...formData, collegeEmail: e.target.value })}
                  />
                </div>

                <div className="form-control md:col-span-2">
                  <label className="label">
                    <span className="label-text">Mobile</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    className="input input-bordered"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  />
                </div>
              </div>

              <div className="alert alert-info mt-4">
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current flex-shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <span className="text-sm">Changing the batch will move the student to the selected batch.</span>
                </div>
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedStudent(null);
                    resetForm();
                  }}
                  className="btn"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagementPage;
