import Batch from "../batch.model.js";
import PlacementDoneStudent from "../placementDone.model.js";
import StudentAuth from "../studentAuth.model.js";

// Student login
export const studentLogin = async (req, res) => {
  try {
    const { regNo, password } = req.body;

    if (!regNo || !password) {
      return res.status(400).json({ message: "Registration number and password are required" });
    }

    // Find student auth record
    const studentAuth = await StudentAuth.findOne({ regNo: regNo.toUpperCase() });

    if (!studentAuth) {
      return res.status(401).json({ message: "Invalid registration number or password" });
    }

    if (!studentAuth.isActive) {
      return res.status(403).json({ message: "Your account has been deactivated. Please contact the administrator." });
    }

    // Verify password (plain text comparison - in production, use hashed passwords)
    if (studentAuth.password !== password) {
      return res.status(401).json({ message: "Invalid registration number or password" });
    }

    // Update last login and add to history
    studentAuth.lastLogin = new Date();
    studentAuth.loginHistory.push({
      timestamp: new Date(),
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    });

    // Keep only last 10 login records
    if (studentAuth.loginHistory.length > 10) {
      studentAuth.loginHistory = studentAuth.loginHistory.slice(-10);
    }

    await studentAuth.save();

    res.json({
      message: "Login successful",
      student: {
        regNo: studentAuth.regNo,
        lastLogin: studentAuth.lastLogin
      }
    });
  } catch (error) {
    console.error("Student login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// Get student data
export const getStudentData = async (req, res) => {
  try {
    const { regNo } = req.params;

    if (!regNo) {
      return res.status(400).json({ message: "Registration number is required" });
    }

    const upperRegNo = regNo.toUpperCase();

    // First, check if student is in placement done collection
    let placementStudent = await PlacementDoneStudent.findOne({ regNo: upperRegNo });
    
    if (placementStudent) {
      return res.json({
        source: "placement",
        data: {
          regNo: placementStudent.regNo,
          name: placementStudent.name,
          department: placementStudent.department,
          personalEmail: placementStudent.personalEmail,
          collegeEmail: placementStudent.collegeEmail,
          mobile: placementStudent.mobile,
          marks: placementStudent.marks,
          attendancePercent: placementStudent.attendancePercent,
          placedCompany: placementStudent.placedCompany,
          package: placementStudent.package,
          placementType: placementStudent.placementType,
          additionalOffers: placementStudent.additionalOffers,
          originalBatch: placementStudent.originalBatch,
          year: placementStudent.year,
          movedAt: placementStudent.movedAt
        }
      });
    }

    // If not in placement, search in batches
    const batches = await Batch.find({ "students.regNo": upperRegNo });
    
    if (batches.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Find the student in the batch
    let studentData = null;
    let batchName = null;
    let batchYear = null;

    for (const batch of batches) {
      const student = batch.students.find(s => s.regNo === upperRegNo);
      if (student) {
        studentData = student;
        batchName = batch.batchName;
        batchYear = batch.year;
        break;
      }
    }

    if (!studentData) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Calculate total marks
    const totalMarks = 
      studentData.marks.efforts + 
      studentData.marks.presentation + 
      studentData.marks.assessment + 
      studentData.marks.assignment;

    res.json({
      source: "batch",
      data: {
        regNo: studentData.regNo,
        name: studentData.name,
        department: studentData.department,
        personalEmail: studentData.personalEmail,
        collegeEmail: studentData.collegeEmail,
        mobile: studentData.mobile,
        marks: studentData.marks,
        totalMarks,
        marksLastUpdated: studentData.marksLastUpdated,
        marksHistory: studentData.marksHistory,
        attendance: studentData.attendance,
        attendancePercent: studentData.attendancePercent,
        batch: batchName,
        year: batchYear
      }
    });
  } catch (error) {
    console.error("Get student data error:", error);
    res.status(500).json({ message: "Server error while fetching student data" });
  }
};

// Change student password
export const changeStudentPassword = async (req, res) => {
  try {
    const { regNo } = req.params;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Old password and new password are required" });
    }

    if (newPassword.length < 4) {
      return res.status(400).json({ message: "New password must be at least 4 characters long" });
    }

    const studentAuth = await StudentAuth.findOne({ regNo: regNo.toUpperCase() });

    if (!studentAuth) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Verify old password
    if (studentAuth.password !== oldPassword) {
      return res.status(401).json({ message: "Incorrect old password" });
    }

    // Update password
    studentAuth.password = newPassword;
    await studentAuth.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Server error while changing password" });
  }
};

// Get login history for a student
export const getLoginHistory = async (req, res) => {
  try {
    const { regNo } = req.params;

    const studentAuth = await StudentAuth.findOne({ regNo: regNo.toUpperCase() });

    if (!studentAuth) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({
      regNo: studentAuth.regNo,
      lastLogin: studentAuth.lastLogin,
      loginHistory: studentAuth.loginHistory.slice(-10).reverse() // Latest first
    });
  } catch (error) {
    console.error("Get login history error:", error);
    res.status(500).json({ message: "Server error while fetching login history" });
  }
};

// Create student auth account (for superadmin)
export const createStudentAuth = async (req, res) => {
  try {
    const { regNo, password } = req.body;

    if (!regNo || !password) {
      return res.status(400).json({ message: "Registration number and password are required" });
    }

    // Check if student exists in batches or placement
    const upperRegNo = regNo.toUpperCase();
    const batchStudent = await Batch.findOne({ "students.regNo": upperRegNo });
    const placementStudent = await PlacementDoneStudent.findOne({ regNo: upperRegNo });

    if (!batchStudent && !placementStudent) {
      return res.status(404).json({ message: "Student not found in the system. Please add the student to a batch first." });
    }

    // Check if auth already exists
    const existingAuth = await StudentAuth.findOne({ regNo: upperRegNo });
    if (existingAuth) {
      return res.status(400).json({ message: "Student account already exists" });
    }

    // Create student auth
    const studentAuth = new StudentAuth({
      regNo: upperRegNo,
      password: password
    });

    await studentAuth.save();

    res.status(201).json({
      message: "Student account created successfully",
      student: {
        regNo: studentAuth.regNo,
        isActive: studentAuth.isActive,
        createdAt: studentAuth.createdAt
      }
    });
  } catch (error) {
    console.error("Create student auth error:", error);
    res.status(500).json({ message: "Server error while creating student account" });
  }
};

// Bulk create student auth accounts (for superadmin)
export const bulkCreateStudentAuth = async (req, res) => {
  try {
    const { students } = req.body; // Array of { regNo, password }

    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ message: "Students array is required" });
    }

    const results = {
      created: [],
      skipped: [],
      errors: []
    };

    for (const student of students) {
      try {
        const { regNo, password } = student;

        if (!regNo || !password) {
          results.errors.push({ regNo, reason: "Missing regNo or password" });
          continue;
        }

        const upperRegNo = regNo.toUpperCase();

        // Check if auth already exists
        const existingAuth = await StudentAuth.findOne({ regNo: upperRegNo });
        if (existingAuth) {
          results.skipped.push({ regNo: upperRegNo, reason: "Account already exists" });
          continue;
        }

        // Create student auth
        const studentAuth = new StudentAuth({
          regNo: upperRegNo,
          password: password
        });

        await studentAuth.save();
        results.created.push({ regNo: upperRegNo });
      } catch (error) {
        results.errors.push({ regNo: student.regNo, reason: error.message });
      }
    }

    res.json({
      message: "Bulk creation completed",
      summary: {
        total: students.length,
        created: results.created.length,
        skipped: results.skipped.length,
        errors: results.errors.length
      },
      details: results
    });
  } catch (error) {
    console.error("Bulk create student auth error:", error);
    res.status(500).json({ message: "Server error during bulk creation" });
  }
};

