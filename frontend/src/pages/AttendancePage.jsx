import React from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';

const AttendancePage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-base-200">
      <NavBar />
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4 py-8">
        <h1 className="text-4xl font-bold text-primary mb-10 mt-6 text-center">Attendance</h1>
        <div className="flex flex-col sm:flex-row gap-8 mb-12">
          {/* Mark Attendance Card */}
          <div
            className="card w-80 bg-base-100 shadow-xl hover:scale-105 transition-transform duration-300 cursor-pointer"
            onClick={() => navigate('/markattendance')}
          >
            <div className="card-body items-center text-center">
              <span className="text-6xl mb-2 animate-bounce">📝</span>
              <h2 className="card-title mb-2 text-xl">Mark Attendance</h2>
              <p className="text-base">Click here to mark today's attendance for your students.</p>
              <button className="btn btn-primary mt-4 w-full text-lg">Mark Now</button>
            </div>
          </div>
          {/* View Attendance Card */}
          <div
            className="card w-80 bg-base-100 shadow-xl hover:scale-105 transition-transform duration-300 cursor-pointer"
            onClick={() => navigate('/viewattendance')}
          >
            <div className="card-body items-center text-center">
              <span className="text-6xl mb-2 animate-pulse">📊</span>
              <h2 className="card-title mb-2 text-xl">View Attendance</h2>
              <p className="text-base">See attendance records and statistics for your students.</p>
              <button className="btn btn-secondary mt-4 w-full text-lg">View Records</button>
            </div>
          </div>
        </div>
        {/* UI Animation Idea: Floating Dots */}
        <div className="relative w-full flex justify-center mt-8">
          <div className="flex gap-3">
            <span className="w-5 h-5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
            <span className="w-5 h-5 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
            <span className="w-5 h-5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;