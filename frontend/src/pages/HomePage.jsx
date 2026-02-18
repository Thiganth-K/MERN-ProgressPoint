import React, { useState, useEffect } from 'react'
import { useNavigate } from "react-router";

const HomePage = () => {
    const [showIntro, setShowIntro] = useState(true);
    const navigate = useNavigate();
    
    // Hide intro after animation completes
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowIntro(false);
        }, 3500); // Total animation duration
        return () => clearTimeout(timer);
    }, []);

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
            
            {/* Branding - moved below the cards */}
            <div className="flex flex-col items-center mt-6">
                <div className="flex items-center gap-2 mb-8 -mt-2">
                    <svg className="w-10 h-10 text-accent" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 10v10a1 1 0 001 1h3m10-11v10a1 1 0 01-1 1h-3m-4 0h4" />
                    </svg>
                    <span className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight">Progress Point</span>
                </div>
                {/* Branding removed from here and moved below the cards */}
            <section className="bg-base-100 w-full max-w-5xl px-6 py-6 sm:px-12 sm:py-10 rounded-2xl shadow-2xl relative">
                {/* Main selection buttons */}
                <div className="flex flex-col gap-6">
                    <h2 className="text-2xl font-bold text-secondary text-center">
                        Welcome! Choose your login
                    </h2>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <button
                            onClick={() => navigate('/admin-login')}
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
                <style>
                    {`
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
            {/* Fixed footer at bottom */}
            <footer className="fixed bottom-4 left-0 right-0 flex justify-center pointer-events-none">
                <div className="w-full max-w-2xl text-center pointer-events-auto">
                    <div className="text-xs text-gray-500">
                        &copy; {new Date().getFullYear()} Progress Point<br />Sona College of Technology, Salem
                    </div>
                </div>
            </footer>
            </div>
        </div>
    );
};

export default HomePage;