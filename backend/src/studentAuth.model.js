import mongoose from "mongoose";

const studentAuthSchema = new mongoose.Schema({
  regNo: { 
    type: String, 
    required: true, 
    unique: true,
    uppercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  lastLogin: { 
    type: Date, 
    default: null 
  },
  loginHistory: [{
    timestamp: { type: Date, default: Date.now },
    ipAddress: String,
    userAgent: String
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update timestamp on save
studentAuthSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const StudentAuth = mongoose.model("StudentAuth", studentAuthSchema);
export default StudentAuth;
