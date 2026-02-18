# Lead Management System - Complete Documentation

## Overview

The Lead Management System is a comprehensive document collection and tracking feature that enables super admins to request specific documents (like 10th marksheets, certificates, etc.) from students. Students receive notifications, can upload files to Cloudinary, and track their submission status in real-time.

---

## 🎯 Key Features

### For Super Admin
- ✅ **Create Document Requests** - Request specific documents from students
- ✅ **Target Specific Students** - Send requests to all students, specific batches, departments, or individual students
- ✅ **Track Submissions** - Monitor who has submitted and who hasn't
- ✅ **Review Submissions** - Approve, reject, or request revisions
- ✅ **File Management** - View all submitted files with direct links
- ✅ **Priority System** - Mark requests as Low, Medium, High, or Urgent
- ✅ **Statistics Dashboard** - View submission rates and completion statistics

### For Students
- ✅ **Real-time Notifications** - See pending document requests on dashboard
- ✅ **Upload Files** - Drag and drop file uploads to Cloudinary
- ✅ **Track Submissions** - View submission status (Pending, Approved, Rejected)
- ✅ **Resubmit Files** - If rejected, students can resubmit
- ✅ **View Instructions** - Clear instructions for each document request
- ✅ **Submission History** - See all past submissions and reviews

---

## 🗄️ Database Models

### 1. InfoRequest Model
Located: `backend/src/infoRequest.model.js`

```javascript
{
  title: String,                    // e.g., "Upload 10th Marksheet"
  description: String,              // Detailed description
  instructions: String,             // Instructions for students
  requestType: String,              // marksheet, certificate, document, form, other
  targetAudience: String,           // all, batch, department, specific
  targetBatches: [ObjectId],        // If targeting specific batches
  targetDepartments: [String],      // If targeting specific departments
  targetStudents: [String],         // If targeting specific students (regNos)
  dueDate: Date,                    // Optional due date
  isActive: Boolean,                // Active/Inactive status
  allowedFileTypes: [String],       // pdf, jpg, jpeg, png, etc.
  maxFileSize: Number,              // In MB
  priority: String,                 // low, medium, high, urgent
  createdBy: String,                // Admin who created it
  totalTargetStudents: Number,      // Total students targeted
  totalSubmissions: Number,         // How many submitted
  totalPendingSubmissions: Number   // How many pending
}
```

### 2. StudentSubmission Model
Located: `backend/src/studentSubmission.model.js`

```javascript
{
  infoRequestId: ObjectId,          // Reference to InfoRequest
  studentRegNo: String,
  studentName: String,
  studentDepartment: String,
  studentBatch: String,
  
  // File details
  fileUrl: String,                  // Cloudinary URL
  filePublicId: String,             // Cloudinary public ID (for deletion)
  fileName: String,
  fileType: String,
  fileSize: Number,
  
  // Submission details
  submittedAt: Date,
  comments: String,                 // Student comments
  
  // Review details
  reviewStatus: String,             // pending, approved, rejected, needs_revision
  reviewedBy: String,
  reviewedAt: Date,
  reviewComments: String,
  
  // Resubmission tracking
  isResubmission: Boolean,
  previousSubmissionId: ObjectId
}
```

---

## 🔧 Backend Implementation

### Controllers
Location: `backend/src/controllers/leadManagementController.js`

**Super Admin Functions:**
- `createInfoRequest` - Create new document request
- `getAllInfoRequests` - Get all requests with filters
- `getInfoRequestById` - Get single request with submissions
- `updateInfoRequest` - Update request details
- `deleteInfoRequest` - Delete request (also deletes files from Cloudinary)
- `toggleInfoRequestStatus` - Activate/Deactivate request
- `getSubmissionsByRequest` - Get all submissions for a request
- `reviewSubmission` - Approve/Reject/Request Revision
- `deleteSubmission` - Delete a submission
- `getSubmissionStatistics` - Get dashboard statistics

**Student Functions:**
- `getStudentInfoRequests` - Get all applicable requests for a student
- `submitInfoRequest` - Upload file for a request

### Routes
Location: `backend/src/routes/leadManagementRoutes.js`

**Super Admin Routes:**
```
POST   /api/lead-management/requests                    - Create request
GET    /api/lead-management/requests                    - Get all requests
GET    /api/lead-management/requests/:id                - Get single request
PUT    /api/lead-management/requests/:id                - Update request
DELETE /api/lead-management/requests/:id                - Delete request
PATCH  /api/lead-management/requests/:id/toggle         - Toggle status
GET    /api/lead-management/requests/:requestId/submissions - Get submissions
GET    /api/lead-management/statistics                  - Get statistics
PATCH  /api/lead-management/submissions/:submissionId/review - Review submission
DELETE /api/lead-management/submissions/:submissionId   - Delete submission
```

