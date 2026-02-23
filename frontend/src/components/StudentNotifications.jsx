import { useState, useEffect } from 'react';
import axios from '../lib/axios';
import toast from 'react-hot-toast';
import { FiUpload, FiFile, FiCheckCircle, FiAlertCircle, FiClock, FiX, FiEye } from 'react-icons/fi';

const StudentNotifications = ({ regNo }) => {
  const [infoRequests, setInfoRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadModal, setUploadModal] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isImageFile, setIsImageFile] = useState(false);
  const [comments, setComments] = useState('');
  const [uploading, setUploading] = useState(false);
  const [filePreviewModal, setFilePreviewModal] = useState(null); // { url, name, type }

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

      // Revoke previous preview URL to avoid memory leaks
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }

      const isImage = file.type.startsWith('image/');
      setIsImageFile(isImage);

      if (isImage) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        console.log('[File Preview] Image selected:', file.name, '| Type:', file.type, '| Size:', (file.size / 1024 / 1024).toFixed(2) + 'MB');
      } else {
        console.log('[File Preview] Non-image file selected:', file.name, '| Type:', file.type, '| Size:', (file.size / 1024 / 1024).toFixed(2) + 'MB');
      }
    }
  };

  const resetUploadState = () => {
    setUploadModal(null);
    setSelectedFile(null);
    setComments('');
    setIsImageFile(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
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
      console.log('[Upload] Starting upload for:', selectedFile.name, '| Request ID:', uploadModal._id, '| Student:', regNo);
      const response = await axios.post(`/lead-management/student/submit/${uploadModal._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-student-regno': regNo
        }
      });
      console.log('[Upload] ✅ Upload successful! File URL:', response.data?.data?.fileUrl);
      toast.success('File uploaded successfully!');
      resetUploadState();
      fetchInfoRequests(); // Refresh data
    } catch (error) {
      console.error('[Upload] ❌ Upload failed:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  // Helper to fix Cloudinary URL: ensure raw path for PDFs (handle old records with /image/upload/)
  const fixFileUrl = (fileUrl, fileType) => {
    if (!fileUrl || !fileType) return fileUrl || '';
    let url = fileUrl;
    if (fileType.includes('pdf') || fileType.includes('document')) {
      url = url.replace('/image/upload/', '/raw/upload/');
    }
    return url;
  };

  // Open submitted file in an inline preview modal
  const handleViewSubmittedFile = (fileUrl, fileType, fileName) => {
    const fixedUrl = fixFileUrl(fileUrl, fileType || '');
    console.log('[View File] Opening inline preview:', fixedUrl, '| Type:', fileType);
    if (!fixedUrl) { toast.error('File URL not available'); return; }
    setFilePreviewModal({ url: fixedUrl, name: fileName || 'Submitted File', type: fileType || '' });
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
                        <button
                          onClick={() => handleViewSubmittedFile(submission.fileUrl, submission.fileType, submission.fileName)}
                          className="btn btn-sm btn-outline gap-1"
                        >
                          <FiEye /> View File
                        </button>
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
                {/* Image Preview */}
                {selectedFile && isImageFile && previewUrl && (
                  <div className="mt-3">
                    <p className="text-sm font-semibold mb-2 flex items-center gap-1">
                      <FiEye className="text-primary" /> Preview (review before submitting):
                    </p>
                    <div className="relative border-2 border-dashed border-primary rounded-lg overflow-hidden bg-base-200">
                      <img
                        src={previewUrl}
                        alt="File preview"
                        className="max-h-64 w-full object-contain"
                      />
                      <span className="absolute top-2 right-2 badge badge-success text-xs">Ready to upload</span>
                    </div>
                    <p className="text-xs text-success mt-1">✅ Confirm the image looks correct before submitting.</p>
                  </div>
                )}
                {/* Non-image file info */}
                {selectedFile && !isImageFile && (
                  <div className="mt-3 p-3 bg-base-200 rounded-lg flex items-center gap-3">
                    <FiFile className="text-2xl text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">{selectedFile.type} &bull; {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <span className="badge badge-success text-xs flex-shrink-0">Ready to upload</span>
                  </div>
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
                  onClick={resetUploadState}
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
            <button onClick={resetUploadState}>close</button>
          </form>
        </dialog>
      )}

      {/* Inline File Preview Modal */}
      {filePreviewModal && (
        <dialog open className="modal">
          <div className="modal-box w-11/12 max-w-5xl h-[90vh] flex flex-col p-0 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-base-300 bg-base-100 flex-shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <FiFile className="text-primary flex-shrink-0" />
                <span className="font-semibold truncate text-sm">{filePreviewModal.name}</span>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <a
                  href={filePreviewModal.url}
                  download
                  className="btn btn-sm btn-outline gap-1"
                  title="Download file"
                >
                  ⬇ Download
                </a>
                <button
                  onClick={() => setFilePreviewModal(null)}
                  className="btn btn-sm btn-circle btn-ghost"
                >✕</button>
              </div>
            </div>
            {/* Preview */}
            <div className="flex-1 overflow-hidden bg-base-200">
              {filePreviewModal.type.startsWith('image/') ? (
                <div className="w-full h-full flex items-center justify-center p-4">
                  <img
                    src={filePreviewModal.url}
                    alt={filePreviewModal.name}
                    className="max-w-full max-h-full object-contain rounded shadow-lg"
                  />
                </div>
              ) : (
                <iframe
                  src={filePreviewModal.url}
                  title={filePreviewModal.name}
                  className="w-full h-full border-0"
                  allow="fullscreen"
                />
              )}
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setFilePreviewModal(null)}>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
};

export default StudentNotifications;
