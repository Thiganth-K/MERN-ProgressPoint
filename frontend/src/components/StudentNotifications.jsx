import { useState, useEffect } from 'react';
import axios from '../lib/axios';
import toast from 'react-hot-toast';
import { FiUpload, FiFile, FiCheckCircle, FiAlertCircle, FiClock, FiX } from 'react-icons/fi';

const StudentNotifications = ({ regNo }) => {
  const [infoRequests, setInfoRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadModal, setUploadModal] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [comments, setComments] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchInfoRequests();
  }, [regNo]);

  const fetchInfoRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/lead-management/student/${regNo}/requests`, {
        headers: {
          'x-student-regno': regNo
        }
      });
      setInfoRequests(response.data.data);
    } catch (error) {
      console.error('Error fetching info requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size should not exceed 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('studentRegNo', regNo);
    formData.append('comments', comments);

    try {
      setUploading(true);
      await axios.post(`/lead-management/student/submit/${uploadModal._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-student-regno': regNo
        }
      });
      
      toast.success('File uploaded successfully!');
      setUploadModal(null);
      setSelectedFile(null);
      setComments('');
      fetchInfoRequests(); // Refresh data
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(error.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
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

  const getStatusIcon = (status) => {
    switch (status.reviewStatus) {
      case 'approved':
        return <FiCheckCircle className="text-success text-xl" />;
      case 'rejected':
        return <FiX className="text-error text-xl" />;
      case 'needs_revision':
        return <FiAlertCircle className="text-warning text-xl" />;
      case 'pending':
        return <FiClock className="text-info text-xl" />;
      default:
        return null;
    }
  };

  const pendingRequests = infoRequests.filter(req => !req.submissionStatus.submitted);
  const submittedRequests = infoRequests.filter(req => req.submissionStatus.submitted);

  if (loading) {
    return (
      <div className="text-center py-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification Badge */}
      {pendingRequests.length > 0 && (
        <div className="alert alert-warning shadow-lg">
          <div className="flex items-center gap-2">
            <FiAlertCircle className="text-2xl" />
            <div>
              <h3 className="font-bold">Action Required!</h3>
              <div className="text-sm">You have {pendingRequests.length} pending document request(s)</div>
            </div>
          </div>
        </div>
      )}

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FiAlertCircle className="text-warning" />
            Pending Submissions ({pendingRequests.length})
          </h3>
          <div className="grid gap-4">
            {pendingRequests.map((request) => (
              <div key={request._id} className="card bg-base-100 shadow-md border-l-4 border-warning">
                <div className="card-body">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="card-title text-lg">{request.title}</h4>
                        <span className={`badge ${getPriorityColor(request.priority)}`}>
                          {request.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{request.description}</p>
                      {request.instructions && (
                        <div className="bg-base-200 p-3 rounded-lg mb-3">
                          <p className="text-sm font-semibold mb-1">📝 Instructions:</p>
                          <p className="text-sm">{request.instructions}</p>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-3 text-sm">
                        <div>
                          <span className="font-semibold">Type:</span> {request.requestType}
                        </div>
                        <div>
                          <span className="font-semibold">Max Size:</span> {request.maxFileSize}MB
                        </div>
                        {request.dueDate && (
                          <div>
                            <span className="font-semibold">Due:</span>{' '}
                            <span className="text-warning font-semibold">
                              {new Date(request.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setUploadModal(request)}
                      className="btn btn-primary gap-2"
                    >
                      <FiUpload /> Upload File
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submitted Requests */}
      {submittedRequests.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FiCheckCircle className="text-success" />
            Your Submissions ({submittedRequests.length})
          </h3>
          <div className="grid gap-4">
            {submittedRequests.map((request) => {
              const submission = request.submissionStatus;
              return (
                <div key={request._id} className="card bg-base-100 shadow-md">
                  <div className="card-body">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(submission)}
                          <h4 className="card-title text-lg">{request.title}</h4>
                          <span className={`badge ${getPriorityColor(request.priority)}`}>
                            {request.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{request.description}</p>
                        
                        <div className="bg-base-200 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <FiFile />
                            <span className="font-semibold">Submission Status:</span>
                            <span className={`badge ${
                              submission.reviewStatus === 'approved' ? 'badge-success' :
                              submission.reviewStatus === 'rejected' ? 'badge-error' :
                              submission.reviewStatus === 'needs_revision' ? 'badge-warning' :
                              'badge-info'
                            }`}>
                              {submission.reviewStatus.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          <div className="text-sm mb-1">
                            <span className="font-semibold">Submitted:</span>{' '}
                            {new Date(submission.submittedAt).toLocaleString()}
                          </div>
                          {submission.reviewComments && (
                            <div className="mt-2 p-2 bg-base-300 rounded">
                              <p className="text-sm font-semibold mb-1">Review Comments:</p>
                              <p className="text-sm">{submission.reviewComments}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <a
                          href={submission.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline"
                        >
                          <FiFile /> View File
                        </a>
                        {submission.reviewStatus === 'rejected' && (
                          <button
                            onClick={() => setUploadModal(request)}
                            className="btn btn-sm btn-warning"
                          >
                            <FiUpload /> Resubmit
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* No Requests */}
      {infoRequests.length === 0 && (
        <div className="text-center py-12 bg-base-100 rounded-lg">
          <FiCheckCircle className="text-6xl mx-auto mb-4 text-gray-400" />
          <p className="text-xl text-gray-500">No document requests at the moment</p>
          <p className="text-gray-400 mt-2">You'll be notified when new requests are created</p>
        </div>
      )}

      {/* Upload Modal */}
      {uploadModal && (
        <dialog open className="modal">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-4">Upload Document</h3>
            <div className="mb-4 bg-base-200 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">{uploadModal.title}</h4>
              <p className="text-sm mb-2">{uploadModal.description}</p>
              {uploadModal.instructions && (
                <div className="mt-2 p-2 bg-base-300 rounded">
                  <p className="text-sm font-semibold mb-1">📝 Instructions:</p>
                  <p className="text-sm">{uploadModal.instructions}</p>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text font-semibold">Select File *</span>
                  <span className="label-text-alt">Max size: {uploadModal.maxFileSize}MB</span>
                </label>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  accept={uploadModal.allowedFileTypes?.map(type => `.${type}`).join(',')}
                  className="file-input file-input-bordered w-full"
                  required
                />
                {selectedFile && (
                  <label className="label">
                    <span className="label-text-alt text-success">
                      Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </label>
                )}
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Comments (Optional)</span>
                </label>
                <textarea
                  className="textarea textarea-bordered h-20"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Any additional information..."
                />
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  onClick={() => {
                    setUploadModal(null);
                    setSelectedFile(null);
                    setComments('');
                  }}
                  className="btn"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={uploading || !selectedFile}
                >
                  {uploading ? (
                    <>
                      <span className="loading loading-spinner"></span>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <FiUpload /> Submit
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => {
              setUploadModal(null);
              setSelectedFile(null);
              setComments('');
            }}>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
};

export default StudentNotifications;
