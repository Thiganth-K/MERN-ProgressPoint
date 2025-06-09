import React from 'react'
import NavBar from '../components/NavBar'

const AboutPage = () => {
  return (
    <div>
      <NavBar />
      <div className="min-h-screen flex flex-col items-center justify-center bg-base-200 px-2 mb-14">
        <h1 className="mb-8 text-3xl sm:text-4xl font-bold text-primary text-center">
          About Progress Point
        </h1>
        <section className="bg-base-100 w-full max-w-md px-4 py-6 sm:px-8 rounded-xl shadow-lg flex flex-col gap-6">
          <div className="flex flex-col items-center">
            <img
              src="https://img.icons8.com/color/96/000000/classroom.png"
              alt="Progress Point Logo"
              className="mb-4"
            />
            <h2 className="text-xl sm:text-2xl font-semibold text-secondary text-center mb-2">
              Empowering Placement Training
            </h2>
          </div>
          <p className="text-base sm:text-lg text-gray-700 text-justify">
            <span className="font-semibold text-primary">Progress Point</span> is a
            specialized digital platform developed by the Department of Information
            Technology at Sona College of Technology, Salem. Its primary purpose is to
            assist staff in efficiently conducting and managing placement training
            sessions for students.
          </p>
          <ul className="list-disc list-inside text-gray-700 text-base sm:text-lg mb-2">
            <li>
              <span className="font-semibold text-secondary">Attendance Tracking:</span>
              Seamlessly record and monitor student attendance for every training session.
            </li>
            <li>
              <span className="font-semibold text-secondary">Performance Management:</span>
              Enter, update, and analyze marks for various training modules and assessments.
            </li>
            <li>
              <span className="font-semibold text-secondary">Comprehensive Dashboard:</span>
              Instantly view student progress, leaderboards, and attendance statistics.
            </li>
            <li>
              <span className="font-semibold text-secondary">Multi-Admin Support:</span>
              Each staff member can manage their own set of students and sessions securely.
            </li>
          </ul>
          <div className="flex flex-col items-center gap-2">
            <button
              className="btn btn-primary btn-sm"
              onClick={() =>
                window.open(
                  'https://www.sonatech.ac.in/department/information-technology/',
                  '_blank'
                )
              }
            >
              Learn More About IT @ Sona
            </button>
            <span className="text-xs text-gray-500 text-center">
              Developed with pride by the IT Department, Sona College of Technology,
              Salem.
            </span>
          </div>
        </section>
      </div>
    </div>
  )
}

export default AboutPage