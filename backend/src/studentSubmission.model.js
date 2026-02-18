import mongoose from 'mongoose';

const studentSubmissionSchema = new mongoose.Schema({
  infoRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InfoRequest',
    required: true
  },
  studentRegNo: {
    type: String,
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  studentDepartment: {
    type: String,
    required: true
  },
  studentBatch: {
    type: String,
    required: true
  },
  // File details
  fileUrl: {
    type: String,
    required: true
  },
  filePublicId: {
    type: String,  // Cloudinary public ID for deletion
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,  // in bytes
    required: true
  },
  // Submission details
  submittedAt: {
    type: Date,
    default: Date.now
  },
  comments: {
    type: String,
    default: ''
  },
  // Review status
  reviewStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'needs_revision'],
    default: 'pending'
  },
  reviewedBy: {
    type: String,
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  },
  reviewComments: {
    type: String,
    default: ''
  },
  // Resubmission tracking
  isResubmission: {
    type: Boolean,
    default: false
  },
  previousSubmissionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentSubmission',
    default: null
  }
}, {
  timestamps: true
});

// Indexes for faster queries
studentSubmissionSchema.index({ infoRequestId: 1, studentRegNo: 1 });
studentSubmissionSchema.index({ studentRegNo: 1, submittedAt: -1 });
studentSubmissionSchema.index({ reviewStatus: 1 });

// Compound unique index to prevent duplicate submissions (one active submission per student per request)
studentSubmissionSchema.index(
  { infoRequestId: 1, studentRegNo: 1, reviewStatus: 1 },
  { 
    unique: true,
    partialFilterExpression: { reviewStatus: { $ne: 'rejected' } }
  }
);

const StudentSubmission = mongoose.model('StudentSubmission', studentSubmissionSchema);

export default StudentSubmission;
