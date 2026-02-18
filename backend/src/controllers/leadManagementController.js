import InfoRequest from '../infoRequest.model.js';
import StudentSubmission from '../studentSubmission.model.js';
import Batch from '../batch.model.js';
import { deleteFromCloudinary } from '../config/cloudinary.js';

// ============================================================================
// INFO REQUEST MANAGEMENT (Super Admin)
// ============================================================================

// Create a new info request
export const createInfoRequest = async (req, res) => {
  try {
    const {
      title,
      description,
      instructions,
      requestType,
      targetAudience,
      targetBatches,
      targetDepartments,
      targetStudents,
      dueDate,
      allowedFileTypes,
      maxFileSize,
      priority
    } = req.body;

    // Calculate total target students
    let totalTargetStudents = 0;
    
    if (targetAudience === 'all') {
      const batches = await Batch.find();
      totalTargetStudents = batches.reduce((sum, batch) => sum + batch.students.length, 0);
    } else if (targetAudience === 'batch' && targetBatches?.length > 0) {
      const batches = await Batch.find({ _id: { $in: targetBatches } });
      totalTargetStudents = batches.reduce((sum, batch) => sum + batch.students.length, 0);
    } else if (targetAudience === 'department' && targetDepartments?.length > 0) {
      const batches = await Batch.find();
      batches.forEach(batch => {
        batch.students.forEach(student => {
          if (targetDepartments.includes(student.department)) {
            totalTargetStudents++;
          }
        });
      });
    } else if (targetAudience === 'specific' && targetStudents?.length > 0) {
      totalTargetStudents = targetStudents.length;
    }

    const infoRequest = new InfoRequest({
      title,
      description,
      instructions,
      requestType,
      targetAudience,
      targetBatches: targetBatches || [],
      targetDepartments: targetDepartments || [],
      targetStudents: targetStudents || [],
      dueDate,
      allowedFileTypes: allowedFileTypes || ['pdf', 'jpg', 'jpeg', 'png'],
      maxFileSize: maxFileSize || 5,
      priority: priority || 'medium',
      createdBy: req.adminName || 'super_admin',
      totalTargetStudents,
      totalPendingSubmissions: totalTargetStudents
    });

    await infoRequest.save();

    res.status(201).json({
      success: true,
      message: 'Info request created successfully',
      data: infoRequest
    });
  } catch (error) {
    console.error('Error creating info request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create info request',
      error: error.message
    });
  }
};

// Get all info requests (Super Admin)
export const getAllInfoRequests = async (req, res) => {
  try {
    const { status, requestType, priority } = req.query;
    
    const filter = {};
    if (status) filter.isActive = status === 'active';
    if (requestType) filter.requestType = requestType;
    if (priority) filter.priority = priority;

    const infoRequests = await InfoRequest.find(filter)
      .sort({ createdAt: -1 })
      .populate('targetBatches', 'batchName year');

    res.status(200).json({
      success: true,
      count: infoRequests.length,
      data: infoRequests
    });
  } catch (error) {
    console.error('Error fetching info requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch info requests',
      error: error.message
    });
  }
};

// Get single info request with submissions
export const getInfoRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const infoRequest = await InfoRequest.findById(id)
      .populate('targetBatches', 'batchName year');

    if (!infoRequest) {
      return res.status(404).json({
        success: false,
        message: 'Info request not found'
      });
    }

    // Get all submissions for this request
    const submissions = await StudentSubmission.find({ infoRequestId: id })
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        request: infoRequest,
        submissions: submissions,
        stats: {
          total: infoRequest.totalTargetStudents,
          submitted: submissions.length,
          pending: infoRequest.totalPendingSubmissions,
          approved: submissions.filter(s => s.reviewStatus === 'approved').length,
          rejected: submissions.filter(s => s.reviewStatus === 'rejected').length,
          needsRevision: submissions.filter(s => s.reviewStatus === 'needs_revision').length
        }
      }
    });
  } catch (error) {
    console.error('Error fetching info request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch info request',
      error: error.message
    });
  }
};

// Update info request
export const updateInfoRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const infoRequest = await InfoRequest.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!infoRequest) {
      return res.status(404).json({
        success: false,
        message: 'Info request not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Info request updated successfully',
      data: infoRequest
    });
  } catch (error) {
    console.error('Error updating info request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update info request',
      error: error.message
    });
  }
};

