import express from 'express';
import {
  createInfoRequest,
  getAllInfoRequests,
  getInfoRequestById,
  updateInfoRequest,
  deleteInfoRequest,
  toggleInfoRequestStatus,
  getStudentInfoRequests,
  submitInfoRequest,
  getSubmissionsByRequest,
  reviewSubmission,
  deleteSubmission,
  getSubmissionStatistics,
  fixFileUrls
} from '../controllers/leadManagementController.js';
import { superAdminAuth, adminOrSuperAdminAuth, studentAuth } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// ============================================================================
// ADMIN & SUPER ADMIN ROUTES - Info Request Management
// ============================================================================

// Create new info request
router.post('/requests', adminOrSuperAdminAuth, createInfoRequest);

// Get all info requests
router.get('/requests', adminOrSuperAdminAuth, getAllInfoRequests);

// Get single info request with submissions
router.get('/requests/:id', adminOrSuperAdminAuth, getInfoRequestById);

// Update info request
router.put('/requests/:id', adminOrSuperAdminAuth, updateInfoRequest);

// Delete info request
router.delete('/requests/:id', adminOrSuperAdminAuth, deleteInfoRequest);

// Toggle info request active status
router.patch('/requests/:id/toggle', adminOrSuperAdminAuth, toggleInfoRequestStatus);

// Get submissions for a request
router.get('/requests/:requestId/submissions', adminOrSuperAdminAuth, getSubmissionsByRequest);

// Get submission statistics
router.get('/statistics', adminOrSuperAdminAuth, getSubmissionStatistics);

// Fix existing file URLs (utility endpoint)
router.post('/fix-file-urls', superAdminAuth, fixFileUrls);

// Review a submission
router.patch('/submissions/:submissionId/review', adminOrSuperAdminAuth, reviewSubmission);

// Delete a submission
router.delete('/submissions/:submissionId', adminOrSuperAdminAuth, deleteSubmission);

// ============================================================================
// STUDENT ROUTES - View and Submit
// ============================================================================

// Get info requests for a student
router.get('/student/:regNo/requests', studentAuth, getStudentInfoRequests);

// Submit file for an info request
router.post('/student/submit/:requestId', studentAuth, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.error('Multer upload error:', err);
      
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size exceeds the maximum allowed size of 10MB'
        });
      }
      
      if (err.message.includes('Invalid file type')) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      
      // Cloudinary 403 error - Invalid credentials
      if (err.http_code === 403 || err.message.includes('403')) {
        return res.status(500).json({
          success: false,
          message: 'Cloud storage authentication failed. Please contact administrator.',
          error: 'Invalid Cloudinary credentials. Please verify API Key and API Secret in .env file'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Error uploading file',
        error: err.message
      });
    }
    next();
  });
}, submitInfoRequest);

export default router;
