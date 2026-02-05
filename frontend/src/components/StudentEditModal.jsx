import React, { useState, useEffect } from 'react';
import api from '../lib/axios';
import toast from 'react-hot-toast';

const StudentEditModal = ({ student, batchName, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    regNo: '',
    name: '',
    department: '',
    personalEmail: '',
    collegeEmail: '',
    mobile: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (student) {
      setFormData({
        regNo: student.regNo || '',
        name: student.name || '',
        department: student.department || '',
        personalEmail: student.personalEmail || '',
        collegeEmail: student.collegeEmail || '',
        mobile: student.mobile || ''
      });
    }
  }, [student]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.put(
        `/superadmin/student/${batchName}/${student.regNo}`,
        formData
      );

      if (response.data.success) {
        toast.success('Student updated successfully!');
        onUpdate(response.data.student);
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update student');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${student.name}? This action cannot be undone!`)) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.delete(`/superadmin/student/${batchName}/${student.regNo}`);

      if (response.data.success) {
        toast.success('Student deleted successfully!');
        onUpdate(null, true); // true indicates deletion
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete student');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-base-100 border-b border-base-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-primary">Edit Student</h2>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-circle"
            disabled={isLoading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Registration Number */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Registration Number</span>
              </label>
              <input
                type="text"
                name="regNo"
                value={formData.regNo}
                onChange={handleChange}
                className="input input-bordered"
                required
              />
            </div>

            {/* Name */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Name</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input input-bordered"
                required
              />
            </div>

            {/* Department */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Department</span>
              </label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="input input-bordered"
              />
            </div>

            {/* Mobile */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Mobile</span>
              </label>
              <input
                type="text"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                className="input input-bordered"
              />
            </div>

            {/* Personal Email */}
            <div className="form-control md:col-span-2">
              <label className="label">
                <span className="label-text font-semibold">Personal Email</span>
              </label>
              <input
                type="email"
                name="personalEmail"
                value={formData.personalEmail}
                onChange={handleChange}
                className="input input-bordered"
              />
            </div>

            {/* College Email */}
            <div className="form-control md:col-span-2">
              <label className="label">
                <span className="label-text font-semibold">College Email</span>
              </label>
              <input
                type="email"
                name="collegeEmail"
                value={formData.collegeEmail}
                onChange={handleChange}
                className="input input-bordered"
              />
            </div>
          </div>

          {/* Student Stats */}
          <div className="mt-6 p-4 bg-base-200 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Student Statistics</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total Marks:</span>
                <span className="ml-2 font-semibold">
                  {(student.marks?.efforts || 0) +
                   (student.marks?.presentation || 0) +
                   (student.marks?.assessment || 0) +
                   (student.marks?.assignment || 0)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Attendance:</span>
                <span className="ml-2 font-semibold">{student.attendancePercent || 0}%</span>
              </div>
              <div>
                <span className="text-gray-600">Marks Records:</span>
                <span className="ml-2 font-semibold">{student.marksHistory?.length || 0}</span>
              </div>
              <div>
                <span className="text-gray-600">Attendance Records:</span>
                <span className="ml-2 font-semibold">{student.attendance?.length || 0}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-between">
            <button
              type="button"
              onClick={handleDelete}
              className="btn btn-error"
              disabled={isLoading}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Student
            </button>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-ghost"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Updating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Update Student
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentEditModal;