// Delete info request
export const deleteInfoRequest = async (req, res) => {
  try {
    const { id } = req.params;

    // Get all submissions for this request
    const submissions = await StudentSubmission.find({ infoRequestId: id });

    // Delete all associated files from Cloudinary
    for (const submission of submissions) {
      try {
        await deleteFromCloudinary(submission.filePublicId);
      } catch (error) {
        console.error('Error deleting file from Cloudinary:', error);
      }
    }

    // Delete all submissions
    await StudentSubmission.deleteMany({ infoRequestId: id });

    // Delete the info request
    const infoRequest = await InfoRequest.findByIdAndDelete(id);

    if (!infoRequest) {
      return res.status(404).json({
        success: false,
        message: 'Info request not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Info request and all associated submissions deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting info request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete info request',
      error: error.message
    });
  }
};

// Toggle info request active status
export const toggleInfoRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const infoRequest = await InfoRequest.findById(id);
    if (!infoRequest) {
      return res.status(404).json({
        success: false,
        message: 'Info request not found'
      });
    }

    infoRequest.isActive = !infoRequest.isActive;
    await infoRequest.save();

    res.status(200).json({
      success: true,
      message: `Info request ${infoRequest.isActive ? 'activated' : 'deactivated'} successfully`,
      data: infoRequest
    });
  } catch (error) {
    console.error('Error toggling info request status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle info request status',
      error: error.message
    });
  }
};

// ============================================================================
// STUDENT SUBMISSION MANAGEMENT
// ============================================================================

// Get info requests for a specific student
export const getStudentInfoRequests = async (req, res) => {
  try {
    const { regNo } = req.params;

    // Find student's batch and department
    let studentBatch = null;
    let studentDepartment = null;
    let studentData = null;

    const batches = await Batch.find();
    for (const batch of batches) {
      const student = batch.students.find(s => s.regNo === regNo);
      if (student) {
        studentBatch = batch._id.toString();
        studentDepartment = student.department;
        studentData = student;
        break;
      }
    }

    if (!studentData) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Find all applicable info requests
    const infoRequests = await InfoRequest.find({
      isActive: true,
      $or: [
        { targetAudience: 'all' },
        { targetAudience: 'batch', targetBatches: studentBatch },
        { targetAudience: 'department', targetDepartments: studentDepartment },
        { targetAudience: 'specific', targetStudents: regNo }
      ]
    }).sort({ priority: -1, createdAt: -1 });

    // Get submissions for this student
    const submissions = await StudentSubmission.find({ studentRegNo: regNo });

    // Combine requests with submission status
    const requestsWithStatus = infoRequests.map(request => {
      const submission = submissions.find(s => s.infoRequestId.toString() === request._id.toString());
      return {
        ...request.toObject(),
        submissionStatus: submission ? {
          submitted: true,
          submittedAt: submission.submittedAt,
          reviewStatus: submission.reviewStatus,
          reviewComments: submission.reviewComments,
          fileUrl: submission.fileUrl
        } : {
          submitted: false
        }
      };
    });

    res.status(200).json({
      success: true,
      count: requestsWithStatus.length,
      data: requestsWithStatus
    });
  } catch (error) {
    console.error('Error fetching student info requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch info requests',
      error: error.message
    });
  }
};

// Submit a file for an info request
export const submitInfoRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { studentRegNo, comments } = req.body;

    console.log('Submit request received:', { requestId, studentRegNo, hasFile: !!req.file });

    if (!req.file) {
      console.error('No file in request');
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    console.log('File details:', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Find the info request
    const infoRequest = await InfoRequest.findById(requestId);
    if (!infoRequest) {
      return res.status(404).json({
        success: false,
        message: 'Info request not found'
      });
    }

    if (!infoRequest.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This info request is no longer active'
      });
    }

    // Find student details
    let studentData = null;
    let studentBatchName = null;

    const batches = await Batch.find();
    for (const batch of batches) {
      const student = batch.students.find(s => s.regNo === studentRegNo);
      if (student) {
        studentData = student;
        studentBatchName = batch.batchName;
        break;
      }
    }

    if (!studentData) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check if student already has a pending/approved submission
    const existingSubmission = await StudentSubmission.findOne({
      infoRequestId: requestId,
      studentRegNo,
      reviewStatus: { $in: ['pending', 'approved'] }
    });

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted for this request. Wait for review or resubmit if rejected.'
      });
    }

    // Fix URL for PDFs and documents (ensure /raw/ resource type)
    let fileUrl = req.file.path;
    if (req.file.mimetype === 'application/pdf' || 
        req.file.mimetype.includes('document') || 
        req.file.mimetype.includes('msword')) {
      // Replace /image/upload/ with /raw/upload/ for proper PDF delivery
      fileUrl = fileUrl.replace('/image/upload/', '/raw/upload/');
    }

    // Create submission
    const submission = new StudentSubmission({
      infoRequestId: requestId,
      studentRegNo,
      studentName: studentData.name,
      studentDepartment: studentData.department,
      studentBatch: studentBatchName,
      fileUrl: fileUrl,
      filePublicId: req.file.filename,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      comments
    });

    await submission.save();
    
    console.log('File uploaded successfully:', {
      originalUrl: req.file.path,
      fixedUrl: fileUrl,
      publicId: req.file.filename,
      mimetype: req.file.mimetype
    });

    // Update info request statistics
    infoRequest.totalSubmissions += 1;
    infoRequest.totalPendingSubmissions -= 1;
    await infoRequest.save();

    res.status(201).json({
      success: true,
      message: 'File submitted successfully',
      data: submission
    });
  } catch (error) {
    console.error('Error submitting file:', error);
    console.error('Error stack:', error.stack);
    
    // Handle specific error types
    let errorMessage = 'Failed to submit file';
    
    if (error.message.includes('Cloudinary')) {
      errorMessage = 'Failed to upload file to cloud storage. Please try again.';
    } else if (error.message.includes('File too large')) {
      errorMessage = 'File size exceeds the maximum allowed size.';
    } else if (error.name === 'ValidationError') {
      errorMessage = 'Invalid data provided.';
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'production' ? undefined : error.message,
      details: process.env.NODE_ENV === 'production' ? undefined : error.stack
    });
  }
};

