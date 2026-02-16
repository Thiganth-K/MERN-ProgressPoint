import React, { useState, useEffect } from 'react'
import { useNavigate } from "react-router";
import toast from 'react-hot-toast';
import api from '../lib/axios';

const HomePage = () => {
    const [adminName, setAdminName] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [showFail, setShowFail] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showAdminForm, setShowAdminForm] = useState(false);
    const [showIntro, setShowIntro] = useState(true);
    const navigate = useNavigate();
    
    // Hide intro after animation completes
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowIntro(false);
        }, 3500); // Total animation duration
        return () => clearTimeout(timer);
    }, []);
    
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
            {/* Intro Animation */}
            {showIntro && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-base-200 intro-overlay">
                    <div className="flex items-center gap-3">
                        <svg className="w-12 h-12 text-accent" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 10v10a1 1 0 001 1h3m10-11v10a1 1 0 01-1 1h-3m-4 0h4" />
                        </svg>
                        <div className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                            <span className="text-primary reveal-letter" style={{ animationDelay: '0ms' }}>P</span>
                            <span className="text-primary reveal-letter" style={{ animationDelay: '100ms' }}>r</span>
                            <span className="text-primary reveal-letter" style={{ animationDelay: '200ms' }}>o</span>
                            <span className="text-primary reveal-letter" style={{ animationDelay: '300ms' }}>g</span>
                            <span className="text-primary reveal-letter" style={{ animationDelay: '400ms' }}>r</span>
                            <span className="text-primary reveal-letter" style={{ animationDelay: '500ms' }}>e</span>
                            <span className="text-primary reveal-letter" style={{ animationDelay: '600ms' }}>s</span>
                            <span className="text-primary reveal-letter" style={{ animationDelay: '700ms' }}>s</span>
                            <span className="text-accent reveal-letter mx-2" style={{ animationDelay: '800ms' }}> </span>
                            <span className="text-accent reveal-letter" style={{ animationDelay: '900ms' }}>P</span>
                            <span className="text-accent reveal-letter" style={{ animationDelay: '1000ms' }}>o</span>
                            <span className="text-accent reveal-letter" style={{ animationDelay: '1100ms' }}>i</span>
                            <span className="text-accent reveal-letter" style={{ animationDelay: '1200ms' }}>n</span>
                            <span className="text-accent reveal-letter" style={{ animationDelay: '1300ms' }}>t</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content - fade in after intro */}
            <div className={`w-full flex flex-col items-center justify-center transition-opacity duration-1000 ${showIntro ? 'opacity-0' : 'opacity-100'}`}>
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
            <section className="bg-base-100 w-full max-w-2xl px-4 py-8 sm:px-8 rounded-2xl shadow-2xl relative">
                {!showAdminForm ? (
                    // Main selection buttons
                    <div className="flex flex-col gap-6">
                        <h2 className="text-2xl font-bold text-secondary text-center">
                            Welcome! Choose your login
                        </h2>
                        
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <button
                                onClick={() => setShowAdminForm(true)}
                                className="btn btn-primary w-32 h-32 flex flex-col items-center justify-center gap-2 hover:scale-105 transition-transform p-4"
                            >
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 3.13a4 4 0 010 7.75" />
                                </svg>
                                <span className="text-sm font-bold">Admin</span>
                            </button>

                            <button
                                onClick={() => navigate('/client-dashboard')}
                                className="btn btn-secondary w-32 h-32 flex flex-col items-center justify-center gap-2 hover:scale-105 transition-transform p-4"
                            >
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <span className="text-sm font-bold">Guest</span>
                            </button>

                            <button
                                onClick={() => navigate('/student-login')}
                                className="btn btn-accent w-32 h-32 flex flex-col items-center justify-center gap-2 hover:scale-105 transition-transform p-4"
                            >
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                </svg>
                                <span className="text-sm font-bold">Student</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    // Admin login form
                    <>
                        <div className="flex items-center justify-between mb-6">
                            <button
                                onClick={() => setShowAdminForm(false)}
                                className="btn btn-ghost btn-sm flex items-center gap-1"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                </svg>
                                Back
                            </button>
                            <h2 className="text-2xl font-bold text-secondary flex items-center gap-2">
                                <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 3.13a4 4 0 010 7.75" />
                                </svg>
                                Admin Login
                            </h2>
                            <div className="w-16"></div>
                        </div>
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
                    </>
                )}
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
                    @keyframes reveal {
                        0% { 
                            opacity: 0; 
                            transform: translateY(20px) scale(0.8);
                        }
                        100% { 
                            opacity: 1; 
                            transform: translateY(0) scale(1);
                        }
                    }
                    .reveal-letter {
                        display: inline-block;
                        opacity: 0;
                        animation: reveal 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                    }
                    @keyframes bounce-slow {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-10px); }
                    }
                    .animate-bounce-slow {
                        animation: bounce-slow 1.5s ease-in-out infinite;
                    }
                    .intro-overlay {
                        animation: fade-out 0.5s ease-in-out 3s forwards;
                    }
                    @keyframes fade-out {
                        0% { opacity: 1; }
                        100% { opacity: 0; visibility: hidden; }
                    }
                    `}
                </style>
            </section>
            </div>
        </div>
    );
};

export default HomePage;