// Update student account status (activate/deactivate)
export const updateStudentStatus = async (req, res) => {
  try {
    const { regNo } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ message: "isActive must be a boolean value" });
    }

    const studentAuth = await StudentAuth.findOne({ regNo: regNo.toUpperCase() });

    if (!studentAuth) {
      return res.status(404).json({ message: "Student account not found" });
    }

    studentAuth.isActive = isActive;
    await studentAuth.save();

    res.json({
      message: `Student account ${isActive ? 'activated' : 'deactivated'} successfully`,
      student: {
        regNo: studentAuth.regNo,
        isActive: studentAuth.isActive
      }
    });
  } catch (error) {
    console.error("Update student status error:", error);
    res.status(500).json({ message: "Server error while updating student status" });
  }
};

// Reset student password (for superadmin)
export const resetStudentPassword = async (req, res) => {
  try {
    const { regNo } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: "New password is required" });
    }

    if (newPassword.length < 4) {
      return res.status(400).json({ message: "Password must be at least 4 characters long" });
    }

    const studentAuth = await StudentAuth.findOne({ regNo: regNo.toUpperCase() });

    if (!studentAuth) {
      return res.status(404).json({ message: "Student account not found" });
    }

    studentAuth.password = newPassword;
    await studentAuth.save();

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error while resetting password" });
  }
};

