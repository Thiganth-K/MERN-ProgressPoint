import TimeRestriction from "../timeRestriction.model.js";

// Get all time restrictions
export const getTimeRestrictions = async (req, res) => {
  try {
    const restrictions = await TimeRestriction.find();
    res.json({ success: true, restrictions });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch time restrictions" });
  }
};

// Get specific time restriction by type
export const getTimeRestrictionByType = async (req, res) => {
  try {
    const { type } = req.params;
    const restriction = await TimeRestriction.findOne({ type });
    
    if (!restriction) {
      return res.status(404).json({ success: false, error: "Time restriction not found" });
    }
    
    res.json({ success: true, restriction });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch time restriction" });
  }
};

// Create or update time restriction
export const setTimeRestriction = async (req, res) => {
  try {
    const { type, isEnabled, startTime, endTime, timezone, allowWeekends, allowedDays } = req.body;
    const adminName = req.admin?.adminName || 'System';

    // Validate required fields
    if (!type || !startTime || !endTime) {
      return res.status(400).json({ 
        success: false, 
        error: "Type, start time, and end time are required" 
      });
    }

    // Validate type
    if (!['attendance', 'marks'].includes(type)) {
      return res.status(400).json({ 
        success: false, 
        error: "Type must be either 'attendance' or 'marks'" 
      });
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return res.status(400).json({ 
        success: false, 
        error: "Time must be in HH:MM format" 
      });
    }

    // Check if end time is after start time
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (endMinutes <= startMinutes) {
      return res.status(400).json({ 
        success: false, 
        error: "End time must be after start time" 
      });
    }

    // Update or create restriction
    const restriction = await TimeRestriction.findOneAndUpdate(
      { type },
      {
        type,
        isEnabled: isEnabled ?? false,
        startTime,
        endTime,
        timezone: timezone || 'Asia/Kolkata',
        allowWeekends: allowWeekends ?? true,
        allowedDays: allowedDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        lastUpdatedBy: adminName,
        lastUpdatedAt: new Date()
      },
      { 
        new: true, 
        upsert: true,
        runValidators: true 
      }
    );

    res.json({ 
      success: true, 
      restriction,
      message: `Time restriction for ${type} ${isEnabled ? 'enabled' : 'disabled'} successfully` 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message || "Failed to set time restriction" 
    });
  }
};

// Delete time restriction
export const deleteTimeRestriction = async (req, res) => {
  try {
    const { type } = req.params;
    
    const restriction = await TimeRestriction.findOneAndDelete({ type });
    
    if (!restriction) {
      return res.status(404).json({ success: false, error: "Time restriction not found" });
    }
    
    res.json({ 
      success: true, 
      message: `Time restriction for ${type} deleted successfully` 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to delete time restriction" });
  }
};

// Check if current time is within allowed period
export const checkTimeAccess = async (req, res) => {
  try {
    const { type } = req.params;
    
    const restriction = await TimeRestriction.findOne({ type });
    
    if (!restriction || !restriction.isEnabled) {
      return res.json({ 
        success: true, 
        allowed: true, 
        message: "No time restrictions in place" 
      });
    }

    const result = await isTimeAllowed(type);
    
    res.json({
      success: true,
      allowed: result.allowed,
      message: result.message,
      restriction: {
        startTime: restriction.startTime,
        endTime: restriction.endTime,
        allowedDays: restriction.allowedDays
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to check time access" });
  }
};

// Helper function to check if current time is allowed
export const isTimeAllowed = async (type) => {
  try {
    const restriction = await TimeRestriction.findOne({ type });
    
    if (!restriction || !restriction.isEnabled) {
      return { allowed: true, message: "No restrictions" };
    }

    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-GB', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: restriction.timezone 
    });
    
    const currentDay = now.toLocaleDateString('en-US', { 
      weekday: 'long',
      timeZone: restriction.timezone 
    });

    // Check if current day is allowed
    if (!restriction.allowedDays.includes(currentDay)) {
      return { 
        allowed: false, 
        message: `${type} is not allowed on ${currentDay}` 
      };
    }

    // Check if current time is within allowed period
    const [currentHour, currentMin] = currentTime.split(':').map(Number);
    const [startHour, startMin] = restriction.startTime.split(':').map(Number);
    const [endHour, endMin] = restriction.endTime.split(':').map(Number);

    const currentMinutes = currentHour * 60 + currentMin;
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
      return { allowed: true, message: "Access allowed" };
    } else {
      return { 
        allowed: false, 
        message: `${type} is only allowed between ${restriction.startTime} and ${restriction.endTime}` 
      };
    }
  } catch (error) {
    return { allowed: true, message: "Error checking restrictions" };
  }
};