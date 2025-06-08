import React from 'react'
import NavBar from '../components/NavBar'
const AboutPage = () => {
  return (
    <div>
        <NavBar />
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-200 px-2">
      <h1 className="mb-8 text-3xl sm:text-4xl font-bold text-primary text-center">About Progress Point</h1>
      <section className="bg-base-100 w-full max-w-md px-4 py-6 sm:px-8 rounded-xl shadow-lg">
        <h2 className="mb-6 text-xl sm:text-2xl font-semibold text-secondary text-center">Our Mission</h2>
        <p className="text-base sm:text-lg text-gray-700">
          Progress Point is dedicated to providing a seamless and efficient platform for managing your student's record. Our goal is to help you stay organized and focused on what matters most.
        </p>
      </section>
    </div>
    </div>
  )
}

export default AboutPage