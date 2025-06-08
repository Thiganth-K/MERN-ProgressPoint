# MERN-ProgressPoint

**ProgressPoint** is a full-stack MERN (MongoDB, Express, React, Node.js) application designed for teachers and administrators to efficiently manage and track student progress.

## Features

- **Admin Login:** Secure login for admins to manage their own set of students.
- **Student Management:** Each admin can view and manage a unique list of students with registration numbers and marks.
- **Marks Tracking:** Track student performance in Efforts, Presentation, Assessment, and Assignment.
- **Attendance Management:** Mark daily attendance for each student and view attendance records and statistics.
- **Leaderboard:** View a sorted leaderboard of students based on total marks, with attendance percentage as a tiebreaker.
- **Multi-Admin Support:** Each admin has their own login and student set.

## Tech Stack

- **Frontend:** React, Tailwind CSS, DaisyUI, React Router
- **Backend:** Node.js, Express, Mongoose
- **Database:** MongoDB Atlas (cloud)
- **Authentication:** Simple admin login (can be extended for more security)

## Getting Started

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

## Project Structure

- `/backend` — Express API, MongoDB models, and seed scripts
- `/frontend` — React app with pages for login, attendance, leaderboard, etc.

## Purpose

ProgressPoint helps educational institutions and teachers:
- Keep all student records organized in one place
- Easily track and compare student performance and attendance
- Save time on manual record-keeping

---

Feel free to expand this with screenshots, deployment instructions, or contribution guidelines!
signing off - Thiganth