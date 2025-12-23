import mongoose from "mongoose";

const timeRestrictionSchema = new mongoose.Schema({
  type: { 
    type: String, 
    required: true,
    enum: ['attendance', 'marks'],
    unique: true 
  },
  isEnabled: { 
    type: Boolean, 
    default: false 
  },
  startTime: { 
    type: String, 
    required: true,
    match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
  },
  endTime: { 
    type: String, 
    required: true,
    match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
  },
  timezone: {
    type: String,
    default: 'Asia/Kolkata'
  },
  allowWeekends: {
    type: Boolean,
    default: true
  },
  allowedDays: [{
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  }],
  lastUpdatedBy: {
    type: String,
    required: true
  },
  lastUpdatedAt: {
    type: Date,
    default: Date.now
  }
});

// Default allowed days (all days)
timeRestrictionSchema.pre('save', function(next) {
  if (!this.allowedDays || this.allowedDays.length === 0) {
    this.allowedDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  }
  next();
});

const TimeRestriction = mongoose.model("TimeRestriction", timeRestrictionSchema);
export default TimeRestriction;