**Student Routes:**
```
GET    /api/lead-management/student/:regNo/requests     - Get student's requests
POST   /api/lead-management/student/submit/:requestId   - Submit file
```

### Cloudinary Configuration
Location: `backend/src/config/cloudinary.js`

- **Storage Path:** `progresspoint/student-submissions/`
- **Allowed Formats:** JPG, JPEG, PNG, PDF, DOC, DOCX
- **Max File Size:** 10MB (configurable)
- **Auto Quality Optimization:** Yes

---

## 🎨 Frontend Implementation

### Pages

#### 1. LeadManagementPage (Super Admin)
Location: `frontend/src/pages/LeadManagementPage.jsx`

**Features:**
- Statistics Dashboard (Total requests, submissions, approved, pending)
- Create new document requests with comprehensive form
- View all requests with filtering options
- Real-time submission tracking
- Review submissions (Approve/Reject/Request Revision)
- Delete requests and submissions
- Toggle request active status

**UI Components:**
- Statistics Cards
- Request Cards (with priority badges)
- Create Modal (comprehensive form)
- Details Modal (shows all submissions)
- Review buttons for each submission

#### 2. StudentNotifications Component
Location: `frontend/src/components/StudentNotifications.jsx`

**Features:**
- Alert badge showing pending requests count
- Separate sections for pending and submitted requests
- File upload modal with instructions
- Submission status tracking
- Resubmit option for rejected submissions
- View uploaded files

**UI Elements:**
- Warning alert for pending requests
- Request cards with priority badges
- Upload modal with file validation
- Status icons (checkmark, clock, X, alert)
- Review comments display

#### 3. StudentDashboardPage Integration
Location: `frontend/src/pages/StudentDashboardPage.jsx`

Added a new section "Document Requests & Submissions" that displays the StudentNotifications component.

---

## 📝 Usage Guide

### For Super Admin

#### Creating a Document Request

1. Navigate to **Super Admin Dashboard**
2. Click on **Lead Management** card
3. Click **Create New Request** button
4. Fill in the form:
   - **Title:** Clear title (e.g., "Upload 10th Marksheet")
   - **Description:** Detailed description
   - **Instructions:** Clear instructions for students
   - **Request Type:** Select type (marksheet, certificate, etc.)
   - **Priority:** Set priority level
   - **Target Audience:** Choose who receives this request
     - All Students
     - Specific Batches (select from dropdown)
     - Specific Departments (select checkboxes)
     - Specific Students (enter registration numbers)
   - **Due Date:** Optional deadline
   - **Max File Size:** Set limit (default 5MB)
5. Click **Create Request**

#### Reviewing Submissions

1. Click on **View Details** (eye icon) for any request
2. View all submissions in a list
3. For each submission:
   - Click **View File** to see the uploaded document
   - Click **Approve** to approve the submission
   - Click **Reject** and enter reason to reject
4. Student will be notified of the review status

#### Managing Requests

- **Toggle Status:** Click toggle icon to activate/deactivate
- **Delete Request:** Click trash icon (also deletes all files)
- **View Statistics:** See dashboard for overview

### For Students

#### Viewing Notifications

1. Log in to **Student Dashboard**
2. Scroll to **Document Requests & Submissions** section
3. Yellow alert shows count of pending requests
4. View all pending requests with instructions

#### Uploading Documents

1. Click **Upload File** button on any pending request
2. Read the instructions carefully
3. Click **Select File** and choose your document
4. Supported formats: PDF, JPG, JPEG, PNG, DOC, DOCX
5. Maximum file size: As specified in request
6. Add optional comments
7. Click **Submit**
8. File uploads to Cloudinary
9. Confirmation message appears

#### Tracking Submissions

1. Submitted requests appear in "Your Submissions" section
2. Status badges show:
   - ⏰ **Pending** - Waiting for review
   - ✅ **Approved** - Submission accepted
   - ❌ **Rejected** - Needs correction (can resubmit)
   - ⚠️ **Needs Revision** - Modify and resubmit
3. View review comments from admin
4. Click **View File** to see your uploaded document
5. If rejected, click **Resubmit** to upload again

---

## 🔐 Security Features

1. **Authentication:** 
   - Super admin authentication required for creating/managing requests
   - Student authentication required for submitting files

2. **File Validation:**
   - File type validation (only allowed formats)
   - File size validation (configurable max size)
   - Duplicate submission prevention

3. **Access Control:**
   - Students can only view their own applicable requests
   - Students can only submit to active requests
   - Super admin can review any submission

4. **Data Protection:**
   - Files stored securely in Cloudinary
   - Automatic file deletion when request is deleted
   - Unique file identifiers prevent conflicts

---

## 🚀 Setup Instructions

### 1. Environment Variables

Add to `backend/.env`:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Get Cloudinary credentials:**
1. Go to https://cloudinary.com/
2. Sign up for a free account
3. Go to Dashboard
4. Copy Cloud Name, API Key, and API Secret
5. Paste them into `.env` file

