import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../lib/axios";

export default function StudentDashboardPage() {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [showEditEmails, setShowEditEmails] = useState(false);
  const [personalEmail, setPersonalEmail] = useState("");
  const [collegeEmail, setCollegeEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailSuccess, setEmailSuccess] = useState("");
  const navigate = useNavigate();

  const regNo = localStorage.getItem("studentRegNo");

  useEffect(() => {
    if (!regNo) {
      navigate("/student-login");
      return;
    }

    fetchStudentData();
  }, [regNo, navigate]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/students/${regNo}/data`);
      setStudentData(response.data);
      setPersonalEmail(response.data.data?.personalEmail || "");
      setCollegeEmail(response.data.data?.collegeEmail || "");
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch student data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("studentRegNo");
    localStorage.removeItem("studentLastLogin");
    navigate("/student-login");
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match");
      return;
    }

    if (newPassword.length < 4) {
      setPasswordError("Password must be at least 4 characters long");
      return;
    }

    try {
      await axios.post(`/students/${regNo}/change-password`, {
        oldPassword,
        newPassword
      });

      setPasswordSuccess("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setShowChangePassword(false);
        setPasswordSuccess("");
      }, 2000);
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Failed to change password");
    }
  };

  const handleUpdateEmails = async (e) => {
    e.preventDefault();
    setEmailError("");
    setEmailSuccess("");

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (personalEmail && !emailRegex.test(personalEmail)) {
      setEmailError("Invalid personal email format");
      return;
    }
    
    if (collegeEmail && !emailRegex.test(collegeEmail)) {
      setEmailError("Invalid college email format");
      return;
    }

    if (!personalEmail && !collegeEmail) {
      setEmailError("Please provide at least one email address");
      return;
    }

    try {
      const response = await axios.put(`/students/${regNo}/update-emails`, {
        personalEmail,
        collegeEmail
      });

      setEmailSuccess("Email addresses updated successfully!");
      
      // Update local state with new email values
      setStudentData(prevData => ({
        ...prevData,
        data: {
          ...prevData.data,
          personalEmail: response.data.data.personalEmail,
          collegeEmail: response.data.data.collegeEmail
        }
      }));

      setTimeout(() => {
        setShowEditEmails(false);
        setEmailSuccess("");
      }, 2000);
    } catch (err) {
      setEmailError(err.response?.data?.message || "Failed to update email addresses");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-base-content">Loading your data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="card bg-base-100 shadow-xl p-8">
          <div className="alert alert-error mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
          <button onClick={handleLogout} className="btn btn-primary">
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  const data = studentData?.data;
  const isPlaced = studentData?.source === "placement";

  return (
    <div className="min-h-screen bg-base-200 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-primary">{data?.name}</h1>
                <p className="text-base-content opacity-70 mt-1">Registration No: {data?.regNo}</p>
                {isPlaced && (
                  <div className="badge badge-success badge-lg mt-2 gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Placed
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowChangePassword(!showChangePassword)}
                  className="btn btn-neutral btn-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  Change Password
                </button>
                <button onClick={handleLogout} className="btn btn-error btn-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Section */}
        {showChangePassword && (
          <div className="card bg-base-100 shadow-xl mb-6">
            <div className="card-body">
              <h2 className="card-title">Change Password</h2>
              {passwordError && (
                <div className="alert alert-error">
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{passwordError}</span>
                </div>
              )}
              {passwordSuccess && (
                <div className="alert alert-success">
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{passwordSuccess}</span>
                </div>
              )}
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Old Password</span>
                  </label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                    className="input input-bordered"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">New Password</span>
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="input input-bordered"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Confirm New Password</span>
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="input input-bordered"
                  />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="btn btn-primary">
                    Update Password
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowChangePassword(false)}
                    className="btn btn-ghost"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Personal Information */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h2 className="card-title">Personal Information</h2>
              <button
                onClick={() => setShowEditEmails(!showEditEmails)}
                className="btn btn-sm btn-outline btn-primary"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Emails
              </button>
            </div>

            {/* Edit Emails Form */}
            {showEditEmails && (
              <div className="border border-primary rounded-lg p-4 mb-4 bg-base-200">
                <h3 className="font-semibold mb-3">Update Email Addresses</h3>
                {emailError && (
                  <div className="alert alert-error mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{emailError}</span>
                  </div>
                )}
                {emailSuccess && (
                  <div className="alert alert-success mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{emailSuccess}</span>
                  </div>
                )}
                <form onSubmit={handleUpdateEmails} className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Personal Email</span>
                    </label>
                    <input
                      type="email"
                      value={personalEmail}
                      onChange={(e) => setPersonalEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="input input-bordered"
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">College Email</span>
                    </label>
                    <input
                      type="email"
                      value={collegeEmail}
                      onChange={(e) => setCollegeEmail(e.target.value)}
                      placeholder="your.email@college.edu"
                      className="input input-bordered"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="btn btn-primary btn-sm">
                      Update Emails
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditEmails(false);
                        setPersonalEmail(data?.personalEmail || "");
                        setCollegeEmail(data?.collegeEmail || "");
                        setEmailError("");
                        setEmailSuccess("");
                      }}
                      className="btn btn-ghost btn-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm opacity-70">Department</p>
                <p className="font-semibold">{data?.department || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm opacity-70">Personal Email</p>
                <p className="font-semibold">{data?.personalEmail || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm opacity-70">College Email</p>
                <p className="font-semibold">{data?.collegeEmail || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm opacity-70">Mobile</p>
                <p className="font-semibold">{data?.mobile || "N/A"}</p>
              </div>
              {!isPlaced && (
                <>
                  <div>
                    <p className="text-sm opacity-70">Batch</p>
                    <p className="font-semibold">{data?.batch || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-70">Year</p>
                    <p className="font-semibold">{data?.year || "N/A"}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Placement Information (if placed) */}
        {isPlaced && (
          <div className="card bg-base-100 shadow-xl mb-6">
            <div className="card-body">
              <h2 className="card-title">Placement Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm opacity-70">Company</p>
                  <p className="font-semibold text-lg text-success">{data?.placedCompany}</p>
                </div>
                <div>
                  <p className="text-sm opacity-70">Package</p>
                  <p className="font-semibold text-lg">{data?.package}</p>
                </div>
                <div>
                  <p className="text-sm opacity-70">Placement Type</p>
                  <p className="font-semibold capitalize">{data?.placementType?.replace("+", " + ")}</p>
                </div>
                <div>
                  <p className="text-sm opacity-70">Original Batch</p>
                  <p className="font-semibold">{data?.originalBatch}</p>
                </div>
              </div>

              {/* Additional Offers */}
              {data?.additionalOffers && data.additionalOffers.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-3">Additional Offers</h3>
                  <div className="space-y-3">
                    {data.additionalOffers.map((offer, index) => (
                      <div key={index} className="border border-base-300 rounded-lg p-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <div>
                            <p className="text-xs opacity-70">Company</p>
                            <p className="font-semibold">{offer.company}</p>
                          </div>
                          <div>
                            <p className="text-xs opacity-70">Package</p>
                            <p className="font-semibold">{offer.package}</p>
                          </div>
                          <div>
                            <p className="text-xs opacity-70">Status</p>
                            <div className={`badge ${
                              offer.status === 'accepted' ? 'badge-success' :
                              offer.status === 'rejected' ? 'badge-error' :
                              'badge-warning'
                            }`}>
                              {offer.status}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Marks */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h2 className="card-title">Marks</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="stats shadow">
                <div className="stat">
                  <div className="stat-title">Efforts</div>
                  <div className="stat-value text-info">{data?.marks?.efforts || 0}</div>
                </div>
              </div>
              <div className="stats shadow">
                <div className="stat">
                  <div className="stat-title">Presentation</div>
                  <div className="stat-value text-success">{data?.marks?.presentation || 0}</div>
                </div>
              </div>
              <div className="stats shadow">
                <div className="stat">
                  <div className="stat-title">Assessment</div>
                  <div className="stat-value text-secondary">{data?.marks?.assessment || 0}</div>
                </div>
              </div>
              <div className="stats shadow">
                <div className="stat">
                  <div className="stat-title">Assignment</div>
                  <div className="stat-value text-warning">{data?.marks?.assignment || 0}</div>
                </div>
              </div>
            </div>
            {data?.totalMarks !== undefined && (
              <div className="stats shadow">
                <div className="stat place-items-center">
                  <div className="stat-title">Total Marks</div>
                  <div className="stat-value text-primary">{data.totalMarks}</div>
                </div>
              </div>
            )}
            {data?.marksLastUpdated && (
              <p className="text-sm opacity-70 mt-4 text-center">
                Last updated: {new Date(data.marksLastUpdated).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Attendance (only for non-placed students) */}
        {!isPlaced && data?.attendance && (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex justify-between items-center mb-4">
                <h2 className="card-title">Attendance</h2>
                <div className="stats shadow">
                  <div className="stat">
                    <div className="stat-title">Attendance %</div>
                    <div className="stat-value text-success">{data.attendancePercent?.toFixed(2) || 0}%</div>
                  </div>
                </div>
              </div>

              {data.attendance.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="table table-zebra">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Session</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.attendance.slice().reverse().map((record, index) => (
                        <tr key={index}>
                          <td>{record.date}</td>
                          <td>{record.session}</td>
                          <td>
                            <div className={`badge ${
                              record.status === 'Present' ? 'badge-success' :
                              record.status === 'Absent' ? 'badge-error' :
                              'badge-warning'
                            }`}>
                              {record.status}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="alert">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info shrink-0 w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>No attendance records found</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
