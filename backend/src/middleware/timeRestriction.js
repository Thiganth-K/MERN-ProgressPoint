import { isTimeAllowed } from "../controllers/timeRestrictionController.js";

// Middleware to check if current time allows the operation
export const checkTimeRestriction = (type) => {
  return async (req, res, next) => {
    try {
      const result = await isTimeAllowed(type);
      
      if (!result.allowed) {
        return res.status(403).json({
          success: false,
          error: result.message,
          timeRestricted: true
        });
      }
      
      next();
    } catch (error) {
      // If there's an error checking restrictions, allow the operation
      console.warn('Error checking time restriction:', error);
      next();
    }
  };
};

// Specific middleware for attendance operations
export const checkAttendanceTime = checkTimeRestriction('attendance');

// Specific middleware for marks operations
export const checkMarksTime = checkTimeRestriction('marks');