### 2. Installation

Already installed automatically:
```bash
cd backend
npm install cloudinary multer-storage-cloudinary
```

### 3. Database

No manual setup needed. MongoDB models are automatically created on first use.

---

## 📊 API Examples

### Create Request (Super Admin)

```javascript
POST /api/lead-management/requests
Content-Type: application/json

{
  "title": "Upload 10th Mark Sheet",
  "description": "Please upload a clear scan of your 10th standard mark sheet",
  "instructions": "Ensure the document is clearly visible and in PDF format",
  "requestType": "marksheet",
  "targetAudience": "department",
  "targetDepartments": ["CSE", "IT"],
  "priority": "high",
  "dueDate": "2026-03-15",
  "maxFileSize": 5
}
```

### Submit File (Student)

```javascript
POST /api/lead-management/student/submit/:requestId
Content-Type: multipart/form-data

{
  file: <File>,
  studentRegNo: "2021CS001",
  comments: "10th marksheet - 95% aggregate"
}
```

### Review Submission (Super Admin)

```javascript
PATCH /api/lead-management/submissions/:submissionId/review
Content-Type: application/json

{
  "reviewStatus": "approved",
  "reviewComments": "Clear and valid document. Approved!",
  "reviewedBy": "super_admin"
}
```

---

## 🎨 UI Screenshots Reference

### Super Admin Dashboard
- **Statistics Cards:** Total requests, submissions, approved, pending
- **Request List:** Cards showing all requests with action buttons
- **Create Modal:** Comprehensive form with all options
- **Details Modal:** Show submissions with review buttons

### Student Dashboard
- **Alert Badge:** Yellow warning with count of pending requests
- **Pending Requests:** Cards with upload buttons
- **Submitted Requests:** Cards with status badges and view links
- **Upload Modal:** File selection with instructions

---

## 🔧 Customization Options

### Modify Allowed File Types

Edit `backend/src/config/cloudinary.js`:

```javascript
allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'xlsx']
```

### Change Max File Size

Edit `backend/src/config/cloudinary.js`:

```javascript
limits: {
  fileSize: 20 * 1024 * 1024 // 20MB
}
```

### Add New Request Types

Edit `backend/src/infoRequest.model.js`:

```javascript
requestType: {
  type: String,
  enum: ['marksheet', 'certificate', 'document', 'form', 'transcript', 'other'],
  default: 'document'
}
```

### Add New Priority Levels

Edit `backend/src/infoRequest.model.js`:

```javascript
priority: {
  type: String,
  enum: ['low', 'medium', 'high', 'urgent', 'critical'],
  default: 'medium'
}
```

---

## 🐛 Troubleshooting

### Files Not Uploading
1. Check Cloudinary credentials in `.env`
2. Verify file size is within limits
3. Check file format is allowed
4. Check browser console for errors

### Students Not Seeing Requests
1. Verify request is set to "Active"
2. Check target audience settings
3. Verify student is in the targeted batch/department
4. Check student is logged in with correct regNo

### Review Status Not Updating
1. Refresh the page
2. Check browser console for errors
3. Verify super admin is authenticated
4. Check backend logs for errors

---

## 📈 Future Enhancements

Potential features for future updates:

1. **Email Notifications** - Send email alerts to students
2. **SMS Notifications** - SMS alerts for urgent requests
3. **Bulk Upload** - Super admin bulk upload feature
4. **Analytics Dashboard** - Detailed charts and graphs
5. **Export Reports** - Export submission reports to Excel
6. **Template Requests** - Save and reuse request templates
7. **Automated Reminders** - Send reminders for pending submissions
8. **Mobile App Integration** - Mobile notifications
9. **Document Verification** - AI-powered document validation
10. **Multi-language Support** - Support for multiple languages

---

## 📞 Support

For issues or questions:
1. Check this documentation first
2. Review error messages in browser console
3. Check backend logs
4. Verify all environment variables are set correctly
5. Ensure Cloudinary account is active and has storage available

---

## ✅ Testing Checklist

Before going to production:

- [ ] Cloudinary credentials configured correctly
- [ ] Test creating a request (all target audiences)
- [ ] Test student can see notifications
- [ ] Test file upload (various file types)
- [ ] Test file size validation
- [ ] Test submission review (approve/reject)
- [ ] Test resubmission after rejection
- [ ] Test file viewing/downloading
- [ ] Test request deletion (verify files deleted from Cloudinary)
- [ ] Test statistics dashboard
- [ ] Test with multiple students simultaneously
- [ ] Test with large files (close to limit)
- [ ] Test inactive request (student shouldn't see it)

---

## 📄 License

Part of MERN-ProgressPoint application
© 2026 ProgressPoint

---

**Documentation Version:** 1.0
**Last Updated:** February 17, 2026
**Author:** GitHub Copilot + Thiganth-K