// Get all student auth accounts (for superadmin)
export const getAllStudentAuth = async (req, res) => {
  try {
    const students = await StudentAuth.find({})
      .select('-password -loginHistory')
      .sort({ regNo: 1 });

    res.json({
      count: students.length,
      students
    });
  } catch (error) {
    console.error("Get all student auth error:", error);
    res.status(500).json({ message: "Server error while fetching student accounts" });
  }
};

// Delete student auth account (for superadmin)
export const deleteStudentAuth = async (req, res) => {
  try {
    const { regNo } = req.params;

    const studentAuth = await StudentAuth.findOneAndDelete({ regNo: regNo.toUpperCase() });

    if (!studentAuth) {
      return res.status(404).json({ message: "Student account not found" });
    }

    res.json({ message: "Student account deleted successfully" });
  } catch (error) {
    console.error("Delete student auth error:", error);
    res.status(500).json({ message: "Server error while deleting student account" });
  }
};

// Update student emails (personal and college)
export const updateStudentEmails = async (req, res) => {
  try {
    const { regNo } = req.params;
    const { personalEmail, collegeEmail } = req.body;

    if (!personalEmail && !collegeEmail) {
      return res.status(400).json({ message: "At least one email field is required" });
    }

    const upperRegNo = regNo.toUpperCase();

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (personalEmail && !emailRegex.test(personalEmail)) {
      return res.status(400).json({ message: "Invalid personal email format" });
    }
    
    if (collegeEmail && !emailRegex.test(collegeEmail)) {
      return res.status(400).json({ message: "Invalid college email format" });
    }

    // Check if student is in placement done collection
    const placementStudent = await PlacementDoneStudent.findOne({ regNo: upperRegNo });
    
    if (placementStudent) {
      // Update placement student emails
      if (personalEmail) placementStudent.personalEmail = personalEmail;
      if (collegeEmail) placementStudent.collegeEmail = collegeEmail;
      
      await placementStudent.save();
      
      return res.json({
        message: "Email addresses updated successfully",
        data: {
          personalEmail: placementStudent.personalEmail,
          collegeEmail: placementStudent.collegeEmail
        }
      });
    }

    // If not in placement, find in batches
    const batch = await Batch.findOne({ "students.regNo": upperRegNo });
    
    if (!batch) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Find and update the student in the batch
    const student = batch.students.find(s => s.regNo === upperRegNo);
    
    if (!student) {
      return res.status(404).json({ message: "Student not found in batch" });
    }

    if (personalEmail) student.personalEmail = personalEmail;
    if (collegeEmail) student.collegeEmail = collegeEmail;
    
    await batch.save();

    res.json({
      message: "Email addresses updated successfully",
      data: {
        personalEmail: student.personalEmail,
        collegeEmail: student.collegeEmail
      }
    });
  } catch (error) {
    console.error("Update student emails error:", error);
    res.status(500).json({ message: "Server error while updating email addresses" });
  }
};