// Get all submissions for an info request (Super Admin)
export const getSubmissionsByRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { reviewStatus } = req.query;

    const filter = { infoRequestId: requestId };
    if (reviewStatus) filter.reviewStatus = reviewStatus;

    const submissions = await StudentSubmission.find(filter)
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submissions',
      error: error.message
    });
  }
};

// Review a submission (Super Admin)
export const reviewSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { reviewStatus, reviewComments, reviewedBy } = req.body;

    const submission = await StudentSubmission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    submission.reviewStatus = reviewStatus;
    submission.reviewComments = reviewComments || '';
    submission.reviewedBy = reviewedBy;
    submission.reviewedAt = new Date();

    await submission.save();

    res.status(200).json({
      success: true,
      message: 'Submission reviewed successfully',
      data: submission
    });
  } catch (error) {
    console.error('Error reviewing submission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to review submission',
      error: error.message
    });
  }
};

// Delete a submission (Super Admin or Student)
export const deleteSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;

    const submission = await StudentSubmission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Delete file from Cloudinary
    try {
      await deleteFromCloudinary(submission.filePublicId);
    } catch (error) {
      console.error('Error deleting file from Cloudinary:', error);
    }

    // Update info request statistics
    const infoRequest = await InfoRequest.findById(submission.infoRequestId);
    if (infoRequest) {
      infoRequest.totalSubmissions -= 1;
      infoRequest.totalPendingSubmissions += 1;
      await infoRequest.save();
    }

    await StudentSubmission.findByIdAndDelete(submissionId);

    res.status(200).json({
      success: true,
      message: 'Submission deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting submission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete submission',
      error: error.message
    });
  }
};

// Get submission statistics (Super Admin Dashboard)
export const getSubmissionStatistics = async (req, res) => {
  try {
    const totalRequests = await InfoRequest.countDocuments();
    const activeRequests = await InfoRequest.countDocuments({ isActive: true });
    const totalSubmissions = await StudentSubmission.countDocuments();
    
    const submissionsByStatus = await StudentSubmission.aggregate([
      {
        $group: {
          _id: '$reviewStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    const submissionsByRequest = await StudentSubmission.aggregate([
      {
        $group: {
          _id: '$infoRequestId',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'inforequests',
          localField: '_id',
          foreignField: '_id',
          as: 'request'
        }
      },
      {
        $unwind: '$request'
      },
      {
        $project: {
          title: '$request.title',
          count: 1
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalRequests,
        activeRequests,
        totalSubmissions,
        submissionsByStatus: submissionsByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        topRequests: submissionsByRequest
      }
    });
  } catch (error) {
    console.error('Error fetching submission statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Fix existing file URLs (convert /image/ to /raw/ for PDFs and documents)
export const fixFileUrls = async (req, res) => {
  try {
    const submissions = await StudentSubmission.find({});
    let fixedCount = 0;

    for (const submission of submissions) {
      if (submission.fileType && 
          (submission.fileType.includes('pdf') || 
           submission.fileType.includes('document') || 
           submission.fileType.includes('msword')) &&
          submission.fileUrl.includes('/image/upload/')) {
        
        submission.fileUrl = submission.fileUrl.replace('/image/upload/', '/raw/upload/');
        await submission.save();
        fixedCount++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Fixed ${fixedCount} file URLs`,
      data: {
        totalSubmissions: submissions.length,
        fixedCount
      }
    });
  } catch (error) {
    console.error('Error fixing file URLs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fix file URLs',
      error: error.message
    });
  }
};
