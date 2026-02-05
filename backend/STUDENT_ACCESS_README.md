# Student Access System

This system allows students to log in with their registration number and view their personal academic data.

## Features

- ✅ **Student Login**: Students can log in using their registration number and password
- ✅ **Personal Dashboard**: View marks, attendance, and personal information
- ✅ **Placement Information**: Placed students can view their placement details
- ✅ **Password Management**: Students can change their password
- ✅ **Login History**: Track login activity
- ✅ **Secure Access**: Each student can only view their own data

## Quick Start

### 1. Create Student Auth Accounts

Before students can log in, you need to create authentication accounts for them:

```bash
# Navigate to backend directory
cd backend

# Run the script to create student accounts
npm run create-student-accounts
```

The script will:
1. Find all students from batches and placement done collection
2. Allow you to choose a password strategy:
   - Option 1: Use Registration Number as password (e.g., REG001)
   - Option 2: Use a custom password for all students
   - Option 3: Use student name as password
3. Create student auth accounts for all students

### 2. Student Login

Students can access the system at:
```
http://localhost:5173/student-login
```

Or click the **"Student Login"** button on the homepage.

## API Endpoints

### Public Endpoints

#### Student Login
```http
POST /api/students/login
Content-Type: application/json

{
  "regNo": "REG001",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "student": {
    "regNo": "REG001",
    "lastLogin": "2026-02-04T10:30:00.000Z"
  }
}
```

### Student Endpoints

#### Get Student Data
```http
GET /api/students/:regNo/data
```

**Response for active student:**
```json
{
  "source": "batch",
  "data": {
    "regNo": "REG001",
    "name": "John Doe",
    "department": "CSE",
    "marks": {
      "efforts": 8,
      "presentation": 7,
      "assessment": 9,
      "assignment": 8
    },
    "totalMarks": 32,
    "attendancePercent": 85.5,
    "attendance": [...],
    "batch": "Batch A",
    "year": 2026
  }
}
```

**Response for placed student:**
```json
{
  "source": "placement",
  "data": {
    "regNo": "REG002",
    "name": "Jane Smith",
    "placedCompany": "Google",
    "package": "25 LPA",
    "placementType": "work",
    "marks": {...},
    "attendancePercent": 92.0
  }
}
```

#### Change Password
```http
POST /api/students/:regNo/change-password
Content-Type: application/json

{
  "oldPassword": "oldpass123",
  "newPassword": "newpass456"
}
```

#### Get Login History
```http
GET /api/students/:regNo/login-history
```

### Super Admin Endpoints

All super admin endpoints require authentication with super admin credentials.

#### Create Single Student Account
```http
POST /api/students/create
Authorization: Super Admin
Content-Type: application/json

{
  "regNo": "REG001",
  "password": "password123"
}
```

#### Bulk Create Student Accounts
```http
POST /api/students/bulk-create
Authorization: Super Admin
Content-Type: application/json

{
  "students": [
    { "regNo": "REG001", "password": "pass1" },
    { "regNo": "REG002", "password": "pass2" }
  ]
}
```

#### Get All Student Accounts
```http
GET /api/students/all
Authorization: Super Admin
```

#### Update Student Account Status
```http
PUT /api/students/:regNo/status
Authorization: Super Admin
Content-Type: application/json

{
  "isActive": false
}
```

#### Reset Student Password
```http
PUT /api/students/:regNo/reset-password
Authorization: Super Admin
Content-Type: application/json

{
  "newPassword": "newpass123"
}
```

#### Delete Student Account
```http
DELETE /api/students/:regNo
Authorization: Super Admin
```

## Database Model

### StudentAuth Model

```javascript
{
  regNo: String (unique, uppercase, required),
  password: String (required),
  isActive: Boolean (default: true),
  lastLogin: Date,
  loginHistory: [
    {
      timestamp: Date,
      ipAddress: String,
      userAgent: String
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

## Frontend Pages

### Student Login Page
- Route: `/student-login`
- Component: `StudentLoginPage.jsx`
- Features:
  - Clean login form
  - Auto-uppercase registration number
  - Error handling
  - Loading states

### Student Dashboard Page
- Route: `/student-dashboard`
- Component: `StudentDashboardPage.jsx`
- Features:
  - Personal information display
  - Marks breakdown with visual cards
  - Attendance table with color-coded status
  - Placement information (if placed)
  - Password change functionality
  - Logout button

## Security Features

1. **Password Protection**: Each student account is password-protected
2. **Account Status**: Accounts can be activated/deactivated by super admin
3. **Login History**: Track all login attempts with IP and user agent
4. **Session Management**: Uses localStorage for session persistence
5. **Data Isolation**: Students can only access their own data

## Usage Examples

### Example 1: Create Accounts for All Students
```bash
cd backend
npm run create-student-accounts
# Select option 1 (Use RegNo as password)
# Confirm: yes
```

### Example 2: Reset a Student's Password
```bash
# Using API
curl -X PUT http://localhost:5001/api/students/REG001/reset-password \
  -H "Content-Type: application/json" \
  -d '{"newPassword": "newpass123"}'
```

### Example 3: Deactivate a Student Account
```bash
# Using API
curl -X PUT http://localhost:5001/api/students/REG001/status \
  -H "Content-Type: application/json" \
  -d '{"isActive": false}'
```

## Best Practices

1. **Initial Setup**:
   - Use registration number as initial password
   - Encourage students to change password on first login

2. **Password Policy**:
   - Minimum 4 characters (can be increased)
   - Students should use unique passwords

3. **Account Management**:
   - Deactivate accounts for graduated students
   - Keep login history for audit purposes
   - Regularly review active accounts

4. **Security**:
   - In production, implement password hashing (bcrypt)
   - Add rate limiting for login attempts
   - Implement JWT tokens for better session management
   - Add CAPTCHA for brute force protection

## Future Enhancements

- [ ] Password hashing with bcrypt
- [ ] JWT-based authentication
- [ ] Email verification
- [ ] Password reset via email
- [ ] Two-factor authentication
- [ ] Mobile app support
- [ ] Real-time notifications
- [ ] Performance analytics
- [ ] Export personal reports

## Troubleshooting

### Issue: Student can't login
**Solution**: 
1. Check if student auth account exists
2. Verify password is correct
3. Check if account is active (`isActive: true`)

### Issue: Student data not showing
**Solution**:
1. Verify student exists in batch or placement collection
2. Check registration number matches exactly (case-sensitive)

### Issue: Password change fails
**Solution**:
1. Verify old password is correct
2. Ensure new password meets minimum length requirement

## Support

For issues or questions, contact the system administrator or IT support team.

---

**⚠️ Important**: This system stores passwords in plain text. For production use, implement proper password hashing using bcrypt or similar libraries.
