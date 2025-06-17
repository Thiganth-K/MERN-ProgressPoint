import React, { useState } from 'react'
import { useNavigate } from "react-router";
import toast from 'react-hot-toast';
import api from '../lib/axios';

const HomePage = () => {
    const [adminName, setAdminName] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [showFail, setShowFail] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const navigate = useNavigate();
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (adminName === '' || adminPassword === '') {
            toast.error('Please fill in all fields');
            setShowFail(true);
            setTimeout(() => setShowFail(false), 2000);
            return;
        }
        try {
            const res = await api.post('/admin/login', { adminName, adminPassword });
            const data = res.data;
            if (data.success) {
                localStorage.setItem('adminName', adminName);
                localStorage.setItem('role', data.role);
                toast.success('Login successfully!');
                setShowSuccess(true);
                setTimeout(() => {
                    setShowSuccess(false);
                    if (data.role === "superadmin") {
                        navigate('/superadmin');
                    } else {
                        navigate('/admin');
                    }
                }, 1500);
            } else {
                toast.error('Invalid credentials');
                setShowFail(true);
                setTimeout(() => setShowFail(false), 2000);
            }
        } catch (err) {
            toast.error('Invalid credentials');
            setShowFail(true);
            setTimeout(() => setShowFail(false), 2000);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-base-200 px-2">
            {/* Branding */}
            <div className="flex flex-col items-center mb-8">
                <div className="flex items-center gap-2 mb-2">
                    <svg className="w-10 h-10 text-accent" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 10v10a1 1 0 001 1h3m10-11v10a1 1 0 01-1 1h-3m-4 0h4" />
                    </svg>
                    <span className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight">Progress Point</span>
                </div>
                <span className="text-xs text-gray-500 text-center">
                    &copy; {new Date().getFullYear()} Progress Point<br />Sona College of Technology, Salem
                </span>
            </div>
            <section className="bg-base-100 w-full max-w-md px-4 py-8 sm:px-8 rounded-2xl shadow-2xl relative">
                <h2 className="mb-6 text-2xl font-bold text-secondary text-center flex items-center justify-center gap-2">
                    <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 3.13a4 4 0 010 7.75" />
                    </svg>
                    Admin Login
                </h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Admin Name"
                            value={adminName}
                            onChange={(e) => setAdminName(e.target.value)}
                            required
                            className="input input-bordered w-full pl-10"
                            autoComplete="current-name"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </span>
                    </div>
                    <div className="relative">
                        <input
                            type="password"
                            placeholder="Admin Password"
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            required
                            className="input input-bordered w-full pl-10"
                            autoComplete="current-password"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 11V7a5 5 0 00-10 0v4a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2z" />
                            </svg>
                        </span>
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary w-full flex items-center justify-center gap-2 text-lg font-semibold"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                        Get Started
                    </button>
                </form>
                {/* Failed login animation */}
                {showFail && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-base-100 bg-opacity-90 rounded-2xl animate-fade-in z-10">
                        <svg
                            className="w-16 h-16 text-error animate-shake mb-2"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                        >
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 9l-6 6m0-6l6 6" />
                        </svg>
                        <div className="text-lg font-bold text-error text-center tracking-wide">
                            Failed to Login!
                        </div>
                    </div>
                )}
                {/* Success login animation */}
                {showSuccess && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-base-100 bg-opacity-90 rounded-2xl animate-fade-in z-10">
                        <svg
                            className="w-16 h-16 text-success animate-bounce mb-2"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                        >
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12l2 2l4-4" />
                        </svg>
                        <div className="text-lg font-bold text-success text-center tracking-wide">
                            Login Successful!
                        </div>
                    </div>
                )}
                <style>
                    {`
                    @keyframes fade-in {
                        0% { opacity: 0; transform: scale(0.95);}
                        100% { opacity: 1; transform: scale(1);}
                    }
                    .animate-fade-in {
                        animation: fade-in 0.4s cubic-bezier(.4,0,.2,1);
                    }
                    @keyframes shake {
                        0%, 100% { transform: translateX(0); }
                        20%, 60% { transform: translateX(-8px); }
                        40%, 80% { transform: translateX(8px); }
                    }
                    .animate-shake {
                        animation: shake 0.5s;
                    }
                    `}
                </style>
            </section>
        </div>
    );
};

export default HomePage;