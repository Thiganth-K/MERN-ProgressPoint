import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../lib/axios';
import toast from 'react-hot-toast';
import { 
  FiPlus, FiEdit, FiTrash2, FiEye, FiToggleLeft, FiToggleRight,
  FiFileText, FiUsers, FiCheckCircle, FiClock, FiAlertCircle
} from 'react-icons/fi';

const LeadManagementPage = () => {
  const navigate = useNavigate();
  const [infoRequests, setInfoRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [statistics, setStatistics] = useState(null);

  // Helper function to fix Cloudinary URLs for PDFs and documents
  const getCloudinaryFileUrl = (fileUrl, fileType) => {
    if (!fileUrl) return '';
    
    // If it's a PDF or document, ensure it uses /raw/ resource type
    if (fileType && (fileType.includes('pdf') || fileType.includes('document'))) {
      // Replace /image/upload/ with /raw/upload/ for PDFs
      return fileUrl.replace('/image/upload/', '/raw/upload/');
    }
    
    return fileUrl;
  };

  // Form state for creating new request
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    requestType: 'document',
    targetAudience: 'all',
    targetBatches: [],
    targetDepartments: [],
    targetStudents: '',
    dueDate: '',
    priority: 'medium',
    allowedFileTypes: ['pdf', 'jpg', 'jpeg', 'png'],
    maxFileSize: 5
  });

  const [batches, setBatches] = useState([]);
  const departments = ['CSE', 'ECE', 'MECH', 'CIVIL', 'EEE', 'IT', 'AIDS', 'AIML'];

  useEffect(() => {
    fetchInfoRequests();
    fetchStatistics();
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const response = await axios.get('/batches');
      setBatches(response.data || []);
    } catch (error) {
      console.error('Error fetching batches:', error);
      setBatches([]);
    }
  };

  const fetchInfoRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/lead-management/requests');
      setInfoRequests(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching info requests:', error);
      toast.error('Failed to load information requests');
      setInfoRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await axios.get('/lead-management/statistics');
      setStatistics(response.data?.data || null);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setStatistics(null);
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    
    try {
      const requestData = {
        ...formData,
        targetStudents: formData.targetStudents 
          ? formData.targetStudents.split(',').map(s => s.trim()) 
          : []
      };

      await axios.post('/lead-management/requests', requestData);
      toast.success('Information request created successfully');
      setShowCreateModal(false);
      resetForm();
      fetchInfoRequests();
      fetchStatistics();
    } catch (error) {
      console.error('Error creating request:', error);
      toast.error(error.response?.data?.message || 'Failed to create request');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await axios.patch(`/lead-management/requests/${id}/toggle`);
      toast.success('Request status updated');
      fetchInfoRequests();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleDeleteRequest = async (id) => {
    if (!confirm('Are you sure? This will delete the request and all submissions.')) {
      return;
    }

    try {
      await axios.delete(`/lead-management/requests/${id}`);
      toast.success('Request deleted successfully');
      fetchInfoRequests();
      fetchStatistics();
    } catch (error) {
      console.error('Error deleting request:', error);
      toast.error('Failed to delete request');
    }
  };

  const handleViewDetails = async (id) => {
    try {
      const response = await axios.get(`/lead-management/requests/${id}`);
      setSelectedRequest(response.data.data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error fetching request details:', error);
      toast.error('Failed to load request details');
    }
  };

  const handleReviewSubmission = async (submissionId, status, comments) => {
    try {
      await axios.patch(`/lead-management/submissions/${submissionId}/review`, {
        reviewStatus: status,
        reviewComments: comments,
        reviewedBy: 'super_admin'
      });
      toast.success('Submission reviewed successfully');
      handleViewDetails(selectedRequest.request._id);
    } catch (error) {
      console.error('Error reviewing submission:', error);
      toast.error('Failed to review submission');
    }
  };

  const handleFixFileUrls = async () => {
    try {
      const response = await axios.post('/lead-management/fix-file-urls');
      toast.success(response.data.message);
      // Refresh details if modal is open
      if (selectedRequest) {
        handleViewDetails(selectedRequest.request._id);
      }
    } catch (error) {
      console.error('Error fixing file URLs:', error);
      toast.error('Failed to fix file URLs');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      instructions: '',
      requestType: 'document',
      targetAudience: 'all',
      targetBatches: [],
      targetDepartments: [],
      targetStudents: '',
      dueDate: '',
      priority: 'medium',
      allowedFileTypes: ['pdf', 'jpg', 'jpeg', 'png'],
      maxFileSize: 5
    });
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'badge-info',
      medium: 'badge-primary',
      high: 'badge-warning',
      urgent: 'badge-error'
    };
    return colors[priority] || 'badge-ghost';
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'text-yellow-500',
      approved: 'text-green-500',
      rejected: 'text-red-500',
      needs_revision: 'text-orange-500'
    };
    return colors[status] || 'text-gray-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 to-base-300">
      {/* Header with enhanced styling */}
      <div className="navbar bg-base-100 shadow-lg border-b border-base-300">
        <div className="flex-1 px-4">
          <button 
            onClick={() => navigate('/superadmin')} 
            className="btn btn-ghost gap-2 text-lg hover:bg-primary hover:text-primary-content transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Lead Management System
          </button>
        </div>
        <div className="flex-none px-4">
          <div className="flex items-center gap-2">
            <FiFileText className="text-primary text-xl" />
            <span className="text-sm font-semibold text-primary">Super Admin Portal</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Title with icon */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <FiUsers className="text-4xl text-primary" />
            <h1 className="text-4xl font-extrabold text-primary">Lead Management</h1>
          </div>
          <p className="text-base-content opacity-70">Track and manage student information requests</p>
        </div>

        {/* Statistics Cards - Enhanced Design */}
        {statistics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <div className="card bg-transparent border-2 border-primary text-primary hover:shadow-md transition-all hover:scale-105">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold">{statistics.totalRequests}</h2>
                    <p className="text-sm opacity-90">Total Requests</p>
                    <p className="text-xs opacity-75 mt-1">{statistics.activeRequests} active</p>
                  </div>
                  <FiFileText className="text-5xl text-primary opacity-40" />
                </div>
              </div>
            </div>

            <div className="card bg-transparent border-2 border-secondary text-secondary hover:shadow-md transition-all hover:scale-105">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold">{statistics.totalSubmissions}</h2>
                    <p className="text-sm opacity-90">Submissions</p>
                    <p className="text-xs opacity-75 mt-1">Total received</p>
                  </div>
                  <FiUsers className="text-5xl text-secondary opacity-40" />
                </div>
              </div>
            </div>

            <div className="card bg-transparent border-2 border-success text-success hover:shadow-md transition-all hover:scale-105">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold">{statistics.submissionsByStatus?.approved || 0}</h2>
                    <p className="text-sm opacity-90">Approved</p>
                    <p className="text-xs opacity-75 mt-1">Verified & accepted</p>
                  </div>
                  <FiCheckCircle className="text-5xl text-success opacity-40" />
                </div>
              </div>
            </div>

            <div className="card bg-transparent border-2 border-warning text-warning hover:shadow-md transition-all hover:scale-105">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold">{statistics.submissionsByStatus?.pending || 0}</h2>
                    <p className="text-sm opacity-90">Pending</p>
                    <p className="text-xs opacity-75 mt-1">Awaiting review</p>
                  </div>
                  <FiClock className="text-5xl text-warning opacity-40" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Bar - Enhanced */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body py-5 px-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h2 className="text-xl font-bold text-base-content">Information Requests</h2>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={handleFixFileUrls}
                  className="btn btn-outline btn-sm gap-2 hover:btn-secondary flex-1 sm:flex-none"
                  title="Fix file URLs for existing PDF submissions"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Fix URLs
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn btn-primary btn-sm gap-2 shadow-lg hover:shadow-xl transition-all flex-1 sm:flex-none"
                >
                  <FiPlus className="text-lg" />
                  Create New Request
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Requests List - Card Grid */}
        <div className="grid gap-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-base-100 rounded-2xl shadow-xl">
              <span className="loading loading-spinner loading-lg text-primary"></span>
              <p className="mt-4 text-base-content opacity-70">Loading requests...</p>
            </div>
          ) : !infoRequests || infoRequests.length === 0 ? (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body items-center text-center py-16">
                <div className="bg-base-200 rounded-full p-6 mb-4">
                  <FiAlertCircle className="text-6xl text-primary opacity-50" />
                </div>
                <h3 className="text-2xl font-bold text-base-content mb-2">No information requests yet</h3>
                <p className="text-base-content opacity-70 mb-6">Create your first request to start collecting information from students</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn btn-primary gap-2"
                >
                  <FiPlus /> Create Your First Request
                </button>
              </div>
            </div>
          ) : (
            infoRequests.map((request) => (
              <div key={request._id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all border border-base-300 hover:border-primary">
                <div className="card-body">
                  <div className="flex flex-col lg:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="bg-primary bg-opacity-10 p-3 rounded-lg">
                          <FiFileText className="text-2xl text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <h3 className="text-xl font-bold text-base-content">{request.title}</h3>
                            <span className={`badge ${getPriorityColor(request.priority)} badge-lg gap-1`}>
                              {request.priority === 'urgent' && '🔥'}
                              {request.priority === 'high' && '⚡'}
                              {request.priority}
                            </span>
                            {request.isActive ? (
                              <span className="badge badge-success badge-lg gap-1">
                                <span className="w-2 h-2 bg-success-content rounded-full animate-pulse"></span>
                                Active
                              </span>
                            ) : (
                              <span className="badge badge-ghost badge-lg">Inactive</span>
                            )}
                          </div>
                          <p className="text-sm text-base-content opacity-80 mb-4 max-w-3xl">{request.description}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 bg-base-200 p-4 rounded-lg">
                        <div className="flex flex-col">
                          <span className="text-xs text-base-content opacity-60 mb-1">Type</span>
                          <span className="font-semibold text-sm capitalize">{request.requestType}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-base-content opacity-60 mb-1">Target</span>
                          <span className="font-semibold text-sm capitalize">{request.targetAudience}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-base-content opacity-60 mb-1">Students</span>
                          <span className="font-semibold text-sm">{request.totalTargetStudents}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-base-content opacity-60 mb-1">Submissions</span>
                          <div className="flex items-center gap-1 text-sm">
                            <span className="font-semibold text-success">{request.totalSubmissions}</span>
                            <span className="opacity-60">/</span>
                            <span className="font-semibold text-warning">{request.totalPendingSubmissions}</span>
                          </div>
                        </div>
                        {request.dueDate && (
                          <div className="flex flex-col">
                            <span className="text-xs text-base-content opacity-60 mb-1">Due Date</span>
                            <span className="font-semibold text-sm">{new Date(request.dueDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex lg:flex-col gap-2 justify-end">
                      <button
                        onClick={() => handleViewDetails(request._id)}
                        className="btn btn-primary btn-sm gap-2 hover:shadow-lg transition-all"
                        title="View Details"
                      >
                        <FiEye />
                        <span className="hidden sm:inline">View</span>
                      </button>
                      <button
                        onClick={() => handleToggleStatus(request._id)}
                        className={`btn btn-sm gap-2 ${request.isActive ? 'btn-success' : 'btn-ghost'}`}
                        title={request.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {request.isActive ? <FiToggleRight className="text-lg" /> : <FiToggleLeft className="text-lg" />}
                        <span className="hidden sm:inline">{request.isActive ? 'Active' : 'Inactive'}</span>
                      </button>
                      <button
                        onClick={() => handleDeleteRequest(request._id)}
                        className="btn btn-error btn-sm gap-2 hover:shadow-lg transition-all"
                        title="Delete"
                      >
                        <FiTrash2 />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Request Modal - Enhanced Design */}
      {showCreateModal && (
        <dialog open className="modal modal-bottom sm:modal-middle">
          <div className="modal-box max-w-3xl shadow-2xl">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-base-300">
              <div className="bg-primary bg-opacity-10 p-3 rounded-lg">
                <FiPlus className="text-2xl text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-2xl text-base-content">Create New Request</h3>
                <p className="text-sm text-base-content opacity-70">Fill in the details to create an information request</p>
              </div>
            </div>
            <form onSubmit={handleCreateRequest}>
              <div className="grid gap-5">
                {/* Title */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold flex items-center gap-2">
                      <FiFileText className="text-primary" />
                      Title *
                    </span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered input-primary focus:input-primary"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter a clear, descriptive title"
                    required
                  />
                </div>

                {/* Description */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold flex items-center gap-2">
                      <FiEdit className="text-primary" />
                      Description *
                    </span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered textarea-primary focus:textarea-primary h-24"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what information you need from students"
                    required
                  />
                </div>

                {/* Instructions */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold flex items-center gap-2">
                      <FiAlertCircle className="text-info" />
                      Instructions for Students
                    </span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered h-24"
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    placeholder="e.g., Please upload a clear PDF scan of your marksheet..."
                  />
                </div>

                {/* Request Type and Priority */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Request Type</span>
                    </label>
                    <select
                      className="select select-bordered select-primary focus:select-primary"
                      value={formData.requestType}
                      onChange={(e) => setFormData({ ...formData, requestType: e.target.value })}
                    >
                      <option value="marksheet">📄 Marksheet</option>
                      <option value="certificate">🎓 Certificate</option>
                      <option value="document">📋 Document</option>
                      <option value="form">📝 Form</option>
                      <option value="other">📦 Other</option>
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Priority</span>
                    </label>
                    <select
                      className="select select-bordered select-primary focus:select-primary"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    >
                      <option value="low">🟢 Low</option>
                      <option value="medium">🟡 Medium</option>
                      <option value="high">🟠 High</option>
                      <option value="urgent">🔴 Urgent</option>
                    </select>
                  </div>
                </div>

                {/* Target Audience */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold flex items-center gap-2">
                      <FiUsers className="text-primary" />
                      Target Audience
                    </span>
                  </label>
                  <select
                    className="select select-bordered select-primary focus:select-primary"
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  >
                    <option value="all">👥 All Students</option>
                    <option value="batch">🎒 Specific Batches</option>
                    <option value="department">🏢 Specific Departments</option>
                    <option value="specific">👤 Specific Students</option>
                  </select>
                </div>

                {/* Conditional Target Fields */}
                {formData.targetAudience === 'batch' && (
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Select Batches</span>
                      <span className="label-text-alt text-info">Hold Ctrl/Cmd to select multiple</span>
                    </label>
                    <select
                      multiple
                      className="select select-bordered select-primary h-40"
                      value={formData.targetBatches}
                      onChange={(e) => 
                        setFormData({ 
                          ...formData, 
                          targetBatches: Array.from(e.target.selectedOptions, option => option.value)
                        })
                      }
                    >
                      {batches.map(batch => (
                        <option key={batch._id} value={batch._id}>
                          {batch.batchName} ({batch.year})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {formData.targetAudience === 'department' && (
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Select Departments</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-base-200 rounded-lg">
                      {departments.map(dept => (
                        <label key={dept} className="cursor-pointer label gap-2 bg-base-100 p-3 rounded-lg hover:bg-base-300 transition-all">
                          <input
                            type="checkbox"
                            className="checkbox checkbox-primary checkbox-sm"
                            checked={formData.targetDepartments.includes(dept)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  targetDepartments: [...formData.targetDepartments, dept]
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  targetDepartments: formData.targetDepartments.filter(d => d !== dept)
                                });
                              }
                            }}
                          />
                          <span className="label-text font-medium">{dept}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {formData.targetAudience === 'specific' && (
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Student Registration Numbers</span>
                      <span className="label-text-alt text-info">Comma-separated</span>
                    </label>
                    <textarea
                      className="textarea textarea-bordered textarea-primary h-24"
                      value={formData.targetStudents}
                      onChange={(e) => setFormData({ ...formData, targetStudents: e.target.value })}
                      placeholder="e.g., 2021CS001, 2021CS002, 2021CS003"
                    />
                  </div>
                )}

                {/* Due Date and File Size */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold flex items-center gap-2">
                        <FiClock className="text-warning" />
                        Due Date
                      </span>
                    </label>
                    <input
                      type="date"
                      className="input input-bordered input-primary focus:input-primary"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Max File Size (MB)</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      className="input input-bordered input-primary focus:input-primary"
                      value={formData.maxFileSize}
                      onChange={(e) => setFormData({ ...formData, maxFileSize: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-action pt-6 border-t border-base-300 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="btn btn-ghost gap-2"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary gap-2 shadow-lg">
                  <FiCheckCircle />
                  Create Request
                </button>
              </div>
            </form>
          </div>
        </dialog>
      )}

      {/* Details Modal - Enhanced Design */}
      {showDetailsModal && selectedRequest && (
        <dialog open className="modal modal-bottom sm:modal-middle">
          <div className="modal-box max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-base-300">
              <div className="bg-primary bg-opacity-10 p-3 rounded-lg">
                <FiEye className="text-2xl text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-2xl text-base-content">{selectedRequest.request.title}</h3>
                <p className="text-sm text-base-content opacity-70">Request Details and Submissions</p>
              </div>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedRequest(null);
                }}
                className="btn btn-ghost btn-sm btn-circle"
              >
                ✕
              </button>
            </div>
            
            {/* Request Details Card */}
            <div className="card bg-gradient-to-br from-base-200 to-base-300 border-2 border-primary border-opacity-20 mb-6">
              <div className="card-body">
                <div className="flex items-start gap-3 mb-4">
                  <FiFileText className="text-2xl text-primary mt-1" />
                  <div className="flex-1">
                    <h4 className="font-bold text-lg mb-2">Description</h4>
                    <p className="text-base-content opacity-80 mb-4">{selectedRequest.request.description}</p>
                    {selectedRequest.request.instructions && (
                      <>
                        <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                          <FiAlertCircle className="text-info" />
                          Student Instructions
                        </h4>
                        <p className="text-base-content opacity-80 bg-base-100 p-3 rounded-lg">{selectedRequest.request.instructions}</p>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 mt-4">
                  <span className={`badge ${getPriorityColor(selectedRequest.request.priority)} badge-lg gap-1`}>
                    {selectedRequest.request.priority === 'urgent' && '🔥'}
                    {selectedRequest.request.priority === 'high' && '⚡'}
                    Priority: {selectedRequest.request.priority}
                  </span>
                  <span className="badge badge-outline badge-lg">Type: {selectedRequest.request.requestType}</span>
                  <span className="badge badge-outline badge-lg">Target: {selectedRequest.request.targetAudience}</span>
                </div>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="card bg-base-100 shadow-lg border-2 border-base-300">
                <div className="card-body p-4 items-center text-center">
                  <FiUsers className="text-3xl text-primary mb-2" />
                  <div className="stat-value text-2xl">{selectedRequest.stats.total}</div>
                  <div className="text-xs opacity-70">Total Students</div>
                </div>
              </div>
              <div className="card bg-gradient-to-br from-success to-success-focus text-success-content shadow-lg">
                <div className="card-body p-4 items-center text-center">
                  <FiCheckCircle className="text-3xl mb-2" />
                  <div className="stat-value text-2xl">{selectedRequest.stats.submitted}</div>
                  <div className="text-xs opacity-90">Submitted</div>
                </div>
              </div>
              <div className="card bg-gradient-to-br from-warning to-warning-focus text-warning-content shadow-lg">
                <div className="card-body p-4 items-center text-center">
                  <FiClock className="text-3xl mb-2" />
                  <div className="stat-value text-2xl">{selectedRequest.stats.pending}</div>
                  <div className="text-xs opacity-90">Pending</div>
                </div>
              </div>
              <div className="card bg-gradient-to-br from-info to-info-focus text-info-content shadow-lg">
                <div className="card-body p-4 items-center text-center">
                  <FiCheckCircle className="text-3xl mb-2" />
                  <div className="stat-value text-2xl">{selectedRequest.stats.approved}</div>
                  <div className="text-xs opacity-90">Approved</div>
                </div>
              </div>
            </div>

            {/* Submissions Section */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h4 className="font-bold text-xl">Submissions ({selectedRequest.submissions.length})</h4>
              </div>
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {selectedRequest.submissions.length === 0 ? (
                  <div className="card bg-base-100 shadow-lg">
                    <div className="card-body items-center text-center py-12">
                      <FiAlertCircle className="text-5xl text-base-content opacity-30 mb-4" />
                      <p className="text-lg text-base-content opacity-70">No submissions yet</p>
                      <p className="text-sm text-base-content opacity-50">Students will appear here once they submit</p>
                    </div>
                  </div>
                ) : (
                  selectedRequest.submissions.map((submission) => (
                    <div key={submission._id} className="card bg-base-100 shadow-lg border border-base-300 hover:border-primary transition-all">
                      <div className="card-body p-5">
                        <div className="flex flex-col lg:flex-row gap-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="avatar placeholder">
                                <div className="bg-primary text-primary-content rounded-full w-12 h-12">
                                  <span className="text-lg font-bold">{submission.studentName.charAt(0)}</span>
                                </div>
                              </div>
                              <div className="flex-1">
                                <p className="font-bold text-lg">{submission.studentName}</p>
                                <p className="text-sm text-base-content opacity-70">
                                  {submission.studentRegNo} - {submission.studentDepartment}
                                </p>
                                <p className="text-xs text-base-content opacity-60 mt-1 flex items-center gap-1">
                                  <FiClock className="text-primary" />
                                  {new Date(submission.submittedAt).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            
                            <div className="mb-3">
                              <span className={`badge badge-lg gap-2 ${
                                submission.reviewStatus === 'approved' ? 'badge-success' :
                                submission.reviewStatus === 'rejected' ? 'badge-error' :
                                submission.reviewStatus === 'needs_revision' ? 'badge-warning' :
                                'badge-info'
                              }`}>
                                {submission.reviewStatus === 'approved' && <FiCheckCircle />}
                                {submission.reviewStatus === 'rejected' && <FiTrash2 />}
                                {submission.reviewStatus === 'pending' && <FiClock />}
                                Status: {submission.reviewStatus.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                            
                            {submission.comments && (
                              <div className="bg-base-200 p-3 rounded-lg mb-3">
                                <p className="text-sm font-semibold mb-1">Student Comments:</p>
                                <p className="text-sm italic">{submission.comments}</p>
                              </div>
                            )}
                            {submission.reviewComments && (
                              <div className="bg-warning bg-opacity-10 border-l-4 border-warning p-3 rounded">
                                <p className="text-sm font-semibold mb-1 flex items-center gap-2">
                                  <FiAlertCircle className="text-warning" />
                                  Review Comments:
                                </p>
                                <p className="text-sm">{submission.reviewComments}</p>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-row lg:flex-col gap-2 justify-center">
                            <a
                              href={getCloudinaryFileUrl(submission.fileUrl, submission.fileType)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-primary btn-sm gap-2 shadow-lg"
                              onClick={(e) => {
                                const url = getCloudinaryFileUrl(submission.fileUrl, submission.fileType);
                                console.log('Opening file:', url);
                              }}
                            >
                              <FiEye />
                              View File
                            </a>
                            {submission.reviewStatus === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleReviewSubmission(submission._id, 'approved', 'Approved')}
                                  className="btn btn-success btn-sm gap-2"
                                >
                                  <FiCheckCircle />
                                  Approve
                                </button>
                                <button
                                  onClick={() => {
                                    const comments = prompt('Enter rejection reason:');
                                    if (comments) handleReviewSubmission(submission._id, 'rejected', comments);
                                  }}
                                  className="btn btn-error btn-sm gap-2"
                                >
                                  <FiTrash2 />
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="modal-action pt-6 border-t border-base-300">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedRequest(null);
                }}
                className="btn btn-primary gap-2"
              >
                Close
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
};

export default LeadManagementPage;
