# MERN-ProgressPoint

**ProgressPoint** is a full-stack MERN (MongoDB, Express, React, Node.js) application designed for teachers and administrators to efficiently manage and track student progress.

---

##  Features

- **Admin & SuperAdmin Login:**  
  Secure login for admins and a superadmin to manage the platform.

- **Batch Management:**  
  - Create, view, and remove student batches.
  - Move students between batches.
  - Responsive batch and student tables for all devices.

- **Student Management:**  
  - Add students to batches (with registration number and name).
  - Remove students from batches.
  - View all students in a batch with marks and attendance.

- **Marks Tracking:**  
  - Track and update student performance in Efforts, Presentation, Assessment, and Assignment.
  - Mark entry page for bulk updating marks.

- **Attendance Management:**  
  - Mark daily attendance for each student (Present, Absent, On-Duty).
  - View attendance records grouped by date.
  - Attendance percentage auto-calculated for each student.

- **Leaderboard:**  
  - View a sorted leaderboard of students based on total marks.
  - Attendance percentage used as a tiebreaker.
  - Trophy icons for top 3 students.

- **Multi-Admin Support:**  
  - Each admin manages their own set of students and batches.
  - Superadmin can add, edit, and remove admins.

- **Admin Logs:**  
  - Login and logout logs for each admin.
  - Superadmin can view and clear all logs.

- **Responsive UI:**  
  - Mobile, tablet, and desktop friendly.
  - Built with Tailwind CSS and DaisyUI.

- **Security:**  
  - Simple authentication for admins and superadmin.
  - Passwords stored securely in the database.

- **Time Restriction:**
  - The super admin can able to restrict the admin controllers by fixing the in and out of the admin activity.
  - The time restrictions include for the Attendance management system and for the Mark management system too.

- **Backup and Restore Feature:**
  - The superadmin can able to create the baackup in the main mongo db.
  - Then the superadmin can able to restore the backup by selective instance.

- **Guest Access:**
  - The users can login to this application without an account as a guest.
  - The Guest access offers the guest to view the Placement done students data.

- **Export Feature:**     
  - The superadmin  can able to export thte attendance record in the Excel format.
  - The Superadmin can able to export the student marks data with the attendance performance in the excel format.
  - The superadmin can able to export the placement done students data in the excel format.


---

##  Tech Stack

- **Frontend:** React, Tailwind CSS, DaisyUI, React Router, Axios
- **Backend:** Node.js, Express, Mongoose
- **Database:** MongoDB Atlas (cloud)
- **Authentication:** Simple admin login (can be extended for more security)

---

##  Getting Started

1. **Clone the repository**
2. **Set up your environment variables**
   - Create a `.env` file in the `backend` folder with your MongoDB URI:
     ```
     MONGO_URI=your_mongodb_connection_string
     ```
3. **Seed the database**
   - Run `node src/seed.js` in the `backend` folder to create sample admins and students.
4. **Start the backend**
   - `npm run dev` in the `backend` folder.
5. **Start the frontend**
   - `npm run dev` in the `frontend` folder.

---

##  Project Structure

- `/backend` — Express API, MongoDB models, and seed scripts
- `/frontend` — React app with pages for login, attendance, leaderboard, etc.

---

##  Purpose

ProgressPoint helps educational institutions and teachers:
- Keep all student records organized in one place
- Easily track and compare student performance and attendance
- Save time on manual record-keeping

## Production Notes

Feed the .env ccredentials to the server side service

  - Run the following cmd to build the project :-> `npm run build`
  - Check the build logs and clear the unwanted errors, leave the chuncks if it cause an issue then reduce teh chunks
  - To start this project now run this cmd to startt the service in the production environment: `npm run start`
  - This starts the service in the production mode and the service continues in the port of `5001`
---

signing off - Thiganth
