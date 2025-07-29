import React, { useEffect, useState } from "react";
import api from "../lib/axios";
import { useNavigate } from "react-router-dom";

const PlacementDonePage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalStudent, setModalStudent] = useState(null);
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

  return (
    <div className="min-h-screen bg-base-200 flex flex-col items-center py-8 px-2">
      <div className="w-full max-w-6xl flex flex-col items-center">
        <div className="w-full flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary tracking-tight">Placement Done Students</h1>
          <button
            className="btn btn-success font-semibold flex items-center px-4 py-2 text-base rounded-lg shadow hover:scale-105 transition-transform"
            onClick={() => window.open("/api/placement-done/export", "_blank")}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Export as Excel
          </button>
        </div>
        {loading ? (
          <div className="w-full flex justify-center items-center py-16">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : students.length === 0 ? (
          <div className="w-full text-center text-gray-400 font-semibold py-16">No placement done students found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
            {students.map((s, idx) => (
              <div
                key={s._id || idx}
                className="bg-base-100 rounded-2xl shadow-xl p-6 flex flex-col gap-2 border border-base-300 hover:shadow-2xl transition cursor-pointer"
                onClick={() => setModalStudent(s)}
                tabIndex={0}
                aria-label={`View details for ${s.name}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold">
                    {s.name?.[0] || '?'}
                  </div>
                  <div>
                    <div className="font-extrabold text-lg text-primary">{s.name}</div>
                    <div className="text-xs font-mono text-gray-500">Reg No: {s.regNo}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                  <span><span className="font-semibold">Company:</span> {s.placedCompany}</span>
                  <span><span className="font-semibold">Batch:</span> {s.originalBatch}</span>
                </div>
                <div className="flex justify-end mt-2">
                  <span className="text-xs text-primary font-semibold">Click to view details</span>
                </div>
              </div>
            ))}
          </div>
        )}
        <button
          className="btn btn-outline btn-primary mt-8 px-6 py-2 text-base font-semibold rounded-lg shadow-sm hover:scale-105 transition-transform"
          onClick={() => navigate(-1)}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
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
              <div className="flex flex-col gap-1 mt-2">
                <span className="font-semibold">Mail Details:</span>
                <div className="ml-2">
                  <div>Personal: <span className="font-mono">{modalStudent.personalEmail || '-'}</span></div>
                  <div>College: <span className="font-mono">{modalStudent.collegeEmail || '-'}</span></div>
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

export default PlacementDonePage; 