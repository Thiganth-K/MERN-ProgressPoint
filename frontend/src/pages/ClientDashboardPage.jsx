import React, { useEffect, useState } from "react";
import api from "../lib/axios";
import { useNavigate } from "react-router-dom";

const ClientDashboardPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalStudent, setModalStudent] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const studentsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get("/placement-done");
      setStudents(res.data.students || []);
    } catch {
      setStudents([]);
    }
    setLoading(false);
  };

  // Modal close handler
  const closeModal = () => setModalStudent(null);

  // Get unique companies for filter options
  const uniqueCompanies = [...new Set(students.map(s => s.placedCompany).filter(Boolean))].sort();

  // Filter students based on search term and selected companies
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.regNo?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCompany = selectedCompanies.length === 0 || 
                          selectedCompanies.includes(student.placedCompany);
    
    return matchesSearch && matchesCompany;
  });

  // Handle company filter change
  const handleCompanyFilter = (company) => {
    setSelectedCompanies(prev => 
      prev.includes(company) 
        ? prev.filter(c => c !== company)
        : [...prev, company]
    );
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedCompanies([]);
    setSearchTerm("");
  };

  // Pagination calculations (using filtered students)
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  const startIndex = (currentPage - 1) * studentsPerPage;
  const endIndex = startIndex + studentsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);

  // Reset to first page when search term or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCompanies]);

  // Pagination handlers
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex flex-col items-center py-8 px-2">
      <div className="w-full max-w-6xl flex flex-col items-center">
        
        {/* Header */}
        <div className="w-full flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex flex-col items-center sm:items-start">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary tracking-tight">
              Student Placement Dashboard
            </h1>
            <p className="text-sm text-gray-600 mt-1">Public view of placement statistics</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {students.length > 0 && (
              <div className="text-sm text-gray-600 font-medium">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredStudents.length)} of {filteredStudents.length} students
                {(searchTerm || selectedCompanies.length > 0) && ` (filtered from ${students.length} total)`}
              </div>
            )}
            <button
              className="btn btn-outline btn-primary font-semibold flex items-center px-4 py-2 text-base rounded-lg shadow hover:scale-105 transition-transform"
              onClick={() => navigate("/")}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Login
            </button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="w-full max-w-4xl mb-6 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search by name or reg number..."
                className="input input-bordered w-full pl-10 pr-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth={2} 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchTerm && (
                <button
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setSearchTerm("")}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Filter Toggle Button */}
            <button
              className="btn btn-outline btn-primary font-semibold flex items-center gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
              {selectedCompanies.length > 0 && (
                <span className="badge badge-primary badge-sm">{selectedCompanies.length}</span>
              )}
            </button>

            {/* Clear Filters Button */}
            {(searchTerm || selectedCompanies.length > 0) && (
              <button
                className="btn btn-ghost btn-sm font-semibold text-error"
                onClick={clearAllFilters}
              >
                Clear All
              </button>
            )}
          </div>

          {/* Company Filters */}
          {showFilters && (
            <div className="bg-base-100 rounded-xl p-4 shadow-lg border border-base-300">
              <h3 className="font-semibold text-lg mb-3 text-primary">Filter by Company</h3>
              {uniqueCompanies.length === 0 ? (
                <p className="text-gray-500 text-sm">No companies available</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-60 overflow-y-auto">
                  {uniqueCompanies.map((company) => {
                    const count = students.filter(s => s.placedCompany === company).length;
                    const isSelected = selectedCompanies.includes(company);
                    return (
                      <button
                        key={company}
                        type="button"
                        onClick={() => handleCompanyFilter(company)}
                        className={`w-full flex items-center justify-between gap-3 p-3 rounded-lg border transition-shadow hover:shadow-sm focus:outline-none ${isSelected ? 'bg-primary text-white border-primary' : 'bg-base-100 border-base-300'}`}
                        aria-pressed={isSelected}
                        title={`${company} — ${count} student${count !== 1 ? 's' : ''}`}
                      >
                        <div className="truncate text-sm font-medium text-left">{company}</div>
                        <div className={`badge ${isSelected ? 'badge-ghost text-white/90 bg-white/20' : 'badge-outline'}`}>{count}</div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="w-full flex justify-center items-center py-16">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : currentStudents.length === 0 ? (
          <div className="w-full text-center text-gray-400 font-semibold py-16">
            {(searchTerm || selectedCompanies.length > 0) ? 
              `No students found matching your filters` : 
              "No placement data available."
            }
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="table table-zebra w-full bg-base-100 rounded-2xl shadow-xl">
              <thead>
                <tr className="border-b-2 border-primary text-primary">
                  <th className="text-center font-bold">S.No</th>
                  <th className="font-bold">Student Name</th>
                  <th className="font-bold">Reg No</th>
                  <th className="font-bold">Company</th>
                  <th className="font-bold">Batch</th>
                  <th className="font-bold">Package</th>
                  <th className="font-bold">Type</th>
                  <th className="text-center font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentStudents.map((s, idx) => (
                  <tr
                    key={s._id || idx}
                    className="hover:bg-base-300 cursor-pointer transition-colors"
                    onClick={() => setModalStudent(s)}
                    tabIndex={0}
                    aria-label={`View details for ${s.name}`}
                  >
                    <td className="text-center font-semibold">{startIndex + idx + 1}</td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-lg font-bold">
                          {s.name?.[0] || '?'}
                        </div>
                        <div className="font-semibold text-primary">{s.name}</div>
                      </div>
                    </td>
                    <td className="font-mono text-sm">{s.regNo}</td>
                    <td className="font-medium">{s.placedCompany}</td>
                    <td className="font-medium">{s.originalBatch}</td>
                    <td className="font-medium">{s.package || '-'}</td>
                    <td className="capitalize font-medium">{s.placementType?.replace("+", " + ") || '-'}</td>
                    <td className="text-center">
                      <button 
                        className="btn btn-primary btn-sm font-semibold"
                        onClick={(e) => {
                          e.stopPropagation();
                          setModalStudent(s);
                        }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {filteredStudents.length > studentsPerPage && (
          <div className="flex flex-col sm:flex-row justify-between items-center w-full max-w-6xl mt-6 gap-4">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                className={`btn btn-outline btn-primary btn-sm font-semibold ${
                  currentPage === 1 ? 'btn-disabled' : ''
                }`}
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
              <button
                className={`btn btn-outline btn-primary btn-sm font-semibold ${
                  currentPage === totalPages ? 'btn-disabled' : ''
                }`}
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
              >
                Next
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal for student details */}
      {modalStudent && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div
            className="bg-base-100 rounded-2xl shadow-2xl w-[95vw] max-w-md p-6 relative flex flex-col items-center"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 btn btn-circle btn-sm btn-ghost"
              onClick={closeModal}
              aria-label="Close"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex flex-col items-center gap-2 mb-4">
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-bold mb-2">
                {modalStudent.name?.[0] || '?'}
              </div>
              <h2 className="text-xl font-extrabold text-primary">{modalStudent.name}</h2>
              <div className="text-sm text-gray-500 font-mono">Reg No: {modalStudent.regNo}</div>
              <div className="text-sm text-gray-500">Department: {modalStudent.department || '-'}</div>
            </div>
            <div className="w-full flex flex-col gap-2 mb-2">
              <div className="flex justify-between">
                <span className="font-semibold">Batch:</span>
                <span>{modalStudent.originalBatch}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Company:</span>
                <span>{modalStudent.placedCompany}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Package:</span>
                <span>{modalStudent.package}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Type:</span>
                <span className="capitalize">{modalStudent.placementType?.replace("+", " + ")}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Attendance %:</span>
                <span className="text-success font-bold">{modalStudent.attendancePercent ?? 0}%</span>
              </div>
              <div className="flex flex-col gap-1 mt-2">
                <span className="font-semibold">Marks:</span>
                <div className="ml-2 grid grid-cols-2 gap-x-4 gap-y-1">
                  <span>Efforts:</span><span>{modalStudent.marks?.efforts ?? 0}</span>
                  <span>Presentation:</span><span>{modalStudent.marks?.presentation ?? 0}</span>
                  <span>Assessment:</span><span>{modalStudent.marks?.assessment ?? 0}</span>
                  <span>Assignment:</span><span>{modalStudent.marks?.assignment ?? 0}</span>
                </div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-400">
                <span>Moved At:</span>
                <span>{modalStudent.movedAt ? new Date(modalStudent.movedAt).toLocaleString() : '-'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboardPage;