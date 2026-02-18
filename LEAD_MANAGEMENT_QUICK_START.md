# 🚀 Lead Management System - Quick Start Guide

## ⚡ Get Started in 5 Minutes!

### Step 1: Setup Cloudinary (2 minutes)

1. Go to https://cloudinary.com/
2. Click **Sign Up for Free**
3. Create an account (it's free!)
4. Once logged in, go to **Dashboard**
5. You'll see three important values:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

6. Open `backend/.env` and update:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

### Step 2: Start Your Servers (1 minute)

```bash
# Double-click start-servers.bat
# OR run manually:

# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Step 3: Test the Feature (2 minutes)

#### As Super Admin:

1. Navigate to http://localhost:5173
2. Login as Super Admin (credentials from .env)
3. Click **Lead Management** card
4. Click **Create New Request**
5. Fill in the form:
   - Title: "Upload Your Profile Photo"
   - Description: "Please upload a professional photo"
   - Type: Document
   - Target: All Students
   - Priority: Medium
6. Click **Create Request**
7. ✅ Request created!

#### As Student:

1. Open a new incognito window (or different browser)
2. Go to http://localhost:5173/student-login
3. Login with a student registration number
4. You'll see a yellow alert: "Action Required! You have 1 pending document request(s)"
5. Scroll to **Document Requests & Submissions** section
6. Click **Upload File** on the request
7. Select a file (JPG, PNG, or PDF)
8. Click **Submit**
9. ✅ File uploaded to Cloudinary!

#### Review Submission (Super Admin):

1. Go back to Super Admin Lead Management page
2. Click **View Details** (eye icon) on your request
3. You'll see the student's submission
4. Click **View File** to see the uploaded document
5. Click **Approve** to approve it
6. ✅ Student will see "APPROVED" status!

---

## 🎯 Common Use Cases

### Use Case 1: Collect 10th Marksheets

```javascript
Title: Upload 10th Standard Marksheet
Description: Please upload a clear PDF scan of your 10th standard marks card
Instructions: 
- Ensure all text is clearly visible
- File should be in PDF format
- Document must be complete (all pages)
Type: Marksheet
Target: All Students
Priority: High
Due Date: One week from now
Max File Size: 5MB
```

### Use Case 2: Department-Specific Certificate

```javascript
Title: Upload Industry Certification
Description: Upload your industry certification (AWS, Azure, Google Cloud, etc.)
Instructions: Only valid certifications will be accepted
Type: Certificate
Target: Specific Departments (select CSE, IT, AIML)
Priority: Medium
```

### Use Case 3: Urgent Document Collection

```javascript
Title: Emergency Contact Form
Description: URGENT - Fill and upload the emergency contact form
Instructions: Download the form from college website, fill it, and upload
Type: Form
Target: All Students
Priority: Urgent
Due Date: Tomorrow
```

---

## 📱 Student Workflow

```
1. Student logs in
   ↓
2. Sees notification badge
   ↓
3. Reads instructions
   ↓
4. Prepares document
   ↓
5. Uploads file
   ↓
6. Waits for review
   ↓
7. Gets approved/rejected notification
   ↓
8. If rejected, resubmits
```

---

## 🔧 Quick Troubleshooting

### Problem: "Failed to upload file"
**Solution:** 
- Check Cloudinary credentials in `.env`
- Restart backend server after updating `.env`
- Verify file size is under the limit

### Problem: "Student can't see request"
**Solution:**
- Verify request is set to "Active" (toggle icon)
- Check target audience settings
- Ensure student is logged in

### Problem: "Upload button not working"
**Solution:**
- Check browser console for errors (F12)
- Clear browser cache
- Check file size and format

---

## 💡 Pro Tips

### For Super Admin:
1. **Use Priority Wisely:** Urgent requests show up prominently
2. **Be Specific:** Clear instructions = less rejections
3. **Set Deadlines:** Students respond better with deadlines
4. **Review Quickly:** Fast feedback keeps students engaged
5. **Target Smartly:** Don't spam all students for batch-specific needs

### For Implementation:
1. **Start Small:** Test with one request and few students first
2. **Monitor Storage:** Cloudinary free tier has 25GB
3. **Regular Cleanup:** Delete old requests to free up storage
4. **Backup Links:** Export submission data periodically
5. **Track Analytics:** Use statistics dashboard to monitor compliance

---

## 📊 Dashboard Metrics Explained

- **Total Requests:** All requests created (active + inactive)
- **Active Requests:** Currently open for submissions
- **Total Submissions:** Files uploaded by students
- **Approved:** Submissions that passed review
- **Pending Review:** Waiting for admin action

---

## 🎨 Customization Quick Tips

### Change File Size Limit
Edit `backend/src/config/cloudinary.js` line 25:
```javascript
fileSize: 20 * 1024 * 1024 // Change to 20MB
```

### Add More File Types
Edit `backend/src/config/cloudinary.js` line 19:
```javascript
allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'xlsx']
```

### Change Priority Colors
Edit `frontend/src/pages/LeadManagementPage.jsx` line 178:
```javascript
const colors = {
  low: 'badge-success',      // Green
  medium: 'badge-primary',   // Blue
  high: 'badge-warning',     // Orange
  urgent: 'badge-error'      // Red
};
```

---

## ✅ Pre-Launch Checklist

Before announcing to students:

- [ ] Cloudinary account is set up and credentials are correct
- [ ] Backend and frontend servers are running
- [ ] Created a test request successfully
- [ ] Tested file upload as a student
- [ ] Tested file review and approval
- [ ] Tested file rejection and resubmission
- [ ] Verified files are visible in Cloudinary dashboard
- [ ] Tested with different file sizes
- [ ] Tested with different file types (PDF, JPG, PNG)
- [ ] Informed HOD/faculty about the new feature
- [ ] Prepared instructions for students

---

## 🆘 Need Help?

**Check the full documentation:** `LEAD_MANAGEMENT_SYSTEM_DOCUMENTATION.md`

**Common Questions:**

Q: Can students upload multiple files?
A: Currently one file per request. They can resubmit if rejected.

Q: Where are files stored?
A: Cloudinary cloud storage (secure and reliable)

Q: Can I edit a request after creating it?
A: Yes, use the PUT endpoint or create a new request

Q: How to delete old requests?
A: Click trash icon - it also deletes all associated files

Q: Is there a file format restriction?
A: Yes - PDF, JPG, JPEG, PNG, DOC, DOCX by default

---

## 🚀 Next Steps

1. ✅ Get Cloudinary setup done
2. ✅ Test with a small group first
3. ✅ Announce to all students
4. ✅ Monitor submissions daily
5. ✅ Provide quick feedback
6. ✅ Export important submissions

---

## 🎉 You're All Set!

The Lead Management System is now ready to use. Start by creating your first document request and watch as students upload their files seamlessly!

**Happy Document Collecting! 📄✨**

---

**Quick Start Version:** 1.0
**Last Updated:** February 17, 2026
