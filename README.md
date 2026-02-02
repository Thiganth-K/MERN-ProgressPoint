# 🎓 MERN-ProgressPoint

**ProgressPoint** is a comprehensive, enterprise-grade full-stack MERN (MongoDB, Express, React, Node.js) application designed for educational institutions to efficiently manage student progress, attendance, performance tracking, and placement records with advanced role-based access control.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Role-Based Access Control](#role-based-access-control)
- [Core Features](#core-features)
- [Backend Architecture](#backend-architecture)
- [API Endpoints](#api-endpoints)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Security Features](#security-features)
- [Production Deployment](#production-deployment)

---

## 🌟 Overview

ProgressPoint is a modular student management system that provides:
- **Multi-tier access control** (Super Admin, Admin, Guest)
- **Comprehensive student tracking** (Attendance, Marks, Placement)
- **Advanced data export capabilities** (Excel, JSON)
- **Automated backup and restore** functionality
- **Real-time admin activity logging** and monitoring
- **Time-based access restrictions** for sensitive operations
- **Cross-batch student search** and analytics

---

## 🔐 Role-Based Access Control

### 👑 Super Admin
**Full system control with exclusive privileges:**

#### Administrative Management
- Create, edit, and remove admin accounts
- View comprehensive admin activity logs with filtering
- Monitor all admin actions with timestamp tracking
- Clear admin logs for maintenance

#### Batch & Student Management
- Create, update, and delete student batches
- Assign year groups to batches
- Move students between batches
- Remove students from batches
- Update batch information (name, year)
- View all batches across all admins

#### Time Restriction Controls
- Set time restrictions for attendance marking
- Set time restrictions for marks entry
- Configure FN (Forenoon) and AN (Afternoon) session timings
- Enforce temporal access controls on admin operations

#### Data Management & Export
- Export attendance records to Excel format
- Export student marks with attendance data to Excel
- Export placement records to Excel
- View comprehensive batch statistics and averages
- Access placement done student database

#### Backup & Restore
- Create manual database backups
- Automatic periodic backup system
- Restore from selective backup instances
- View backup history and metadata
- Manage backup retention

#### Data Export/Import System
- Export all MongoDB data to single JSON file
- Import data from JSON with merge or replace options
- Selective collection import (choose specific collections)
- Complete data migration between environments
- Download/upload export files via API
- See [DATA_EXPORT_IMPORT.md](DATA_EXPORT_IMPORT.md) for details

#### Placement Management
- Add students to placement done database
- Edit placement records
- Track multiple offers per student
- Record internship/work placement types
- Manage company package details

### 👨‍🏫 Admin
**Batch-specific management capabilities:**

#### Batch Management
- Create new student batches
- View assigned batches only
- Add students to batches (Reg No, Name, Department, Emails)
- Search students across all batches by registration number
- View detailed student profiles

#### Attendance Management
- Mark daily attendance (Present, Absent, On-Duty)
- Dual session support (FN/AN)
- View attendance records by date and session
- Auto-calculated attendance percentages
- Subject to time restrictions set by Super Admin

#### Marks Management
- Update student marks across four categories:
  - **Efforts** (participation and engagement)
  - **Presentation** (communication and presentation skills)
  - **Assessment** (test and quiz scores)
  - **Assignment** (homework and project scores)
- Bulk mark entry page for efficient updates
- View marks history with timestamps
- Marks last updated tracking
- Subject to time restrictions set by Super Admin

#### Performance Tracking
- View batch-wise leaderboard
- Sorted by total marks with attendance as tiebreaker
- Visual indicators for top 3 performers (trophy icons)
- Real-time performance analytics

#### Personal Activity Logs
- Automatic logging of all actions
- Login/logout tracking
- Attendance marking logs
- Marks update logs
- Batch navigation logs
- Search activity logs

### 🌐 Guest (Public Access)
**Read-only placement information:**

- View placement done students database
- Filter by company, department, year
- Search placed students by registration number
- View placement statistics
- No authentication required for placement visibility

---

## 🎯 Core Features

### 1. Student Management System
**Comprehensive student data tracking:**

- **Student Profile Management**
  - Unique registration number identification
  - Full name and department tracking
  - Personal and college email storage
  - Academic year assignment
  - Original batch tracking

- **Performance Metrics**
  - Four-category marks system (Efforts, Presentation, Assessment, Assignment)
  - Automatic total calculation
  - Marks history with date tracking
  - Last updated timestamp
  - Performance trend analysis

- **Attendance Tracking**
  - Date and session-based records
  - Three status types (Present, Absent, On-Duty)
  - Automatic percentage calculation
  - Session-wise attendance (FN/AN)
  - Historical attendance data

### 2. Batch Management
**Organize students by cohorts:**

- Create and manage multiple batches
- Year-based batch organization
- Move students between batches seamlessly
- Batch-level statistics and averages
- Batch update and deletion capabilities
- Cross-batch student search functionality

### 3. Advanced Attendance System
**Flexible attendance tracking:**

- **Dual Session Support**
  - Forenoon (FN) session tracking
  - Afternoon (AN) session tracking
  - Session-wise status recording

- **Attendance Controls**
  - Time restriction enforcement
  - Date-wise attendance grouping
  - Bulk attendance marking
  - Export attendance to Excel
  - Attendance percentage auto-calculation

### 4. Marks & Performance Tracking
**Multi-dimensional performance evaluation:**

- **Four-Category Assessment**
  - Efforts: Student participation and engagement
  - Presentation: Communication and presentation skills
  - Assessment: Test and quiz performance
  - Assignment: Homework and project completion

- **Performance Analytics**
  - Total marks calculation
  - Batch averages and statistics
  - Leaderboard with ranking
  - Historical marks tracking
  - Export capabilities for reporting

### 5. Placement Management
**Track student placement success:**

- **Placement Records**
  - Company name and package details
  - Placement type (Internship, Internship+Work, Work)
  - Original batch and year tracking
  - Placement date recording

- **Multiple Offers Tracking**
  - Record multiple company offers per student
  - Offer status (Accepted, Rejected, Pending)
  - Package comparison
  - Offer date tracking
  - Additional notes for each offer

- **Placement Analytics**
  - Company-wise placement statistics
  - Package distribution analysis
  - Department-wise placement rates
  - Year-wise placement trends

### 6. Admin Activity Logging
**Comprehensive audit trail:**

- **Logged Actions**
  - Authentication (Login, Logout)
  - Attendance operations (Mark, View, Export)
  - Marks operations (Update, View, Export)
  - Student searches
  - Batch navigation and selection
  - Data export activities
  - Leaderboard access

- **Log Features**
  - Timestamp for each action
  - Action type categorization
  - Detailed metadata storage
  - Admin-wise filtering
  - Date-based sorting
  - Color-coded action types
  - Searchable and filterable logs

### 7. Time Restriction System
**Control when admins can perform sensitive operations:**

- Set specific time windows for attendance marking
- Configure separate restrictions for marks entry
- Session-based timing (FN/AN)
- Prevent unauthorized time-based access
- Super Admin exempt from restrictions

### 8. Backup & Restore System
**Automated data protection:**

- **Automatic Backups**
  - Periodic automated backup creation
  - Timestamp-based backup naming
  - Complete database snapshot

- **Backup Management**
  - Manual backup creation
  - Selective restore from backup instances
  - Backup metadata tracking
  - Backup history viewing
  - JSON-based backup format

- **Backed Up Collections**
  - Admins and their logs
  - All batches with students
  - Placement done records
  - Time restrictions
  - Backup metadata

### 9. Data Export Capabilities
**Excel export for reporting:**

- Export attendance records by batch and date
- Export student marks with attendance data
- Export placement records with company details
- Formatted Excel sheets with headers
- Ready for analysis and reporting

### 10. Search & Discovery
**Advanced search functionality:**

- **Student Search**
  - Cross-batch search by registration number
  - Instant student profile display
  - Complete marks and attendance view
  - Modal-based interface

- **Placement Search**
  - Search placed students by registration number
  - Filter by company, department, year
  - Quick access to placement details

---

## 🏗️ Backend Architecture

### Modular MVC Structure

#### Models (`backend/src/`)
- **admin.model.js** - Admin accounts with activity logs
- **batch.model.js** - Batch and student schema
- **placementDone.model.js** - Placed student records
- **timeRestriction.model.js** - Time-based access controls

#### Controllers (`backend/src/controllers/`)
- **adminController.js** - Admin authentication and log management
- **superAdminController.js** - Super admin operations (CRUD admins)
- **batchController.js** - Batch CRUD operations and statistics
- **attendanceController.js** - Attendance marking and viewing
- **marksController.js** - Marks update and retrieval
- **placementController.js** - Placement record management
- **timeRestrictionController.js** - Time restriction configuration
- **backupController.js** - Backup creation and restoration

#### Middleware (`backend/src/middleware/`)
- **auth.js** - Rate limiting (100 requests/15 min per IP)
- **logging.js** - Automatic action logging for admin activities
- **timeRestriction.js** - Enforce time-based access controls

#### Routes (`backend/src/routes/`)
- **adminRoutes.js** - `/api/admin/*` endpoints
- **superAdminRoutes.js** - `/api/superadmin/*` endpoints
- **batchRoutes.js** - `/api/batches/*` endpoints
- **attendanceRoutes.js** - Attendance-specific batch routes
- **marksRoutes.js** - Marks-specific batch routes
- **placementRoutes.js** - `/api/placement-done/*` endpoints
- **timeRestrictionRoutes.js** - `/api/time-restrictions/*` endpoints
- **backupRoutes.js** - `/api/backup/*` endpoints
- **index.js** - Central router combining all routes

---

## 🔌 API Endpoints

### Admin Routes (`/api/admin`)
```
POST   /login              - Admin authentication
POST   /logout             - Admin logout and log recording
POST   /log-action         - Manual action logging
GET    /logs               - Get admin's activity logs
```

### Super Admin Routes (`/api/superadmin`)
```
POST   /login              - Super admin authentication
GET    /admins             - Get all admin accounts
POST   /admins             - Create new admin account
PUT    /admins/:id         - Update admin account
DELETE /admins/:id         - Delete admin account
GET    /all-logs           - View all admin logs
DELETE /clear-logs         - Clear all admin logs
```

### Batch Routes (`/api/batches`)
```
GET    /                   - Get all batches
POST   /                   - Create new batch
PUT    /:id                - Update batch information
DELETE /:id                - Delete batch
POST   /:id/students       - Add student to batch
DELETE /:id/students/:regNo - Remove student from batch
POST   /move-student       - Move student between batches
GET    /search/:regNo      - Search student by registration number
```

### Attendance Routes (`/api/batches`)
```
POST   /:id/attendance     - Mark attendance for batch
GET    /:id/attendance     - Get attendance records
POST   /export-attendance  - Export attendance to Excel
```

### Marks Routes (`/api/batches`)
```
PUT    /:id/students/:regNo/marks - Update student marks
GET    /:id/students/:regNo/marks - Get student marks
POST   /export-data        - Export marks data to Excel
```

### Placement Routes (`/api/placement-done`)
```
GET    /                   - Get all placed students
POST   /                   - Add student to placement done
PUT    /:id                - Update placement record
DELETE /:id                - Remove placement record
POST   /:id/offers         - Add additional offer to student
PUT    /:id/offers/:offerId - Update offer status
DELETE /:id/offers/:offerId - Remove offer
POST   /export             - Export placement data to Excel
```

### Time Restriction Routes (`/api/time-restrictions`)
```
GET    /                   - Get current time restrictions
PUT    /                   - Update time restrictions
```

### Backup Routes (`/api/backup`)
```
POST   /create             - Create manual backup
GET    /list               - List all backups
POST   /restore            - Restore from backup
```

### Utility Routes
```
GET    /api/batch-averages - Get batch statistics
GET    /api/ping           - Health check endpoint
```

---

##  Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **React Router v6** - Client-side routing
- **Axios** - HTTP client with interceptors
- **Tailwind CSS** - Utility-first CSS framework
- **DaisyUI** - Tailwind component library
- **React Icons** - Icon library (Feather Icons)
- **Vite** - Lightning-fast build tool

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **express-rate-limit** - API rate limiting
- **dotenv** - Environment variable management
- **CORS** - Cross-Origin Resource Sharing

### Development Tools
- **Nodemon** - Auto-restart on file changes
- **ESLint** - Code linting
- **PostCSS** - CSS transformations

---

##  Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB instance
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Thiganth-K/MERN-ProgressPoint.git
   cd MERN-ProgressPoint
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install

   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the `backend` folder:
   ```env
   MONGO_URI=your_mongodb_connection_string
   PORT=5001
   NODE_ENV=development
   ```

4. **Seed the database**
   ```bash
   cd backend
   node src/seed.js
   ```
   This creates:
   - Super admin account (username: superadmin)
   - Sample admin accounts
   - Sample batches with students

5. **Start the development servers**

   **Option 1: Using the batch file (Windows)**
   ```bash
   # From root directory
   start-servers.bat
   ```

   **Option 2: Manual start**
   ```bash
   # Terminal 1: Start backend (from backend folder)
   npm run dev

   # Terminal 2: Start frontend (from frontend folder)
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5001

### Default Credentials
After seeding:
- **Super Admin**: superadmin / super123
- **Admin**: Check seed.js for created admin credentials

---

##  Project Structure

```
MERN-ProgressPoint/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # MongoDB connection
│   │   ├── controllers/             # Business logic
│   │   │   ├── adminController.js
│   │   │   ├── superAdminController.js
│   │   │   ├── batchController.js
│   │   │   ├── attendanceController.js
│   │   │   ├── marksController.js
│   │   │   ├── placementController.js
│   │   │   ├── timeRestrictionController.js
│   │   │   └── backupController.js
│   │   ├── middleware/              # Express middleware
│   │   │   ├── auth.js              # Rate limiting
│   │   │   ├── logging.js           # Action logging
│   │   │   └── timeRestriction.js   # Time-based access
│   │   ├── routes/                  # API routes
│   │   │   ├── index.js             # Route aggregator
│   │   │   ├── adminRoutes.js
│   │   │   ├── superAdminRoutes.js
│   │   │   ├── batchRoutes.js
│   │   │   ├── attendanceRoutes.js
│   │   │   ├── marksRoutes.js
│   │   │   ├── placementRoutes.js
│   │   │   ├── timeRestrictionRoutes.js
│   │   │   └── backupRoutes.js
│   │   ├── admin.model.js           # Admin schema
│   │   ├── batch.model.js           # Batch & student schema
│   │   ├── placementDone.model.js   # Placement schema
│   │   ├── timeRestriction.model.js # Time restriction schema
│   │   ├── server.js                # Main server file
│   │   ├── seed.js                  # Database seeder
│   │   └── backup.js                # Backup utilities
│   ├── backups/                     # Backup storage
│   ├── .env                         # Environment variables
│   ├── package.json
│   └── nodemon.json
│
├── frontend/
│   ├── src/
│   │   ├── components/              # Reusable components
│   │   │   ├── NavBar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── AdminLogsModal.jsx
│   │   │   ├── StudentSearchModal.jsx
│   │   │   └── BackupManager.jsx
│   │   ├── lib/                     # Utilities
│   │   │   ├── axios.js             # Axios configuration
│   │   │   └── adminLogger.js       # Frontend logging utility
│   │   ├── pages/                   # Page components
│   │   │   ├── HomePage.jsx
│   │   │   ├── AdminPage.jsx
│   │   │   ├── SuperAdminPage.jsx
│   │   │   ├── BatchPage.jsx
│   │   │   ├── MarkAttendancePage.jsx
│   │   │   ├── ViewAttendancePage.jsx
│   │   │   ├── MarkEntryPage.jsx
│   │   │   ├── LeaderBoard.jsx
│   │   │   ├── PlacementDonePage.jsx
│   │   │   ├── ManageAdminsPage.jsx
│   │   │   ├── ClientDashboardPage.jsx
│   │   │   └── AboutPage.jsx
│   │   ├── App.jsx                  # Main app component
│   │   ├── main.jsx                 # Entry point
│   │   └── index.css                # Global styles
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── .gitignore
├── package.json                     # Root package.json
├── README.md
└── start-servers.bat                # Windows batch script
```

---

## 🔒 Security Features

### Authentication & Authorization
- Role-based access control (Super Admin, Admin, Guest)
- Session-based authentication
- Password storage (can be enhanced with bcrypt)
- Admin-specific data isolation

### API Security
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Cross-Origin Resource Sharing enabled
- **Input Validation**: Mongoose schema validation
- **Error Handling**: Comprehensive error responses

### Data Protection
- Time-restricted access to sensitive operations
- Admin action logging for accountability
- Automatic backup system for data recovery
- Isolated admin environments (admins can't access others' data)

### Audit Trail
- Complete logging of all admin actions
- Timestamp tracking for all operations
- Metadata storage for detailed audit reports
- Super admin oversight of all activities

---

## 🚀 Production Deployment

### Build Process

1. **Build the project**
   ```bash
   npm run build
   ```
   This will:
   - Install backend dependencies
   - Install frontend dependencies
   - Build optimized frontend for production

2. **Configure environment**
   - Set `NODE_ENV=production` in `.env`
   - Configure production MongoDB URI
   - Set secure environment variables

3. **Start production server**
   ```bash
   npm start
   ```
   - Server runs on port 5001
   - Serves both API and static frontend
   - Optimized for performance

### Deployment Checklist
- [ ] Set production environment variables
- [ ] Configure MongoDB Atlas production cluster
- [ ] Enable MongoDB Atlas IP whitelist
- [ ] Set up SSL/TLS certificates
- [ ] Configure proper CORS origins
- [ ] Implement proper password hashing (bcrypt)
- [ ] Set up monitoring and logging
- [ ] Configure automated backups
- [ ] Test all API endpoints
- [ ] Verify role-based access controls

### Recommended Hosting
- **Frontend & Backend**: Render, Railway, Heroku
- **Database**: MongoDB Atlas (M0 free tier or higher)
- **Static Assets**: CDN (Cloudflare, AWS CloudFront)

---

##  Purpose & Benefits

ProgressPoint empowers educational institutions by:

- **Streamlining Administration**: Automate attendance, marks, and placement tracking
- **Enhancing Accountability**: Complete audit trails of all admin actions
- **Improving Data Security**: Role-based access and automated backups
- **Enabling Analytics**: Export data for comprehensive reporting
- **Saving Time**: Bulk operations and intuitive interfaces
- **Ensuring Accuracy**: Automatic calculations and validation
- **Facilitating Transparency**: Guest access to placement records
- **Supporting Growth**: Scalable architecture for expanding institutions

---

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Thiganth K**
- GitHub: [@Thiganth-K](https://github.com/Thiganth-K)

## 🐛 Issues & Support

For bug reports and feature requests, please visit the [Issues](https://github.com/Thiganth-K/MERN-ProgressPoint/issues) page.

---

**Built with ❤️ using the MERN Stack**

signing off - Thiganth
