import React, { useState } from 'react';
import api from '../lib/axios';
import AdminLogger from '../lib/adminLogger';
import { FiSearch, FiX, FiUser, FiMail, FiCalendar, FiPercent } from 'react-icons/fi';

const StudentSearchModal = ({ isOpen, onClose }) => {
  const [regNo, setRegNo] = useState('');
  const [student, setStudent] = useState(null);
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!regNo.trim()) {
      setError('Please enter a registration number');
      return;
    }

    setLoading(true);
    setError('');
    setStudent(null);
    setBatch(null);

    try {
      const response = await api.get(`/batches/search/${regNo.trim()}`);
      setStudent(response.data.student);
      setBatch(response.data.batch);
      
      // Log successful search
      AdminLogger.logStudentSearch(regNo.trim());
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Student not found');
      } else {
        setError('An error occurred while searching');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRegNo('');
    setStudent(null);
    setBatch(null);
    setError('');
    onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-base-300">
          <h2 className="text-2xl font-bold text-primary">Search Student</h2>
          <button
            onClick={handleClose}
            className="btn btn-sm btn-circle btn-ghost"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Search Section */}
        <div className="p-6">
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              placeholder="Enter Registration Number"
              className="input input-bordered flex-1"
              value={regNo}
              onChange={(e) => setRegNo(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <>
                  <FiSearch className="w-4 h-4 mr-2" />
                  Search
                </>
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="alert alert-error mb-4">
              <FiX className="w-6 h-6" />
              <span>{error}</span>
            </div>
          )}

          {/* Student Details */}
          {student && batch && (
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <h3 className="card-title text-lg text-primary mb-4">
                  Student Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Basic Information */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-semibold text-base-content/70">Registration Number</label>
                      <p className="font-medium">{student.regNo}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-base-content/70">Name</label>
                      <p className="font-medium">{student.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-base-content/70">Department</label>
                      <p className="font-medium">{student.department || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-base-content/70">Batch</label>
                      <p className="font-medium">{batch.batchName} ({batch.year})</p>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-semibold text-base-content/70">Personal Email</label>
                      <p className="font-medium text-sm">{student.personalEmail || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-base-content/70">College Email</label>
                      <p className="font-medium text-sm">{student.collegeEmail || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-base-content/70">Attendance</label>
                      <p className="font-medium">{student.attendancePercent || 0}%</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-base-content/70">Last Updated</label>
                      <p className="font-medium text-sm">
                        {student.marksLastUpdated 
                          ? new Date(student.marksLastUpdated).toLocaleDateString() 
                          : 'Never'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Marks Section */}
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-secondary mb-3">Academic Performance</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-base-100 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">{student.marks?.efforts || 0}</div>
                      <div className="text-sm font-medium">Efforts</div>
                    </div>
                    <div className="bg-base-100 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">{student.marks?.presentation || 0}</div>
                      <div className="text-sm font-medium">Presentation</div>
                    </div>
                    <div className="bg-base-100 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-600">{student.marks?.assessment || 0}</div>
                      <div className="text-sm font-medium">Assessment</div>
                    </div>
                    <div className="bg-base-100 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-orange-600">{student.marks?.assignment || 0}</div>
                      <div className="text-sm font-medium">Assignment</div>
                    </div>
                  </div>
                </div>

                {/* Total Score */}
                <div className="mt-4 bg-primary/10 p-4 rounded-lg">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">
                      {(student.marks?.efforts || 0) + 
                       (student.marks?.presentation || 0) + 
                       (student.marks?.assessment || 0) + 
                       (student.marks?.assignment || 0)}
                    </div>
                    <div className="text-sm font-medium text-primary">Total Score</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentSearchModal;