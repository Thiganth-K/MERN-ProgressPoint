// Department Students Modal Component - Add this before the closing of main element in SuperAdminPage.jsx
// Insert this modal just before </main>

{/* Department Students Modal */}
{showDepartmentStudentsModal && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-2 sm:p-4">
    <div className="bg-base-100 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] relative flex flex-col">
      <button
        className="absolute top-2 right-2 sm:top-3 sm:right-3 btn btn-circle btn-xs sm:btn-sm btn-ghost z-10"
        onClick={() => setShowDepartmentStudentsModal(false)}
        aria-label="Close"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      
      <div className="p-3 sm:p-4 lg:p-6 border-b border-base-300">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="inline-flex items-center justify-center bg-secondary rounded-full w-6 h-6 sm:w-8 sm:h-8 lg:w-9 lg:h-9 shrink-0">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </span>
          <h3 className="text-sm sm:text-lg lg:text-xl font-extrabold text-secondary tracking-tight">
            Department: <span className="text-accent">{selectedDepartment}</span>
            <span className="text-sm font-normal text-gray-500 ml-2">({departmentStudents.length} students)</span>
          </h3>
        </div>
        
        <div className="mt-3 sm:mt-4 flex justify-end">
          <button
            className="btn btn-outline btn-success btn-xs sm:btn-sm font-semibold flex items-center gap-1"
            onClick={() => handleExportDepartmentStudents(selectedDepartment, 'excel')}
            title="Export to Excel"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Export to Excel</span>
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto flex-1 w-full p-3 sm:p-4 lg:p-6">
        <table className="min-w-[1000px] w-full text-xs sm:text-sm md:text-base">
          <thead>
            <tr className="bg-base-200 text-xs sm:text-sm uppercase text-gray-600">
              <th className="px-2 py-2 text-left font-bold whitespace-nowrap">S.No</th>
              <th className="px-2 py-2 text-left font-bold whitespace-nowrap">Reg No</th>
              <th className="px-2 py-2 text-left font-bold whitespace-nowrap">Name</th>
              <th className="px-2 py-2 text-left font-bold whitespace-nowrap">Batch</th>
              <th className="px-2 py-2 text-left font-bold whitespace-nowrap">Year</th>
              <th className="px-2 py-2 text-left font-bold whitespace-nowrap">Email</th>
              <th className="px-2 py-2 text-left font-bold whitespace-nowrap">Mobile</th>
              <th className="px-2 py-2 text-center font-bold whitespace-nowrap">Marks</th>
              <th className="px-2 py-2 text-center font-bold whitespace-nowrap">Attendance %</th>
            </tr>
          </thead>
          <tbody>
            {departmentStudents.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-6 text-gray-400 font-semibold">
                  No students in this department.
                </td>
              </tr>
            ) : (
              departmentStudents.map((student, idx) => {
                const totalMarks = (student.marks?.efforts || 0) + (student.marks?.presentation || 0) + 
                                  (student.marks?.assessment || 0) + (student.marks?.assignment || 0);
                return (
                  <tr key={student.regNo} className="hover:bg-base-200 transition">
                    <td className="px-2 py-2 text-xs sm:text-sm text-gray-500 whitespace-nowrap">{idx + 1}</td>
                    <td className="px-2 py-2 font-mono text-xs sm:text-sm whitespace-nowrap">{student.regNo}</td>
                    <td className="px-2 py-2 text-xs sm:text-sm whitespace-nowrap">{student.name}</td>
                    <td className="px-2 py-2 text-xs sm:text-sm whitespace-nowrap">
                      <span className="badge badge-primary badge-xs sm:badge-sm">{student.batchName}</span>
                    </td>
                    <td className="px-2 py-2 text-xs sm:text-sm whitespace-nowrap">{student.year}</td>
                    <td className="px-2 py-2 text-xs sm:text-sm whitespace-nowrap">
                      {student.personalEmail || student.collegeEmail || '-'}
                    </td>
                    <td className="px-2 py-2 text-xs sm:text-sm whitespace-nowrap">{student.mobile || '-'}</td>
                    <td className="px-2 py-2 text-center text-xs sm:text-sm whitespace-nowrap">
                      <span className="badge badge-info">{totalMarks}</span>
                    </td>
                    <td className="px-2 py-2 text-center text-xs sm:text-sm whitespace-nowrap">
                      <span className={`badge ${student.attendancePercent >= 75 ? 'badge-success' : 'badge-warning'}`}>
                        {student.attendancePercent?.toFixed(1) || 0}%
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
)}
