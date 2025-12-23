import Admin from "../admin.model.js";

// Middleware to log admin actions
export const logAdminAction = (actionType, getDetails = null) => {
  return async (req, res, next) => {
    // Store original json and end methods
    const originalJson = res.json;
    const originalEnd = res.end;

    // Override res.json to capture successful responses
    res.json = function(data) {
      // Only log if the action was successful
      if (res.statusCode >= 200 && res.statusCode < 300) {
        logAction(req, actionType, getDetails);
      }
      return originalJson.call(this, data);
    };

    // Override res.end for non-JSON responses
    res.end = function(chunk, encoding) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        logAction(req, actionType, getDetails);
      }
      return originalEnd.call(this, chunk, encoding);
    };

    next();
  };
};

// Helper function to actually log the action
const logAction = async (req, actionType, getDetails) => {
  try {
    // Get admin name from various possible sources
    const adminName = req.headers['x-admin-name'] || 
                     req.body.adminName || 
                     req.query.adminName ||
                     req.headers.authorization?.split(' ')[1]; // if using token

    if (!adminName) return; // Skip logging if no admin identified

    // Get additional details if provided
    let details = {};
    if (typeof getDetails === 'function') {
      details = getDetails(req);
    }

    // Find admin and add log entry
    const admin = await Admin.findOne({ adminName });
    if (admin) {
      admin.logs.push({
        type: actionType,
        timestamp: new Date(),
        details: {
          batchName: req.params.batchName || req.body.batchName || details.batchName,
          studentRegNo: req.params.regNo || req.body.regNo || details.studentRegNo,
          action: details.action || req.method + ' ' + req.originalUrl,
          metadata: {
            userAgent: req.headers['user-agent'],
            ip: req.ip || req.connection.remoteAddress,
            params: req.params,
            query: req.query,
            ...details.metadata
          }
        }
      });
      await admin.save();
    }
  } catch (error) {
    console.error('Error logging admin action:', error);
    // Don't fail the request if logging fails
  }
};

// Helper function to manually log an action (for use in controllers)
export const manualLogAction = async (adminName, actionType, details = {}) => {
  try {
    const admin = await Admin.findOne({ adminName });
    if (admin) {
      admin.logs.push({
        type: actionType,
        timestamp: new Date(),
        details
      });
      await admin.save();
    }
  } catch (error) {
    console.error('Error manually logging admin action:', error);
  }
};