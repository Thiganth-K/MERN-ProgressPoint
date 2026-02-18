import mongoose from 'mongoose';

const infoRequestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  instructions: {
    type: String,
    default: ''
  },
  requestType: {
    type: String,
    enum: ['marksheet', 'certificate', 'document', 'form', 'other'],
    default: 'document'
  },
  targetAudience: {
    type: String,
    enum: ['all', 'batch', 'department', 'specific'],
    default: 'all'
  },
  // For specific targeting
  targetBatches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch'
  }],
  targetDepartments: [{
    type: String
  }],
  targetStudents: [{
    type: String  // Registration numbers
  }],
  dueDate: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  allowedFileTypes: [{
    type: String,
    default: ['pdf', 'jpg', 'jpeg', 'png']
  }],
  maxFileSize: {
    type: Number,
    default: 5  // MB
  },
  createdBy: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  // Statistics
  totalTargetStudents: {
    type: Number,
    default: 0
  },
  totalSubmissions: {
    type: Number,
    default: 0
  },
  totalPendingSubmissions: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for faster queries
infoRequestSchema.index({ isActive: 1, createdAt: -1 });
infoRequestSchema.index({ targetAudience: 1 });

const InfoRequest = mongoose.model('InfoRequest', infoRequestSchema);

export default InfoRequest;
